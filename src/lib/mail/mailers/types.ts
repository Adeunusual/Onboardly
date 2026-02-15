// src/lib/mail/mailers/types.ts

export type MailAttachment = {
  name: string; // e.g., "Onboardly-Form.pdf"
  contentType: string; // e.g., "application/pdf"
  base64: string; // base64 bytes (no data: prefix)
  /** If provided with isInline=true, enables <img src="cid:..."> */
  contentId?: string; // e.g., "banner-image"
  isInline?: boolean; // true for inline (CID) images
};
