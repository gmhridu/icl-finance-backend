// src/email/send-email.ts
import { Env } from "@/config/env.config";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(Env.RESEND_API_KEY);

// --- Zod Schema ---
const SendEmailSchema = z.object({
  to: z.email("Invalid recipient email address"),
  subject: z.string().min(1, "Subject is required").max(78, "Subject too long"),
  html: z.string().min(1, "Email body (HTML) is required"),
  from: z
    .string()
    .default("ICL FINANCE <support@icl.finance>")
    .refine(
      (val) => val.includes("<") && val.includes(">"),
      "From must be in format: Name <email@domain.com>"
    ),
});

type SendEmailInput = z.infer<typeof SendEmailSchema>;

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  details?: unknown;
}

// --- Main Function ---
export const sendEmail = async (
  input: SendEmailInput
): Promise<EmailResult> => {
  // Validate input
  const parseResult = SendEmailSchema.safeParse(input);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues[0].message;
    console.warn("[Email] Validation failed:", { input, error: errorMsg });
    return {
      success: false,
      error: errorMsg,
    };
  }

  const { to, subject, html, from } = parseResult.data;

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[Email] Resend API error:", {
        to,
        subject,
        error: error.message,
        code: error.name,
        statusCode: "statusCode" in error ? error.statusCode : null,
      });

      return {
        success: false,
        error: "Failed to send email. Please try again later.",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      };
    }

    if (!data?.id) {
      console.warn("[Email] No message ID from Resend:", { to, subject, data });
      return {
        success: false,
        error: "Email queued but no confirmation received.",
      };
    }

    console.info(`[Email] Sent → ${to} | ID: ${data.id}`);
    return {
      success: true,
      messageId: data.id,
    };
  } catch (unexpectedError) {
    console.error("[Email] Unexpected send failure:", {
      to,
      subject,
      error:
        unexpectedError instanceof Error
          ? unexpectedError.message
          : String(unexpectedError),
      stack:
        unexpectedError instanceof Error ? unexpectedError.stack : undefined,
    });

    return {
      success: false,
      error: "An internal error occurred. Our team has been notified.",
    };
  }
};
