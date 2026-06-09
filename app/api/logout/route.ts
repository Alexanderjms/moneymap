import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));

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
          response.cookies.set(key, value, options);
        },
        remove(key: string, _options: Record<string, unknown>) {
          response.cookies.delete(key);
        },
      },
    },
  );

  await supabase.auth.signOut();

  response.cookies.delete("access_verified");
  return response;
}
