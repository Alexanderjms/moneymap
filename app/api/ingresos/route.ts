import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function createSupabase(request: NextRequest) {
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      db: { schema: "money" },
      cookies: {
        get(key: string) {
          return request.cookies.get(key)?.value;
        },
        set() {},
        remove() {},
      },
    },
  );
}

export async function GET(request: NextRequest) {
  const supabase = createSupabase(request);
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("ingresos")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createSupabase(request);
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { id, name, amount, date, currency } = body;

  if (!name || !amount || !date) {
    return NextResponse.json(
      { error: "Faltan campos requeridos" },
      { status: 400 },
    );
  }

  let result;
  if (id) {
    result = await supabase
      .from("ingresos")
      .update({ name, amount, date, currency: currency || "HNL" })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();
  } else {
    result = await supabase
      .from("ingresos")
      .insert({
        name,
        amount,
        date,
        currency: currency || "HNL",
        user_id: user.id,
      })
      .select()
      .single();
  }

  if (result.error) {
    return NextResponse.json(
      { error: result.error.message },
      { status: 500 },
    );
  }

  return NextResponse.json(result.data, { status: id ? 200 : 201 });
}

export async function DELETE(request: NextRequest) {
  const supabase = createSupabase(request);
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = (await request.json()) as { id: string };
  if (!id) {
    return NextResponse.json({ error: "Falta id" }, { status: 400 });
  }

  const { error } = await supabase
    .from("ingresos")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
