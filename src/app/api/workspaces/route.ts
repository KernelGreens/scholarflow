import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const memberships = await prisma.tenantMembership.findMany({
    where: { userId: user.id },
    include: { tenant: true },
  });

  const tenants = memberships.map((m) => m.tenant);

  return NextResponse.json({ tenants });
}

export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { name?: string; type?: string };
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const type = body?.type === 'GROUP' || body?.type === 'INSTITUTION' ? body.type : 'PERSONAL';

  if (name.length < 2 || name.length > 120) {
    return NextResponse.json({ error: 'Workspace name must be between 2 and 120 characters.' }, { status: 400 });
  }

  const slug =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + user.id.slice(0, 6);

  const tenant = await prisma.tenant.create({
    data: {
      name,
      slug,
      type,
    },
  });

  await prisma.tenantMembership.create({
    data: {
      tenantId: tenant.id,
      userId: user.id,
      role: 'OWNER',
    },
  });

  return NextResponse.json({ tenant }, { status: 201 });
}
