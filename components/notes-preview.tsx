import Link from "next/link";

import { NoteList } from "@/components/note-list";
import { getRecentPublishedNotes } from "@/lib/content";
import { Reveal } from "@/components/reveal";

export function NotesPreview() {
  const notes = getRecentPublishedNotes(3);

  return (
    <section aria-labelledby="notes-preview-title" className="border-b border-border">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
        <Reveal>
        <header className="flex flex-col gap-6 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-accent">
              Technical notebook / {String(notes.length).padStart(2, "0")}
            </p>
            <h2
              id="notes-preview-title"
              className="mt-3 text-2xl font-semibold uppercase tracking-[-0.03em] text-foreground sm:text-3xl"
            >
              Notes
            </h2>
          </div>

          <Link
            href="/notes"
            className="group inline-flex min-h-11 w-fit items-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.14em] focus-visible:outline-offset-4"
          >
            <span className="text-foreground group-hover:text-accent group-focus-visible:text-accent">
              View Notes
            </span>
            <span aria-hidden="true" className="text-accent">
              →
            </span>
          </Link>
        </header>
        </Reveal>

        <NoteList
          maintenanceBreakable
          notes={notes}
          titleLevel={3}
          emptyDescription="The notebook is ready for confirmed technical write-ups, build logs and project retrospectives."
        />
      </div>
    </section>
  );
}
