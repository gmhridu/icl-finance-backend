import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import { Env } from "@/config/env.config";
import { handleJwtError } from "@/utils/app-error";
import { encrypt } from "@/utils/encrypt";

/* ---------- Payload ----------
   state = encrypted lastUsed timestamp (string)
*/
export interface IJwtPayload {
  userId: string;
  number: string;
  state: string; // encrypted timestamp
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

/* ---------- Create Token (with encrypted state) ---------- */
export const createToken = (
  payload: Omit<IJwtPayload, "state">,
  secret: string,
  expiresIn: number | string,
  extra: Partial<SignOptions> = {},
  lastUsed: number = 0
): string => {
  const state = encrypt(lastUsed.toString()); // lastUsed timestamp

  return jwt.sign({ ...payload, state }, secret, {
    algorithm: "HS256",
    issuer: Env.JWT_ISSUER,
    audience: Env.JWT_AUDIENCE,
    expiresIn,
    ...extra,
  } as SignOptions);
};

/* ---------- Verify Token (throws AppError) ---------- */
export const verifyToken = (
  token: string,
  secret: string,
  options: VerifyOptions = {}
): IJwtPayload => {
  try {
    const verifyOpts: VerifyOptions = {
      algorithms: ["HS256"],
      issuer: Env.JWT_ISSUER,
      audience: Env.JWT_AUDIENCE,
      ...options,
    };

    return jwt.verify(token, secret, verifyOpts) as IJwtPayload;
  } catch (err) {
    throw handleJwtError(err);
  }
};

const LOGO_URL =
  "https://res.cloudinary.com/dyq0ij1yk/image/upload/v1762449773/gbujflig4n9eglmqmuvf.png";

export const passwordResetEmailTemplate = (
  resetLink: string,
  userEmail: string
): string =>
  `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Reset Your Password – ICL Finance</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:16px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.06);border:1px solid #e2e8f0;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e3a8a 0%,#2563eb 50%,#3b82f6 100%);padding:40px 20px;text-align:center;position:relative;">
              <div style="position:absolute;inset:0;background:url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27%3E%3Cpattern id=%27p%27 width=%27100%27 height=%27100%27 patternUnits=%27userSpaceOnUse%27%3E%3Ccircle cx=%2725%27 cy=%2725%27 r=%271%27 fill=%27rgba(255,255,255,0.08)%27/%3E%3Ccircle cx=%2775%27 cy=%2775%27 r=%271%27 fill=%27rgba(255,255,255,0.08)%27/%3E%3C/pattern%3E%3Crect width=%27100%27 height=%27100%27 fill=%27url(%23p)%27/%3E%3C/svg%3E');opacity:0.25;"></div>

              <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.6px;position:relative;z-index:1;">
                ICL FINANCE
              </h1>

              <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.6px;position:relative;z-index:1;">
                Reset Your Password
              </h1>
              <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.95);position:relative;z-index:1;">
                Protect your ICL Finance account
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 22px;">
              <p style="margin:0 0 14px;font-size:16px;color:#111827;font-weight:500;">Hi there,</p>

              <p style="margin:0 0 18px;font-size:14.5px;line-height:1.6;color:#4b5563;">
                We received a request to reset the password for your <strong>ICL Finance</strong> account linked to:
              </p>
              <p style="margin:0 0 24px;padding:8px 12px;background:#f8fafc;border-radius:8px;font-size:14px;color:#1f2937;border-left:3px solid #3b82f6;">
                <strong>${userEmail}</strong>
              </p>

              <p style="margin:0 0 28px;font-size:14.5px;line-height:1.6;color:#4b5563;">
                Tap the button below to set a new password. This link expires in <strong>10 minutes</strong>.
              </p>

              <div style="text-align:center;margin:28px 0;">
                <a href="${resetLink}"
                   style="display:inline-block;background:linear-gradient(135deg,#1e40af 0%,#2563eb 50%,#3b82f6 100%);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:12px;font-size:15px;font-weight:600;box-shadow:0 6px 18px rgba(59,130,246,0.35);text-transform:none;letter-spacing:0.3px;transition:transform 0.2s ease,box-shadow 0.2s ease;"
                   onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 10px 25px rgba(59,130,246,0.45)';"
                   onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 6px 18px rgba(59,130,246,0.35)';">
                  Reset Password
                </a>
              </div>

              <!-- Security Notice – Fixed Warning Icon -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fbbf24;border-radius:12px;padding:16px;margin:24px 0;">
                <tr>
                  <td width="28" valign="top" style="padding-right:12px;">
                    <!-- Real warning icon (Unicode) -->
                    <div style="width:28px;height:28px;background:#f59e0b;border-radius:50%;display:flex;align-items:center;justify-content:center;">
                      <span style="color:#fff;font-size:16px;line-height:1;">Warning</span>
                    </div>
                  </td>
                  <td>
                    <p style="margin:0 0 4px;font-size:13.5px;font-weight:600;color:#92400e;">
                      Security Notice
                    </p>
                    <p style="margin:0;font-size:12.5px;color:#78350f;line-height:1.5;">
                      Didn’t request this? Ignore this email. Your account remains secure.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Support -->
              <div style="background:#f8fafc;border-left:4px solid #3b82f6;border-radius:8px;padding:14px;margin-top:20px;">
                <p style="margin:0 0 4px;font-size:12.5px;font-weight:600;color:#1e40af;">Need Help?</p>
                <p style="margin:0;font-size:11.5px;color:#64748b;">
                  Reach us anytime at <a href="mailto:support@icl.finance" style="color:#3b82f6;text-decoration:underline;">support@icl.finance</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0f172a;padding:28px 22px;text-align:center;color:#94a3b8;font-size:11.5px;">
              <p style="margin:0 0 6px;opacity:0.9;">
                © ${new Date().getFullYear()} ICL Finance. All rights reserved.
              </p>
              <p style="margin:0 0 6px;opacity:0.7;">
                This is an automated message — please do not reply.
              </p>
              <p style="margin:0;opacity:0.7;">
                Support: <a href="mailto:support@icl.finance" style="color:#60a5fa;text-decoration:none;">support@icl.finance</a>
              </p>

              <div style="margin-top:20px;display:flex;align-items: center;gap: 5px;">
                <img src="${LOGO_URL}" alt="ICL" width="30" height="30" style="border-radius:6px;object-fit:contain;">
                <span style="font-weight:600;color:#e2e8f0;font-size:13px;">ICL Finance</span>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
