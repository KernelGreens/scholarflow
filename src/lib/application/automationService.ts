import { randomUUID } from 'node:crypto';
import prisma from '@/lib/prisma';
import { hasProjectPermission } from '@/lib/auth/permissions';
import { dispatchN8nWebhook, isEnabledWorkflowKey } from '@/lib/automation/n8n';

export class AutomationServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export type CreateAutomationRunInput = {
  actorUserId: string;
  projectId: string;
  workflowKey?: string;
  researchContext?: Record<string, unknown>;
};

export async function createAutomationRun(input: CreateAutomationRunInput): Promise<{ runId: string }> {
  const workflowKey = input.workflowKey ?? 'RESEARCH_DISCOVERY';

  if (!isEnabledWorkflowKey(workflowKey)) {
    throw new AutomationServiceError(`Workflow "${workflowKey}" is not enabled.`, 400);
  }

  const project = await prisma.researchProject.findUnique({ where: { id: input.projectId } });
  if (!project) {
    throw new AutomationServiceError('Research project not found.', 404);
  }

  const tenantId = project.tenantId;

  const membership = await prisma.tenantMembership.findUnique({
    where: { tenantId_userId: { tenantId, userId: input.actorUserId } },
  });
  if (!membership) {
    throw new AutomationServiceError('You are not a member of this workspace.', 403);
  }

  if (!hasProjectPermission(membership.role, 'project:create')) {
    throw new AutomationServiceError('You do not have permission to run discovery workflows.', 403);
  }

  const run = await prisma.automationRun.create({
    data: {
      tenantId,
      projectId: input.projectId,
      workflowKey,
      workflowVersion: 1,
      status: 'QUEUED',
      correlationId: randomUUID(),
      idempotencyKey: randomUUID(),
      requestedBy: input.actorUserId,
      usage: (input.researchContext ?? undefined) as never,
    },
  });

  return { runId: run.id };
}

export async function dispatchAutomationRun(runId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const run = await prisma.automationRun.findUnique({ where: { id: runId } });
  if (!run) {
    return { ok: false, error: 'Automation run not found.' };
  }

  if (run.status !== 'QUEUED') {
    return { ok: true };
  }

  await prisma.automationRun.update({
    where: { id: runId },
    data: { status: 'DISPATCHING' },
  });

  const dispatch = await dispatchN8nWebhook({
    payload: {
      runId: run.id,
      correlationId: run.correlationId,
      idempotencyKey: run.idempotencyKey,
      tenantId: run.tenantId,
      projectId: run.projectId,
      workflowKey: run.workflowKey,
      workflowVersion: run.workflowVersion,
      status: 'RUNNING',
      startedAt: run.startedAt ?? new Date().toISOString(),
    },
    eventId: run.correlationId,
  });

  if (dispatch.ok) {
    await prisma.automationRun.update({
      where: { id: runId },
      data: { status: 'RUNNING' },
    });
    return { ok: true };
  }

  await prisma.automationRun.update({
    where: { id: runId },
    data: { status: 'FAILED', completedAt: new Date() },
  });

  return { ok: false, error: dispatch.error };
}
