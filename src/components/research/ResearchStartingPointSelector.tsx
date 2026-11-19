import Link from 'next/link';

interface ResearchStartingPointSelectorProps {
  workspaceSlug: string;
}

export function ResearchStartingPointSelector({ workspaceSlug }: ResearchStartingPointSelectorProps) {
  const basePath = `/w/${workspaceSlug}`;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Where are you in your research journey?
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href={`${basePath}/ideation/new`}
          className="rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <p className="font-medium">Option A — Explore Research Ideas</p>
          <p className="mt-2 text-xs text-muted-foreground">
            I have an area of interest or practical problem, but I have not yet selected a research topic.
          </p>
        </Link>
        <Link
          href={`${basePath}/projects/new`}
          className="rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <p className="font-medium">Option B — Develop an Existing Research Topic</p>
          <p className="mt-2 text-xs text-muted-foreground">
            I already have a research topic or provisional research question and want to investigate the
            existing literature.
          </p>
        </Link>
        <Link
          href={`${basePath}/projects`}
          className="rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <p className="font-medium">Option C — Continue an Established Research Project</p>
          <p className="mt-2 text-xs text-muted-foreground">
            I have an existing proposal or ongoing research project and want to organise, analyse, and
            manage it.
          </p>
        </Link>
      </div>
    </div>
  );
}
