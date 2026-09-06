import type { Metadata } from "next";
import Link from "next/link";

import { siteContent } from "@/content/site";
import type { InterestReference } from "@/content/types";
import { getLabEntryBySlug, getProjectBySlug } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description: `About ${siteContent.identity.name}, also known as ${siteContent.identity.onlineName}.`,
};

function resolveFeaturedReference(reference: InterestReference) {
  if (reference.kind === "project") {
    const project = getProjectBySlug(reference.slug);

    return project
      ? {
          key: `project-${project.slug}`,
          label: "Major work",
          title: project.title,
          description: project.shortDescription,
          categories: project.categories,
          status: project.status,
          href: "/work" as const,
        }
      : undefined;
  }

  const entry = getLabEntryBySlug(reference.slug);

  return entry
    ? {
        key: `lab-${entry.slug}`,
        label: entry.id,
        title: entry.title,
        description: entry.shortDescription,
        categories: entry.categories,
        status: entry.status,
        href: `/lab#${entry.slug}`,
      }
    : undefined;
}

export default function AboutPage() {
  const featuredItems = siteContent.about.featuredReferences
    .map((reference) => resolveFeaturedReference(reference))
    .filter((item) => item !== undefined);
  const contactLinks = [
    { label: "GitHub", href: siteContent.site.githubUrl },
    { label: "LinkedIn", href: siteContent.site.linkedinUrl },
    {
      label: "Email",
      href: siteContent.site.email
        ? `mailto:${siteContent.site.email}`
        : undefined,
    },
    { label: "Resume", href: siteContent.site.resumeUrl },
  ].filter(
    (item): item is { label: string; href: string } =>
      item.href !== undefined,
  );

  return (
    <>
      <section
        aria-labelledby="about-title"
        className="border-b border-border"
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-accent">
            RGB / About
          </p>
          <h1
            id="about-title"
            className="mt-5 max-w-5xl break-words text-balance text-[clamp(3rem,9vw,7rem)] font-semibold uppercase leading-[0.9] tracking-[-0.06em] text-foreground"
          >
            {siteContent.identity.name}
          </h1>
          <p className="mt-6 font-mono text-sm uppercase tracking-[0.14em] text-accent sm:text-base">
            aka {siteContent.identity.onlineName}
          </p>
          <p className="mt-10 max-w-3xl text-lg leading-8 text-foreground sm:text-xl sm:leading-9">
            {siteContent.about.positioning}
          </p>
        </div>
      </section>

      <section
        aria-labelledby="current-focus-title"
        className="border-b border-border bg-surface"
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-14">
          <header className="border-b border-border pb-6">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-accent">
              System state
            </p>
            <h2
              id="current-focus-title"
              className="mt-3 text-2xl font-semibold uppercase tracking-[-0.03em] text-foreground sm:text-3xl"
            >
              Current Focus
            </h2>
          </header>
          <dl className="grid sm:grid-cols-2 lg:grid-cols-4">
            {siteContent.currently.map((item) => (
              <div
                key={item.label}
                className="min-w-0 border-b border-border py-5 sm:px-5 sm:first:pl-0 lg:border-r lg:last:border-r-0 lg:last:pr-0"
              >
                <dt className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-muted">
                  {item.label}
                </dt>
                <dd className="mt-2 break-words text-sm font-medium text-foreground">
                  {item.value}
                </dd>
                {item.note ? (
                  <dd className="mt-2 font-mono text-[0.625rem] uppercase leading-5 tracking-[0.1em] text-accent">
                    {item.note}
                  </dd>
                ) : null}
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section
        aria-labelledby="about-interests-title"
        className="border-b border-border"
      >
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-12 sm:px-8 sm:py-14 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12">
          <header>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-accent">
              Capability index /{" "}
              {String(siteContent.about.interests.length).padStart(2, "0")}
            </p>
            <h2
              id="about-interests-title"
              className="mt-3 text-2xl font-semibold uppercase tracking-[-0.03em] text-foreground"
            >
              Areas of Interest
            </h2>
          </header>
          <ol className="grid border-t border-l border-border sm:grid-cols-2">
            {siteContent.about.interests.map((interest, index) => (
              <li
                key={interest}
                className="grid min-w-0 grid-cols-[2rem_minmax(0,1fr)] gap-3 border-r border-b border-border p-4 sm:p-5"
              >
                <span
                  aria-hidden="true"
                  className="font-mono text-[0.625rem] tabular-nums text-muted"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="break-words font-mono text-xs font-semibold uppercase tracking-[0.1em] text-foreground">
                  {interest}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        aria-labelledby="project-links-title"
        className="border-b border-border bg-surface"
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
          <header className="border-b border-border pb-7">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-accent">
              Selected references / {String(featuredItems.length).padStart(2, "0")}
            </p>
            <h2
              id="project-links-title"
              className="mt-3 text-2xl font-semibold uppercase tracking-[-0.03em] text-foreground sm:text-3xl"
            >
              Project Links
            </h2>
          </header>

          <ol>
            {featuredItems.map((item, index) => (
              <li key={item.key} className="border-b border-border">
                <Link
                  href={item.href}
                  className="group grid min-w-0 gap-5 py-6 focus-visible:bg-background focus-visible:outline-offset-2 sm:grid-cols-[3rem_minmax(0,1fr)_13rem] sm:gap-6"
                >
                  <span
                    aria-hidden="true"
                    className="font-mono text-[0.6875rem] tabular-nums text-muted sm:pt-1"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-accent">
                      {item.label}
                    </p>
                    <h3 className="mt-2 break-words text-xl font-semibold tracking-[-0.025em] text-foreground group-hover:text-accent group-focus-visible:text-accent sm:text-2xl">
                      {item.title}
                    </h3>
                    {item.description ? (
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="min-w-0 sm:border-l sm:border-border sm:pl-5">
                    {item.status ? (
                      <p className="mb-3 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-accent">
                        Status / {item.status}
                      </p>
                    ) : null}
                    {item.categories && item.categories.length > 0 ? (
                      <p className="break-words font-mono text-[0.6875rem] uppercase leading-5 tracking-[0.08em] text-muted">
                        {item.categories.join(" / ")}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        aria-labelledby="working-style-title"
        className="border-b border-border"
      >
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-12 sm:px-8 sm:py-14 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12">
          <header>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-accent">
              Operating principles
            </p>
            <h2
              id="working-style-title"
              className="mt-3 text-2xl font-semibold uppercase tracking-[-0.03em] text-foreground"
            >
              Working Style
            </h2>
          </header>
          <ol className="border-t border-border">
            {siteContent.about.approach.map((principle, index) => (
              <li
                key={principle}
                className="grid grid-cols-[2rem_minmax(0,1fr)] gap-4 border-b border-border py-4"
              >
                <span
                  aria-hidden="true"
                  className="font-mono text-[0.625rem] tabular-nums text-accent"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm leading-6 text-foreground">
                  {principle}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {contactLinks.length > 0 ? (
        <section
          aria-labelledby="contact-title"
          className="border-b border-border bg-surface"
        >
          <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-14">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-accent">
              External links
            </p>
            <h2
              id="contact-title"
              className="mt-3 text-2xl font-semibold uppercase tracking-[-0.03em] text-foreground"
            >
              Contact
            </h2>
            <ul className="mt-7 flex flex-wrap gap-x-8 gap-y-2 border-y border-border py-3">
              {contactLinks.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="group inline-flex min-h-11 items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.12em] focus-visible:outline-offset-3"
                  >
                    <span className="text-foreground group-hover:text-accent group-focus-visible:text-accent">
                      {item.label}
                    </span>
                    <span aria-hidden="true" className="text-accent">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
