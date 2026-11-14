import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const instant = false;

interface WorkspaceProjectsPageProps {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function WorkspaceProjectsPage({ params }: WorkspaceProjectsPageProps) {
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

  const membership = tenant?.memberships.find((m) => m.userId === user.id);
  if (!tenant || !membership) {
    notFound();
  }

  const projects = await prisma.researchProject.findMany({
    where: { tenantId: tenant.id },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Research projects</h1>
          <p className="text-sm text-muted-foreground">Workspace: {tenant.name}</p>
        </div>
        <Link href={`/w/${tenant.slug}/projects/new`} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
          New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No research projects yet in this workspace. Create your first project to begin.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4">
                <Link href={`/w/${tenant.slug}/projects/${p.id}`} className="font-medium hover:underline">
                  {p.title}
                </Link>
                <p className="text-xs text-muted-foreground">{p.status}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
