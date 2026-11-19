'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreateWorkspaceFormProps {
  onCreated?: (slug: string) => void;
}

export function CreateWorkspaceForm({ onCreated }: CreateWorkspaceFormProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState<'PERSONAL' | 'GROUP' | 'INSTITUTION'>('PERSONAL');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const res = await fetch('/api/workspaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type }),
    });

    const data = (await res.json().catch(() => ({}))) as { tenant?: { slug: string }; error?: string };
    if (!res.ok) {
      setError(data.error ?? 'Failed to create workspace.');
      setPending(false);
      return;
    }

    if (onCreated) {
      onCreated(data.tenant!.slug);
      return;
    }

    router.push(`/w/${data.tenant!.slug}/starting-point`);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create research workspace</CardTitle>
        <CardDescription>Start a personal, group, or institutional research workspace.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workspace-name">Workspace name *</Label>
            <Input
              id="workspace-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Doctoral Research"
              required
              minLength={2}
              maxLength={120}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workspace-type">Workspace type</Label>
            <select
              id="workspace-type"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as 'PERSONAL' | 'GROUP' | 'INSTITUTION')}
            >
              <option value="PERSONAL">Personal</option>
              <option value="GROUP">Group</option>
              <option value="INSTITUTION">Institution</option>
            </select>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? 'Creating…' : 'Create workspace'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
