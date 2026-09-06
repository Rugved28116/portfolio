import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getProjectBySlug, getProjects } from "@/lib/content";
import { Reveal } from "@/components/reveal";

export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {};
  }

  return {
    title: project.title,
    description: project.shortDescription,
  };
}

export default async function ProjectPage({
  params,
}: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const categories = project.categories ?? [];
  const technologies = project.technologies ?? [];
  const details = [
    { label: "Year", value: project.year },
    { label: "Status", value: project.status },
    { label: "Role", value: project.role },
  ].filter((detail) => detail.value !== undefined);
  const links = [
    {
      label: "GitHub",
      description: `View ${project.title} on GitHub`,
      href: project.githubUrl,
    },
    {
      label: "Live site",
      description: `Visit the live ${project.title} site`,
      href: project.liveUrl,
    },
  ].filter((link): link is typeof link & { href: string } => link.href !== undefined);
  const caseStudySections = [
    { label: "Problem", content: project.caseStudy?.problem },
    { label: "Approach", content: project.caseStudy?.approach },
    { label: "Architecture", content: project.caseStudy?.architecture },
    { label: "Challenges", content: project.caseStudy?.challenges },
    { label: "Lessons", content: project.caseStudy?.lessons },
    { label: "Outcome", content: project.caseStudy?.outcome },
  ].filter(
    (section): section is { label: string; content: string } =>
      section.content !== undefined,
  );

  return (
    <article>
      <header className="border-b border-border">
        <Reveal className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-20">
          <Link
            href="/work"
            className="group inline-flex min-h-11 items-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.14em] focus-visible:outline-offset-4"
          >
            <span aria-hidden="true" className="text-accent">
              ←
            </span>
            <span className="text-foreground group-hover:text-accent group-focus-visible:text-accent">
              Back to work
            </span>
          </Link>

          <div className="mt-10 grid min-w-0 gap-10 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-end lg:gap-16">
            <div className="min-w-0">
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-accent">
                RGB / Work
              </p>
              <h1 className="mt-5 break-words text-balance text-[clamp(2.75rem,8vw,6.5rem)] font-semibold uppercase leading-[0.92] tracking-[-0.06em] text-foreground">
                {project.title}
              </h1>
              {project.shortDescription ? (
                <p className="mt-7 max-w-3xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
                  {project.shortDescription}
                </p>
              ) : null}
            </div>

            {categories.length > 0 ? (
              <div className="min-w-0 border-t border-border pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
                <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-muted">
                  Categories
                </p>
                <p className="mt-3 break-words font-mono text-xs uppercase leading-6 tracking-[0.1em] text-foreground">
                  {categories.join(" / ")}
                </p>
              </div>
            ) : null}
          </div>
        </Reveal>
      </header>

      <Reveal className="mx-auto grid w-full max-w-6xl px-5 sm:px-8 lg:grid-cols-[13rem_minmax(0,1fr)]">
        {project.caseStudy?.overview ? (
          <section
            aria-labelledby="project-overview-title"
            className="border-b border-border py-10 sm:py-12 lg:col-span-2 lg:grid lg:grid-cols-subgrid"
          >
            <h2
              id="project-overview-title"
              className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-accent"
            >
              Overview
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-foreground/90 lg:mt-0">
              {project.caseStudy.overview}
            </p>
          </section>
        ) : null}

        {technologies.length > 0 ? (
          <section
            aria-labelledby="project-technologies-title"
            className="border-b border-border py-10 sm:py-12 lg:col-span-2 lg:grid lg:grid-cols-subgrid"
          >
            <h2
              id="project-technologies-title"
              className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-accent"
            >
              Technologies
            </h2>
            <ul className="mt-5 grid min-w-0 border-t border-l border-border sm:grid-cols-2 lg:mt-0">
              {technologies.map((technology) => (
                <li
                  key={technology}
                  className="min-w-0 break-words border-r border-b border-border px-4 py-3 font-mono text-xs leading-5 text-foreground"
                >
                  {technology}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {details.length > 0 ? (
          <section
            aria-labelledby="project-details-title"
            className="border-b border-border py-10 sm:py-12 lg:col-span-2 lg:grid lg:grid-cols-subgrid"
          >
            <h2
              id="project-details-title"
              className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-accent"
            >
              Project details
            </h2>
            <dl className="mt-5 grid gap-px bg-border sm:grid-cols-3 lg:mt-0">
              {details.map((detail) => (
                <div key={detail.label} className="min-w-0 bg-surface p-4">
                  <dt className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-muted">
                    {detail.label}
                  </dt>
                  <dd className="mt-2 break-words text-sm text-foreground">
                    {detail.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {links.length > 0 ? (
          <section
            aria-labelledby="project-links-title"
            className="border-b border-border py-10 sm:py-12 lg:col-span-2 lg:grid lg:grid-cols-subgrid"
          >
            <h2
              id="project-links-title"
              className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-accent"
            >
              Links
            </h2>
            <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-2 lg:mt-0">
              {links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${link.description} (opens in a new tab)`}
                    className="group inline-flex min-h-11 items-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] focus-visible:outline-offset-3"
                  >
                    <span className="text-foreground group-hover:text-accent group-focus-visible:text-accent">
                      {link.label}
                    </span>
                    <span aria-hidden="true" className="text-accent">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {caseStudySections.length > 0 ? (
          <section
            aria-labelledby="project-case-study-title"
            className="py-10 sm:py-12 lg:col-span-2 lg:grid lg:grid-cols-subgrid"
          >
            <h2
              id="project-case-study-title"
              className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-accent"
            >
              Case study
            </h2>
            <div className="mt-5 max-w-3xl lg:mt-0">
              {caseStudySections.map((section, index) => (
                <section
                  key={section.label}
                  aria-labelledby={`case-study-${section.label.toLowerCase()}-title`}
                  className={index === 0 ? "" : "mt-10 border-t border-border pt-8"}
                >
                  <h3
                    id={`case-study-${section.label.toLowerCase()}-title`}
                    className="text-xl font-semibold tracking-[-0.025em] text-foreground sm:text-2xl"
                  >
                    {section.label}
                  </h3>
                  <p className="mt-4 text-base leading-8 text-foreground/90">
                    {section.content}
                  </p>
                </section>
              ))}
            </div>
          </section>
        ) : null}
      </Reveal>

      <footer className="border-t border-border">
        <Reveal className="mx-auto w-full max-w-6xl px-5 py-7 sm:px-8">
          <Link
            href="/work"
            className="group inline-flex min-h-11 items-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.14em] focus-visible:outline-offset-4"
          >
            <span aria-hidden="true" className="text-accent">
              ←
            </span>
            <span className="text-foreground group-hover:text-accent group-focus-visible:text-accent">
              Back to work
            </span>
          </Link>
        </Reveal>
      </footer>
    </article>
  );
}
