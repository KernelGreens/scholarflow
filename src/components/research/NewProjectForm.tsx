'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface NewProjectFormProps {
  workspaceSlug: string;
}

export function NewProjectForm({ workspaceSlug }: NewProjectFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [shortTitle, setShortTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [aim, setAim] = useState('');
  const [institution, setInstitution] = useState('');
  const [programmeType, setProgrammeType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [targetCompletionDate, setTargetCompletionDate] = useState('');
  const [keywords, setKeywords] = useState('');
  const [privacy, setPrivacy] = useState<'PRIVATE' | 'SHARED' | 'PUBLIC'>('PRIVATE');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: workspaceSlug,
        title,
        shortTitle: shortTitle || undefined,
        description: description || undefined,
        discipline: discipline || undefined,
        aim: aim || undefined,
        institution: institution || undefined,
        programmeType: programmeType || undefined,
        startDate: startDate || undefined,
        targetCompletionDate: targetCompletionDate || undefined,
        keywords: keywords ? keywords.split(',').map((k) => k.trim()).filter(Boolean) : [],
        privacy,
      }),
    });

    const data = (await res.json().catch(() => ({}))) as { projectId?: string; error?: string };
    if (!res.ok) {
      setError(data.error ?? 'Failed to create project.');
      setPending(false);
      return;
    }

    router.push(`/w/${workspaceSlug}/projects/${data.projectId}`);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create research project</CardTitle>
        <CardDescription>Start a new research project in this workspace.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Research title *</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shortTitle">Short title</Label>
            <Input id="shortTitle" value={shortTitle} onChange={(e) => setShortTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="discipline">Academic discipline</Label>
              <Input id="discipline" value={discipline} onChange={(e) => setDiscipline(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="institution">Institution</Label>
              <Input id="institution" value={institution} onChange={(e) => setInstitution(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="aim">Research aim</Label>
            <Textarea id="aim" value={aim} onChange={(e) => setAim(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start date</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetCompletionDate">Target completion date</Label>
              <Input
                id="targetCompletionDate"
                type="date"
                value={targetCompletionDate}
                onChange={(e) => setTargetCompletionDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords (comma separated)</Label>
            <Input id="keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="privacy">Privacy</Label>
            <select
              id="privacy"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value as 'PRIVATE' | 'SHARED' | 'PUBLIC')}
            >
              <option value="PRIVATE">Private</option>
              <option value="SHARED">Shared</option>
              <option value="PUBLIC">Public</option>
            </select>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? 'Creating…' : 'Create project'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
