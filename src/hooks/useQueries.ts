import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Ingreso, Gasto, PlanCompra } from "@/src/types";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error fetching ${url}`);
  return res.json();
}

export function useIngresos() {
  return useQuery<Ingreso[]>({
    queryKey: ["ingresos"],
    queryFn: () => fetchJson<Ingreso[]>("/api/ingresos"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useGastos() {
  return useQuery<Gasto[]>({
    queryKey: ["gastos"],
    queryFn: () => fetchJson<Gasto[]>("/api/gastos"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpsertIngreso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch("/api/ingresos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => {
        if (!r.ok) throw new Error("Error guardando ingreso");
        return r.json();
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ingresos"] });
    },
  });
}

export function useUpsertGasto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch("/api/gastos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => {
        if (!r.ok) throw new Error("Error guardando gasto");
        return r.json();
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gastos"] });
    },
  });
}

function deleteFetch(url: string, id: string) {
  return fetch(url, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  }).then((r) => {
    if (!r.ok) throw new Error("Error eliminando");
    return r.json();
  });
}

export function useDeleteIngreso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFetch("/api/ingresos", id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ingresos"] });
    },
  });
}

export function useDeleteGasto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFetch("/api/gastos", id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gastos"] });
    },
  });
}

type RateResponse = {
  rate: number;
  source: string;
  cachedAt: string | null;
};

export function useCurrentRate() {
  return useQuery<RateResponse>({
    queryKey: ["exchange-rate"],
    queryFn: () => fetchJson<RateResponse>("/api/exchange-rate"),
    staleTime: 12 * 60 * 60 * 1000,
  });
}

export function usePlanCompras() {
  return useQuery<PlanCompra[]>({
    queryKey: ["plan-compras"],
    queryFn: () => fetchJson<PlanCompra[]>("/api/plan-compras"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpsertPlanCompra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch("/api/plan-compras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => {
        if (!r.ok) throw new Error("Error guardando plan");
        return r.json();
      }),
    onMutate: async (body) => {
      await qc.cancelQueries({ queryKey: ["plan-compras"] });
      const previous = qc.getQueryData<PlanCompra[]>(["plan-compras"]);
      if (previous && body.id) {
        const updated = previous.map((item) =>
          item.id === body.id
            ? {
                ...item,
                name: (body.name as string) ?? item.name,
                amount: Number(String(body.amount ?? "").replace(/,/g, "")) || item.amount,
                currency: (body.currency as "HNL" | "USD") ?? item.currency,
                date: (body.date as string) ?? item.date,
                purchased: (body.purchased as boolean) ?? item.purchased,
                url: (body.url as string) ?? item.url,
              }
            : item,
        );
        qc.setQueryData(["plan-compras"], updated);
      }
      return { previous };
    },
    onError: (_err, _body, context) => {
      if (context?.previous) {
        qc.setQueryData(["plan-compras"], context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["plan-compras"] });
    },
  });
}

export function useDeletePlanCompra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFetch("/api/plan-compras", id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plan-compras"] });
    },
  });
}

export function useRefreshRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      fetch("/api/exchange-rate", { method: "POST" }).then((r) => {
        if (!r.ok) throw new Error("Error actualizando tasa");
        return r.json() as Promise<RateResponse>;
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exchange-rate"] });
    },
  });
}
