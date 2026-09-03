import { labEntries } from "@/content/lab";
import { notes } from "@/content/notes";
import { projects } from "@/content/projects";
import type { LabEntry, Note, Project } from "@/content/types";

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getLabEntryBySlug(slug: string): LabEntry | undefined {
  return labEntries.find((entry) => entry.slug === slug);
}

export function getNoteBySlug(slug: string): Note | undefined {
  return notes.find((note) => note.slug === slug);
}
