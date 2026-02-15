// src/lib/mail/employee/sendEmployeeOnboardingApproved.ts
import { ESubsidiary } from "@/types/shared.types";
import { sendMailAppOnly } from "@/lib/mail/mailer";
import { escapeHtml } from "@/lib/mail/utils";
import { ONBOARDLY_HR_EMAIL } from "@/config/env";
import { buildEmployeeEmailLayout } from "@/lib/mail/templates/buildEmployeeEmailLayout";

export type SendEmployeeOnboardingApprovedParams = {
  to: string;
  firstName: string;
  lastName: string;
  subsidiary: ESubsidiary;
  baseUrl: string;
  employeeNumber?: string;
};

export async function sendEmployeeOnboardingApproved(
  params: SendEmployeeOnboardingApprovedParams,
): Promise<void> {
  const { to, firstName, lastName, subsidiary, employeeNumber } = params;

  const fullName = `${firstName} ${lastName}`.trim();
  const escapedName = escapeHtml(fullName || "there");
  const escapedSubsidiary = escapeHtml(subsidiary);
  const escapedEmployeeNumber = employeeNumber
    ? escapeHtml(employeeNumber)
    : undefined;

  const subject = "NPT Employee Onboarding – Approved";

  const employeeNumberBlock = escapedEmployeeNumber
    ? `<p style="margin:0 0 16px 0; font-size:14px; color:#111827;">
         Your employee number is:
         <strong style="font-weight:600;">${escapedEmployeeNumber}</strong>.
       </p>`
    : "";

  const bodyHtml = `
    <p style="margin:0 0 16px 0;">Hi ${escapedName},</p>
    <p style="margin:0 0 12px 0;">
      We’re pleased to let you know that your employee onboarding with
      <strong>NPT (${escapedSubsidiary})</strong> has been
      <strong>approved</strong>.
    </p>
    ${employeeNumberBlock}
    <p style="margin:0 0 16px 0;">
      HR will contact you shortly with your start date, orientation details,
      and any remaining next steps.
    </p>
    <p style="margin:0 0 4px 0;">Thank you,</p>
    <p style="margin:0 0 24px 0;">NPT HR</p>
  `;

  const html = buildEmployeeEmailLayout({
    subject,
    heading: "Your onboarding is approved",
    subtitle: `NPT (${escapedSubsidiary})`,
    bodyHtml,
    footerContactEmail: ONBOARDLY_HR_EMAIL,
  });

  await sendMailAppOnly({
    from: ONBOARDLY_HR_EMAIL,
    to: [to],
    subject,
    html,
  });
}
