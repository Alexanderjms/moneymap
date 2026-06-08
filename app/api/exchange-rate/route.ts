import { NextRequest, NextResponse } from "next/server";
import {
  getRate,
  fetchRateFromBCH,
  setCachedRate,
  DEFAULT_RATE,
} from "@/src/lib/exchange-rate";
import type { RateInfo } from "@/src/types";

export async function GET() {
  const apiKey = process.env.BCH_API_KEY;
  const apiUrl = process.env.BCH_API_URL;
  const info = await getRate(apiKey, apiUrl);
  return NextResponse.json(info);
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.BCH_API_KEY;
  const apiUrl = process.env.BCH_API_URL;

  const body = await request.json().catch(() => ({}));
  const manualRate = typeof body.rate === "number" ? body.rate : null;

  let result: RateInfo;
  if (manualRate != null && Number.isFinite(manualRate) && manualRate > 0) {
    setCachedRate(manualRate, "manual");
    result = {
      rate: manualRate,
      source: "manual",
      cachedAt: new Date().toISOString(),
    };
  } else if (apiKey && apiUrl) {
    try {
      result = await fetchRateFromBCH(apiKey, apiUrl);
      setCachedRate(result.rate, result.source);
    } catch {
      result = { rate: DEFAULT_RATE, source: "fallback", cachedAt: null };
    }
  } else {
    result = { rate: DEFAULT_RATE, source: "fallback", cachedAt: null };
  }

  return NextResponse.json(result);
}
