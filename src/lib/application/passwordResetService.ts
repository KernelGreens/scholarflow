import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export class PasswordResetServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function requestPasswordReset(input: { email: string }): Promise<{ ok: true }> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  // Always return success to avoid leaking whether an account exists.
  if (!user) {
    return { ok: true };
  }

  const token = randomBytes(24).toString('hex');
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      usedAt: null,
    },
  });

  // Email delivery (SMTP/n8n notification) is deferred to the email slice.
  return { ok: true };
}

export async function resetPassword(input: { token: string; password: string }): Promise<{ ok: true } | { ok: false; error: string }> {
  const tokenRecord = await prisma.passwordResetToken.findUnique({
    where: { token: input.token },
    include: { user: true },
  });

  const now = new Date();
  if (!tokenRecord || tokenRecord.usedAt || tokenRecord.expiresAt < now) {
    return { ok: false, error: 'Invalid or expired reset token.' };
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  await prisma.user.update({
    where: { id: tokenRecord.userId },
    data: { passwordHash },
  });
  await prisma.passwordResetToken.update({
    where: { token: input.token },
    data: { usedAt: now },
  });

  return { ok: true };
}
