"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { X } from "lucide-react";

type SubmissionCompleteModalProps = {
  open: boolean;
  onAcknowledge: () => void;
};

function AnimatedCheckmark() {
  return (
    <motion.div
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-100"
    >
      <motion.svg
        width="44"
        height="44"
        viewBox="0 0 52 52"
        className="block"
        aria-hidden="true"
      >
        <motion.circle
          cx="26"
          cy="26"
          r="22"
          fill="none"
          stroke="rgb(5 150 105)" // emerald-600
          strokeWidth="3.5"
          strokeLinecap="round"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: {
              pathLength: 1,
              opacity: 1,
              transition: { duration: 0.45, ease: "easeOut" },
            },
          }}
          initial="hidden"
          animate="visible"
        />
        <motion.path
          d="M16 27.5 L23 34.5 L37 19.5"
          fill="none"
          stroke="rgb(5 150 105)" // emerald-600
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: {
              pathLength: 1,
              opacity: 1,
              transition: { delay: 0.15, duration: 0.35, ease: "easeOut" },
            },
          }}
          initial="hidden"
          animate="visible"
        />
      </motion.svg>
    </motion.div>
  );
}

export function SubmissionCompleteModal({
  open,
  onAcknowledge,
}: SubmissionCompleteModalProps) {
  return (
    <Modal open={open} onClose={onAcknowledge} ariaLabel="Onboarding submitted">
      <div className="relative">
        <button
          type="button"
          onClick={onAcknowledge}
          className="absolute right-0 top-0 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close"
        >
          <X className="h-4 w-4" strokeWidth={2.2} />
        </button>

        <div className="flex flex-col items-center text-center">
          <AnimatedCheckmark />

          <h2 className="mt-5 text-lg font-semibold tracking-tight text-slate-900">
            Submission complete
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Your onboarding form has been submitted successfully. Please keep an
            eye on your email for a response from HR.
          </p>

          <Button className="mt-6 w-full" onClick={onAcknowledge}>
            Back to onboarding start
          </Button>

          <p className="mt-3 text-xs text-slate-400">
            You can safely close this tab.
          </p>
        </div>
      </div>
    </Modal>
  );
}

