"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { convertToHnl } from "@/src/lib/exchange-rate";
import { formatNumber } from "@/src/lib/format";
import type { Ingreso, Gasto } from "@/src/types";

interface Props {
  ingresos: Ingreso[];
  gastos: Gasto[];
  rate: number;
}

interface MonthData {
  year: number;
  month: number;
  label: string;
  ingresos: number;
  gastos: number;
}

function MobileMonthRow({ m, maxVal }: { m: MonthData; maxVal: number }) {
  const incPct = maxVal > 0 ? (m.ingresos / maxVal) * 100 : 0;
  const gasPct = maxVal > 0 ? (m.gastos / maxVal) * 100 : 0;
  const bal = m.ingresos - m.gastos;

  return (
    <div className="rounded-xl border border-neutral-800/40 bg-neutral-950/30 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-neutral-300">{m.label}</span>
        <span className={`text-xs font-medium ${bal >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {bal >= 0 ? "+" : ""}L. {formatNumber(bal, 0)}
        </span>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-12 shrink-0 text-right text-emerald-400">+L.{formatNumber(m.ingresos, 0)}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-800">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${incPct}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-12 shrink-0 text-right text-red-400">-L.{formatNumber(m.gastos, 0)}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-800">
            <div className="h-full rounded-full bg-red-500 transition-all" style={{ width: `${gasPct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IncomeExpenseChart({ ingresos, gastos, rate }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);

  const months: MonthData[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"][d.getMonth()],
      ingresos: 0,
      gastos: 0,
    });
  }

  ingresos.forEach((ing) => {
    const d = new Date(ing.date);
    const match = months.find(
      (m) => m.year === d.getFullYear() && m.month === d.getMonth(),
    );
    if (match) {
      match.ingresos += convertToHnl(
        Number(ing.amount),
        ing.currency || "HNL",
        rate,
      );
    }
  });

  gastos.forEach((gas) => {
    const d = new Date(gas.date);
    const match = months.find(
      (m) => m.year === d.getFullYear() && m.month === d.getMonth(),
    );
    if (match) {
      match.gastos += convertToHnl(
        Number(gas.amount),
        gas.currency || "HNL",
        rate,
      );
    }
  });

  const maxVal =
    Math.max(...months.map((m) => Math.max(m.ingresos, m.gastos))) * 1.15 ||
    1000;
  const chartHeight = 160;
  const chartWidth = 680;
  const xOffset = 70;
  const yOffset = 30;
  const baseline = yOffset + chartHeight;

  const gridLines = [
    { y: baseline, label: "L. 0" },
    {
      y: baseline - chartHeight * 0.25,
      label: `L. ${Math.round((maxVal * 0.25) / 100) / 10}k`,
    },
    {
      y: baseline - chartHeight * 0.5,
      label: `L. ${Math.round((maxVal * 0.5) / 100) / 10}k`,
    },
    {
      y: baseline - chartHeight * 0.75,
      label: `L. ${Math.round((maxVal * 0.75) / 100) / 10}k`,
    },
    {
      y: yOffset,
      label: `L. ${Math.round(maxVal / 100) / 10}k`,
    },
  ];

  const colWidth = chartWidth / 6;
  const barWidth = 26;

  const bars = months.map((m, i) => {
    const colCenter = xOffset + (i + 0.5) * colWidth;
    const incH = (m.ingresos / maxVal) * chartHeight;
    const gasH = (m.gastos / maxVal) * chartHeight;
    const bal = m.ingresos - m.gastos;
    const balY = baseline - (bal / maxVal) * chartHeight;

    return {
      label: m.label,
      inc: {
        x: colCenter - barWidth - 4,
        y: baseline - incH,
        h: Math.max(incH, 2),
        val: m.ingresos,
      },
      gas: {
        x: colCenter + 4,
        y: baseline - gasH,
        h: Math.max(gasH, 2),
        val: m.gastos,
      },
      linePoint: { x: colCenter, y: balY, val: bal },
    };
  });

  let linePath = "";
  if (bars.length > 0) {
    linePath = `M ${bars[0].linePoint.x} ${bars[0].linePoint.y}`;
    for (let i = 1; i < bars.length; i++) {
      const prev = bars[i - 1].linePoint;
      const curr = bars[i].linePoint;
      const cp1x = prev.x + colWidth / 3;
      const cp1y = prev.y;
      const cp2x = curr.x - colWidth / 3;
      const cp2y = curr.y;
      linePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".chart-fade-in", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.05,
        ease: "power2.out",
      });

      gsap.from(".chart-bar", {
        attr: { height: 0, y: baseline },
        duration: 1.2,
        stagger: 0.04,
        ease: "power4.out",
      });

      const paths = document.querySelectorAll(".chart-trend-line");
      paths.forEach((path) => {
        const length = (path as SVGPathElement).getTotalLength();
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 1.6,
          ease: "power2.inOut",
          delay: 0.4,
        });
      });

      gsap.from(".chart-dot", {
        scale: 0,
        transformOrigin: "center",
        duration: 0.5,
        stagger: 0.08,
        ease: "back.out(2)",
        delay: 1.2,
      });
    }, chartRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={chartRef}
      className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 backdrop-blur-md"
    >
      <div className="mb-3">
        <h3 className="text-base font-semibold text-white">
          Ingresos vs Gastos
        </h3>
        <p className="mt-0.5 text-[11px] text-neutral-400">
          Comparativa de flujos de caja y saldo neto de los últimos 6 meses
        </p>
      </div>

      <div className="sm:hidden space-y-2">
        {months.map((m) => (
          <MobileMonthRow key={`${m.year}-${m.month}`} m={m} maxVal={maxVal} />
        ))}
      </div>

      <div className="max-sm:hidden w-full overflow-x-auto">
        <svg viewBox="0 0 800 240" className="min-w-[700px] w-full select-none">
          <defs>
            <linearGradient id="chartIncGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="chartGasGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F87171" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
            <linearGradient
              id="lineGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <g className="chart-fade-in opacity-0">
            {gridLines.map((line, i) => (
              <g key={i}>
                <line
                  x1={xOffset}
                  y1={line.y}
                  x2={xOffset + chartWidth}
                  y2={line.y}
                  stroke="#262626"
                  strokeWidth="1.5"
                  strokeDasharray="4 6"
                />
                <text
                  x={xOffset - 12}
                  y={line.y + 4}
                  fill="#737373"
                  fontSize="11"
                  fontFamily="system-ui"
                  textAnchor="end"
                >
                  {line.label}
                </text>
              </g>
            ))}
          </g>

          <g>
            {bars.map((bar, i) => (
              <g key={i} className="group">
                <rect
                  className="chart-bar cursor-pointer transition-all duration-200 hover:brightness-110"
                  x={bar.inc.x}
                  y={bar.inc.y}
                  width={barWidth}
                  height={bar.inc.h}
                  rx="6"
                  fill="url(#chartIncGrad)"
                >
                  <title>
                    Ingreso: L.{" "}
                    {formatNumber(bar.inc.val)}
                  </title>
                </rect>

                <rect
                  className="chart-bar cursor-pointer transition-all duration-200 hover:brightness-110"
                  x={bar.gas.x}
                  y={bar.gas.y}
                  width={barWidth}
                  height={bar.gas.h}
                  rx="6"
                  fill="url(#chartGasGrad)"
                >
                  <title>
                    Gasto: L.{" "}
                    {formatNumber(bar.gas.val)}
                  </title>
                </rect>

                <text
                  className="chart-fade-in opacity-0"
                  x={bar.linePoint.x}
                  y={baseline + 24}
                  fill="#A3A3A3"
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="system-ui"
                  textAnchor="middle"
                >
                  {bar.label}
                </text>
              </g>
            ))}
          </g>

          <g>
            <path
              className="chart-trend-line"
              d={linePath}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.3"
              filter="url(#glow)"
            />
            <path
              className="chart-trend-line"
              d={linePath}
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {bars.map((bar, i) => (
              <g key={i}>
                <circle
                  className="chart-dot cursor-pointer"
                  cx={bar.linePoint.x}
                  cy={bar.linePoint.y}
                  r="6"
                  fill="#FFFFFF"
                  stroke="#2563EB"
                  strokeWidth="3"
                >
                  <title>
                    Saldo Neto: L.{" "}
                    {formatNumber(bar.linePoint.val)}
                  </title>
                </circle>
              </g>
            ))}
          </g>
        </svg>
      </div>

      <div className="mt-3 max-sm:hidden flex-wrap items-center justify-center gap-6 border-t border-neutral-800/60 pt-3 text-xs font-medium text-neutral-400 sm:flex">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-5 rounded-md bg-gradient-to-b from-emerald-400 to-emerald-600" />
          <span>Ingresos</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-5 rounded-md bg-gradient-to-b from-red-400 to-red-600" />
          <span>Gastos</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-1 w-5 rounded-full bg-blue-500" />
          <span>Saldo Neto</span>
        </div>
      </div>
    </div>
  );
}
