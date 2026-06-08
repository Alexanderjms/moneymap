export interface Ingreso {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  currency: "HNL" | "USD";
  date: string;
  created_at: string;
  updated_at: string;
}

export interface Gasto {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  currency: "HNL" | "USD";
  date: string;
  created_at: string;
  updated_at: string;
}

export type RateSource = "api" | "cache" | "fallback" | "manual";

export interface RateInfo {
  rate: number;
  source: RateSource;
  cachedAt: string | null;
}

export interface DrawerData {
  id?: string;
  name?: string;
  amount?: string;
  date?: string;
  currency?: string;
}
