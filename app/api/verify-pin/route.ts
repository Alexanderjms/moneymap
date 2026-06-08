import { NextRequest, NextResponse } from "next/server";

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000;
const rateLimit = new Map<string, { count: number; blockedUntil: number }>();

function getIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  const ip = getIp(request);

  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (entry && entry.blockedUntil > now) {
    const remaining = Math.ceil((entry.blockedUntil - now) / 60000);
    return NextResponse.json(
      {
        success: false,
        error: `Demasiados intentos. Volvé a intentar en ${remaining} minutos.`,
      },
      { status: 429 },
    );
  }

  const body = await request.json();
  const { pin } = body;

  if (pin === process.env.ACCESS_CODE) {
    rateLimit.delete(ip);
    const response = NextResponse.json({ success: true });
    response.cookies.set("access_verified", "true", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
    });
    return response;
  }

  const nextCount = entry ? entry.count + 1 : 1;
  if (nextCount >= MAX_ATTEMPTS) {
    rateLimit.set(ip, { count: nextCount, blockedUntil: now + BLOCK_DURATION_MS });
  } else {
    rateLimit.set(ip, { count: nextCount, blockedUntil: 0 });
  }

  return NextResponse.json(
    { success: false, error: "PIN incorrecto" },
    { status: 401 },
  );
}
