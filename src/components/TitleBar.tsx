"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

declare global {
  interface Window {
    electronAPI?: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      onMaximizedChanged: (callback: (maximized: boolean) => void) => void;
      platform: string;
    };
  }
}

export default function TitleBar() {
  const [maximized, setMaximized] = useState(false);
  const isElectron = typeof window !== "undefined" && !!window.electronAPI;

  useEffect(() => {
    if (!window.electronAPI) return;
    document.body.style.paddingTop = "40px";
    window.electronAPI.onMaximizedChanged(setMaximized);
    return () => {
      document.body.style.paddingTop = "";
    };
  }, []);

  if (!isElectron) return null;

  return (
    <div
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      className="fixed top-0 left-0 right-0 z-[9999] flex h-10 items-center justify-between bg-neutral-950 border-b border-neutral-800 select-none"
    >
      <div className="flex items-center gap-2 pl-3">
        <img
          src="/logo-header.svg"
          alt=""
          className="h-5 w-auto brightness-125 saturate-150"
        />
        <span className="text-sm font-semibold text-neutral-300">MoneyMap</span>
      </div>
      <div style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties} className="flex h-full">
        <button
          type="button"
          onClick={() => window.electronAPI?.minimize()}
          className="flex h-10 w-11 cursor-pointer items-center justify-center text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
          aria-label="Minimizar"
        >
          <svg width="12" height="12" viewBox="0 0 12 1" fill="currentColor">
            <rect x="0" y="0" width="12" height="1" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => window.electronAPI?.maximize()}
          className="flex h-10 w-11 cursor-pointer items-center justify-center text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
          aria-label={maximized ? "Restaurar" : "Maximizar"}
        >
          {maximized ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="2" y="4" width="8" height="8" rx="1" />
              <path d="M10 4V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="1" y="1" width="10" height="10" rx="1" />
            </svg>
          )}
        </button>
        <button
          type="button"
          onClick={() => window.electronAPI?.close()}
          className="flex h-10 w-11 cursor-pointer items-center justify-center text-neutral-400 transition-colors hover:bg-red-600 hover:text-white"
          aria-label="Cerrar"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 1l10 10M11 1L1 11" />
          </svg>
        </button>
      </div>
    </div>
  );
}
