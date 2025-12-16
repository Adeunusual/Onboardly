// src/components/ui/modal.tsx
"use client";

import { ReactNode, MouseEvent, useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { overlayFade, dialogScale } from "@/lib/animations/presets";
import { cn } from "@/lib/utils/cn";

type ModalProps = {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
};

export function Modal({
  open,
  onClose,
  children,
  className,
  ariaLabel,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedElRef = useRef<HTMLElement | null>(null);

  const canClose = Boolean(onClose);

  const focusableSelector = useMemo(
    () =>
      [
        'a[href]:not([tabindex="-1"])',
        'button:not([disabled]):not([tabindex="-1"])',
        'input:not([disabled]):not([type="hidden"]):not([tabindex="-1"])',
        'select:not([disabled]):not([tabindex="-1"])',
        'textarea:not([disabled]):not([tabindex="-1"])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(","),
    []
  );

  // A11y + UX: focus management, Escape-to-close, basic focus trap, and scroll lock.
  useEffect(() => {
    if (!open) return;

    // Save focus so we can restore it on close.
    previouslyFocusedElRef.current =
      (document.activeElement as HTMLElement | null) ?? null;

    // Lock scroll while modal is open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus the first focusable element, otherwise the dialog.
    const focusFirst = () => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>(focusableSelector)
      );
      const target = focusables[0] ?? dialog;
      target.focus?.();
    };

    // Wait a tick so the dialog is mounted and animated in.
    const raf = requestAnimationFrame(focusFirst);

    function onKeyDown(e: KeyboardEvent) {
      if (!dialogRef.current) return;

      // ESC closes if allowed
      if (e.key === "Escape" && canClose) {
        e.preventDefault();
        onClose?.();
        return;
      }

      // Basic focus trap
      if (e.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>(focusableSelector)
      ).filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);

      // If no focusable elements, keep focus on dialog
      if (focusables.length === 0) {
        e.preventDefault();
        dialog.focus?.();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (!active || active === first || !dialog.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (!active || active === last || !dialog.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;

      // Restore focus (best-effort).
      previouslyFocusedElRef.current?.focus?.();
      previouslyFocusedElRef.current = null;
    };
  }, [open, canClose, onClose, focusableSelector]);

  function handleBackdropClick(e: MouseEvent<HTMLDivElement>) {
    if (!onClose) return;
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal-backdrop"
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4 py-6"
          variants={overlayFade}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleBackdropClick}
        >
          <motion.div
            key="modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            variants={dialogScale}
            initial="hidden"
            animate="visible"
            exit="exit"
            ref={dialogRef}
            tabIndex={-1}
            className={cn(
              "w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl",
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
