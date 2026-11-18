import { afterEach, describe, expect, it, vi } from 'vitest';
import { sendEmail, sendPasswordResetEmail } from './resend';

describe('resend email service', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('returns an error when RESEND_API_KEY is not configured', async () => {
    vi.stubEnv('RESEND_API_KEY', '');
    const result = await sendEmail({ to: 'researcher@example.com', subject: 'Test', html: '<p>Test</p>' });
    expect(result.ok).toBe(false);
  });

  it('sends an email successfully when Resend accepts the request', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_test_key');
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'email_1' }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await sendEmail({ to: 'researcher@example.com', subject: 'Test', html: '<p>Test</p>', text: 'Test' });
    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('returns an error when Resend rejects the request', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_test_key');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: 'Invalid API key' }), { status: 401 })));

    const result = await sendEmail({ to: 'researcher@example.com', subject: 'Test', html: '<p>Test</p>' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Resend responded with status 401');
    }
  });

  it('sends a password reset email with the reset url', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_test_key');
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'email_2' }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await sendPasswordResetEmail({
      to: 'researcher@example.com',
      resetUrl: 'http://localhost:3000/reset-password?token=abc123',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });
    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
