import { z } from 'zod';

export const callbackEventTypes = ['ack', 'progress', 'complete', 'fail', 'heartbeat'] as const;
export type CallbackEventType = (typeof callbackEventTypes)[number];

export const createAutomationRunSchema = z.object({
  workflowKey: z.string().min(1, 'Workflow key is required.').max(100, 'Workflow key is too long.').optional(),
  projectId: z.string().min(1, 'Project identifier is required.').max(100, 'Project identifier is too long.'),
  researchContext: z.unknown().optional(),
});

export const callbackEventSchema = z.object({
  type: z.enum(callbackEventTypes),
  status: z.string().max(100).optional(),
  payload: z.unknown().optional(),
});

export type CreateAutomationRunInput = z.infer<typeof createAutomationRunSchema>;
export type CallbackEventInput = z.infer<typeof callbackEventSchema>;
