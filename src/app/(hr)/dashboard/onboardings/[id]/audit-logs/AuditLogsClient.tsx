"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RefreshCcw } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { ApiError } from "@/lib/api/client";
import { getOnboardingAuditLogs, type AuditLogListItem } from "@/lib/api/admin/onboardings";
import { SmartPagination } from "@/components/dashboard/pagination/SmartPagination";

export function AuditLogsClient({
  onboardingId,
  initialItems,
  initialMeta,
  initialError,
}: {
  onboardingId: string;
  initialItems: AuditLogListItem[];
  initialMeta: any | null;
  initialError: string | null;
}) {
  const sp = useSearchParams();
  const router = useRouter();

  const [items, setItems] = useState<AuditLogListItem[]>(initialItems);
  const [meta, setMeta] = useState<any | null>(initialMeta);
  const [error, setError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState(false);

  const page = Math.max(1, Number(sp.get("page") ?? String(meta?.page ?? 1)) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number(sp.get("pageSize") ?? String(meta?.pageSize ?? 25)) || 25)
  );
  const totalPages = meta?.totalPages ?? 1;
  const total = meta?.total ?? 0;

  const updateQuery = useCallback(
    (next: Record<string, string | undefined>) => {
      const nextSp = new URLSearchParams(sp.toString());
      Object.entries(next).forEach(([k, v]) => {
        if (!v) nextSp.delete(k);
        else nextSp.set(k, v);
      });
      router.replace(`/dashboard/onboardings/${onboardingId}/audit-logs?${nextSp.toString()}`);
    },
    [router, sp, onboardingId]
  );

  const load = useCallback(
    async (nextPage: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await getOnboardingAuditLogs({
          id: onboardingId,
          page: nextPage,
          pageSize,
          sortBy: "createdAt",
          sortDir: "desc",
        });
        setItems(res.items);
        setMeta(res.meta);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Unable to load audit logs.");
      } finally {
        setLoading(false);
      }
    },
    [onboardingId, pageSize]
  );

  // Keep data in sync with URL pagination (matches Home page behavior).
  useEffect(() => {
    if (error) return;
    if (!meta) {
      void load(page);
      return;
    }
    if (meta.page !== page || meta.pageSize !== pageSize) void load(page);
  }, [page, pageSize, meta, load, error]);

  const rows = useMemo(() => items ?? [], [items]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] shadow-[var(--dash-shadow)] overflow-hidden">
        <div className="p-5 border-b border-[var(--dash-border)] flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-[var(--dash-text)]">
              Audit logs
            </div>
            <div className="mt-1 text-sm text-[var(--dash-muted)]">
              Read-only list of events for this onboarding.
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-xs font-semibold text-[var(--dash-muted)]">
              {loading ? "Loading…" : error ? "—" : `${total} event(s)`}
            </div>
            <SmartPagination
              page={page}
              pages={totalPages}
              onPage={(p) => {
                if (loading) return;
                updateQuery({ page: String(p), pageSize: String(pageSize) });
              }}
            />
            <button
              type="button"
              onClick={() => load(page)}
              disabled={loading}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition",
                "border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text)] hover:bg-[var(--dash-surface-2)]",
                loading && "opacity-60 cursor-not-allowed"
              )}
            >
              <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="p-5 text-sm text-[var(--dash-red)]">{error}</div>
        )}

        {!error && (
          <div className="p-5 space-y-3">
            {rows.length === 0 ? (
              <div className="text-sm text-[var(--dash-muted)]">
                No audit logs found.
              </div>
            ) : (
              <div className="space-y-2">
                {rows.map((it) => (
                  <div
                    key={it.id}
                    className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface-2)] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[var(--dash-text)]">
                          {it.action}
                        </div>
                        <div className="mt-1 text-sm text-[var(--dash-muted)]">
                          {it.message}
                        </div>
                      </div>
                      <div className="text-xs text-[var(--dash-muted)]">
                        {new Date(it.createdAt as any).toLocaleString()}
                      </div>
                    </div>
                    {it.actor && (
                      <div className="mt-2 text-xs text-[var(--dash-muted)]">
                        Actor:{" "}
                        <span className="text-[var(--dash-text)]">
                          {it.actor?.name ?? "—"}
                        </span>{" "}
                        ({it.actor?.type ?? "—"})
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


