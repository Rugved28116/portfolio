import type { LabEntry } from "@/content/types";

export const labEntries: readonly LabEntry[] = [
  {
    id: "RGB / LAB_001",
    slug: "line-tracker-robot",
    title: "Line Tracker Robot",
    shortDescription:
      "A small autonomous robotics project focused on following a predefined path using sensors, motor control, and feedback.",
    categories: ["Robotics", "Embedded Systems"],
    status: undefined,
    year: undefined,
    technologies: undefined,
    hardware: undefined,
    featured: undefined,
    githubUrl: undefined,
    thumbnail: undefined,
  },
  {
    id: "RGB / PLAN_001",
    slug: "portable-cyberdeck",
    title: "Portable Cyberdeck",
    shortDescription:
      "A planned portable engineering workstation intended for Linux experimentation, networking, embedded development, electronics work, and security tooling.",
    categories: ["Hardware", "Systems", "Linux", "Networking"],
    status: "PLANNED",
    year: undefined,
    technologies: undefined,
    hardware: undefined,
    featured: undefined,
    githubUrl: undefined,
    thumbnail: undefined,
  },
];

// Unconfirmed optional fields intentionally remain undefined.
