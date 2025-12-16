"use client";

import { cn } from "@/lib/utils/cn";
import { EOnboardingStatus } from "@/types/onboarding.types";

function mapStatus(status: EOnboardingStatus) {
  switch (status) {
    case EOnboardingStatus.InviteGenerated:
      return { label: "Pending", tone: "info" as const };
    case EOnboardingStatus.ModificationRequested:
      return { label: "Modification requested", tone: "warn" as const };
    case EOnboardingStatus.Submitted:
    case EOnboardingStatus.Resubmitted:
      return { label: "Pending review", tone: "info" as const };
    case EOnboardingStatus.Approved:
      return { label: "Approved", tone: "success" as const };
    case EOnboardingStatus.ManualPDFSent:
      return { label: "Manual PDF sent", tone: "neutral" as const };
    case EOnboardingStatus.Terminated:
      return { label: "Terminated", tone: "danger" as const };
    default:
      return { label: status, tone: "neutral" as const };
  }
}

export function StatusChip({ status }: { status: EOnboardingStatus }) {
  const { label, tone } = mapStatus(status);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        "border-[var(--dash-border)]",
        tone === "info" && "bg-[var(--dash-surface-2)] text-[var(--dash-text)]",
        tone === "neutral" && "bg-[var(--dash-surface-2)] text-[var(--dash-muted)]",
        tone === "warn" && "bg-amber-500/10 text-amber-600 border-amber-500/20",
        tone === "success" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        tone === "danger" && "bg-[var(--dash-red-soft)] text-[var(--dash-red)] border-[var(--dash-red-soft)]"
      )}
    >
      {label}
    </span>
  );
}

