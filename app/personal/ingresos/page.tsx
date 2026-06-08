import { redirect } from "next/navigation";
import { createServerSupabase } from "@/src/lib/supabase-server";
import IngresosClient from "./IngresosClient";

export default async function IngresosPage() {
  const supabase = await createServerSupabase();
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) redirect("/login");

  return <IngresosClient />;
}
