"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

type Props = Readonly<{
  dirty: boolean;
  busy?: boolean;
  errorMessage?: string | null;
  onSubmit: () => Promise<void> | void;
  onDiscard?: () => void;
  /** Where the bar should stick within the page (default: bottom). */
  placement?: "top" | "bottom";
  /** When false, renders as a normal block (useful when parent provides sticky stacking). */
  sticky?: boolean;
  /** Optional wrapper class override (e.g. tweak sticky offsets). */
  className?: string;
}>;

/**
 * Dashboard-themed sticky footer bar that activates when there are staged changes.
 * - Shows an error message when provided
 * - Disables submit when not dirty or busy
 */
export function UpdateSubmitBar({
  dirty,
  busy,
  errorMessage,
  onSubmit,
  onDiscard,
  placement = "bottom",
  sticky = true,
  className,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Clear error when changes are no longer dirty
  useEffect(() => {
    if (!dirty) setLocalError(null);
  }, [dirty]);

  // Prefer external error from parent (e.g. validation failure)
  const effectiveError = errorMessage ?? localError;

  const handleSubmit = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      setLocalError(null);
      await onSubmit();
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ??
        (typeof err === "string" ? err : null) ??
        "Something went wrong while saving. Please try again.";
      setLocalError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscard = () => {
    setLocalError(null);
    onDiscard?.();
  };

  const isDisabled = !dirty || !!busy || isSubmitting;

  return (
    <div
      className={cn(
        sticky
          ? placement === "top"
            ? // Dashboard topbar is h-16; give a little breathing room below it.
              "sticky top-20 z-20 mb-4"
            : "sticky bottom-0 z-20 mt-4"
          : "relative",
        className
      )}
      aria-live="polite"
    >
      <div
        className={cn(
          "rounded-2xl border px-4 py-3 shadow-[var(--dash-shadow)]",
          "bg-[var(--dash-surface)] border-[var(--dash-border)]",
          effectiveError && "bg-[var(--dash-red-soft)] border-[var(--dash-red-soft)]"
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            className={cn(
              "text-sm",
              effectiveError ? "text-[var(--dash-red)] font-semibold" : "text-[var(--dash-muted)]"
            )}
            role={effectiveError ? "alert" : undefined}
          >
            {effectiveError
              ? effectiveError
              : dirty
              ? "You have unsaved changes."
              : "No changes to submit."}
          </div>

          <div className="flex items-center gap-2">
            {onDiscard ? (
              <button
                type="button"
                onClick={handleDiscard}
                disabled={isDisabled}
                className={cn(
                  "rounded-xl border px-4 py-2 text-sm font-semibold transition",
                  "border-[var(--dash-border)] text-[var(--dash-text)] hover:bg-[var(--dash-surface-2)]",
                  isDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                )}
              >
                Discard
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isDisabled}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-semibold transition",
                !isDisabled
                  ? "bg-[var(--dash-red)] text-white hover:opacity-95 cursor-pointer"
                  : "bg-[var(--dash-surface-2)] text-[var(--dash-muted)] border border-[var(--dash-border)] cursor-not-allowed opacity-70"
              )}
            >
              {busy || isSubmitting ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


