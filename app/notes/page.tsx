import type { Metadata } from "next";

import { PageIntro } from "@/components/page-intro";
import { notes } from "@/content/notes";

export const metadata: Metadata = {
  title: "Notes",
  description: "Technical notes by Rugved Ganesh Bhor.",
};

export default function NotesPage() {
  return (
    <PageIntro
      eyebrow="Notes"
      title="Engineering notes and working knowledge."
      description="Long-form note content will be added when the source material is ready."
    >
      {notes.length === 0 ? (
        <p className="border border-border bg-surface p-5 font-mono text-sm text-muted">
          TODO: Add confirmed note content.
        </p>
      ) : null}
    </PageIntro>
  );
}
