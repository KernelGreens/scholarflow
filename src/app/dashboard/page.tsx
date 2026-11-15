import { connection } from 'next/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';

export const instant = false;

type NavItem = {
  label: string;
  href?: string;
  active?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', href: '/dashboard', active: true },
  { label: 'Research Projects', href: '/workspaces' },
  { label: 'Research Discovery' },
  { label: 'Literature Library' },
  { label: 'Evidence Matrix' },
  { label: 'Research Positioning' },
  { label: 'Conceptual Framework' },
  { label: 'Methodology' },
  { label: 'Research Experiments' },
  { label: 'Publications' },
  { label: 'Supervisor Review' },
  { label: 'Automation Runs' },
  { label: 'Settings' },
];

const LIFECYCLE_PHASES = [
  { label: 'Discovery', active: true },
  { label: 'Design', active: false },
  { label: 'Proposal', active: false },
  { label: 'Data', active: false },
  { label: 'Experiments', active: false },
  { label: 'Thesis', active: false },
];

const RESEARCH_DOMAINS = [
  { name: 'Artificial Intelligence', progress: 74 },
  { name: 'Business Process Management', progress: 64 },
  { name: 'Process Mining', progress: 90 },
  { name: 'Enterprise Systems', progress: 51 },
  { name: 'Decision Support', progress: 61 },
  { name: 'Public Administration', progress: 40 },
];

const REVIEW_QUEUE = [
  'Verify WDI conceptual overlap',
  'Review Process Mining summary',
  'Read priority landmark papers',
  'Approve discovery report',
];

export default async function DashboardPage() {
  await connection();
  const session = await auth();
  const user = session?.user;
  if (!user?.id) {
    redirect('/login');
  }

  const navItemClassName = (active: boolean) =>
    `block rounded-md px-2.5 py-2 text-[10px] font-medium transition-colors ${
      active ? 'bg-[#294c78] text-white' : 'text-[#cbd5e1] hover:bg-white/10'
    }`;

  const memberships = await prisma.tenantMembership.findMany({
    where: { userId: user.id },
    include: { tenant: true },
  });
  const workspaces = memberships.map((membership) => membership.tenant);

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <aside className="flex w-[168px] shrink-0 flex-col bg-[#14243b] text-white">
        <div className="px-4 pt-6">
          <p className="text-sm font-bold text-white">ScholarFlow AI</p>
          <p className="mt-1 text-[8px] text-[#94a3b8]">RESEARCH WORKSPACE</p>
        </div>
        {workspaces.length > 0 ? (
          <div className="mt-8 px-3">
            <p className="px-2 pb-2 text-[8px] font-medium uppercase tracking-wide text-[#94a3b8]">Workspace</p>
            <ul className="space-y-1">
              {workspaces.map((workspace) => (
                <li key={workspace.id}>
                  <Link
                    href={`/w/${workspace.slug}/projects`}
                    className="block rounded-md px-2.5 py-2 text-[10px] font-medium text-[#cbd5e1] transition-colors hover:bg-white/10"
                  >
                    {workspace.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <nav className="mt-10 flex flex-1 flex-col gap-1 px-3" aria-label="Research workspace">
          {NAV_ITEMS.map((item) => {
            const className = navItemClassName(Boolean(item.active));
            const content = item.label;
            if (item.href) {
              return (
                <li key={item.label}>
                  <Link href={item.href} className={className}>
                    {content}
                  </Link>
                </li>
              );
            }
            return (
              <li key={item.label}>
                <span className={className}>{content}</span>
              </li>
            );
          })}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-[10px] font-normal text-[#64748b]">
            My Research / AI Workflow Intelligence
          </h1>
          <Button className="h-8 rounded-md bg-[#2563eb] px-3 text-xs font-medium text-white hover:bg-[#2563eb]/90">
            Run Discovery
          </Button>
        </header>
        <main className="min-w-0 flex-1 p-6">
          <div className="max-w-[680px] space-y-6">
            <div>
              <h2 className="text-[19px] font-bold text-[#14243b]">Research Overview</h2>
              <p className="mt-1 text-[9px] text-[#64748b]">Current phase: Research Discovery</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border bg-white p-4">
                <p className="text-[20px] font-bold text-[#1e293b]">128</p>
                <p className="mt-1 text-[9px] text-[#64748b]">Publications</p>
              </div>
              <div className="rounded-lg border bg-white p-4">
                <p className="text-[20px] font-bold text-[#1e293b]">42</p>
                <p className="mt-1 text-[9px] text-[#64748b]">Reviewed papers</p>
              </div>
              <div className="rounded-lg border bg-white p-4">
                <p className="text-[20px] font-bold text-[#1e293b]">6 / 6</p>
                <p className="mt-1 text-[9px] text-[#64748b]">Research domains</p>
              </div>
              <div className="rounded-lg border bg-white p-4">
                <p className="text-[20px] font-bold text-[#1e293b]">8</p>
                <p className="mt-1 text-[9px] text-[#64748b]">Candidate gaps</p>
              </div>
            </div>

            <div className="rounded-lg border bg-white p-5">
              <h3 className="text-[11px] font-semibold text-[#1e293b]">Research lifecycle</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {LIFECYCLE_PHASES.map((phase) => (
                  <span
                    key={phase.label}
                    className={
                      phase.active
                        ? 'rounded-md bg-[#dbeafe] px-2.5 py-2 text-[9px] font-medium text-[#1d4ed8]'
                        : 'rounded-md bg-[#f1f5f9] px-2.5 py-2 text-[9px] font-medium text-[#64748b]'
                    }
                  >
                    {phase.label}
                  </span>
                ))}
              </div>
              <div className="mt-4 h-1.5 w-full rounded-full bg-[#e2e8f0]">
                <div className="h-1.5 rounded-full bg-[#2563eb]" style={{ width: '28%' }} />
              </div>
              <p className="mt-3 text-[9px] text-[#64748b]">
                Next milestone: Validate literature positioning and candidate gaps
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-lg border bg-white p-5">
                <h3 className="text-[11px] font-semibold text-[#1e293b]">Research domains</h3>
                <div className="mt-4 space-y-3">
                  {RESEARCH_DOMAINS.map((domain) => (
                    <div key={domain.name} className="flex items-center justify-between gap-3">
                      <span className="text-[9px] text-[#475569]">{domain.name}</span>
                      <div className="h-1 w-[69px] shrink-0 overflow-hidden rounded-full bg-[#e2e8f0]">
                        <div
                          className="h-1 rounded-full bg-[#2563eb]"
                          style={{ width: `${domain.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border bg-white p-5">
                <h3 className="text-[11px] font-semibold text-[#1e293b]">Review queue</h3>
                <ul className="mt-4 space-y-3">
                  {REVIEW_QUEUE.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-[2px] border border-[#94a3b8] bg-transparent" />
                      <span className="text-[9px] text-[#475569]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
