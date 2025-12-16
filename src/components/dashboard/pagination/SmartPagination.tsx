"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// Build compact pagination items: numbers + ellipsis
// Mirrors the reference implementation: show a small window around current,
// plus edges, and insert ellipsis where gaps exist.
type PageItem = number | "dots";

function buildPaginationItems(current: number, total: number): PageItem[] {
  if (total <= 1) return [1];

  const pages = new Set<number>();
  pages.add(1);
  pages.add(total);
  pages.add(current);
  pages.add(Math.max(1, current - 1));
  pages.add(Math.min(total, current + 1));

  if (current <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (current >= total - 2) {
    pages.add(total - 1);
    pages.add(total - 2);
    pages.add(total - 3);
  }

  const ordered = Array.from(pages)
    .filter((n) => Number.isFinite(n) && n >= 1 && n <= total)
    .sort((a, b) => a - b);

  const items: PageItem[] = [];
  for (let i = 0; i < ordered.length; i++) {
    const n = ordered[i];
    const prev = ordered[i - 1];
    if (i > 0 && prev != null && n - prev > 1) items.push("dots");
    items.push(n);
  }
  return items;
}

export function SmartPagination({
  page,
  pages,
  onPage,
}: {
  page: number;
  pages: number;
  onPage: (page: number) => void;
}) {
  // Guard against transient invalid values (prevents NaN showing in UI)
  if (!Number.isFinite(pages)) return null;

  const safePages = Math.max(1, Math.floor(pages));
  const safePage = Number.isFinite(page)
    ? Math.min(safePages, Math.max(1, Math.floor(page)))
    : 1;

  const items = buildPaginationItems(safePage, safePages);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onPage(Math.max(1, safePage - 1))}
        disabled={safePage <= 1}
        className={cn(
          "h-8 w-8 rounded-full border inline-flex items-center justify-center transition",
          "border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text)]",
          "hover:bg-[var(--dash-surface-2)] disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-1">
        {items.map((it, idx) =>
          it === "dots" ? (
            <span
              key={`dots-${idx}`}
              className="px-2 text-xs font-semibold text-[var(--dash-muted)]"
            >
              …
            </span>
          ) : (
            <button
              key={it}
              type="button"
              onClick={() => onPage(it)}
              className={cn(
                "h-8 min-w-8 px-2 rounded-full text-xs font-semibold transition",
                it === safePage
                  ? "bg-[var(--dash-red-soft)] text-[var(--dash-text)]"
                  : "text-[var(--dash-muted)] hover:bg-[var(--dash-surface-2)]"
              )}
              aria-current={it === safePage ? "page" : undefined}
            >
              {it}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        onClick={() => onPage(Math.min(safePages, safePage + 1))}
        disabled={safePage >= safePages}
        className={cn(
          "h-8 w-8 rounded-full border inline-flex items-center justify-center transition",
          "border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text)]",
          "hover:bg-[var(--dash-surface-2)] disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
