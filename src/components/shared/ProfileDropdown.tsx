// src/components/shared/ProfileDropdown.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { ChevronDown } from "lucide-react";
import ProfileAvatar from "./ProfileAvatar";
import { cn } from "@/lib/utils/cn";

export default function ProfileDropdown() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", onClick);
    }
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("keydown", onKeyDown);
    }
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const user = session?.user as { name?: string | null; email?: string | null; image?: string | null } | undefined;

  // If not authenticated or no user, don't render the dropdown
  if (status !== "authenticated" || !user) {
    return null;
  }

  const userName = user.name || "User";
  const userEmail = user.email || "";

  return (
    <div ref={ref} className="ml-auto relative flex items-center">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 rounded-lg px-2 py-1 text-sm transition cursor-pointer",
          // Dashboard theme tokens (works in both light/dark via .dashboard-root)
          "text-[var(--dash-text)] hover:bg-[var(--dash-surface-2)]",
          open && "bg-[var(--dash-surface-2)]",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-red-soft)]"
        )}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <ProfileAvatar user={{ name: userName, email: userEmail, picture: user.image || undefined }} size={32} />
        <span className="hidden sm:inline text-xs sm:text-sm font-medium text-[var(--dash-text)]">
          {userName}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-[var(--dash-muted)] transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          className={cn(
            "absolute right-0 top-10 mt-1 w-52 rounded-xl border py-2 shadow-lg z-50",
            "border-[var(--dash-border)] bg-[var(--dash-surface)]"
          )}
          role="menu"
        >
          <div className="px-4 py-2 border-b border-[var(--dash-border)]">
            <div className="text-sm font-medium text-[var(--dash-text)]">{userName}</div>
            {userEmail && (
              <div className="text-xs text-[var(--dash-muted)] truncate">{userEmail}</div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              signOut({ callbackUrl: "/login" });
            }}
            className={cn(
              "block w-full text-left px-4 py-3 text-sm transition active:scale-[0.99] cursor-pointer",
              "text-[var(--dash-text)] hover:bg-[var(--dash-surface-2)]"
            )}
            role="menuitem"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
