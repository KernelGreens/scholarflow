# ScholarFlow AI — n8n Integration

## 1. Role of n8n

n8n is the **automation execution engine**, never the system of record for users,
tenants, permissions, or research data. The Next.js app is canonical.

## 2. Current workflow design (target state)

```
Production Webhook (validated) → Research Config → Literature retrieval (OpenAlex/Crossref)
→ Normalisation/dedup → Evidence → AI analysis → Domain summaries → Positioning
→ Structured result → Callback (completion/progress/failure) → Persist → Human review
```

Manual trigger retained for development.

## 3. Workflow catalogue keys

- `RESEARCH_DISCOVERY`
- `DOMAIN_SUMMARY`
- `PUBLICATION_SCREENING`
- `EVIDENCE_EXTRACTION`
- `LITERATURE_POSITIONING`
- `NOVELTY_PRESSURE_TEST`
- `RESEARCH_REPORT`
- `INCREMENTAL_LITERATURE_MONITORING`

Only keys with implemented, tested handlers are enabled.

## 4. Job request contract (versioned)

```jsonc
{
  "schemaVersion": 1,
  "runId": "…",            // server-generated
  "correlationId": "…",     // server-generated
  "idempotencyKey": "…",   // server-generated
  "tenantId": "…",          // from authorised membership
  "projectId": "…",
  "workflowKey": "RESEARCH_DISCOVERY",
  "workflowVersion": 1,
  "requestedBy": "user_…",
  "researchContext": { … },
  "selectedDomains": [ … ],
  "searchQueries": [ … ],
  "searchConfiguration": { … },
  "modelConfiguration": { … },
  "usageBudget": { … },
  "callback": { "url": "…", "token": "…" }
}
```

## 5. Job response contract (versioned)

```jsonc
{
  "schemaVersion": 1,
  "runId": "…",
  "correlationId": "…",
  "workflowKey": "…",
  "status": "COMPLETED",
  "startedAt": "…",
  "completedAt": "…",
  "sourceStatuses": [ … ],
  "domainResults": [ … ],
  "publicationRecords": [ … ],
  "evidenceRecords": [ … ],
  "domainSummaries": [ … ],
  "capabilityComparisons": [ … ],
  "candidateGaps": [ … ],
  "positioningStatement": { … },
  "recommendedReading": [ … ],
  "generatedArtefacts": [ … ],
  "warnings": [ … ],
  "errors": [ … ],
  "usageMetrics": { … }
}
```

## 6. Callback endpoints

- `POST /api/internal/automation/v1/runs/:runId/events/ack`
- `POST /api/internal/automation/v1/runs/:runId/events/progress`
- `POST /api/internal/automation/v1/runs/:runId/events/complete`
- `POST /api/internal/automation/v1/runs/:runId/events/fail`
- `POST /api/internal/automation/v1/runs/:runId/events/heartbeat`

Security: HMAC signature (or scoped service token), timestamp validation
(±30s window), replay protection via event id + idempotency key, body Zod
validation, rate limiting, audit logging.

## 7. Run lifecycle

`QUEUED → DISPATCHING → RUNNING → (PARTIAL | COMPLETED | FAILED) | CANCEL_REQUESTED → CANCELLED | TIMED_OUT`

Valid transitions only; duplicate/out-of-order callbacks handled idempotently.

## 8. Reliability

- Durable dispatch via outbox pattern / DB-backed job queue.
- Duplicate prevention via idempotency keys.
- Job timeout + stale-run reconciliation.

## 9. Security controls

- Fixed server-side allow-list of approved webhook destinations.
- No user-supplied arbitrary webhook URLs.
- No unrestricted n8n DB access; narrow internal persistence API preferred.
- Credentials stored via secrets manager.

## 10. Current status

Phase 2 implements the integration-ready n8n workflow JSON and the callback
handler. Until then, only `RESEARCH_DISCOVERY` is planned; others deferred.

- Slice 2.2 status: **implemented** — `AutomationRun` + `AutomationRunEvent`
  models, authenticated `POST /api/runs` (create + dispatch signed n8n webhook),
  authenticated `GET /api/runs/:runId` (status/results), and HMAC-validated
  internal callback endpoints under
  `POST /api/internal/automation/v1/runs/:runId/events/{ack|progress|complete|fail|heartbeat}`.
  Run lifecycle: `QUEUED → DISPATCHING → RUNNING → (PARTIAL | COMPLETED | FAILED) | CANCEL_REQUESTED → CANCELLED | TIMED_OUT`.
  Durable outbox/queue wiring and real n8n workflow deployment remain pending.
