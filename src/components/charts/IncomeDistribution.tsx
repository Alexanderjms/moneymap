"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { convertToHnl } from "@/src/lib/exchange-rate";
import { formatNumber } from "@/src/lib/format";
import type { Ingreso } from "@/src/types";

interface Props {
  ingresos: Ingreso[];
  rate: number;
}

export default function IncomeDistribution({ ingresos, rate }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);

  const itemsMap = new Map<string, number>();
  ingresos.forEach((ing) => {
    const valHnl = convertToHnl(
      Number(ing.amount),
      ing.currency || "HNL",
      rate,
    );
    const name = ing.name || "Otros";
    itemsMap.set(name, (itemsMap.get(name) || 0) + valHnl);
  });

  const sorted = Array.from(itemsMap.entries())
    .map(([name, val]) => ({ name, val }))
    .sort((a, b) => b.val - a.val);

  const topItems: { name: string; val: number }[] = [];
  let othersVal = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (i < 3) {
      topItems.push(sorted[i]);
    } else {
      othersVal += sorted[i].val;
    }
  }
  if (othersVal > 0) {
    topItems.push({ name: "Otros", val: othersVal });
  }

  const grandTotal = topItems.reduce((acc, item) => acc + item.val, 0);
  const colors = ["#10B981", "#06B6D4", "#3B82F6", "#84CC16"];
  const C = 377;
  let cumulative = 0;

  const segments = topItems.map((item, idx) => {
    const percent = grandTotal > 0 ? item.val / grandTotal : 0;
    const strokeLength = percent * C;
    const offset = -cumulative;
    cumulative += strokeLength;

    return {
      ...item,
      percent: Math.round(percent * 100),
      color: colors[idx % colors.length],
      dashArray: `${strokeLength} ${C}`,
      offset,
    };
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      const segs = document.querySelectorAll(".income-segment");
      segs.forEach((seg) => {
        const offset = parseFloat(
          seg.getAttribute("stroke-dashoffset") || "0",
        );
        gsap.fromTo(
          seg,
          { strokeDashoffset: 0 },
          {
            strokeDashoffset: offset,
            duration: 1.4,
            ease: "power3.out",
          },
        );
      });
    }, chartRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={chartRef}
      className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 backdrop-blur-md h-full"
    >
      <div className="mb-3">
        <h3 className="text-base font-semibold text-white">
          Fuentes de Ingresos
        </h3>
        <p className="mt-0.5 text-[11px] text-neutral-400">
          Distribución de las fuentes de ingresos
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 my-2">
        <div className="relative w-[130px] h-[130px] flex items-center justify-center shrink-0">
          <svg
            width="130"
            height="130"
            viewBox="0 0 160 160"
            className="transform -rotate-90 select-none"
          >
            <circle
              cx="80"
              cy="80"
              r="60"
              fill="none"
              stroke="#262626"
              strokeWidth="18"
            />

            {segments.map((seg, idx) => (
              <circle
                key={idx}
                className="income-segment cursor-pointer transition-all duration-200 hover:stroke-[22px]"
                cx="80"
                cy="80"
                r="60"
                fill="none"
                stroke={seg.color}
                strokeWidth="18"
                strokeDasharray={seg.dashArray}
                strokeDashoffset={seg.offset}
                strokeLinecap="round"
              >
                <title>
                  {seg.name}: L. {formatNumber(seg.val)} (
                  {seg.percent}%)
                </title>
              </circle>
            ))}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-neutral-400 uppercase font-semibold tracking-wider">
              Total
            </span>
            <span className="mt-0.5 text-sm font-bold text-emerald-400">
              L. {formatNumber(grandTotal, 0)}
            </span>
          </div>
        </div>

        <div className="flex-1 w-full space-y-2 text-xs font-medium">
          {segments.map((seg, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl border border-neutral-800/40 bg-neutral-950/20 p-1.5 transition-colors duration-200 hover:bg-neutral-900/50"
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="max-w-[110px] truncate text-neutral-200">
                  {seg.name}
                </span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-neutral-100">
                  L. {formatNumber(seg.val, 0)}
                </div>
                <div className="mt-0.5 text-[10px] text-neutral-400">
                  {seg.percent}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
