export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export type SendEmailResult = { ok: true } | { ok: false; error: string };

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: 'RESEND_API_KEY is not configured.' };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? 'ScholarFlow AI <onboarding@resend.dev>',
      to: [input.to],
      subject: input.subject,
      text: input.text ?? '',
      html: input.html,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (response.ok) {
    return { ok: true };
  }

  const responseBody = await response.text().catch(() => '');
  return { ok: false, error: `Resend responded with status ${response.status}: ${responseBody.slice(0, 500)}` };
}

export async function sendPasswordResetEmail(input: { to: string; resetUrl: string; expiresAt: Date }): Promise<SendEmailResult> {
  const expiryMinutes = Math.max(1, Math.round((input.expiresAt.getTime() - Date.now()) / 60000));
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
      <h2>Reset your ScholarFlow AI password</h2>
      <p>You requested a password reset. This link expires in ${expiryMinutes} minutes.</p>
      <p>
        <a href="${input.resetUrl}" style="color: #2563eb;">Reset password</a>
      </p>
      <p>If you did not request this, you can ignore this email.</p>
    </div>
  `;
  const text = `Reset your ScholarFlow AI password. This link expires in ${expiryMinutes} minutes: ${input.resetUrl}`;

  return sendEmail({
    to: input.to,
    subject: 'ScholarFlow AI — Password reset requested',
    html,
    text,
  });
}
