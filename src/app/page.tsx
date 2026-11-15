import Link from 'next/link';

export const metadata = {
  title: 'ScholarFlow AI',
  description:
    'ScholarFlow AI — the intelligent research operating system for doctoral research, evidence-grounded literature orchestration, and research automation.',
};

const FEATURES = [
  {
    name: 'Discover',
    description: 'Run literature discovery across research domains and generate reviewable AI summaries.',
  },
  {
    name: 'Analyse',
    description: 'Screen, verify and organise evidence from retrieved publications.',
  },
  {
    name: 'Collaborate',
    description: 'Invite supervisors and reviewers into the research workflow.',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Create your research workspace',
    description: 'Start a personal, group or institutional research workspace.',
  },
  {
    step: '02',
    title: 'Create a research project',
    description: 'Define the research context, domains and provisional methodology.',
  },
  {
    step: '03',
    title: 'Run AI-driven discovery',
    description: 'Queue the automation run and inspect reviewable domain summaries.',
  },
  {
    step: '04',
    title: 'Review and advance',
    description: 'Screen evidence, refine positioning and prepare the thesis.',
  },
];

const PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Personal research workspace and project tracking.',
    cta: 'Get Started',
    href: '/register',
  },
  {
    name: 'Research',
    price: 'Pro',
    description: 'AI discovery runs, literature library and evidence tooling.',
    cta: 'Get Started',
    href: '/register',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Multi-tenant governance, supervision and compliance.',
    cta: 'Contact',
    href: '/register',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-foreground">
      <header className="border-b border-[#e2e8f0] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-bold text-[#14243b]">
            ScholarFlow AI
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-[#475569] md:flex">
            <Link href="#features">Features</Link>
            <Link href="#how-it-works">How it works</Link>
            <Link href="#pricing">Pricing</Link>
            <Link href="#about">About</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-md px-3 py-2 text-sm font-medium text-[#475569] hover:bg-[#f1f5f9]"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-[#2563eb] px-4 py-2 text-sm font-medium text-white hover:bg-[#2563eb]/90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-[#e2e8f0] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#2563eb]">ScholarFlow AI</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#14243b] sm:text-5xl">
            Your research. One intelligent workspace.
          </h1>
          <p className="mt-4 text-lg text-[#475569]">
            From literature discovery to thesis completion.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-md bg-[#2563eb] px-6 py-3 text-sm font-medium text-white hover:bg-[#2563eb]/90"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-[#cbd5e1] bg-white px-6 py-3 text-sm font-medium text-[#475569] hover:bg-[#f8fafc]"
            >
              Start research or sign in
            </Link>
          </div>
          <p className="mt-6 text-sm text-[#64748b]">Explore a clearly labelled sample project.</p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-bold tracking-tight text-[#14243b]">Features</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.name} className="rounded-lg border border-[#e2e8f0] p-6">
                <h3 className="text-lg font-semibold text-[#14243b]">{feature.name}</h3>
                <p className="mt-2 text-sm text-[#475569]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-bold tracking-tight text-[#14243b]">How it works</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="rounded-lg border border-[#e2e8f0] p-6">
                <p className="text-xs font-semibold text-[#2563eb]">{step.step}</p>
                <h3 className="mt-2 text-base font-semibold text-[#14243b]">{step.title}</h3>
                <p className="mt-2 text-sm text-[#475569]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-bold tracking-tight text-[#14243b]">Pricing</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {PLANS.map((plan) => (
              <div key={plan.name} className="rounded-lg border border-[#e2e8f0] p-6">
                <h3 className="text-lg font-semibold text-[#14243b]">{plan.name}</h3>
                <p className="mt-2 text-2xl font-bold text-[#14243b]">{plan.price}</p>
                <p className="mt-2 text-sm text-[#475569]">{plan.description}</p>
                <Link
                  href={plan.href}
                  className="mt-4 inline-block rounded-md bg-[#2563eb] px-4 py-2 text-sm font-medium text-white hover:bg-[#2563eb]/90"
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-bold tracking-tight text-[#14243b]">About</h2>
          <p className="mt-4 max-w-3xl text-[#475569]">
            ScholarFlow AI is the intelligent research operating system for doctoral research — combining
            AI-driven literature discovery, evidence orchestration and supervisor collaboration in one
            workspace.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#e2e8f0] bg-[#14243b]">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">Start your research journey</h2>
          <p className="mt-4 text-[#cbd5e1]">From literature discovery to thesis completion.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-md bg-[#2563eb] px-6 py-3 text-sm font-medium text-white hover:bg-[#2563eb]/90"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-[#475569] px-6 py-3 text-sm font-medium text-[#cbd5e1] hover:bg-white/10"
            >
              Start research or sign in
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
