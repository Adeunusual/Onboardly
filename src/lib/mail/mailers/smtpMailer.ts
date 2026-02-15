// src/lib/mail/mailers/smtpMailer.ts
import nodemailer from "nodemailer";
import type { MailAttachment } from "./types";

export async function sendMailSmtpGmail(params: {
  from: string; // must match/authenticate against your Gmail user in most cases
  appPassword: string; // Gmail App Password (16 chars)
  to: string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: MailAttachment[];
}) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // 465 SSL
    auth: {
      user: params.from,
      pass: params.appPassword,
    },
  });

  const nodemailerAttachments =
    params.attachments?.map((a) => ({
      filename: a.name,
      contentType: a.contentType,
      content: Buffer.from(a.base64, "base64"),
      ...(a.isInline ? { cid: a.contentId } : {}),
      // If you ever want them always treated as attachments even if cid exists:
      // contentDisposition: a.isInline ? "inline" : "attachment",
    })) ?? undefined;

  await transporter.sendMail({
    from: params.from,
    to: params.to.join(", "),
    subject: params.subject,
    html: params.html,
    text: params.text,
    attachments: nodemailerAttachments,
  });
}
