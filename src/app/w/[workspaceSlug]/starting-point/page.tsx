import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ResearchStartingPointSelector } from '@/components/research/ResearchStartingPointSelector';
import Link from 'next/link';

export const instant = false;

interface StartingPointPageProps {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function StartingPointPage({ params }: StartingPointPageProps) {
  await connection();
  const { workspaceSlug } = await params;
  const session = await auth();
  const user = session?.user;
  if (!user?.id) {
    redirect('/login');
  }

  const tenant = await prisma.tenant.findUnique({ where: { slug: workspaceSlug } });
  if (!tenant) {
    notFound();
  }

  const membership = await prisma.tenantMembership.findUnique({
    where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
  });
  if (!membership) {
    redirect(`/w/${tenant.slug}/projects`);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href={`/w/${tenant.slug}/projects`} className="underline hover:text-foreground">
              Back to workspace
            </Link>
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Where are you in your research journey?</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Answer to tailor discovery and project workflows to your stage.
          </p>
        </div>
        <ResearchStartingPointSelector workspaceSlug={tenant.slug} />
      </div>
    </main>
  );
}
