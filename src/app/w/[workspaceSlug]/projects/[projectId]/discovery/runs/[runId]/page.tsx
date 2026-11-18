import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { hasProjectPermission } from '@/lib/auth/permissions';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const instant = false;

interface RunDetailPageProps {
  params: Promise<{ workspaceSlug: string; projectId: string; runId: string }>;
}

export default async function RunDetailPage({ params }: RunDetailPageProps) {
  await connection();
  const { workspaceSlug, projectId, runId } = await params;
  const session = await auth();
  const user = session?.user;
  if (!user?.id) {
    return null;
  }

  const tenant = await prisma.tenant.findUnique({ where: { slug: workspaceSlug } });
  const project = await prisma.researchProject.findUnique({
    where: { id: projectId },
    include: { phases: true },
  });

  if (!tenant || !project || project.tenantId !== tenant.id) {
    notFound();
  }

  const run = await prisma.automationRun.findUnique({
    where: { id: runId },
    include: { events: true },
  });

  if (!run || run.projectId !== projectId || run.tenantId !== project.tenantId) {
    notFound();
  }

  const membership = await prisma.tenantMembership.findUnique({
    where: { tenantId_userId: { tenantId: project.tenantId, userId: user.id } },
  });

  if (!membership || !hasProjectPermission(membership.role, 'project:view')) {
    notFound();
  }

  const events = await prisma.automationRunEvent.findMany({
    where: { runId: run.id },
    orderBy: { timestamp: 'asc' },
  });

  const publications = await prisma.publication.findMany({
    where: { runId: run.id },
    orderBy: { createdAt: 'desc' },
  });

  const failedEvent = events.find((event) => event.type === 'fail');

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div>
            <p className="text-sm text-muted-foreground">
              <a href={`/w/${tenant.slug}/projects/${projectId}?module=Discovery`} className="underline hover:text-foreground">
                Back to project
              </a>
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Discovery run</h1>
            <p className="text-sm text-muted-foreground">Run identifier: {run.id}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Execution status</CardTitle>
              <CardDescription>
                Automation run for project {project.title}. AI outputs remain drafts until reviewed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Status</p>
                  <p className="text-sm font-medium">{run.status}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Workflow</p>
                  <p className="text-sm font-medium">{run.workflowKey}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Started</p>
                  <p className="text-sm">{run.startedAt ? new Date(run.startedAt).toISOString() : '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Completed</p>
                  <p className="text-sm">{run.completedAt ? new Date(run.completedAt).toISOString() : '—'}</p>
                </div>
              </div>
              {run.status === 'FAILED' && failedEvent ? (
                <p className="text-sm text-destructive">Run failed at event {failedEvent.type}.</p>
              ) : null}
              {run.status === 'COMPLETED' && publications.length > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Retrieved publications: <span className="font-medium text-foreground">{publications.length}</span>
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Event timeline</CardTitle>
              <CardDescription>Authenticated automation events for this run.</CardDescription>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground">No events recorded yet.</p>
              ) : (
                <ul className="space-y-2">
                  {events.map((event) => (
                    <li key={event.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border p-2 text-sm">
                      <span className="font-medium text-foreground">{event.type}</span>
                      <span>{event.status ?? '—'}</span>
                      <span className="text-muted-foreground">{new Date(event.timestamp).toISOString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Retrieved publications</CardTitle>
              <CardDescription>Publications returned by the discovery workflow for this run.</CardDescription>
            </CardHeader>
            <CardContent>
              {publications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No publications retrieved for this run yet.</p>
              ) : (
                <ul className="space-y-2">
                  {publications.map((publication) => (
                    <li key={publication.id} className="rounded-md border p-3 text-sm">
                      <p className="font-medium">{publication.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {[publication.year, publication.source, publication.doi].filter(Boolean).join(' · ')}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
