import Link from "next/link";

import { getFeaturedLabEntries } from "@/lib/content";

export function LabPreview() {
  const entries = getFeaturedLabEntries();
  const entryCount = entries.length.toString().padStart(2, "0");

  return (
    <section
      aria-labelledby="lab-preview-title"
      className="border-b border-border bg-surface"
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
        <div className="border-y border-border lg:grid lg:grid-cols-[14rem_minmax(0,1fr)]">
          <header className="flex flex-col justify-between gap-8 border-b border-border p-5 sm:p-6 lg:border-r lg:border-b-0">
            <div>
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-accent">
                Engineering log / {entryCount}
              </p>
              <h2
                id="lab-preview-title"
                className="mt-3 text-2xl font-semibold uppercase tracking-[-0.03em] text-foreground"
              >
                Lab
              </h2>
            </div>

            <Link
              href="/lab"
              className="group inline-flex min-h-11 w-fit items-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.14em] focus-visible:outline-offset-4"
            >
              <span className="text-foreground group-hover:text-accent group-focus-visible:text-accent">
                View Lab
              </span>
              <span aria-hidden="true" className="text-accent">
                →
              </span>
            </Link>
          </header>

          <ol className="min-w-0 divide-y divide-border">
            {entries.map((entry) => (
              <li key={entry.id}>
                <article className="grid min-w-0 gap-6 p-5 sm:p-6 md:grid-cols-[minmax(0,1fr)_12rem] md:gap-8">
                  <div className="min-w-0">
                    <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-accent">
                      {entry.id}
                    </p>
                    <h3 className="mt-3 break-words text-xl font-semibold tracking-[-0.025em] text-foreground sm:text-2xl">
                      {entry.title}
                    </h3>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
                      {entry.shortDescription}
                    </p>
                  </div>

                  <div className="min-w-0 border-t border-border pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-6">
                    {entry.status ? (
                      <p className="mb-5 w-fit border border-accent px-2 py-1 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-foreground">
                        Status / {entry.status}
                      </p>
                    ) : null}
                    <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-muted">
                      Categories
                    </p>
                    <p className="mt-2 break-words font-mono text-xs uppercase leading-5 tracking-[0.08em] text-foreground">
                      {entry.categories.join(" / ")}
                    </p>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
