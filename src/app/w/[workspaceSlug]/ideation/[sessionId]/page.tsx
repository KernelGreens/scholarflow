import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const instant = false;

interface IdeationSessionDetailPageProps {
  params: Promise<{ workspaceSlug: string; sessionId: string }>;
}

export default async function IdeationSessionDetailPage({ params }: IdeationSessionDetailPageProps) {
  await connection();
  const { workspaceSlug, sessionId } = await params;
  const session = await auth();
  const user = session?.user;
  if (!user?.id) {
    redirect('/login');
  }

  const tenant = await prisma.tenant.findUnique({ where: { slug: workspaceSlug } });
  if (!tenant) {
    notFound();
  }

  const ideationSession = await prisma.ideationSession.findFirst({
    where: { id: sessionId, tenantId: tenant.id, ownerId: user.id },
  });

  if (!ideationSession) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href={`/w/${tenant.slug}/starting-point`} className="underline hover:text-foreground">
              Back to research journey
            </Link>
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Research ideation session</h1>
        </div>
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium">Interest</p>
          <p className="mt-2 text-sm">{ideationSession.interest}</p>
          {ideationSession.motivation ? (
            <>
              <p className="mt-3 text-sm font-medium">Motivation</p>
              <p className="mt-2 text-sm">{ideationSession.motivation}</p>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}
