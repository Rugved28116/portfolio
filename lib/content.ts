import { labEntries, labFilters } from "@/content/lab";
import { notes } from "@/content/notes";
import { projects } from "@/content/projects";
import type { LabEntry, LabFilter, Note, Project } from "@/content/types";

export function getProjects(): readonly Project[] {
  return projects;
}

export function getFeaturedProjects(): readonly Project[] {
  return projects.filter((project) => project.featured === true);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getLabEntries(): readonly LabEntry[] {
  return labEntries;
}

export function getLabFilters(): readonly LabFilter[] {
  return labFilters;
}

export function getLabEntryById(id: LabEntry["id"]): LabEntry | undefined {
  return labEntries.find((entry) => entry.id === id);
}

export function getLabEntryBySlug(slug: string): LabEntry | undefined {
  return labEntries.find((entry) => entry.slug === slug);
}

export function getNoteBySlug(slug: string): Note | undefined {
  return notes.find((note) => note.slug === slug);
}
