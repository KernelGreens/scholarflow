import { NextResponse } from 'next/server';
import { resetPasswordSchema } from '@/lib/validation/passwordResetSchema';
import { resetPassword } from '@/lib/application/passwordResetService';

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as unknown;
  const parsed = resetPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.issues },
      { status: 400 }
    );
  }

  const result = await resetPassword({
    token: parsed.data.token,
    password: parsed.data.password,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
