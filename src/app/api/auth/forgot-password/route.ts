import { NextResponse } from 'next/server';
import { forgotPasswordSchema } from '@/lib/validation/passwordResetSchema';
import { requestPasswordReset } from '@/lib/application/passwordResetService';

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as unknown;
  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { ok } = await requestPasswordReset({ email: parsed.data.email });

  if (!ok) {
    return NextResponse.json({ error: 'Failed to process the reset request.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
