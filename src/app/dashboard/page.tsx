import { connection } from 'next/server';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const instant = false;

export default async function DashboardPage() {
  await connection();
  const session = await auth();
  const user = session?.user;
  if (!user?.id) {
    redirect('/login');
  }

  const tenant = await prisma.tenant.findFirst({
    where: {
      memberships: { some: { userId: user.id } },
    },
    include: { projects: true },
    orderBy: { updatedAt: 'desc' },
  });

  const project = tenant?.projects?.[0];

  if (project) {
    redirect(`/w/${tenant.slug}/projects/${project.id}`);
  }

  redirect('/workspaces');
}
