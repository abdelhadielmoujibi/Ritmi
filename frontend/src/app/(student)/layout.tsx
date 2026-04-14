import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";

import { LogoutButton } from "@/components/ui/LogoutButton";
import { createClient } from "@/lib/supabase/server";
import logo from "@/logo.png";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(251,191,36,0.12),transparent_26%),radial-gradient(circle_at_85%_12%,rgba(34,197,94,0.14),transparent_24%),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[length:auto,auto,100%_36px]" />

      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/75 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-6xl px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-700/80 bg-zinc-900/70 px-4 py-3 shadow-[0_10px_40px_-18px_rgba(0,0,0,0.9)] backdrop-blur-xl md:px-6">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="inline-flex items-center gap-3">
                <div className="relative h-12 w-40 overflow-hidden rounded-lg border border-amber-300/30 bg-zinc-950">
                  <Image src={logo} alt="StudyPulse AI logo" fill className="object-cover object-center scale-110" priority />
                </div>
              </Link>

              <nav className="hidden flex-wrap items-center gap-2 text-sm md:flex">
                <Link href="/dashboard" className="rounded-full px-3 py-1.5 text-zinc-300 transition hover:bg-zinc-800 hover:text-amber-200">
                  Dashboard
                </Link>
                <Link href="/goals" className="rounded-full px-3 py-1.5 text-zinc-300 transition hover:bg-zinc-800 hover:text-amber-200">
                  Goals
                </Link>
                <Link href="/tasks" className="rounded-full px-3 py-1.5 text-zinc-300 transition hover:bg-zinc-800 hover:text-amber-200">
                  Tasks
                </Link>
                <Link href="/checkin" className="rounded-full px-3 py-1.5 text-zinc-300 transition hover:bg-zinc-800 hover:text-amber-200">
                  Check-in
                </Link>
                <Link href="/recommendation" className="rounded-full px-3 py-1.5 text-zinc-300 transition hover:bg-zinc-800 hover:text-amber-200">
                  Recommendation
                </Link>
                <Link href="/history" className="rounded-full px-3 py-1.5 text-zinc-300 transition hover:bg-zinc-800 hover:text-amber-200">
                  History
                </Link>
              </nav>
            </div>

            <LogoutButton className="rounded-lg border border-zinc-600 px-3 py-2 text-sm font-medium text-zinc-100 transition hover:bg-zinc-800 disabled:opacity-60" />
          </div>
        </div>
      </header>

      <div className="relative">{children}</div>
    </div>
  );
}
