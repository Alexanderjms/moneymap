import { redirect } from "next/navigation";
import { createServerSupabase } from "@/src/lib/supabase-server";
import DashboardClientWrapper from "./DashboardClientWrapper";

export default async function DashboardPage() {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <DashboardClientWrapper />;
}
