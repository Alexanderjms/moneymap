import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { pin } = body;

  if (pin === process.env.ACCESS_CODE) {
    const response = NextResponse.json({ success: true });
    response.cookies.set("access_verified", "true", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
    });
    return response;
  }

  return NextResponse.json(
    { success: false, error: "PIN incorrecto" },
    { status: 401 },
  );
}
