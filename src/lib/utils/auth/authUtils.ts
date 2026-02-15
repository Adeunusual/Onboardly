// src/lib/utils/auth/authUtils.ts
import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { IUser } from "@/types/user.types";
import { AUTH_COOKIE_NAME, DISABLE_AUTH, NEXTAUTH_SECRET } from "@/config/env";
import { AppError } from "@/types/api.types";
import { isAdminEmail } from "@/config/adminAuth";

interface AppJWT {
  userId?: string;
  email?: string;
  name?: string;
  picture?: string;
}

// Dummy admin user used when auth is disabled
const DUMMY_ADMIN_USER: IUser = {
  id: "dev-admin",
  email: "dev-admin@onboardly.local",
  name: "Dev Admin",
  picture: undefined,
};

async function buildNextRequest(): Promise<NextRequest> {
  const jar = await cookies();
  const cookieHeader = jar
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");
  const headers = new Headers();
  if (cookieHeader) headers.set("cookie", cookieHeader);
  return new NextRequest("https://internal.local/", { headers });
}

export const currentUser = cache(async (): Promise<IUser | null> => {
  const jar = await cookies();
  const raw = jar.get(AUTH_COOKIE_NAME)?.value;

  let token: AppJWT | null = null;

  if (raw) {
    const req = await buildNextRequest();
    token = (await getToken({
      req,
      secret: NEXTAUTH_SECRET,
      cookieName: AUTH_COOKIE_NAME,
    })) as AppJWT | null;
  }

  // Small helper so we don't repeat ourselves
  const clearAuthCookie = () => {
    // Only try to delete if we actually had a cookie
    if (raw) {
      jar.delete(AUTH_COOKIE_NAME);
    }
  };

  // No usable token → clear cookie (if present) and fall back
  if (!token?.userId || !token?.email || !token?.name) {
    clearAuthCookie();

    if (DISABLE_AUTH) {
      return DUMMY_ADMIN_USER;
    }
    return null;
  }

  // Enforce hard-coded admin allowlist (via shared helper)
  const isAllowedAdmin = isAdminEmail(token.email);
  if (!isAllowedAdmin) {
    // <── THIS IS THE IMPORTANT PART
    clearAuthCookie();

    if (DISABLE_AUTH) {
      return DUMMY_ADMIN_USER;
    }
    return null;
  }

  const user: IUser = {
    id: token.userId,
    email: token.email,
    name: token.name,
    picture: token.picture,
  };

  return user;
});

export const guard = cache(async (): Promise<IUser> => {
  const user = await currentUser();

  if (!user) {
    throw new AppError(401, "Unauthenticated");
  }

  return user;
});
