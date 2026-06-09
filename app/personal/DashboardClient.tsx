"use client";

import { Icon } from "@iconify/react";
import { useEffect, useMemo } from "react";
import {
  useIngresos,
  useGastos,
  useCurrentRate,
  useRefreshRate,
} from "@/src/hooks/useQueries";
import IncomeExpenseChart from "@/src/components/charts/IncomeExpenseChart";
import IncomeDistribution from "@/src/components/charts/IncomeDistribution";
import ExpenseDistribution from "@/src/components/charts/ExpenseDistribution";

function convertToHnl(amount: number, currency: string, rate: number) {
  if (currency === "USD") return amount * rate;
  return amount;
}

export default function DashboardClient() {
  const { data: ingresos = [] } = useIngresos();
  const { data: gastos = [] } = useGastos();
  const { data: rateInfo, isLoading: rateLoading } = useCurrentRate();
  const refreshRate = useRefreshRate();

  useEffect(() => {
    if (rateInfo?.rate) {
      try {
        localStorage.setItem("bch_exchange_rate", JSON.stringify(rateInfo));
      } catch {}
    }
  }, [rateInfo]);

  const rate = rateInfo?.rate ?? 26.5;
  const rateSourceLabel = rateInfo?.source === "api" ? "BCH" : "Default";

  const totalIngresosHnl = useMemo(
    () =>
      ingresos.reduce(
        (acc, ing) =>
          acc + convertToHnl(Number(ing.amount), ing.currency || "HNL", rate),
        0,
      ),
    [ingresos, rate],
  );

  const totalGastosHnl = useMemo(
    () =>
      gastos.reduce(
        (acc, gas) =>
          acc + convertToHnl(Number(gas.amount), gas.currency || "HNL", rate),
        0,
      ),
    [gastos, rate],
  );

  const saldo = totalIngresosHnl - totalGastosHnl;

  const totalIngresosStr = totalIngresosHnl.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const totalGastosStr = totalGastosHnl.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const saldoStr = saldo.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const rateFormatted = rate.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Resumen</h1>
        {rateLoading && !rateInfo ? (
          <div className="flex animate-pulse items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/80 px-3 py-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-neutral-600" />
            <span className="text-xs font-medium text-neutral-500">1 USD = L. --</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/80 px-3 py-1.5 text-xs font-medium text-neutral-300">
            <span
              className={`inline-block h-2 w-2 rounded-full ${refreshRate.isPending ? "animate-pulse bg-yellow-400" : "bg-emerald-400"}`}
            />
            1 USD = L. {rateFormatted}
            <span className="text-neutral-500">({rateSourceLabel})</span>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
          <div className="flex items-center gap-2">
            <Icon icon="mdi:cash-plus" className="text-xl text-emerald-400" />
            <p className="text-sm text-neutral-400">Ingresos</p>
          </div>
          <p className="mt-2 text-2xl font-semibold text-emerald-400">
            L. {totalIngresosStr}
          </p>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
          <div className="flex items-center gap-2">
            <Icon icon="mdi:cash-minus" className="text-xl text-red-400" />
            <p className="text-sm text-neutral-400">Gastos</p>
          </div>
          <p className="mt-2 text-2xl font-semibold text-red-400">
            L. {totalGastosStr}
          </p>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
          <div className="flex items-center gap-2">
            <Icon
              icon="mdi:scale-balance"
              className={`text-xl ${saldo >= 0 ? "text-white" : "text-red-400"}`}
            />
            <p className="text-sm text-neutral-400">Saldo</p>
          </div>
          <p
            className={`mt-2 text-2xl font-semibold ${saldo >= 0 ? "text-white" : "text-red-400"}`}
          >
            L. {saldoStr}
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="w-full">
          <IncomeExpenseChart ingresos={ingresos} gastos={gastos} rate={rate} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <IncomeDistribution ingresos={ingresos} rate={rate} />
          </div>
          <div>
            <ExpenseDistribution gastos={gastos} rate={rate} />
          </div>
        </div>
      </div>
    </div>
  );
}
