"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import gsap from "gsap";

export default function Header() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      gsap.fromTo(
        menuRef.current,
        { opacity: 0, scaleY: 0.95, transformOrigin: "top center" },
        { opacity: 1, scaleY: 1, duration: 0.2, ease: "power2.out" },
      );
    }
  }, [open]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        open &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const linkClass =
    "flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors";

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-800/50 bg-neutral-950/70 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Link
          href="/personal/"
          className="group flex items-center gap-2 text-base font-semibold text-emerald-400 hover:text-emerald-300"
        >
          <img
            src="/logo-header.svg"
            alt="MoneyMap"
            className="-mt-1.5 h-6 w-auto brightness-125 saturate-150 transition-all duration-200 group-hover:brightness-150 group-hover:saturate-200 sm:h-7"
          />
          <span>MoneyMap</span>
        </Link>

        <div className="hidden items-center gap-5 text-base sm:flex">
          <Link href="/personal/" className={linkClass}>
            <Icon icon="mdi:home" className="h-5 w-5" />
            <span>Home</span>
          </Link>
          <Link href="/personal/ingresos" className={linkClass}>
            <Icon icon="mdi:plus-circle" className="h-5 w-5" />
            <span>Ingresos</span>
          </Link>
          <Link href="/personal/gastos" className={linkClass}>
            <Icon icon="mdi:trending-down" className="h-5 w-5" />
            <span>Gastos</span>
          </Link>
          <form method="POST" action="/api/logout">
            <button
              type="submit"
              className="flex cursor-pointer items-center gap-1.5 text-sm text-neutral-500 hover:text-red-400 transition-colors"
            >
              <Icon icon="mdi:logout" className="h-5 w-5" />
              <span>Salir</span>
            </button>
          </form>
        </div>

        <button
          ref={btnRef}
          type="button"
          onClick={() => setOpen(!open)}
          className="flex cursor-pointer items-center gap-1 text-sm text-neutral-400 hover:text-white transition-colors sm:hidden"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          <Icon icon={open ? "mdi:close" : "mdi:menu"} className="h-6 w-6" />
        </button>
      </nav>

      {open && (
        <div
          ref={menuRef}
          className="border-t border-neutral-800/50 bg-neutral-950/95 backdrop-blur-md sm:hidden"
        >
          <div className="flex flex-col gap-1 px-4 py-3">
            <Link
              href="/personal/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-400 hover:bg-neutral-800/60 hover:text-white transition-colors"
            >
              <Icon icon="mdi:home" className="h-5 w-5" />
              Home
            </Link>
            <Link
              href="/personal/ingresos"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-400 hover:bg-neutral-800/60 hover:text-white transition-colors"
            >
              <Icon icon="mdi:plus-circle" className="h-5 w-5" />
              Ingresos
            </Link>
            <Link
              href="/personal/gastos"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-400 hover:bg-neutral-800/60 hover:text-white transition-colors"
            >
              <Icon icon="mdi:trending-down" className="h-5 w-5" />
              Gastos
            </Link>
            <form method="POST" action="/api/logout" className="mt-1">
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-500 hover:bg-neutral-800/60 hover:text-red-400 transition-colors"
              >
                <Icon icon="mdi:logout" className="h-5 w-5" />
                Salir
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
