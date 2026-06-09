"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

type Theme = "default" | "onyx" | "obsidian" | "esmeralda" | "rubi" | "grafito";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_KEY = "moneymap_theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("default");

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "onyx" || saved === "obsidian" || saved === "esmeralda" || saved === "rubi" || saved === "grafito") {
      setThemeState(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem(THEME_KEY, t);
    if (t === "default") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", t);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
