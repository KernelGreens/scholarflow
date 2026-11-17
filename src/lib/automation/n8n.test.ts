import { describe, expect, it } from 'vitest';
import { createHmac } from 'node:crypto';
import {
  CALLBACK_EVENT_TYPES,
  ENABLED_N8N_WORKFLOW_KEYS,
  isEnabledWorkflowKey,
  signPayload,
  verifyCallbackSignature,
} from './n8n';

describe('n8n integration helpers', () => {
  it('signs payloads deterministically', () => {
    const body = JSON.stringify({ runId: 'run_1', status: 'RUNNING' });
    expect(signPayload(body, 'secret')).toBe(createHmac('sha256', 'secret').update(body).digest('hex'));
  });

  it('verifies a valid callback signature', () => {
    const body = JSON.stringify({ runId: 'run_1', type: 'complete', status: 'COMPLETED' });
    const signature = signPayload(body, 'secret');
    const timestamp = Math.floor(Date.now() / 1000);
    expect(verifyCallbackSignature({ rawBody: body, signature, secret: 'secret', timestamp: String(timestamp) })).toBe(true);
  });

  it('rejects an invalid signature', () => {
    const body = JSON.stringify({ runId: 'run_1', type: 'complete', status: 'COMPLETED' });
    const timestamp = Math.floor(Date.now() / 1000);
    expect(verifyCallbackSignature({ rawBody: body, signature: 'deadbeef', secret: 'secret', timestamp: String(timestamp) })).toBe(false);
  });

  it('rejects a stale callback timestamp', () => {
    const body = JSON.stringify({ runId: 'run_1', type: 'complete', status: 'COMPLETED' });
    const signature = signPayload(body, 'secret');
    const timestamp = Math.floor(Date.now() / 1000) - 3600;
    expect(
      verifyCallbackSignature({ rawBody: body, signature, secret: 'secret', timestamp: String(timestamp), toleranceSeconds: 30 })
    ).toBe(false);
  });

  it('exposes only enabled workflow keys', () => {
    expect((ENABLED_N8N_WORKFLOW_KEYS as readonly string[]).includes('RESEARCH_DISCOVERY')).toBe(true);
    expect(isEnabledWorkflowKey('RESEARCH_DISCOVERY')).toBe(true);
    expect(isEnabledWorkflowKey('DOMAIN_SUMMARY')).toBe(false);
  });

  it('exposes the supported callback event types', () => {
    expect([...CALLBACK_EVENT_TYPES].sort()).toEqual(['ack', 'complete', 'fail', 'heartbeat', 'progress']);
  });
});
