"use client";

import { useEffect, useMemo, useState } from "react";
import { Wand2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils/cn";
import { ApiError } from "@/lib/api/client";

export function RequestModificationModal({
  open,
  onClose,
  onConfirm,
  employeeLabel,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (message: string) => Promise<void> | void;
  employeeLabel: string;
}) {
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canProceed = useMemo(() => !saving && message.trim().length > 0, [saving, message]);

  useEffect(() => {
    if (open) return;
    setMessage("");
    setError(null);
    setSaving(false);
  }, [open]);

  function handleClose() {
    if (saving) return;
    setError(null);
    onClose();
  }

  async function handleConfirm() {
    if (!canProceed) return;
    setSaving(true);
    setError(null);
    try {
      await onConfirm(message.trim());
      onClose();
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else if (e instanceof Error) setError(e.message);
      else setError("Unable to request modification right now. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      ariaLabel="Request modification"
      className="max-w-xl"
    >
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-[var(--dash-text)]">
          Request modification
        </h2>
        <p className="mt-1 text-sm text-[var(--dash-muted)]">
          Send a message to{" "}
          <span className="font-medium text-[var(--dash-text)]">
            {employeeLabel}
          </span>{" "}
          with required changes. A new 48h link will be generated and emailed.
        </p>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-[var(--dash-red-soft)] bg-[var(--dash-red-soft)] p-3 text-sm">
          <div className="font-semibold text-[var(--dash-red)]">Couldn’t send</div>
          <div className="mt-1 text-[var(--dash-muted)]">{error}</div>
        </div>
      )}

      <div className="mt-5 space-y-1">
        <label className="text-xs font-semibold text-[var(--dash-muted)]">
          Message to employee
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className={cn(
            "w-full rounded-xl border bg-[var(--dash-surface)] px-3 py-2 text-sm",
            "border-[var(--dash-border)] text-[var(--dash-text)]",
            "placeholder:text-[var(--dash-muted)]",
            "focus:outline-none focus:ring-2 focus:ring-[var(--dash-red-soft)]"
          )}
          placeholder="Describe what needs to be updated…"
        />
      </div>

      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleClose}
          disabled={saving}
          className={cn(
            "rounded-xl border px-4 py-2 text-sm font-semibold transition",
            "border-[var(--dash-border)] text-[var(--dash-text)] hover:bg-[var(--dash-surface-2)]",
            saving && "opacity-60 cursor-not-allowed"
          )}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!canProceed}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition",
            canProceed
              ? "bg-[var(--dash-red)] text-white hover:opacity-95"
              : "bg-[var(--dash-surface-2)] text-[var(--dash-muted)] border border-[var(--dash-border)] cursor-not-allowed opacity-70"
          )}
        >
          <Wand2 className="h-4 w-4" />
          {saving ? "Sending…" : "Send request"}
        </button>
      </div>
    </Modal>
  );
}


