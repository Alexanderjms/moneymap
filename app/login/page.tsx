import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
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

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const accessVerified =
    cookieStore.get("access_verified")?.value === "true";

  if (session) {
    redirect("/personal/");
  }

  return <LoginForm accessVerified={accessVerified} />;
}
