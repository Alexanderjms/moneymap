import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      db: { schema: "money" },
      cookies: {
        get(key: string) {
          return request.cookies.get(key)?.value;
        },
        set(key: string, value: string, options: Record<string, unknown>) {
          supabaseResponse.cookies.set(key, value, options);
        },
        remove(key: string, _options: Record<string, unknown>) {
          supabaseResponse.cookies.delete(key);
        },
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isLoggedIn = !!session;
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/login";
  const isAuthCallback = pathname === "/auth/callback";
  const isProtected = pathname.startsWith("/personal/");
  const isApiRoute = pathname.startsWith("/api/");

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/personal/", request.url));
  }

  if (isApiRoute || isAuthCallback) {
    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
