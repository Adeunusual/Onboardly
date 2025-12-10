// src/components/shared/ProfileDropdown.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { ChevronDown } from "lucide-react";
import ProfileAvatar from "./ProfileAvatar";

export default function ProfileDropdown() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const user = session?.user as { name?: string | null; email?: string | null; image?: string | null } | undefined;

  // If not authenticated or no user, don't render the dropdown
  if (status !== "authenticated" || !user) {
    return null;
  }

  const userName = user.name || "User";
  const userEmail = user.email || "";

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

  return (
    <div ref={ref} className="ml-auto relative flex items-center">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <ProfileAvatar user={{ name: userName, email: userEmail, picture: user.image || undefined }} size={32} />
        <span className="hidden sm:inline text-xs sm:text-sm font-medium text-slate-700">{userName}</span>
        <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-10 mt-1 w-52 rounded-xl border border-slate-200 bg-white py-2 shadow-lg z-50" role="menu">
          <div className="px-4 py-2 border-b border-slate-200">
            <div className="text-sm font-medium text-slate-900">{userName}</div>
            {userEmail && <div className="text-xs text-slate-500 truncate">{userEmail}</div>}
          </div>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              // NextAuth signOut, redirect back to login
              signOut({ callbackUrl: "/login" });
            }}
            className="block w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-100 active:scale-[0.99] transition"
            role="menuitem"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
