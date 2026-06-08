"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { convertToHnl } from "@/src/lib/exchange-rate";
import { formatNumber } from "@/src/lib/format";
import type { Gasto } from "@/src/types";

interface Props {
  gastos: Gasto[];
  rate: number;
}

export default function ExpenseDistribution({ gastos, rate }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);

  const processedExpenses = gastos.map((gas) => ({
    name: gas.name || "Gasto sin nombre",
    amountHnl: convertToHnl(
      Number(gas.amount),
      gas.currency || "HNL",
      rate,
    ),
    date: gas.date,
  }));

  const sorted = processedExpenses.sort((a, b) => b.amountHnl - a.amountHnl);

  const topExpenses = sorted.slice(0, 4);
  const hasData = topExpenses.length > 0;

  const maxExpense =
    topExpenses.length > 0
      ? Math.max(...topExpenses.map((e) => e.amountHnl))
      : 1000;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".expense-bar", {
        scaleX: 0,
        transformOrigin: "left",
        duration: 1.2,
        stagger: 0.1,
        ease: "power4.out",
      });
    }, chartRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={chartRef}
      className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 backdrop-blur-md h-full"
    >
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white">
          Mayores Egresos
        </h3>
        <p className="mt-0.5 text-[11px] text-neutral-400">
          Top de los gastos individuales de mayor valor registrado
        </p>
      </div>

      <div className="flex-1 w-full my-2 space-y-4 text-xs font-medium">
        {hasData ? (
          topExpenses.map((exp, idx) => {
            const percentage = (exp.amountHnl / maxExpense) * 100;
            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="max-w-[200px] truncate text-neutral-200">
                    {exp.name}
                  </span>
                  <span className="font-semibold text-neutral-100">
                    L. {formatNumber(exp.amountHnl, 0)}
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full border border-neutral-800/40 bg-neutral-950/40">
                  <div
                    className="expense-bar h-full origin-left rounded-full bg-gradient-to-r from-red-500 to-orange-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p className="py-8 text-center text-neutral-500">
            No hay gastos registrados.
          </p>
        )}
      </div>
    </div>
  );
}
