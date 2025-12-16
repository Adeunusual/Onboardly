"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils/cn";
import { ETerminationType } from "@/types/onboarding.types";

export function TerminateModal({
  open,
  onClose,
  onConfirm,
  employeeLabel,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: { terminationType: ETerminationType; terminationReason?: string }) => Promise<void> | void;
  employeeLabel: string;
}) {
  const [type, setType] = useState<ETerminationType>(ETerminationType.TERMINATED);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const canSubmit = useMemo(() => !saving, [saving]);

  async function handleConfirm() {
    if (!canSubmit) return;
    setSaving(true);
    try {
      await onConfirm({
        terminationType: type,
        terminationReason: reason.trim() || undefined,
      });
      onClose();
      setReason("");
      setType(ETerminationType.TERMINATED);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} ariaLabel="Terminate onboarding">
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--dash-text)]">
            Terminate onboarding
          </h2>
          <p className="mt-1 text-sm text-[var(--dash-muted)]">
            This will end the onboarding for <span className="font-medium">{employeeLabel}</span>.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--dash-text)]">Type</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType(ETerminationType.TERMINATED)}
              className={cn(
                "rounded-xl border px-3 py-2 text-sm font-medium transition",
                "border-[var(--dash-border)]",
                type === ETerminationType.TERMINATED
                  ? "bg-[var(--dash-red-soft)] text-[var(--dash-text)]"
                  : "bg-[var(--dash-surface)] text-[var(--dash-muted)] hover:bg-[var(--dash-surface-2)]"
              )}
            >
              Terminate
            </button>
            <button
              type="button"
              onClick={() => setType(ETerminationType.RESIGNED)}
              className={cn(
                "rounded-xl border px-3 py-2 text-sm font-medium transition",
                "border-[var(--dash-border)]",
                type === ETerminationType.RESIGNED
                  ? "bg-[var(--dash-red-soft)] text-[var(--dash-text)]"
                  : "bg-[var(--dash-surface)] text-[var(--dash-muted)] hover:bg-[var(--dash-surface-2)]"
              )}
            >
              Resigned
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-[var(--dash-text)]">
            Reason (optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className={cn(
              "w-full rounded-xl border bg-[var(--dash-surface)] px-3 py-2 text-sm",
              "border-[var(--dash-border)] text-[var(--dash-text)]",
              "placeholder:text-[var(--dash-muted)]",
              "focus:outline-none focus:ring-2 focus:ring-[var(--dash-red-soft)]"
            )}
            placeholder="Add a short note for audit/logs…"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition",
              "border-[var(--dash-border)] text-[var(--dash-text)] hover:bg-[var(--dash-surface-2)]"
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canSubmit}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              "bg-[var(--dash-red)] text-white hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed"
            )}
          >
            {saving ? "Saving…" : type === ETerminationType.RESIGNED ? "Mark as resigned" : "Terminate"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

