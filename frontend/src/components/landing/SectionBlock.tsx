import { ReactNode } from "react";

type SectionBlockProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
};

export function SectionBlock({ id, eyebrow, title, description, children }: SectionBlockProps) {
  return (
    <section id={id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">{eyebrow}</p> : null}
      <h2 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">{title}</h2>
      {description ? <p className="mt-3 max-w-3xl text-slate-600">{description}</p> : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  );
}
