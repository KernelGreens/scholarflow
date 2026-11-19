'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface StartIdeationSessionFormProps {
  workspaceSlug: string;
  tenantId: string;
}

export function StartIdeationSessionForm({ workspaceSlug, tenantId }: StartIdeationSessionFormProps) {
  const router = useRouter();
  const [interest, setInterest] = useState('');
  const [motivation, setMotivation] = useState('');
  const [desiredOutcome, setDesiredOutcome] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const res = await fetch('/api/ideation/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId,
        interest,
        motivation: motivation || undefined,
        desiredOutcome: desiredOutcome || undefined,
      }),
    });

    const data = (await res.json().catch(() => ({}))) as { session?: { id: string }; error?: string };
    if (!res.ok) {
      setError(data.error ?? 'Failed to start ideation session.');
      setPending(false);
      return;
    }

    router.push(`/w/${workspaceSlug}/ideation/${data.session!.id}`);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Start research ideation session</CardTitle>
        <CardDescription>
          Describe your broad research interest. You can refine it into a candidate topic later through
          discovery.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ideation-interest">Research interest *</Label>
            <Input
              id="ideation-interest"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              placeholder="e.g. AI for public-sector administrative workflows"
              required
              minLength={2}
              maxLength={2000}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ideation-motivation">Motivation (optional)</Label>
            <Textarea
              id="ideation-motivation"
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="Why does this matter to you?"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ideation-outcome">Desired outcome / direction (optional)</Label>
            <Textarea
              id="ideation-outcome"
              value={desiredOutcome}
              onChange={(e) => setDesiredOutcome(e.target.value)}
              placeholder="e.g. develop a theoretical framework, build a model, evaluate an intervention"
              rows={3}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? 'Starting…' : 'Start ideation session'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
