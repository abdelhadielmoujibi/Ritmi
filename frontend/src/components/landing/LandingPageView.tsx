import Link from "next/link";
import Image from "next/image";
import logo from "@/logo.png";
import {
  ArrowRight,
  BrainCircuit,
  CalendarCheck2,
  Gauge,
  HeartPulse,
  ListChecks,
  MoonStar,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

const steps = [
  {
    icon: CalendarCheck2,
    title: "Set monthly direction",
    text: "Define a few meaningful goals for the month so your effort has a clear direction.",
  },
  {
    icon: ListChecks,
    title: "Plan weekly tasks",
    text: "Split goals into realistic tasks with priority, difficulty, and optional deadlines.",
  },
  {
    icon: HeartPulse,
    title: "Check in daily",
    text: "Track energy, focus, stress, sleep, motivation, and available study time in under a minute.",
  },
  {
    icon: BrainCircuit,
    title: "Get adaptive guidance",
    text: "StudyPulse selects what fits today and explains what to avoid when your capacity is lower.",
  },
];

const benefits = [
  {
    icon: Gauge,
    title: "Adaptive intensity",
    text: "The recommendation matches your real daily condition, not an idealized schedule.",
  },
  {
    icon: ShieldAlert,
    title: "Negative streak detection",
    text: "Sustained decline is detected early and recovery mode is triggered before momentum drops.",
  },
  {
    icon: Sparkles,
    title: "AI explanation layer",
    text: "Rules decide the mode. AI explains the decision in clear and supportive language.",
  },
  {
    icon: MoonStar,
    title: "Student-centered tone",
    text: "Built as an academic decision assistant, not as therapy or a generic chatbot.",
  },
];

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">{eyebrow}</p>
      <h2 className="font-display mt-3 text-3xl leading-tight text-white md:text-4xl">{title}</h2>
      <p className="mt-4 text-sm leading-relaxed text-zinc-300 md:text-base">{text}</p>
    </div>
  );
}

export function LandingPageView() {
  return (
    <main className="lp-root relative min-h-screen overflow-hidden bg-[#09090b] text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(251,191,36,0.12),transparent_28%),radial-gradient(circle_at_85%_12%,rgba(34,197,94,0.14),transparent_24%),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:auto,auto,100%_36px]" />

      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/75 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between rounded-2xl border border-zinc-700/80 bg-zinc-900/70 px-4 py-3 shadow-[0_10px_40px_-18px_rgba(0,0,0,0.9)] backdrop-blur-xl md:px-6">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="relative h-16 w-64 overflow-hidden rounded-xl border border-amber-300/30 bg-zinc-950">
                <Image src={logo} alt="StudyPulse AI logo" fill className="object-cover object-center scale-110" priority />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-200">StudyPulse AI</p>
                <p className="text-xs text-zinc-400">Adaptive academic planner</p>
              </div>
            </Link>

            <nav className="hidden items-center gap-2 rounded-full border border-zinc-700 bg-zinc-950/70 p-1 text-sm text-zinc-300 md:flex">
              <a href="#problem" className="rounded-full px-4 py-2 transition hover:bg-zinc-800 hover:text-amber-200">
                Problem
              </a>
              <a href="#how" className="rounded-full px-4 py-2 transition hover:bg-zinc-800 hover:text-amber-200">
                How it works
              </a>
              <a href="#benefits" className="rounded-full px-4 py-2 transition hover:bg-zinc-800 hover:text-amber-200">
                Benefits
              </a>
            </nav>

            <div className="flex items-center gap-2">
              <Link href="/login" className="rounded-xl border border-zinc-600 px-3 py-2 text-sm font-medium text-zinc-100 transition hover:bg-zinc-800">
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-xl bg-amber-300 px-3 py-2 text-sm font-semibold text-zinc-950 transition hover:-translate-y-0.5 hover:bg-amber-200"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="relative mx-auto w-full max-w-6xl px-4 pb-12 pt-10 md:pt-14">
        <div className="lp-hero rounded-3xl border border-zinc-700/80 bg-[linear-gradient(145deg,#171717_0%,#222127_60%,#2f2a23_100%)] p-6 shadow-[0_34px_90px_-40px_rgba(0,0,0,0.9)] md:p-10">
          <div className="grid gap-8 md:grid-cols-[1.15fr_0.85fr] md:items-center">
            <div className="animate-[rise_0.7s_ease-out_both]">
              <p className="lp-chip inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">
                <Sparkles className="h-3.5 w-3.5" /> StudyPulse AI
              </p>

              <h1 className="lp-title-main font-display mt-5 text-4xl leading-[1.03] text-white md:text-6xl">
                Smart study decisions,
                <span className="lp-title-accent block text-amber-200">adapted to your real day</span>
              </h1>

              <p className="lp-hero-copy mt-6 max-w-xl text-sm leading-relaxed text-zinc-300 md:text-base">
                StudyPulse is an adaptive study planner powered by rules + AI. You define goals and tasks, check in daily,
                and receive one realistic recommendation for today with clear recovery guidance when decline persists.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="lp-cta-primary inline-flex items-center gap-2 rounded-xl bg-amber-300 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:-translate-y-0.5 hover:bg-amber-200"
                >
                  Create student account <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="lp-cta-secondary inline-flex items-center rounded-xl border border-zinc-500 px-5 py-3 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800"
                >
                  Login
                </Link>
              </div>
            </div>

            <div className="animate-[rise_0.7s_ease-out_0.12s_both] rounded-2xl border border-zinc-600 bg-zinc-900/60 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">Today recommendation</p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="lp-mode-card rounded-xl border border-emerald-300/30 bg-emerald-300/10 p-4">
                  <p className="text-xs uppercase tracking-[0.15em] text-emerald-200">Mode</p>
                  <p className="font-display mt-2 text-2xl text-emerald-100">Light Focus</p>
                </div>
                <div className="rounded-xl border border-zinc-600 bg-zinc-800/70 p-4">
                  <p className="text-zinc-300">Task</p>
                  <p className="mt-1">Review database notes for 30 minutes</p>
                </div>
                <div className="lp-recovery-card rounded-xl border border-amber-300/30 bg-amber-300/10 p-4 text-amber-100">
                  <p className="font-semibold">Recovery alert: Active</p>
                  <p className="mt-1 text-xs text-amber-100/90">Avoid starting your hardest task today and reset tomorrow priorities.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="problem" className="relative mx-auto w-full max-w-6xl px-4 pb-8 scroll-mt-24">
        <div className="rounded-3xl border border-zinc-700 bg-zinc-900/60 p-7 md:p-9">
          <SectionHeading
            eyebrow="Problem / Solution"
            title="Students fail from rigid planning, not from lack of ambition"
            text="Traditional planners ignore daily condition. StudyPulse adapts recommendations to energy, focus, stress, sleep, and motivation, helping students stay consistent without overload."
          />

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-rose-300/25 bg-rose-300/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-rose-200">Without adaptation</p>
              <p className="mt-2 text-sm text-zinc-200">Hard tasks on low-energy days, repeated misses, guilt, and broken momentum.</p>
            </article>
            <article className="rounded-2xl border border-emerald-300/25 bg-emerald-300/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-200">With StudyPulse AI</p>
              <p className="mt-2 text-sm text-zinc-200">Realistic daily action, better consistency, and recovery support before burnout escalates.</p>
            </article>
          </div>
        </div>
      </section>

      <section id="how" className="relative mx-auto w-full max-w-6xl px-4 pb-8 scroll-mt-24">
        <div className="rounded-3xl border border-zinc-700 bg-zinc-900/60 p-7 md:p-9">
          <SectionHeading
            eyebrow="How It Works"
            title="A practical 4-step loop"
            text="Designed for a clean hackathon MVP demo: clear inputs, clear recommendation, clear recovery behavior."
          />

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-2xl border border-zinc-700 bg-zinc-950/70 p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg border border-zinc-600 bg-zinc-900 p-2 text-amber-200">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">Step {idx + 1}</p>
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-zinc-300">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="benefits" className="relative mx-auto w-full max-w-6xl px-4 pb-14 scroll-mt-24">
        <div className="rounded-3xl border border-zinc-700 bg-zinc-900/60 p-7 md:p-9">
          <SectionHeading
            eyebrow="Benefits"
            title="AI theme, student outcomes"
            text="StudyPulse combines deterministic decision logic and AI clarity to make daily planning sustainable and actionable."
          />

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {benefits.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-2xl border border-zinc-700 bg-zinc-950/70 p-5">
                  <div className="flex items-center gap-2 text-amber-200">
                    <Icon className="h-4 w-4" />
                    <p className="font-semibold text-white">{item.title}</p>
                  </div>
                  <p className="mt-2 text-sm text-zinc-300">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="relative border-t border-zinc-800 bg-zinc-950/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-xl text-white">StudyPulse AI</p>
            <p className="mt-1 text-sm text-zinc-400">Adaptive study planner powered by rules + AI.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Link href="/signup" className="rounded-lg border border-zinc-600 px-3 py-2 text-zinc-200 hover:bg-zinc-800">
              Sign up
            </Link>
            <Link href="/login" className="rounded-lg border border-zinc-600 px-3 py-2 text-zinc-200 hover:bg-zinc-800">
              Login
            </Link>
          </div>
        </div>
        <div className="border-t border-zinc-800 py-4 text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} StudyPulse AI. Built for student consistency and recovery-aware planning.
        </div>
      </footer>
    </main>
  );
}
