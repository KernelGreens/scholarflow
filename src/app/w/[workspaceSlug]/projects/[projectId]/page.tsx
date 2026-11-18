import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { RunDiscoveryButton } from '@/components/research/RunDiscoveryButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const instant = false;

interface ProjectDetailPageProps {
  params: Promise<{ workspaceSlug: string; projectId: string }>;
  searchParams: Promise<{ module?: string }>;
}

const RESEARCH_MODULES = [
  { name: 'Overview', description: 'Project position, phase and lifecycle state' },
  { name: 'Discovery', description: 'AI literature discovery and domain summaries', active: true },
  { name: 'Literature', description: 'Permanent publication records and screening' },
  { name: 'Evidence', description: 'Evidence matrix and verification' },
  { name: 'Positioning', description: 'Landscape, gaps and novelty' },
  { name: 'Design', description: 'Research design and framework' },
  { name: 'Writing', description: 'Writing studio and submissions' },
  { name: 'Reviews', description: 'Supervisor reviews and approvals' },
  { name: 'Runs', description: 'Automation runs and results' },
  { name: 'Settings', description: 'Project settings' },
];

export default async function ProjectDetailPage({ params, searchParams }: ProjectDetailPageProps) {
  await connection();
  const { workspaceSlug, projectId } = await params;
  const { module } = await searchParams;
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

  const latestRun = await prisma.automationRun.findFirst({
    where: { projectId, tenantId: project.tenantId },
    orderBy: { createdAt: 'desc' },
    include: { events: true },
  });

  const publications = await prisma.publication.findMany({
    where: { projectId, tenantId: project.tenantId },
    orderBy: { createdAt: 'desc' },
  });

  const activeModule = RESEARCH_MODULES.some((m) => m.name === module) ? module ?? 'Discovery' : 'Discovery';
  const moduleHref = (name: string) => `/w/${tenant.slug}/projects/${projectId}?module=${encodeURIComponent(name)}`;

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <aside className="w-[168px] shrink-0 bg-[#14243b] px-3 py-4">
        <nav className="flex flex-col gap-1" aria-label="Project modules">
          {RESEARCH_MODULES.map((m) => (
            <Link
              key={m.name}
              href={moduleHref(m.name)}
              className={`block rounded-md px-2.5 py-2 text-[10px] font-medium transition-colors ${
                m.name === activeModule ? 'bg-[#294c78] text-white' : 'text-[#cbd5e1] hover:bg-white/10'
              }`}
            >
              {m.name}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6">
            <Link href={`/w/${tenant.slug}/projects`} className="text-sm text-muted-foreground hover:underline">
              ← Back to projects
            </Link>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">{project.title}</h1>
            {project.shortTitle ? <p className="text-sm text-muted-foreground">{project.shortTitle}</p> : null}
          </div>

          {activeModule === 'Overview' ? (
            <Card>
              <CardHeader>
                <CardTitle>Project overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Status:</span> {project.status}
                </p>
                <p>
                  <span className="font-medium">Phase:</span> {project.phase}
                </p>
                {project.description ? <p>{project.description}</p> : null}
                {project.aim ? <p>
                  <span className="font-medium">Aim:</span> {project.aim}
                </p> : null}
                <p>
                  <span className="font-medium">Privacy:</span> {project.privacy}
                </p>
                <p>
                  <span className="font-medium">Phases recorded:</span>{' '}
                  {project.phases.map((p) => p.phase).join(', ') || 'None yet'}
                </p>
              </CardContent>
            </Card>
          ) : activeModule === 'Discovery' ? (
            <Card>
              <CardHeader>
                <CardTitle>AI Workflow Intelligence</CardTitle>
                <CardDescription>
                  Autonomous literature discovery for this project. AI outputs remain drafts until reviewed.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Next action: Run Discovery</p>
                    <p className="text-xs text-muted-foreground">Current phase: {project.phase}</p>
                  </div>
                  <RunDiscoveryButton projectId={project.id} />
                </div>
                {latestRun ? (
                  <div className="border-t pt-3 text-xs text-muted-foreground">
                    Latest run{' '}
                    <span className="font-medium text-foreground">{latestRun.status}</span>
                    {latestRun.startedAt ? (
                      <>
                        {' · '}started {new Date(latestRun.startedAt).toISOString()}
                      </>
                    ) : null}
                    {latestRun.completedAt ? (
                      <>
                        {' · '}completed {new Date(latestRun.completedAt).toISOString()}
                      </>
                    ) : null}
                    {latestRun.events && latestRun.events.length > 0 ? (
                      <ul className="mt-3 space-y-1">
                        {latestRun.events.map((event) => (
                          <li key={event.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                            <span className="font-medium text-foreground">{event.type}</span>
                            <span>{event.status ?? '—'}</span>
                            <span className="text-muted-foreground">{new Date(event.timestamp).toISOString()}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}
                {latestRun && latestRun.status === 'COMPLETED' && latestRun.results ? (
                  <div className="border-t pt-3">
                    <p className="text-xs font-medium text-foreground">Discovery run results</p>
                    <pre className="mt-2 max-h-96 overflow-auto rounded-md bg-muted p-3 text-xs whitespace-pre-wrap">
                      {JSON.stringify(latestRun.results, null, 2)}
                    </pre>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : activeModule === 'Literature' ? (
            <Card>
              <CardHeader>
                <CardTitle>Literature Library</CardTitle>
                <CardDescription>
                  Publications retrieved through discovery runs for this project.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {publications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No publications yet. Run Discovery to retrieve literature for this project.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {publications.map((publication) => (
                      <li key={publication.id} className="rounded-md border p-3">
                        <p className="text-sm font-medium">{publication.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {[publication.year, publication.source, publication.doi].filter(Boolean).join(' · ')}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Module: {activeModule}</CardTitle>
                <CardDescription>
                  The {activeModule} module is planned for this project and will be available in an upcoming phase.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          <Card className="mt-6">
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
    </div>
  );
}
