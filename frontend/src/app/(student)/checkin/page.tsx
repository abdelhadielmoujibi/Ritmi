import { CheckinForm } from "@/components/forms/CheckinForm";

export default function CheckinPage() {
  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8">
      <section className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5 shadow-sm backdrop-blur">
        <h1 className="text-2xl font-bold text-white">Daily Check-In</h1>
        <p className="mt-2 text-sm text-zinc-300">
          Tell us how today feels. StudyPulse will use this to recommend the right task intensity and protect your consistency.
        </p>
      </section>

      <section className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5 shadow-sm backdrop-blur">
        <CheckinForm />
      </section>
    </main>
  );
}
