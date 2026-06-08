import type { RateInfo, RateSource } from "@/src/types";

export const CACHE_KEY_PREFIX = "bch_exchange_rate_";
export const CACHE_KEY = "bch_exchange_rate";
export const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
export const DEFAULT_RATE = 26.5;

export function convertToHnl(
  amount: number,
  currency: string,
  rate: number,
): number {
  if (currency === "USD") return amount * rate;
  if (currency === "HNL") return amount;
  return amount;
}

export function formatRate(rate: number): string {
  return rate.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

export function getCachedRate(): RateInfo | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as RateInfo;
    const now = Date.now();
    if (
      data.cachedAt &&
      now - new Date(data.cachedAt).getTime() < CACHE_TTL_MS
    ) {
      return data;
    }
    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch {
    return null;
  }
}

export function getCachedRateForDate(date: string): RateInfo | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + date);
    if (!raw) return null;
    const data = JSON.parse(raw) as RateInfo;
    const now = Date.now();
    if (
      data.cachedAt &&
      now - new Date(data.cachedAt).getTime() < CACHE_TTL_MS
    ) {
      return data;
    }
    localStorage.removeItem(CACHE_KEY_PREFIX + date);
    return null;
  } catch {
    return null;
  }
}

export function setCachedRateForDate(
  rate: number,
  source: RateSource,
  date: string,
) {
  if (typeof window === "undefined") return;
  const info: RateInfo = { rate, source, cachedAt: new Date().toISOString() };
  localStorage.setItem(CACHE_KEY_PREFIX + date, JSON.stringify(info));
}

export function setCachedRate(rate: number, source: RateSource) {
  if (typeof window === "undefined") return;
  const info: RateInfo = { rate, source, cachedAt: new Date().toISOString() };
  localStorage.setItem(CACHE_KEY, JSON.stringify(info));
}

export async function fetchRateFromBCH(
  apiKey: string,
  apiUrl: string,
): Promise<RateInfo> {
  const url = `${apiUrl}/api/v1/indicadores/97/cifras?clave=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`BCH API error: ${res.status}`);
  const data = await res.json();
  const latest = Array.isArray(data) ? data[0] : data;
  const rate =
    typeof latest?.Valor === "number"
      ? latest.Valor
      : Number(latest?.Valor);
  if (!Number.isFinite(rate)) throw new Error("Invalid rate from BCH");
  return { rate, source: "api", cachedAt: new Date().toISOString() };
}

export async function getRate(
  apiKey?: string,
  apiUrl?: string,
): Promise<RateInfo | null> {
  if (!apiKey || !apiUrl) return null;
  const cached = getCachedRate();
  if (cached) return cached;
  try {
    const fromApi = await fetchRateFromBCH(apiKey, apiUrl);
    setCachedRate(fromApi.rate, fromApi.source);
    return fromApi;
  } catch {
    return { rate: DEFAULT_RATE, source: "fallback", cachedAt: null };
  }
}

export async function getRateForDate(
  date: string,
  apiKey?: string,
  apiUrl?: string,
): Promise<RateInfo | null> {
  if (!apiKey || !apiUrl) return null;
  const cached = getCachedRateForDate(date);
  if (cached) return cached;
  try {
    const fromApi = await fetchRateFromBCH(apiKey, apiUrl);
    setCachedRateForDate(fromApi.rate, fromApi.source, date);
    return fromApi;
  } catch {
    return { rate: DEFAULT_RATE, source: "fallback", cachedAt: null };
  }
}
