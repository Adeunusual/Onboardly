"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Laptop, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useDashboardTheme, type DashboardThemeMode } from "./DashboardThemeProvider";

const modes: Array<{
  mode: DashboardThemeMode;
  label: string;
  Icon: typeof Sun;
}> = [
  { mode: "light", label: "Light", Icon: Sun },
  { mode: "dark", label: "Dark", Icon: Moon },
  { mode: "system", label: "System", Icon: Laptop },
];

export function ThemeModeSwitcher() {
  const { mode, setMode } = useDashboardTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const ActiveIcon = useMemo(() => {
    // Show the currently selected mode’s icon on the button (matches screenshot feel)
    const found = modes.find((m) => m.mode === mode);
    return found?.Icon ?? Moon;
  }, [mode]);

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const el = ref.current;
      if (el == null) return;
      if (!el.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-xl border transition",
          "border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text)] shadow-[var(--dash-shadow)]",
          "hover:bg-[var(--dash-surface-2)]",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-red-soft)]"
        )}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Appearance"
      >
        <ActiveIcon className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Theme mode"
            className={cn(
              "absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-2xl border",
              "border-[var(--dash-border)] bg-[var(--dash-surface)] shadow-[var(--dash-shadow)]"
            )}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
          >
            <div className="py-2">
              {modes.map(({ mode: m, label, Icon }) => {
                const active = mode === m;
                return (
                  <button
                    key={m}
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    onClick={() => {
                      setMode(m);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-2.5 text-sm transition",
                      active
                        ? "bg-[var(--dash-surface-2)] text-[var(--dash-text)]"
                        : "text-[var(--dash-text)] hover:bg-[var(--dash-surface-2)]"
                    )}
                  >
                    <Icon className="h-4 w-4 text-[var(--dash-muted)]" />
                    <span className="flex-1 text-left">{label}</span>
                    {active && <Check className="h-4 w-4 text-[var(--dash-red)]" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

