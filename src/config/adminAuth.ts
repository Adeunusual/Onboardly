// src/config/adminAuth.ts

/**
 * Single source of truth for who counts as an admin.
 * Everything (NextAuth, authUtils, middleware) should import from here.
 *
 * HR access is allowlist-based (“only selected emails can access”). :contentReference[oaicite:0]{index=0}
 */

import { ADMIN_EMAILS } from "@/config/env";

function parseAdminEmails(raw: string): string[] {
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export const ADMIN_EMAILS_LIST: string[] = parseAdminEmails(ADMIN_EMAILS);

const ADMIN_EMAIL_SET = new Set(ADMIN_EMAILS_LIST);

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAIL_SET.has(email.toLowerCase());
}
