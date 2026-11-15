import { connection } from 'next/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CreateWorkspaceForm } from '@/components/research/CreateWorkspaceForm';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const instant = false;

export default async function WorkspacesPage() {
  await connection();
  const session = await auth();
  const user = session?.user;
  if (!user?.id) {
    redirect('/login');
  }

  const memberships = await prisma.tenantMembership.findMany({
    where: { userId: user.id },
    include: { tenant: { include: { projects: true } } },
  });

  const tenants = memberships.map((m) => ({ membership: m, tenant: m.tenant }));

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">Research workspaces</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Personal, group, or institutional research workspaces you belong to. Switch between
          workspaces to continue your research.
        </p>
      </header>

      <div className="space-y-10">
        <CreateWorkspaceForm />

        <section>
          <h2 className="mb-4 text-lg font-semibold tracking-tight">Your workspaces</h2>
          {tenants.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                You have not joined or created any workspaces yet. Create your first research
                workspace above to begin.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {tenants.map(({ membership, tenant }) => (
                <Card
                  key={membership.id}
                  className="transition-shadow hover:shadow-md"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{tenant.name}</p>
                        <p className="text-xs text-muted-foreground">{tenant.slug}</p>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {tenant.type}
                      </Badge>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {tenant.projects.length} {tenant.projects.length === 1 ? 'project' : 'projects'} ·
                      Role: {membership.role}
                    </p>
                    <Link
                      href={`/w/${tenant.slug}/projects`}
                      className="mt-3 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Open workspace →
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Session</CardTitle>
            <CardDescription>End the current ScholarFlow AI session.</CardDescription>
          </CardHeader>
          <CardContent>
            <SignOutButton />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
