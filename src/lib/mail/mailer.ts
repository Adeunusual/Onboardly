// src/lib/mail/mailer.ts
import { ONBOARDLY_HR_EMAIL, ONBOARDLY_HR_APP_PASSWORD } from "@/config/env";
import type { MailAttachment } from "./mailers/types";
import { sendMailSmtpGmail } from "./mailers/smtpMailer";
// If you want to switch back later, just swap the import + call to graphMailer.
// import { sendMailGraphAppOnly } from "./mailers/graphMailer";

export type GraphAttachment = MailAttachment; // keep your existing name working

export async function sendMailAppOnly(params: {
  from: string;
  to: string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: GraphAttachment[];
  saveToSentItems?: boolean; // unused for SMTP, kept for compatibility
}) {
  // SMTP version (current)
  if (!ONBOARDLY_HR_EMAIL) throw new Error("ONBOARDLY_HR_EMAIL is required");
  if (!ONBOARDLY_HR_APP_PASSWORD)
    throw new Error("ONBOARDLY_HR_APP_PASSWORD is required");

  // You can choose to force `from` to be the HR email:
  // const from = ONBOARDLY_HR_EMAIL;
  // Or allow callers to pass it (your code passes ONBOARDLY_HR_EMAIL already):
  const from = params.from;

  await sendMailSmtpGmail({
    from,
    appPassword: ONBOARDLY_HR_APP_PASSWORD,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
    attachments: params.attachments,
  });

  // Graph version (switch-back later)
  // await sendMailGraphAppOnly({
  //   from,
  //   to: params.to,
  //   subject: params.subject,
  //   html: params.html,
  //   text: params.text,
  //   attachments: params.attachments,
  //   saveToSentItems: params.saveToSentItems,
  // });
}
