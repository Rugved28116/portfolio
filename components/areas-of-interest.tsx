import { maintenancePart } from "@/lib/maintenance-parts";
import Link from "next/link";

import { siteContent } from "@/content/site";
import type { InterestReference } from "@/content/types";
import { getLabEntryBySlug, getProjectBySlug } from "@/lib/content";
import { Reveal } from "@/components/reveal";

function resolveReference(reference: InterestReference) {
  if (reference.kind === "project") {
    const project = getProjectBySlug(reference.slug);

    return project
      ? { title: project.title, href: "/work" as const, type: "Work" }
      : undefined;
  }

  const entry = getLabEntryBySlug(reference.slug);

  return entry
    ? { title: entry.title, href: "/lab" as const, type: "Lab" }
    : undefined;
}

export function AreasOfInterest() {
  const areas = siteContent.interests.map((area) => ({
    ...area,
    related: area.related
      .map((reference) => resolveReference(reference))
      .filter((reference) => reference !== undefined),
  }));

  return (
    <section
      aria-labelledby="areas-of-interest-title"
      className="border-b border-border bg-surface"
    >
      <Reveal className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
        <header className="grid gap-5 pb-8 md:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)] md:items-end md:gap-12">
          <div>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-accent">
              Capability map / {String(areas.length).padStart(2, "0")}
            </p>
            <h2
              id="areas-of-interest-title"
              className="mt-3 text-2xl font-semibold uppercase tracking-[-0.03em] text-foreground sm:text-3xl"
            >
              Areas of Interest
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted md:justify-self-end">
            Fields I explore across software, hardware and intelligent systems.
          </p>
        </header>

        <ol className="grid border-t border-l border-border md:grid-cols-2 lg:grid-cols-3">
          {areas.map((area, index) => (
            <li
              key={area.label}
              className="grid min-w-0 grid-cols-[2rem_minmax(0,1fr)] gap-3 border-r border-b border-border p-5 sm:p-6"
            >
              <span {...maintenancePart(`interest-${area.label.toLowerCase()}-number`)}
                aria-hidden="true"
                className="pt-0.5 font-mono text-[0.625rem] tabular-nums text-muted"
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="flex min-w-0 flex-col">
                <h3 {...maintenancePart(`interest-${area.label.toLowerCase()}-title`)} className="break-words font-mono text-sm font-semibold uppercase tracking-[0.1em] text-foreground">
                  {area.label}
                </h3>
                <p {...maintenancePart(`interest-${area.label.toLowerCase()}-description`)} className="mt-3 text-sm leading-6 text-muted">
                  {area.description}
                </p>

                {area.related.length > 0 ? (
                  <ul className="mt-5 border-t border-border pt-2">
                    {area.related.map((reference) => (
                      <li key={`${reference.type}-${reference.title}`}>
                        <Link
                          href={reference.href}
                          className="group inline-flex min-h-11 max-w-full items-center gap-2 py-2 font-mono text-[0.6875rem] uppercase leading-5 tracking-[0.08em] focus-visible:outline-offset-2"
                        >
                          <span className="shrink-0 text-muted">
                            {reference.type} /
                          </span>
                          <span className="min-w-0 break-words text-foreground group-hover:text-accent group-focus-visible:text-accent">
                            {reference.title}
                          </span>
                          <span aria-hidden="true" className="shrink-0 text-accent">
                            →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </Reveal>
    </section>
  );
}
