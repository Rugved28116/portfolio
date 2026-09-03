"use client";

import { useState } from "react";

import type { LabCategory, LabEntry, LabFilter } from "@/content/types";

type LabIndexProps = {
  entries: readonly LabEntry[];
  filters: readonly LabFilter[];
};

export function LabIndex({ entries, filters }: LabIndexProps) {
  const [activeCategory, setActiveCategory] =
    useState<LabCategory | null>(null);
  const visibleEntries = activeCategory
    ? entries.filter((entry) => entry.categories.includes(activeCategory))
    : entries;

  return (
    <div>
      <div className="border-y border-border">
        <div className="flex items-center justify-between gap-4 py-3">
          <p
            id="lab-filter-label"
            className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted"
          >
            Filter log
          </p>
          <p
            aria-live="polite"
            className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted"
          >
            {String(visibleEntries.length).padStart(2, "0")} entries
          </p>
        </div>
        <div
          role="group"
          aria-labelledby="lab-filter-label"
          className="flex flex-wrap gap-2 border-t border-border py-3"
        >
          {filters.map((filter) => {
            const isActive = activeCategory === filter.category;

            return (
              <button
                key={filter.label}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveCategory(filter.category)}
                className={`min-h-11 border px-3 font-mono text-[0.6875rem] font-medium tracking-[0.12em] ${
                  isActive
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted hover:border-muted hover:text-foreground"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {visibleEntries.length > 0 ? (
        <ul className="border-t border-border">
          {visibleEntries.map((entry) => {
            const hasTechnologies =
              entry.technologies !== undefined && entry.technologies.length > 0;
            const hasHardware =
              entry.hardware !== undefined && entry.hardware.length > 0;

            return (
              <li key={entry.id} className="border-b border-border">
                <article
                  aria-labelledby={`lab-entry-${entry.slug}`}
                  className="grid min-w-0 gap-7 py-8 sm:py-10 lg:grid-cols-[11rem_minmax(0,1fr)_16rem] lg:gap-10"
                >
                  <header className="min-w-0">
                    <p className="font-mono text-xs tracking-[0.08em] text-accent">
                      {entry.id}
                    </p>
                    {entry.status ? (
                      <p className="mt-4 w-fit border border-accent px-2.5 py-1.5 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-accent">
                        Status / {entry.status}
                      </p>
                    ) : null}
                    {entry.year !== undefined ? (
                      <p className="mt-4 font-mono text-xs text-muted">
                        Year / {entry.year}
                      </p>
                    ) : null}
                  </header>

                  <div className="min-w-0">
                    <h2
                      id={`lab-entry-${entry.slug}`}
                      className="text-balance break-words text-2xl font-medium leading-tight tracking-[-0.025em] text-foreground sm:text-3xl"
                    >
                      {entry.title}
                    </h2>
                    <p className="mt-4 max-w-2xl text-sm leading-6 text-muted sm:text-base sm:leading-7">
                      {entry.shortDescription}
                    </p>

                    {hasTechnologies || hasHardware ? (
                      <dl className="mt-6 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
                        {hasTechnologies ? (
                          <div>
                            <dt className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted">
                              Technologies
                            </dt>
                            <dd className="mt-1.5 text-xs leading-5 text-foreground">
                              {entry.technologies?.join(" / ")}
                            </dd>
                          </div>
                        ) : null}
                        {hasHardware ? (
                          <div>
                            <dt className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted">
                              Hardware
                            </dt>
                            <dd className="mt-1.5 text-xs leading-5 text-foreground">
                              {entry.hardware?.join(" / ")}
                            </dd>
                          </div>
                        ) : null}
                      </dl>
                    ) : null}
                  </div>

                  <aside className="min-w-0 lg:border-l lg:border-border lg:pl-6">
                    <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted">
                      Categories
                    </p>
                    <p className="mt-2 text-xs uppercase leading-5 tracking-[0.08em] text-muted">
                      {entry.categories.join(" / ")}
                    </p>
                    {entry.githubUrl ? (
                      <a
                        href={entry.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-6 inline-flex min-h-11 items-center font-mono text-xs uppercase tracking-[0.12em] focus-visible:outline-offset-4"
                      >
                        <span className="text-foreground hover:text-accent">
                          Repository
                        </span>
                      </a>
                    ) : null}
                  </aside>
                </article>
              </li>
            );
          })}
        </ul>
      ) : (
        <p
          role="status"
          className="border-b border-border py-10 font-mono text-sm text-muted"
        >
          No Lab entries in this category yet.
        </p>
      )}
    </div>
  );
}
