import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      db: { schema: "money" },
      cookies: {
        get(key: string) {
          return cookieStore.get(key)?.value;
        },
        set() {},
        remove() {},
      },
    },
  );
}
