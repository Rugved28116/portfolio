import type { MetadataRoute } from "next";

import { siteContent } from "@/content/site";
import { getProjects, getPublishedNotes } from "@/lib/content";

const localSiteUrl = "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteContent.site.siteUrl ?? localSiteUrl;
  const staticPaths = ["/", "/work", "/lab", "/notes", "/about"];
  const projectPaths = getProjects().map(
    (project) => `/work/${project.slug}`,
  );
  const notePaths = getPublishedNotes().map((note) => `/notes/${note.slug}`);

  return [...staticPaths, ...projectPaths, ...notePaths].map((path) => ({
    url: new URL(path, baseUrl).toString(),
  }));
}
