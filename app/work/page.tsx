import type { Metadata } from "next";

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
          <li key={project.slug} className="bg-surface p-5 text-sm">
            {project.title}
          </li>
        ))}
      </ul>
    </PageIntro>
  );
}
