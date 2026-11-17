import { describe, expect, it } from 'vitest';
import { forgotPasswordSchema, resetPasswordSchema } from './passwordResetSchema';

describe('password reset validation', () => {
  it('accepts a valid forgot password email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'researcher@example.com' });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid forgot password email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('accepts a valid reset password payload', () => {
    const result = resetPasswordSchema.safeParse({ token: 'abc123', password: 'newpassword1' });
    expect(result.success).toBe(true);
  });

  it('rejects a reset password payload without a token', () => {
    const result = resetPasswordSchema.safeParse({ token: '', password: 'newpassword1' });
    expect(result.success).toBe(false);
  });

  it('rejects a reset password payload with a short password', () => {
    const result = resetPasswordSchema.safeParse({ token: 'abc123', password: 'short' });
    expect(result.success).toBe(false);
  });
});
