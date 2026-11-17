import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

export const ENABLED_N8N_WORKFLOW_KEYS = ['RESEARCH_DISCOVERY'] as const;
export type EnabledN8nWorkflowKey = (typeof ENABLED_N8N_WORKFLOW_KEYS)[number];

export const CALLBACK_EVENT_TYPES = [
  'ack',
  'progress',
  'complete',
  'fail',
  'heartbeat',
] as const;
export type CallbackEventType = (typeof CALLBACK_EVENT_TYPES)[number];

export const AUTOMATION_RUN_STATUSES = [
  'QUEUED',
  'DISPATCHING',
  'RUNNING',
  'PARTIAL',
  'COMPLETED',
  'FAILED',
  'CANCEL_REQUESTED',
  'CANCELLED',
  'TIMED_OUT',
] as const;
export type AutomationRunStatusValue = (typeof AUTOMATION_RUN_STATUSES)[number];

const DEFAULT_SIGNATURE_TOLERANCE_SECONDS = 30;

export function isEnabledWorkflowKey(workflowKey: string): boolean {
  return (ENABLED_N8N_WORKFLOW_KEYS as readonly string[]).includes(workflowKey);
}

export function getN8nDiscoveryWebhookUrl(): string | undefined {
  const url = process.env.N8N_DISCOVERY_WEBHOOK_URL;
  const trimmed = url?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

export function getN8nSigningSecret(): string {
  const secret = process.env.N8N_SIGNING_SECRET;
  return secret && secret.length > 0 ? secret : 'local_dev_n8n_signing_secret_change_me';
}

export function signPayload(body: string, secret: string): string {
  return createHmac('sha256', secret).update(body).digest('hex');
}

export function verifyCallbackSignature(params: {
  rawBody: string;
  signature: string;
  secret: string;
  timestamp?: string;
  toleranceSeconds?: number;
}): boolean {
  const { rawBody, signature, secret, toleranceSeconds = DEFAULT_SIGNATURE_TOLERANCE_SECONDS } = params;

  const expected = signPayload(rawBody, secret);
  const expectedBuf = Buffer.from(expected);
  const signatureBuf = Buffer.from(signature);
  if (expectedBuf.length !== signatureBuf.length || !timingSafeEqual(expectedBuf, signatureBuf)) {
    return false;
  }

  if (params.timestamp) {
    const ts = Number(params.timestamp);
    if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > toleranceSeconds) {
      return false;
    }
  }

  return true;
}

export type N8nDispatchResult = { ok: true } | { ok: false; error: string };

export async function dispatchN8nWebhook(params: {
  url?: string;
  payload: unknown;
  secret?: string;
  eventId?: string;
}): Promise<N8nDispatchResult> {
  const url = params.url ?? getN8nDiscoveryWebhookUrl();
  if (!url) {
    return { ok: false, error: 'N8N_DISCOVERY_WEBHOOK_URL is not configured.' };
  }

  const secret = params.secret ?? getN8nSigningSecret();
  const eventId = params.eventId ?? randomUUID();
  const body = JSON.stringify(params.payload);
  const signature = signPayload(body, secret);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-scholarflow-signature': signature,
      'x-scholarflow-event-id': eventId,
      'x-scholarflow-timestamp': String(Math.floor(Date.now() / 1000)),
    },
    body,
    signal: AbortSignal.timeout(10_000),
  });

  if (response.ok) {
    return { ok: true };
  }

  const responseBody = await response.text().catch(() => '');
  return { ok: false, error: `n8n webhook responded with status ${response.status}: ${responseBody.slice(0, 500)}` };
}
