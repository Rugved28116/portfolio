import { maintenancePart } from "@/lib/maintenance-parts";
import Link from "next/link";

import { getFeaturedProjects } from "@/lib/content";

export function SelectedWork() {
  const projects = getFeaturedProjects();

  return (
    <section
      aria-labelledby="selected-work-title"
      className="border-y border-border"
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <header className="flex flex-col gap-6 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-accent">
              Project index / {String(projects.length).padStart(2, "0")}
            </p>
            <h2
              id="selected-work-title"
              data-maintenance-breakable
              data-maintenance-id="selected-work-title"
              className="mt-3 text-3xl font-semibold uppercase tracking-[-0.035em] text-foreground sm:text-4xl"
            >
              Selected work
            </h2>
          </div>
          <Link
            href="/work"
            className="group inline-flex min-h-11 w-fit items-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.14em] focus-visible:outline-offset-4"
          >
            <span className="text-foreground group-hover:text-accent group-focus-visible:text-accent">
              View all work
            </span>
            <span aria-hidden="true" className="text-muted">
              →
            </span>
          </Link>
        </header>

        <ol>
          {projects.map((project, index) => {
            const hasCategories =
              project.categories !== undefined && project.categories.length > 0;
            const hasTechnologies =
              project.technologies !== undefined &&
              project.technologies.length > 0;
            const hasRecord =
              project.year !== undefined || project.status !== undefined;

            return (
              <li key={project.slug} className="border-b border-border">
                <Link
                  href={`/work/${project.slug}`}
                  className="group grid min-w-0 grid-cols-[2rem_minmax(0,1fr)] gap-x-4 gap-y-6 px-2 py-7 hover:bg-surface focus-visible:bg-surface focus-visible:outline-offset-[-2px] sm:grid-cols-[3rem_minmax(0,1fr)] sm:px-3 sm:py-9 lg:grid-cols-[3rem_minmax(0,1fr)_minmax(16rem,20rem)] lg:gap-x-8"
                >
                  <span {...maintenancePart(`project-${project.slug}-index`)}
                    aria-hidden="true"
                    className="pt-1 font-mono text-xs tabular-nums text-muted"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="min-w-0">
                    <h3 {...maintenancePart(`project-${project.slug}-title`)} className="text-balance text-2xl font-medium leading-tight tracking-[-0.025em] text-foreground transition-colors duration-150 group-hover:text-accent group-focus-visible:text-accent motion-reduce:transition-none sm:text-3xl">
                      {project.title}
                    </h3>
                    {project.shortDescription ? (
                      <p {...maintenancePart(`project-${project.slug}-description`)} className="mt-4 max-w-2xl text-sm leading-6 text-muted sm:text-base sm:leading-7">
                        {project.shortDescription}
                      </p>
                    ) : null}
                  </div>

                  {hasCategories || hasTechnologies || hasRecord ? (
                    <dl className="col-start-2 grid min-w-0 gap-4 lg:col-start-3 lg:row-start-1">
                      {hasCategories ? (
                        <div {...maintenancePart(`project-${project.slug}-categories`)} className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 lg:block">
                          <dt className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted">
                            Categories
                          </dt>
                          <dd className="min-w-0 text-xs leading-5 text-foreground lg:mt-1.5">
                            {project.categories?.join(" / ")}
                          </dd>
                        </div>
                      ) : null}

                      {hasTechnologies ? (
                        <div {...maintenancePart(`project-${project.slug}-technologies`)} className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 lg:block">
                          <dt className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted">
                            Technologies
                          </dt>
                          <dd className="min-w-0 text-xs leading-5 text-muted lg:mt-1.5">
                            {project.technologies?.join(", ")}
                          </dd>
                        </div>
                      ) : null}

                      {hasRecord ? (
                        <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 lg:block">
                          <dt className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted">
                            Record
                          </dt>
                          <dd className="min-w-0 font-mono text-xs uppercase leading-5 text-muted lg:mt-1.5">
                            {project.year !== undefined ? project.year : null}
                            {project.year !== undefined &&
                            project.status !== undefined
                              ? " / "
                              : null}
                            {project.status ?? null}
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
