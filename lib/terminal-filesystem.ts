import type { LabEntry, Project, PublishedNote } from "@/content/types";

export type TerminalLink = { readonly label: string; readonly url?: string };
export type TerminalData = {
  readonly prompt: string;
  readonly identity: { readonly name: string; readonly alias: string; readonly positioning: string };
  readonly currently: readonly { readonly label: string; readonly value: string; readonly note?: string | null }[];
  readonly interests: readonly string[];
  readonly interestAreas: readonly { readonly label: string; readonly description: string }[];
  readonly projects: readonly Project[];
  readonly labEntries: readonly LabEntry[];
  readonly notes: readonly PublishedNote[];
  readonly contact: { readonly github: TerminalLink; readonly linkedin: TerminalLink; readonly email: TerminalLink; readonly resume: TerminalLink };
};
export type VirtualNode = {
  readonly path: string;
  readonly kind: "directory" | "file";
  readonly text: string;
  readonly href?: string;
  readonly source?: string;
  readonly title?: string;
};
export const VIRTUAL_HOME = "/home/rugved";

export function displayPath(path: string) {
  return path === VIRTUAL_HOME ? "~" : path.startsWith(`${VIRTUAL_HOME}/`) ? `~${path.slice(VIRTUAL_HOME.length)}` : path;
}

export function resolvePath(cwd: string, input: string) {
  const expanded = input === "~" || input.startsWith("~/") ? VIRTUAL_HOME + input.slice(1) : input;
  const parts: string[] = [];
  for (const part of (expanded.startsWith("/") ? expanded : `${cwd}/${expanded}`).split("/")) {
    if (part === "..") parts.pop();
    else if (part && part !== ".") parts.push(part);
  }
  return `/${parts.join("/")}`;
}

export function childrenOf(nodes: readonly VirtualNode[], path: string) {
  return nodes.filter((node) => node.path !== "/" && node.path.slice(0, node.path.lastIndexOf("/")) === (path === "/" ? "" : path));
}

export function createFilesystem(data: TerminalData): readonly VirtualNode[] {
  const directory = (path: string, href?: string): VirtualNode => ({ path, kind: "directory", text: "", href });
  const file = (name: string, text: string, href?: string): VirtualNode => ({ path: `${VIRTUAL_HOME}/${name}`, kind: "file", text, href });
  const entry = (folder: string, item: Project | LabEntry | PublishedNote, href: string): VirtualNode[] => {
    const text = [item.title,
      "id" in item ? item.id : "",
      "status" in item && item.status ? `Status: ${item.status}${item.status === "PLANNED" ? " / future work, not built" : ""}` : "",
      "shortDescription" in item ? item.shortDescription : "description" in item ? item.description : "",
      "categories" in item && item.categories ? `Categories: ${item.categories.join(" / ")}` : "",
      "technologies" in item && item.technologies ? `Technologies: ${item.technologies.join(" / ")}` : "",
      "caseStudy" in item && item.caseStudy ? Object.values(item.caseStudy).filter(Boolean).join("\n") : "",
      "tags" in item ? `Tags: ${item.tags.join(" / ")}` : "",
    ].filter(Boolean).join("\n");
    const path = `${VIRTUAL_HOME}/${folder}/${item.slug}`;
    const body = "content" in item ? item.content.map((block) => "text" in block ? block.text : "code" in block ? block.code : block.items.join("\n")).join("\n\n") : text;
    return [
      { path, kind: "directory", text, href, source: folder, title: item.title },
      { path: `${path}/README.txt`, kind: "file", text: body, href },
    ];
  };
  return [directory("/"), directory("/home"), directory(VIRTUAL_HOME),
    file("about.txt", `${data.identity.name}\naka ${data.identity.alias}\n${data.identity.positioning}`, "/about"),
    file("contact.txt", Object.values(data.contact).map((link) => `${link.label}: ${link.url || "Not configured"}`).join("\n")),
    file("now.txt", data.currently.map((item) => `${item.label}: ${item.value}${item.note ? ` / ${item.note}` : ""}`).join("\n")),
    directory(`${VIRTUAL_HOME}/projects`, "/work"), directory(`${VIRTUAL_HOME}/lab`, "/lab"), directory(`${VIRTUAL_HOME}/notes`, "/notes"),
    file("resume.pdf", data.contact.resume.url ? `Resume: ${data.contact.resume.url}` : "Resume not configured. This is a virtual placeholder, not a PDF file.", data.contact.resume.url),
    ...data.projects.flatMap((item) => entry("projects", item, `/work#${item.slug}`)),
    ...data.labEntries.flatMap((item) => entry("lab", item, `/lab#${item.slug}`)),
    ...data.notes.filter((item) => item.published && !item.draft).flatMap((item) => entry("notes", item, `/notes/${item.slug}`)),
  ];
}

export function renderTree(nodes: readonly VirtualNode[], root: string): string[] {
  const lines = [displayPath(root)];
  function visit(path: string, prefix: string) {
    const children = childrenOf(nodes, path);
    children.forEach((node, index) => {
      const last = index === children.length - 1;
      lines.push(`${prefix}${last ? "`-- " : "|-- "}${node.path.split("/").at(-1)}${node.kind === "directory" ? "/" : ""}`);
      if (node.kind === "directory") visit(node.path, `${prefix}${last ? "    " : "|   "}`);
    });
  }
  visit(root, "");
  return lines;
}
