import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const response = NextResponse.redirect(`${origin}/personal/`);

  if (code) {
    const supabase = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        db: { schema: "money" },
        cookies: {
          get(key: string) {
            return request.cookies.get(key)?.value;
          },
          set(key: string, value: string, _options: Record<string, unknown>) {
            response.cookies.set(key, value, _options);
          },
          remove(key: string, _options: Record<string, unknown>) {
            response.cookies.delete(key);
          },
        },
      },
    );
    await supabase.auth.exchangeCodeForSession(code);
  }

  return response;
}
