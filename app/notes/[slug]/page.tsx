import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { NoteContent } from "@/components/note-content";
import { Reveal } from "@/components/reveal";
import {
  getLabEntryById,
  getPublishedNoteBySlug,
  getPublishedNotes,
} from "@/lib/content";

type NotePageProps = {
  params: Promise<{ slug: string }>;
};

const noteDateFormatter = new Intl.DateTimeFormat("en", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function generateStaticParams() {
  return getPublishedNotes().map((note) => ({ slug: note.slug }));
}

export async function generateMetadata({
  params,
}: NotePageProps): Promise<Metadata> {
  const { slug } = await params;
  const note = getPublishedNoteBySlug(slug);

  if (!note) {
    return { title: "Note not found" };
  }

  return {
    title: note.title,
    description: note.description,
  };
}

export default async function NotePage({ params }: NotePageProps) {
  const { slug } = await params;
  const note = getPublishedNoteBySlug(slug);

  if (!note) {
    notFound();
  }

  const relatedLabEntry = note.relatedLabEntryId
    ? getLabEntryById(note.relatedLabEntryId)
    : undefined;

  return (
    <article className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-20">
      <Reveal>
      <header className="border-b border-border pb-10 sm:pb-12">
        <Link
          href="/notes"
          className="group inline-flex min-h-11 items-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.14em] focus-visible:outline-offset-4"
        >
          <span aria-hidden="true" className="text-accent">
            ←
          </span>
          <span className="text-foreground group-hover:text-accent group-focus-visible:text-accent">
            Notes index
          </span>
        </Link>

        <div className="mt-10 max-w-5xl">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-accent">
            RGB / Notes / {note.type}
          </p>
          <h1 className="mt-5 break-words text-balance text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.96] tracking-[-0.055em] text-foreground">
            {note.title}
          </h1>
          <p className="mt-7 max-w-3xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
            {note.description}
          </p>
        </div>

        <dl className="mt-10 grid gap-5 border-t border-border pt-6 sm:grid-cols-3 sm:gap-8">
          <div>
            <dt className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-muted">
              Status
            </dt>
            <dd className="mt-2 font-mono text-xs uppercase tracking-[0.1em] text-foreground">
              Published
            </dd>
          </div>
          {note.date !== undefined ? (
            <div>
              <dt className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-muted">
                Date
              </dt>
              <dd className="mt-2 font-mono text-xs uppercase tracking-[0.1em] text-foreground">
                <time dateTime={note.date}>
                  {noteDateFormatter.format(
                    new Date(`${note.date}T00:00:00Z`),
                  )}
                </time>
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-muted">
              Tags
            </dt>
            <dd className="mt-2 break-words font-mono text-xs uppercase leading-5 tracking-[0.1em] text-foreground">
              {note.tags.join(" / ")}
            </dd>
          </div>
        </dl>

        {relatedLabEntry ? (
          <aside className="mt-8 border-t border-border pt-5">
            <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-muted">
              Related Lab entry
            </p>
            <Link
              href={`/lab#${relatedLabEntry.slug}`}
              className="group mt-2 inline-flex min-h-11 max-w-full items-center gap-3 py-2 font-mono text-xs uppercase leading-5 tracking-[0.1em] focus-visible:outline-offset-3"
            >
              <span className="shrink-0 text-accent">
                {relatedLabEntry.id}
              </span>
              <span className="min-w-0 break-words text-foreground group-hover:text-accent group-focus-visible:text-accent">
                {relatedLabEntry.title}
              </span>
              <span aria-hidden="true" className="shrink-0 text-accent">
                →
              </span>
            </Link>
          </aside>
        ) : null}
      </header>
      </Reveal>

      <Reveal className="py-12 sm:py-16">
        <NoteContent blocks={note.content} />
      </Reveal>

      <Reveal>
      <footer className="border-t border-border pt-7">
        <Link
          href="/notes"
          className="group inline-flex min-h-11 items-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.14em] focus-visible:outline-offset-4"
        >
          <span aria-hidden="true" className="text-accent">
            ←
          </span>
          <span className="text-foreground group-hover:text-accent group-focus-visible:text-accent">
            Back to notes
          </span>
        </Link>
      </footer>
      </Reveal>
    </article>
  );
}
