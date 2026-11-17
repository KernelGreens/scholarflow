import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createAutomationRun, AutomationServiceError, dispatchAutomationRun } from '@/lib/application/automationService';
import { createAutomationRunSchema } from '@/lib/validation/automationRunSchema';

export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const parsed = createAutomationRunSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const { runId } = await createAutomationRun({
      actorUserId: user.id,
      projectId: parsed.data.projectId,
      workflowKey: parsed.data.workflowKey,
      researchContext: parsed.data.researchContext as Record<string, unknown> | undefined,
    });

    const dispatch = await dispatchAutomationRun(runId);
    const status = dispatch.ok ? 'RUNNING' : 'FAILED';

    return NextResponse.json(
      {
        runId,
        status,
        ...(dispatch.ok ? {} : { error: dispatch.error }),
      },
      { status: dispatch.ok ? 202 : 500 }
    );
  } catch (error) {
    if (error instanceof AutomationServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[api/runs] failed to create automation run', error);
    return NextResponse.json({ error: 'Failed to create automation run' }, { status: 500 });
  }
}
