"use client";

import { useState, useRef, useEffect } from "react";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

interface Day {
  day: number;
  month: number;
  year: number;
  other: boolean;
}

function getMonthDays(year: number, month: number): Day[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

  const days: Day[] = [];

  const prevMonthLast = new Date(year, month, 0).getDate();
  for (let i = startOffset - 1; i >= 0; i--) {
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    days.push({ day: prevMonthLast - i, month: m, year: y, other: true });
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({ day: i, month, year, other: false });
  }

  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      const m = month === 11 ? 0 : month + 1;
      const y = month === 11 ? year + 1 : year;
      days.push({ day: i, month: m, year: y, other: true });
    }
  }

  return days;
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDisplay(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface Props {
  name: string;
  value?: string;
  accent?: "emerald" | "red" | "violet";
  onChange?: (value: string) => void;
}

export default function DatePicker({
  name,
  value,
  accent = "emerald",
  onChange,
}: Props) {
  const today = new Date();
  const todayStr = toDateStr(today);
  const initialValue = value || todayStr;
  const initialDate = new Date(initialValue + "T12:00:00");

  const [selectedDate, setSelectedDate] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const pickerRef = useRef<HTMLDivElement>(null);

  const days = getMonthDays(viewYear, viewMonth);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  function selectDay(day: Day) {
    const dateStr = `${day.year}-${String(day.month + 1).padStart(2, "0")}-${String(day.day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
    setIsOpen(false);
    onChange?.(dateStr);
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  const accentBorder =
    accent === "emerald"
      ? "focus:border-emerald-500 focus:ring-emerald-500"
      : accent === "violet"
        ? "focus:border-violet-500 focus:ring-violet-500"
        : "focus:border-red-500 focus:ring-red-500";

  return (
    <div
      ref={pickerRef}
      data-component="datepicker"
      className="relative"
      style={
        {
          "--accent": accent === "emerald" ? "#10b981" : accent === "violet" ? "#8b5cf6" : "#ef4444",
        } as React.CSSProperties
      }
    >
      <input type="hidden" name={name} value={selectedDate} readOnly />

      <button
        type="button"
        data-trigger
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full cursor-pointer items-center justify-between rounded-lg border border-neutral-700 bg-neutral-800/50 px-3 py-2 text-sm text-white outline-none transition-colors hover:border-neutral-600 ${accentBorder} focus:ring-1`}
      >
        <span data-display>{formatDisplay(selectedDate)}</span>
        <svg
          className="h-4 w-4 text-neutral-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" />
        </svg>
      </button>

      {isOpen && (
        <div
          data-popup
          className="absolute left-0 top-full z-50 mt-1 w-72 origin-top rounded-xl border border-neutral-700 bg-neutral-900 p-4 shadow-2xl"
          style={{ transform: "scale(1) translateY(0)" }}
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              data-prev
              onClick={prevMonth}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>
            <span data-month-year className="text-sm font-medium text-white">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              data-next
              onClick={nextMonth}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
              </svg>
            </button>
          </div>
          <div className="mb-2 grid grid-cols-7 text-center text-xs font-medium text-neutral-500">
            <span>L</span>
            <span>M</span>
            <span>M</span>
            <span>J</span>
            <span>V</span>
            <span>S</span>
            <span>D</span>
          </div>
          <div data-days className="grid grid-cols-7 gap-y-1 text-center text-sm">
            {days.map((d, i) => {
              const dateStr = `${d.year}-${String(d.month + 1).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === todayStr && !isSelected;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectDay(d)}
                  className={`day-btn flex h-9 w-9 items-center justify-center rounded-lg text-sm mx-auto transition-colors hover:bg-neutral-800 ${
                    d.other ? "text-neutral-600 hover:bg-transparent" : "text-white"
                  } ${isSelected ? "!bg-emerald-700 !text-white font-medium" : ""} ${
                    isToday ? "outline outline-1 -outline-offset-1" : ""
                  }`}
                  style={
                    isToday
                      ? { outlineColor: "var(--accent)" }
                      : undefined
                  }
                >
                  {d.day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
