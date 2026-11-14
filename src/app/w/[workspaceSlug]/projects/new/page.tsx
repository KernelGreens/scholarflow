import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NewProjectForm } from '@/components/research/NewProjectForm';

export const instant = false;

interface WorkspaceProjectsNewPageProps {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function WorkspaceProjectsNewPage({ params }: WorkspaceProjectsNewPageProps) {
  await connection();
  const { workspaceSlug } = await params;
  const session = await auth();
  const user = session?.user;
  if (!user?.id) {
    return null;
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug: workspaceSlug },
    include: { memberships: true },
  });
  const membership = tenant?.memberships.find(
    (m) => m.userId === user.id && m.role === 'OWNER'
  );
  if (!tenant || !membership) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-6">
        <Link href={`/w/${tenant.slug}/projects`} className="text-sm text-muted-foreground hover:underline">
          ← Back to projects
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">New research project</h1>
      </div>
      <NewProjectForm workspaceSlug={tenant.slug} />
    </main>
  );
}
