import type { Metadata } from "next";

import { LabIndex } from "@/components/lab-index";
import { PageIntro } from "@/components/page-intro";
import { getLabEntries, getLabFilters } from "@/lib/content";

export const metadata: Metadata = {
  title: "Lab",
  description: "Engineering experiments by Rugved Ganesh Bhor.",
};

export default function LabPage() {
  const entries = getLabEntries();
  const filters = getLabFilters();

  return (
    <PageIntro
      eyebrow="RGB / Lab"
      title="Engineering project log."
      description="Experiments, prototypes, robotics, hardware, security, AI, Linux, networking and smaller builds."
    >
      <LabIndex entries={entries} filters={filters} />
    </PageIntro>
  );
}
