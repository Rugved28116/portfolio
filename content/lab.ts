import type { LabEntry, LabFilter } from "@/content/types";

export const labFilters: readonly LabFilter[] = [
  { label: "ALL", category: null },
  { label: "SECURITY", category: "Security" },
  { label: "AI", category: "AI" },
  { label: "ROBOTICS", category: "Robotics" },
  { label: "HARDWARE", category: "Hardware" },
  { label: "SYSTEMS", category: "Systems" },
  { label: "NETWORKING", category: "Networking" },
  { label: "WEB", category: "Web" },
];

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
    featured: true,
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
    featured: true,
    githubUrl: undefined,
    thumbnail: undefined,
  },
];

// Unconfirmed optional fields intentionally remain undefined.
