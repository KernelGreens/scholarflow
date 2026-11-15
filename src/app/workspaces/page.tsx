import { connection } from 'next/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CreateWorkspaceForm } from '@/components/research/CreateWorkspaceForm';
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
    include: { tenant: true },
  });

  const tenants = memberships.map((m) => m.tenant);

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <CreateWorkspaceForm />
      <Card>
        <CardHeader>
          <CardTitle>Research workspaces</CardTitle>
          <CardDescription>Personal, group, or institutional research workspaces you belong to.</CardDescription>
        </CardHeader>
        <CardContent>
          {tenants.length === 0 ? (
            <p className="text-sm text-muted-foreground">You have not joined or created any workspaces yet.</p>
          ) : (
            <ul className="space-y-2">
              {tenants.map((t) => (
                <li key={t.id} className="rounded-lg border p-3">
                  <Link href={`/w/${t.slug}/projects`} className="block">
                    <div>
                      <p className="font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.slug}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
