// src/app/api/v1/onboarding/session/resolve/route.ts
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/utils/connectDB";
import { OnboardingModel } from "@/mongoose/models/Onboarding";
import { EOnboardingMethod, EOnboardingStatus } from "@/types/onboarding.types";
import { ONBOARDING_SESSION_COOKIE_NAME } from "@/config/env";
import { hashString } from "@/lib/utils/encryption";
import { clearOnboardingCookieHeader } from "@/lib/utils/auth/onboardingSession";
import { successResponse, errorResponse } from "@/lib/utils/apiResponse";

/**
 * Resolves the current employee onboarding session from the cookie.
 *
 * Used only by middleware (via fetch) so that:
 *  - middleware itself stays DB-free
 *  - we can compute the correct /onboarding/[id] redirect target
 *
 * Response shape (always 200 on "logical" outcomes):
 *  {
 *    success: true,
 *    data: {
 *      hasSession: boolean;
 *      onboardingId?: string;
 *    }
 *  }
 */
export async function GET(_req: NextRequest) {
  try {
    await connectDB();

    if (!ONBOARDING_SESSION_COOKIE_NAME) {
      // Misconfiguration: just say "no session" to middleware.
      return successResponse(200, "OK", { hasSession: false });
    }

    const jar = await cookies();
    const rawToken = jar.get(ONBOARDING_SESSION_COOKIE_NAME)?.value;

    if (!rawToken) {
      return successResponse(200, "OK", { hasSession: false });
    }

    const tokenHash = hashString(rawToken);
    const now = new Date();

    // Find any digital onboarding for this invite token.
    const onboarding = await OnboardingModel.findOne({
      method: EOnboardingMethod.DIGITAL,
      "invite.tokenHash": tokenHash,
    });

    // Invalid/no longer valid → report no active session + clear cookie.
    if (
      !onboarding ||
      !onboarding.invite ||
      !onboarding.invite.expiresAt ||
      new Date(onboarding.invite.expiresAt) <= now ||
      onboarding.status === EOnboardingStatus.Approved ||
      onboarding.status === EOnboardingStatus.Terminated
    ) {
      const res = successResponse(200, "OK", { hasSession: false });
      res.headers.set("Set-Cookie", clearOnboardingCookieHeader());
      return res;
    }

    return successResponse(200, "OK", {
      hasSession: true,
      onboardingId: onboarding._id.toString(),
    });
  } catch (error) {
    // For middleware callers, 5xx vs 200 doesn't matter much – but keep normal error behavior.
    return errorResponse(error);
  }
}
