"use client";

import React, { createContext, useEffect, useMemo, useState } from "react";

export type DashboardThemeMode = "light" | "dark" | "system";

type DashboardThemeContextValue = {
  mode: DashboardThemeMode;
  resolvedTheme: "light" | "dark";
  setMode: (mode: DashboardThemeMode) => void;
};

const DashboardThemeContext = createContext<DashboardThemeContextValue | null>(
  null
);

const STORAGE_KEY = "npt.dashboard.theme.mode";

function resolveTheme(mode: DashboardThemeMode): "light" | "dark" {
  if (mode === "light" || mode === "dark") return mode;
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
    ? "dark"
    : "light";
}

export function useDashboardTheme() {
  const ctx = React.useContext(DashboardThemeContext);
  if (!ctx) {
    throw new Error("useDashboardTheme must be used within DashboardThemeProvider");
  }
  return ctx;
}

export function DashboardThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setMode] = useState<DashboardThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  // Load persisted mode once
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw === "light" || raw === "dark" || raw === "system") {
        setMode(raw);
      }
    } catch {
      // ignore
    }
  }, []);

  // Keep resolved theme in sync (including system changes)
  useEffect(() => {
    const apply = () => setResolvedTheme(resolveTheme(mode));
    apply();

    if (mode !== "system") return;
    const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mql) return;

    const handler = () => apply();
    // Safari compatibility
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    }
    // Older Safari fallback
    (mql as any).addListener?.(handler);
    return () => (mql as any).removeListener?.(handler);
  }, [mode]);

  const value = useMemo<DashboardThemeContextValue>(
    () => ({
      mode,
      resolvedTheme,
      setMode: (next) => {
        setMode(next);
        try {
          window.localStorage.setItem(STORAGE_KEY, next);
        } catch {
          // ignore
        }
      },
    }),
    [mode, resolvedTheme]
  );

  return (
    <DashboardThemeContext.Provider value={value}>
      <div className="dashboard-root min-h-screen" data-theme={resolvedTheme}>
        {children}
      </div>
    </DashboardThemeContext.Provider>
  );
}

