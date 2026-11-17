'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result = await signIn('credentials', { email, password, redirect: false });
    setPending(false);
    if (result?.error) {
      setError('Invalid email or password.');
      return;
    }
    router.push('/workspaces');
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Sign in to ScholarFlow AI</CardTitle>
          <CardDescription>Access your research workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Forgot password?{' '}
            <a href="/forgot-password" className="font-medium text-primary underline-offset-4 hover:underline">
              Reset it
            </a>
          </p>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            No account yet?{' '}
            <a href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
              Create one
            </a>
          </p>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <a href="/" className="font-medium text-primary underline-offset-4 hover:underline">
              Back to the landing page
            </a>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
