'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface RunDiscoveryButtonProps {
  projectId: string;
  workflowKey?: string;
}

export function RunDiscoveryButton({ projectId, workflowKey }: RunDiscoveryButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch('/api/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, workflowKey }),
      });
      const data = (await res.json().catch(() => ({}))) as { runId?: string; status?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Failed to start discovery run.');
        return;
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        className="h-9 rounded-md bg-[#2563eb] px-4 text-sm font-medium text-white hover:bg-[#2563eb]/90"
        disabled={pending}
        onClick={handleRun}
      >
        {pending ? 'Running…' : 'Run Discovery'}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
