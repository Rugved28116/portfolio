import { maintenancePart } from "@/lib/maintenance-parts";
import Link from "next/link";

import type { PublishedNote } from "@/content/types";
import { Reveal } from "@/components/reveal";

type NoteListProps = {
  notes: readonly PublishedNote[];
  titleLevel: 2 | 3;
  emptyDescription: string;
  maintenanceBreakable?: boolean;
};

const noteDateFormatter = new Intl.DateTimeFormat("en", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatNoteDate(date: NonNullable<PublishedNote["date"]>) {
  return noteDateFormatter.format(new Date(`${date}T00:00:00Z`));
}

export function NoteList({
  notes,
  titleLevel,
  emptyDescription,
  maintenanceBreakable = false,
}: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="grid gap-3 border-y border-border py-6 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-8">
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-accent">
          Log / 00
        </p>
        <div>
          <p className="font-mono text-sm font-semibold uppercase tracking-[0.1em] text-foreground">
            No published notes yet
          </p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            {emptyDescription}
          </p>
        </div>
      </div>
    );
  }

  const Heading = titleLevel === 2 ? "h2" : "h3";

  return (
    <ol className="border-t border-border">
      {notes.map((note, index) => (
        <li key={note.slug} className="border-b border-border">
          <Reveal delay={index * 55}>
          <article>
            <Link
              href={`/notes/${note.slug}`}
              className="group grid min-w-0 gap-5 py-6 focus-visible:bg-surface focus-visible:outline-offset-2 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-5"
            >
              <span {...maintenancePart(`note-${note.slug}-number`, maintenanceBreakable)}
                aria-hidden="true"
                className="font-mono text-[0.6875rem] tabular-nums text-muted sm:pt-1"
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="min-w-0">
                <div {...maintenancePart(`note-${note.slug}-metadata`, maintenanceBreakable)} className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[0.625rem] uppercase tracking-[0.12em] text-muted">
                  <span>{note.type}</span>
                  {note.date !== undefined ? (
                    <>
                      <span aria-hidden="true">/</span>
                      <time dateTime={note.date}>{formatNoteDate(note.date)}</time>
                    </>
                  ) : null}
                  {note.readingTime !== undefined ? (
                    <>
                      <span aria-hidden="true">/</span>
                      <span>{note.readingTime} min read</span>
                    </>
                  ) : null}
                </div>

                <Heading {...maintenancePart(`note-${note.slug}-title`, maintenanceBreakable)} className="mt-3 break-words text-xl font-semibold tracking-[-0.025em] text-foreground group-hover:text-accent group-focus-visible:text-accent sm:text-2xl">
                  {note.title}
                </Heading>
                <p {...maintenancePart(`note-${note.slug}-description`, maintenanceBreakable)} className="mt-3 max-w-2xl text-sm leading-6 text-muted">
                  {note.description}
                </p>

                {note.tags.length > 0 ? (
                  <p className="mt-4 break-words font-mono text-[0.6875rem] uppercase leading-5 tracking-[0.1em] text-muted">
                    {note.tags.join(" / ")}
                  </p>
                ) : null}
              </div>
            </Link>
          </article>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
