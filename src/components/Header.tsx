"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-800/50 bg-neutral-950/70 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between py-4">
        <Link
          href="/personal/"
          className="group flex items-center gap-2 text-base font-semibold text-emerald-400 hover:text-emerald-300"
        >
          <img
            src="/logo-header.svg"
            alt="MoneyMap"
            className="-mt-1.5 h-7 w-auto brightness-125 saturate-150 transition-all duration-200 group-hover:brightness-150 group-hover:saturate-200"
          />
          MoneyMap
        </Link>
        <div className="flex items-center gap-6 text-base">
          <Link
            href="/personal/"
            className="flex items-center gap-1.5 text-neutral-400 hover:text-white"
          >
            <Icon icon="mdi:home" className="h-5 w-5 mt-1" />
            <span className="mt-1">Home</span>
          </Link>
          <Link
            href="/personal/ingresos"
            className="flex items-center gap-1.5 text-neutral-400 hover:text-white"
          >
            <Icon icon="mdi:plus-circle" className="h-5 w-5 mt-1" />
            <span className="mt-1">Ingresos</span>
          </Link>
          <Link
            href="/personal/gastos"
            className="flex items-center gap-1.5 text-neutral-400 hover:text-white"
          >
            <Icon icon="mdi:trending-down" className="h-5 w-5 mt-1" />
            <span className="mt-1">Gastos</span>
          </Link>
          <form method="POST" action="/api/logout">
            <button
              type="submit"
              className="flex cursor-pointer items-center gap-1.5 text-neutral-500 hover:text-red-400"
            >
              <Icon icon="mdi:logout" className="h-5 w-5 mt-1" />
              <span className="mt-1">Salir</span>
            </button>
          </form>
        </div>
      </nav>
    </header>
  );
}
