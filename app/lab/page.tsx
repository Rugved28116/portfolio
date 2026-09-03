import type { Metadata } from "next";

import { PageIntro } from "@/components/page-intro";
import { labEntries } from "@/content/lab";

export const metadata: Metadata = {
  title: "Lab",
  description: "Engineering experiments by Rugved Ganesh Bhor.",
};

export default function LabPage() {
  return (
    <PageIntro
      eyebrow="Lab"
      title="Experiments, prototypes and technical investigations."
      description="A workspace for documenting ongoing exploration across software and hardware."
    >
      <ul className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
        {labEntries.map((entry) => (
          <li key={entry.slug} className="bg-surface p-5">
            <p className="text-sm">{entry.title}</p>
            <p className="mt-2 font-mono text-xs uppercase tracking-[0.14em] text-muted">
              {entry.categories.join(" / ")}
            </p>
          </li>
        ))}
      </ul>
    </PageIntro>
  );
}
