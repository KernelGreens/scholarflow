import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const instant = false;

interface ProjectDetailPageProps {
  params: Promise<{ workspaceSlug: string; projectId: string }>;
}

const RESEARCH_MODULES = [
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

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  await connection();
  const { workspaceSlug, projectId } = await params;
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

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-6">
        <Link href={`/w/${tenant.slug}/projects`} className="text-sm text-muted-foreground hover:underline">
          ← Back to projects
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{project.title}</h1>
        {project.shortTitle ? <p className="text-sm text-muted-foreground">{project.shortTitle}</p> : null}
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>AI Workflow Intelligence</CardTitle>
          <CardDescription>
            Autonomous literature discovery for this project. AI outputs remain drafts until reviewed.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Next action: Run Discovery</p>
            <p className="text-xs text-muted-foreground">Current phase: {project.phase}</p>
          </div>
          <Button className="h-9 rounded-md bg-[#2563eb] px-4 text-sm font-medium text-white hover:bg-[#2563eb]/90">
            Run Discovery
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Research modules</CardTitle>
          <CardDescription>
            Modules in the ScholarFlow AI research workflow. Discovery is executed through AI Workflow
            Intelligence.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {RESEARCH_MODULES.map((module) => (
              <li key={module.name} className="rounded-md border p-3">
                <p className="text-sm font-medium">{module.name}</p>
                <p className="text-xs text-muted-foreground">{module.description}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
