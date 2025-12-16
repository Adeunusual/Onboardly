"use client";

import { Copy, Eye, RefreshCcw, Trash2 } from "lucide-react";

import type { AdminOnboardingListItem } from "@/lib/api/admin/onboardings";
import { cn } from "@/lib/utils/cn";
import { InviteCountdown } from "@/components/dashboard/onboardings/InviteCountdown";
import { OnboardingProgress } from "@/components/dashboard/onboardings/OnboardingProgress";
import { SmartPagination } from "@/components/dashboard/pagination/SmartPagination";

function toDate(value?: string | Date | null) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function OnboardingsDataGrid({
  items,
  loading,
  error,
  page,
  pages,
  total,
  onPage,
  onCopyLink,
  onView,
  onTerminate,
  onResendInvite,
  resendingId,
}: {
  items: AdminOnboardingListItem[];
  loading: boolean;
  error: string | null;
  page: number;
  pages: number;
  total: number;
  onPage: (page: number) => void;
  onCopyLink: (url?: string) => void;
  onView: (id: string) => void;
  onTerminate: (item: AdminOnboardingListItem) => void;
  onResendInvite: (id: string) => void;
  resendingId?: string | null;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] shadow-[var(--dash-shadow)] overflow-hidden">
        {/* Top summary row (before table header) */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[var(--dash-border)]">
          <div className="text-xs font-semibold text-[var(--dash-muted)]">
            {loading ? (
              "Loading…"
            ) : error ? (
              "—"
            ) : (
              `${total} result(s)`
            )}
          </div>

          <SmartPagination page={page} pages={pages} onPage={onPage} />
        </div>

        <div className="hidden md:grid grid-cols-[1.25fr_1.2fr_1.35fr_1.7fr_0.9fr] gap-4 px-5 py-3 border-b border-[var(--dash-border)] text-xs font-semibold text-[var(--dash-muted)]">
          <div>Employee</div>
          <div>Email</div>
          <div>Progress</div>
          <div>Invite</div>
          <div className="text-right">Actions</div>
        </div>

        {error && <div className="p-5 text-sm text-[var(--dash-red)]">{error}</div>}
        {!error && loading && (
          <div className="p-5 text-sm text-[var(--dash-muted)]">Loading…</div>
        )}
        {!error && !loading && items.length === 0 && (
          <div className="p-5 text-sm text-[var(--dash-muted)]">No results found.</div>
        )}

        {!error &&
          !loading &&
          items.map((it) => {
            const fullName = `${it.firstName} ${it.lastName}`.trim();
            const link = it.inviteUrl;
            const expiresAt = toDate(it.inviteExpiresAt);
            const isExpired = expiresAt ? expiresAt.getTime() <= Date.now() : false;

            const isComplete = it.status === "Approved" || it.status === "Terminated";

            // Employee-facing invite link is only relevant while an invite can be used.
            // Once the employee has submitted (Submitted/Resubmitted), the invite flow is no longer valid.
            const isInviteEligible =
              it.method === "digital" &&
              (it.status === "InviteGenerated" ||
                it.status === "ModificationRequested");

            const canResendInvite = it.method === "digital" && it.status === "InviteGenerated";

            const tokenHint = (() => {
              if (!link) return null;
              try {
                const u = new URL(link);
                const token = u.searchParams.get("token");
                if (!token) return link;
                if (token.length <= 12) return token;
                return `${token.slice(0, 6)}…${token.slice(-6)}`;
              } catch {
                return link;
              }
            })();

            return (
              <div
                key={it.id}
                className={cn(
                  "border-b border-[var(--dash-border)] px-5 py-4",
                  "md:grid md:grid-cols-[1.25fr_1.2fr_1.35fr_1.7fr_0.9fr] md:gap-4 md:items-center"
                )}
              >
                {/* Employee (name + optional employee number) */}
                <div className="min-w-0">
                  {it.employeeNumber && (
                    <div className="text-xs text-[var(--dash-muted)] truncate">
                      EN#:{" "}
                      <span className="font-mono text-[var(--dash-text)]">
                        {it.employeeNumber}
                      </span>
                    </div>
                  )}

                  <div className={cn("text-sm font-semibold truncate", it.employeeNumber && "mt-1")}>
                    {fullName}
                  </div>

                  {/* Mobile: stack email under name */}
                  <div className="mt-1 text-xs text-[var(--dash-muted)] truncate md:hidden">
                    {it.email}
                  </div>
                </div>

                {/* Email */}
                <div className="hidden md:block min-w-0 text-sm text-[var(--dash-muted)] truncate">
                  {it.email}
                </div>

                {/* Progress (Apple-like: dot + rail) */}
                <div className="mt-4 md:mt-0">
                  <OnboardingProgress status={it.status} method={it.method} />
                </div>

                {/* Invite */}
                <div className="mt-4 md:mt-0 min-w-0">
                  {/* Completed onboardings should not expose invites */}
                  {isComplete ? (
                    <div className="text-sm text-[var(--dash-muted)]">—</div>
                  ) : it.method === "manual" ? (
                    <div className="text-sm text-[var(--dash-muted)]">—</div>
                  ) : !isInviteEligible ? (
                    // Submitted / Resubmitted (Pending review) should not show invite link or resend.
                    <div className="text-sm text-[var(--dash-muted)]">—</div>
                  ) : link ? (
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <a
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(
                          "min-w-0 flex-1 rounded-xl border px-3 py-2",
                          "border-[var(--dash-border)] bg-[var(--dash-surface-2)]",
                          "hover:bg-[var(--dash-surface)] transition"
                        )}
                        title={link}
                      >
                        <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--dash-muted)]">
                          INVITE Link
                        </div>
                        <div className="mt-1 font-mono text-xs text-[var(--dash-text)] truncate">
                          {tokenHint}
                        </div>
                      </a>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => onCopyLink(link)}
                          disabled={isExpired}
                          className={cn(
                            "rounded-xl border p-2 border-[var(--dash-border)] text-[var(--dash-muted)]",
                            "hover:bg-[var(--dash-surface-2)]",
                            "cursor-pointer active:scale-95 transition-transform",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-red-soft)]",
                            isExpired && "opacity-50 cursor-not-allowed active:scale-100"
                          )}
                          aria-label="Copy invite link"
                          title={isExpired ? "Invite expired" : "Copy invite link"}
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        {it.inviteExpiresAt && (
                          <InviteCountdown expiresAt={it.inviteExpiresAt} />
                        )}

                        {/* Resend appears only when expired (V1 requirement) */}
                        {canResendInvite && isExpired && (
                          <button
                            type="button"
                            onClick={() => onResendInvite(it.id)}
                            disabled={resendingId === it.id}
                            className={cn(
                              "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition",
                              "border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text)] hover:bg-[var(--dash-surface-2)]",
                              "cursor-pointer active:scale-[0.98] transition-transform",
                              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-red-soft)]",
                              resendingId === it.id &&
                                "opacity-60 cursor-not-allowed active:scale-100"
                            )}
                            aria-label="Resend invite"
                          >
                            <RefreshCcw className="h-4 w-4" />
                            {resendingId === it.id ? "Resending…" : "Resend"}
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold">Invite link unavailable</div>
                        <div className="mt-0.5 text-xs text-[var(--dash-muted)]">
                          This usually means the invite was created before link-copy support or the invite was cleared.
                        </div>
                      </div>
                      {canResendInvite ? (
                        <button
                          type="button"
                          onClick={() => onResendInvite(it.id)}
                          disabled={resendingId === it.id}
                          className={cn(
                            "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition shrink-0",
                            "border-[var(--dash-border)] bg-[var(--dash-surface-2)] text-[var(--dash-text)] hover:bg-[var(--dash-surface)]",
                            "cursor-pointer active:scale-[0.98] transition-transform",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-red-soft)]",
                            resendingId === it.id &&
                              "opacity-60 cursor-not-allowed hover:bg-[var(--dash-surface-2)] active:scale-100"
                          )}
                          aria-label="Resend invite"
                        >
                          <RefreshCcw className="h-4 w-4" />
                          {resendingId === it.id ? "Resending…" : "Resend"}
                        </button>
                      ) : (
                        <div className="text-sm text-[var(--dash-muted)]">—</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-end gap-2 md:mt-0">
                  <button
                    type="button"
                    onClick={() => onView(it.id)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition",
                      "border-[var(--dash-border)] text-[var(--dash-text)] hover:bg-[var(--dash-surface-2)]"
                    )}
                    aria-label="View onboarding"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onTerminate(it)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition",
                      "border-[var(--dash-border)] text-[var(--dash-red)] hover:bg-[var(--dash-red-soft)]"
                    )}
                    aria-label="Terminate onboarding"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Terminate</span>
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

