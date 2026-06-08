import { redirect } from "next/navigation";
import { createServerSupabase } from "@/src/lib/supabase-server";
import GastosClient from "./GastosClient";

export default async function GastosPage() {
  const supabase = await createServerSupabase();
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) redirect("/login");

  return <GastosClient />;
}
