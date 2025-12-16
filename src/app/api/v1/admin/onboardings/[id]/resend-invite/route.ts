// src/app/api/v1/admin/onboardings/[id]/resend-invite/route.ts
import { NextRequest } from "next/server";
import crypto from "crypto";

import connectDB from "@/lib/utils/connectDB";
import { errorResponse, successResponse } from "@/lib/utils/apiResponse";
import { guard } from "@/lib/utils/auth/authUtils";
import { hashString } from "@/lib/utils/encryption";
import { buildOnboardingInvite, createOnboardingAuditLogSafe } from "@/lib/utils/onboardingUtils";

import { OnboardingModel } from "@/mongoose/models/Onboarding";

import { EOnboardingMethod, EOnboardingStatus } from "@/types/onboarding.types";
import { EOnboardingActor, EOnboardingAuditAction } from "@/types/onboardingAuditLog.types";

import { sendEmployeeOnboardingInvitation } from "@/lib/mail/employee/sendEmployeeOnboardingInvitation";
import { sendEmployeeOnboardingModificationRequest } from "@/lib/mail/employee/sendEmployeeOnboardingModificationRequest";

// -----------------------------------------------------------------------------
// POST /api/v1/admin/onboardings/[id]/resend-invite
//
// Re-sends the latest DIGITAL onboarding email to an employee.
//
// Allowed states:
// - InviteGenerated: sends the initial onboarding invitation email.
// - ModificationRequested: sends the modification-request email (re-using the
//   previously saved modificationRequestMessage).
//
// Behavior:
// - DIGITAL only.
// - Generates a new secure invite token and replaces the previous one
//   (old links are immediately invalidated).
// - Clears any existing OTP.
// - Resets invite expiry and sends the appropriate email template.
// - Records an INVITE_RESENT audit log entry attributed to the HR actor.
//
// Reliability:
// - If email sending fails, we attempt to roll back the onboarding record to its
//   previous invite/otp/updatedAt state (best-effort) so the employee is not stranded.
// -----------------------------------------------------------------------------
export const POST = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await connectDB();
    const user = await guard();

    const { id } = await params;
    const baseUrl = req.nextUrl.origin;

    const onboarding = await OnboardingModel.findById(id);
    if (!onboarding) return errorResponse(404, "Onboarding not found");

    if (onboarding.method !== EOnboardingMethod.DIGITAL) {
      return errorResponse(400, "Resend invite is only allowed for digital onboardings");
    }

    const isInvite = onboarding.status === EOnboardingStatus.InviteGenerated;
    const isModReq = onboarding.status === EOnboardingStatus.ModificationRequested;

    if (!isInvite && !isModReq) {
      return errorResponse(400, "Cannot resend invite in the current onboarding state", {
        reason: "STATUS_NOT_ELIGIBLE_FOR_RESEND",
        status: onboarding.status,
      });
    }

    // If we are resending a modification request, we must have a persisted message to include.
    const modMessage = typeof (onboarding as any).modificationRequestMessage === "string" ? (onboarding as any).modificationRequestMessage.trim() : "";

    if (isModReq && !modMessage) {
      return errorResponse(400, "Cannot resend modification request because no modification message is on file", {
        reason: "MISSING_MODIFICATION_REQUEST_MESSAGE",
        status: onboarding.status,
      });
    }

    const prevInvite = onboarding.invite;
    const prevOtp = (onboarding as any).otp;
    const prevUpdatedAt = onboarding.updatedAt;

    // Generate a new raw invite token and build a fresh invite payload
    const rawInviteToken = crypto.randomBytes(32).toString("hex");
    const invite = buildOnboardingInvite(rawInviteToken);
    invite.tokenHash = hashString(rawInviteToken)!;

    // Mutate onboarding (pre-email)
    onboarding.invite = invite; // old links become invalid
    (onboarding as any).otp = undefined; // force fresh OTP flow
    onboarding.updatedAt = new Date();

    await onboarding.validate();
    await onboarding.save();

    try {
      if (isInvite) {
        // Initial invite email
        await sendEmployeeOnboardingInvitation({
          to: onboarding.email,
          firstName: onboarding.firstName,
          lastName: onboarding.lastName,
          method: onboarding.method,
          subsidiary: onboarding.subsidiary,
          baseUrl,
          inviteToken: rawInviteToken,
        });
      } else {
        // Modification requested email (reuse stored message)
        await sendEmployeeOnboardingModificationRequest({
          to: onboarding.email,
          firstName: onboarding.firstName,
          lastName: onboarding.lastName,
          subsidiary: onboarding.subsidiary,
          baseUrl,
          inviteToken: rawInviteToken,
          message: modMessage,
        });
      }
    } catch (emailError) {
      // Best-effort rollback so employee isn't stranded with an undispatched link
      try {
        onboarding.invite = prevInvite;
        (onboarding as any).otp = prevOtp;
        onboarding.updatedAt = prevUpdatedAt;
        await onboarding.save();
      } catch (rollbackErr) {
        console.error("Failed to rollback onboarding after resend-invite email error", rollbackErr);
      }
      throw emailError;
    }

    // Audit: invite resent (template depends on status)
    await createOnboardingAuditLogSafe({
      onboardingId: onboarding._id.toString(),
      action: EOnboardingAuditAction.INVITE_RESENT,
      actor: {
        type: EOnboardingActor.HR,
        id: user.id,
        name: user.name,
        email: user.email,
      },
      message: isInvite
        ? `Onboarding invitation re-sent by ${user.name}; a new onboarding link was emailed to the employee.`
        : `Modification-request email re-sent by ${user.name}; a new onboarding link was emailed to the employee.`,
      metadata: {
        status: onboarding.status,
        method: onboarding.method,
        subsidiary: onboarding.subsidiary,
        emailTemplate: isInvite ? "INVITATION" : "MODIFICATION_REQUEST",
        modificationRequestMessage: isModReq ? modMessage : undefined,
        source: "ADMIN_RESEND_INVITE",
      },
    });

    return successResponse(200, "Invite resent", {
      onboarding: onboarding.toObject({ virtuals: true, getters: true }),
    });
  } catch (error) {
    return errorResponse(error);
  }
};
