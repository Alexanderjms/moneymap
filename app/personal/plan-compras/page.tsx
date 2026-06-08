import { redirect } from "next/navigation";
import { createServerSupabase } from "@/src/lib/supabase-server";
import PlanComprasClient from "./PlanComprasClient";

export default async function PlanComprasPage() {
  const supabase = await createServerSupabase();
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) redirect("/login");

  return <PlanComprasClient />;
}
