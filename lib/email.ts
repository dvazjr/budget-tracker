import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL ?? "Budget Tracker <noreply@example.com>";
const APP_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export async function sendPasswordResetEmail(
  toEmail: string,
  rawToken: string
): Promise<void> {
  const resetUrl = `${APP_URL}/auth/reset-password?token=${rawToken}`;

  await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: "Reset your Budget Tracker password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#1a1a2e">Password Reset Request</h2>
        <p>We received a request to reset the password for your Budget Tracker account.</p>
        <p>Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.</p>
        <a href="${resetUrl}"
           style="display:inline-block;margin:16px 0;padding:12px 24px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">
          Reset Password
        </a>
        <p style="color:#666;font-size:13px">
          If you didn't request this, you can safely ignore this email — your password won't change.
        </p>
        <p style="color:#999;font-size:12px">
          Or copy this link into your browser:<br/>
          <a href="${resetUrl}" style="color:#2563eb;word-break:break-all">${resetUrl}</a>
        </p>
      </div>
    `,
  });
}
