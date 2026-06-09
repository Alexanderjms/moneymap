"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import gsap from "gsap";
import { useTheme } from "@/src/contexts/ThemeContext";

const THEMES = [
  { key: "default", label: "Neutral", color: "#404040" },
  { key: "onyx", label: "Ónice", color: "#3b82f6" },
  { key: "obsidian", label: "Obsidiana", color: "#8b5cf6" },
  { key: "esmeralda", label: "Esmeralda", color: "#10b981" },
  { key: "rubi", label: "Rubí", color: "#ef4444" },
  { key: "grafito", label: "Grafito", color: "#6b7280" },
] as const;

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [themesExpanded, setThemesExpanded] = useState(false);
  const themesBodyRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const themeBtnRef = useRef<HTMLButtonElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const menuDrawerRef = useRef<HTMLDivElement>(null);
  const menuBackdropRef = useRef<HTMLDivElement>(null);

  function openMobileMenu() {
    setMenuOpen(true);
    document.body.style.overflow = "hidden";
    gsap.set(menuDrawerRef.current, { x: "100%", force3D: true });
    gsap.set(menuBackdropRef.current, { opacity: 0, pointerEvents: "none" });
    menuBackdropRef.current?.classList.add("backdrop-blur-sm");
    gsap.to(menuBackdropRef.current, {
      opacity: 1,
      pointerEvents: "auto",
      duration: 0.25,
      ease: "power4.out",
    });
    gsap.to(menuDrawerRef.current, {
      x: "0%",
      duration: 0.35,
      ease: "power4.out",
    });
  }

  function closeMobileMenu() {
    setMenuOpen(false);
    document.body.style.overflow = "";
    gsap.to(menuBackdropRef.current, {
      opacity: 0,
      pointerEvents: "none",
      duration: 0.15,
      ease: "power2.inOut",
    });
    gsap.to(menuDrawerRef.current, {
      x: "100%",
      duration: 0.25,
      ease: "power2.inOut",
      onComplete: () => {
        menuBackdropRef.current?.classList.remove("backdrop-blur-sm");
      },
    });
  }

  useEffect(() => {
    const el = themesBodyRef.current;
    if (!el) return;
    if (themesExpanded) {
      gsap.set(el, { display: "block", height: "auto" });
      const h = el.scrollHeight;
      gsap.set(el, { height: 0, opacity: 0 });
      gsap.to(el, { height: h, opacity: 1, duration: 0.3, ease: "power2.out" });
    } else {
      gsap.to(el, { height: 0, opacity: 0, duration: 0.2, ease: "power2.inOut", onComplete: () => { gsap.set(el, { display: "none" }); } });
    }
  }, [themesExpanded]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && menuOpen) closeMobileMenu();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [menuOpen]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        themeOpen &&
        themeMenuRef.current &&
        !themeMenuRef.current.contains(e.target as Node) &&
        themeBtnRef.current &&
        !themeBtnRef.current.contains(e.target as Node)
      ) {
        setThemeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [themeOpen]);

  const linkClass =
    "flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors";

  return (
    <>
    <header className="sticky top-0 z-30 border-b border-neutral-800/50 bg-neutral-950/70 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Link
          href="/personal/"
          className="group flex items-center gap-2 text-base font-semibold text-emerald-400 hover:text-emerald-300"
        >
          <img
            src="/favicon.svg"
            alt="MoneyMap"
            className="-mt-1 h-6 w-auto brightness-125 saturate-150 transition-all duration-200 group-hover:brightness-150 group-hover:saturate-200 sm:h-7"
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
          <Link href="/personal/plan-compras" className={linkClass}>
            <Icon icon="mdi:cart-outline" className="h-5 w-5" />
            <span>Plan de compras</span>
          </Link>
          <div className="relative">
            <button
              ref={themeBtnRef}
              type="button"
              onClick={() => setThemeOpen(!themeOpen)}
              className="flex cursor-pointer items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors"
              aria-label="Cambiar tema"
            >
              <Icon icon="mdi:palette" className="h-5 w-5" />
            </button>
            {themeOpen && (
              <div
                ref={themeMenuRef}
                className="absolute right-0 top-full mt-2 w-40 rounded-xl border border-neutral-800 bg-neutral-900 p-1.5 shadow-lg"
              >
                {THEMES.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => { setTheme(t.key as typeof theme); setThemeOpen(false); }}
                    className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                      theme === t.key
                        ? "text-white bg-neutral-800"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
                    }`}
                  >
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: t.color }}
                    />
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

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
          onClick={() => (menuOpen ? closeMobileMenu() : openMobileMenu())}
          className="flex cursor-pointer items-center gap-1 text-sm text-neutral-400 hover:text-white transition-colors sm:hidden"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          <Icon icon={menuOpen ? "mdi:close" : "mdi:menu"} className="h-6 w-6" />
        </button>
      </nav>

    </header>

    <div
      ref={menuBackdropRef}
      className="pointer-events-none fixed inset-0 z-40 bg-black/60 opacity-0 sm:hidden"
      onClick={closeMobileMenu}
    />

    <div
      ref={menuDrawerRef}
      className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-neutral-800 bg-neutral-950 shadow-2xl will-change-transform sm:hidden"
      style={{ transform: "translateX(100%)" }}
    >
      <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-4">
        <span className="text-lg font-semibold">Menú</span>
        <button
          type="button"
          onClick={closeMobileMenu}
          className="cursor-pointer text-neutral-500 hover:text-white"
          aria-label="Cerrar menú"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 15 15">
            <path d="M12.854.146a.5.5 0 0 0-.707 0L7.5 4.793 2.854.146a.5.5 0 0 0-.708.708L6.793 5.5.146 10.146a.5.5 0 0 0 .708.708L7.5 6.207l4.646 4.647a.5.5 0 0 0 .708-.708L8.207 5.5l4.647-4.646a.5.5 0 0 0 0-.708z" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="flex flex-col gap-1">
          <Link
            href="/personal/"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-400 hover:bg-neutral-800/60 hover:text-white transition-colors"
          >
            <Icon icon="mdi:home" className="h-5 w-5" />
            Home
          </Link>
          <Link
            href="/personal/ingresos"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-400 hover:bg-neutral-800/60 hover:text-white transition-colors"
          >
            <Icon icon="mdi:plus-circle" className="h-5 w-5" />
            Ingresos
          </Link>
          <Link
            href="/personal/gastos"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-400 hover:bg-neutral-800/60 hover:text-white transition-colors"
          >
            <Icon icon="mdi:trending-down" className="h-5 w-5" />
            Gastos
          </Link>
          <Link
            href="/personal/plan-compras"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-400 hover:bg-neutral-800/60 hover:text-white transition-colors"
          >
            <Icon icon="mdi:cart-outline" className="h-5 w-5" />
            Plan de compras
          </Link>
        </div>

        <div className="border-t border-neutral-800/50 my-4 pt-4">
          <button
            type="button"
            onClick={() => setThemesExpanded(!themesExpanded)}
            className="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 hover:text-white transition-colors"
          >
            Tema
            <Icon
              icon={themesExpanded ? "mdi:chevron-up" : "mdi:chevron-down"}
              className="h-4 w-4"
            />
          </button>
          <div ref={themesBodyRef} className="overflow-hidden" style={{ height: 0, opacity: 0, display: "none" }}>
            <div className="space-y-1 pt-1">
              {THEMES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => { setTheme(t.key as typeof theme); closeMobileMenu(); }}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    theme === t.key
                      ? "text-white bg-neutral-800"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
                  }`}
                >
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: t.color }}
                  />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <form method="POST" action="/api/logout" className="mt-4">
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
    </>
  );
}
