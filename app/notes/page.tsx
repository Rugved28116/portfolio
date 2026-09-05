import type { Metadata } from "next";

import { NoteList } from "@/components/note-list";
import { PageIntro } from "@/components/page-intro";
import { getPublishedNotes } from "@/lib/content";

export const metadata: Metadata = {
  title: "Notes",
  description: "Technical notes by Rugved Ganesh Bhor.",
};

export default function NotesPage() {
  const notes = getPublishedNotes();

  return (
    <PageIntro
      eyebrow="RGB / Notes"
      title="Engineering notes and working knowledge."
      description="Technical write-ups, debugging notes, build logs, project retrospectives and longer articles."
    >
      <NoteList
        notes={notes}
        titleLevel={2}
        emptyDescription="Confirmed technical notes will appear here when they are ready to publish."
      />
    </PageIntro>
  );
}
