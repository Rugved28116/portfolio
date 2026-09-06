import type { Metadata } from "next";
import Link from "next/link";

import { PageIntro } from "@/components/page-intro";
import { projects } from "@/content/projects";

export const metadata: Metadata = {
  title: "Work",
  description: "Project index for Rugved Ganesh Bhor.",
};

export default function WorkPage() {
  return (
    <PageIntro
      eyebrow="Work"
      title="Selected systems and software projects."
      description="Project details will be added as the underlying information is confirmed."
    >
      <ul className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
        {projects.map((project) => (
          <li key={project.slug} id={project.slug} className="min-w-0 bg-surface">
            <Link
              href={`/work/${project.slug}`}
              className="group flex min-h-20 min-w-0 items-center justify-between gap-5 p-5 hover:bg-background focus-visible:bg-background focus-visible:outline-offset-[-2px]"
            >
              <span className="min-w-0 break-words text-sm font-medium leading-6 text-foreground group-hover:text-accent group-focus-visible:text-accent">
                {project.title}
              </span>
              <span
                aria-hidden="true"
                className="shrink-0 font-mono text-sm text-muted group-hover:text-accent group-focus-visible:text-accent"
              >
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </PageIntro>
  );
}
