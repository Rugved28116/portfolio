import { childrenOf, displayPath, renderTree, resolvePath, VIRTUAL_HOME, type TerminalData, type TerminalLink, type VirtualNode } from "./terminal-filesystem";

export type TerminalLine = { readonly text: string; readonly href?: string; readonly tone?: "default" | "muted" | "accent" | "error" };
type Result = { lines: readonly TerminalLine[]; cwd?: string; action?: "clear" | "exit"; destination?: string };
export type ShellContext = { data: TerminalData; nodes: readonly VirtualNode[]; cwd: string; history: readonly string[]; now: Date; startedAt: number };
type Command = { name: string; aliases?: readonly string[]; description: string; usage: string; examples: string; handler: (args: string[], context: ShellContext, rest: string) => Result };
const output = (...text: string[]): Result => ({ lines: text.flatMap((value) => value.split("\n").map((text) => ({ text }))) });
const error = (text: string): Result => ({ lines: [{ text, tone: "error" }] });
const configured = (link: TerminalLink): Result => link.url && /^(https?:\/\/|mailto:|\/(?!\/))/.test(link.url) ? { lines: [{ text: `Opening ${link.label}.`, href: link.url }], destination: link.url } : output(`${link.label} link not configured.`);
const listEntries = (context: ShellContext, source: string, planned = false): Result => ({ lines: context.nodes.filter((node) => node.source === source && (!planned || context.data.labEntries.some((entry) => entry.slug === node.path.split("/").at(-1) && entry.status === "PLANNED"))).map((node) => ({ text: node.text, href: node.href })) });

function search(context: ShellContext, term: string, grep: boolean): Result {
  if (!term) return error(`Usage: ${grep ? "grep" : "find"} <term>`);
  const needle = term.toLowerCase();
  const lines: TerminalLine[] = [];
  for (const source of ["projects", "lab", "notes", "interests"]) {
    const records = source === "interests" ? [
      ...context.data.interestAreas.map((item) => ({ text: `${item.label}: ${item.description}`, path: item.label, href: undefined })),
      ...context.data.interests.map((text) => ({ text, path: text, href: undefined })),
    ] : context.nodes.filter((node) => node.source === source).map((node) => ({ ...node, text: `${node.text}\n${context.nodes.find((file) => file.path === `${node.path}/README.txt`)?.text ?? ""}` }));
    const matches = records.filter((record) => `${record.path}\n${record.text}`.toLowerCase().includes(needle));
    if (matches.length) {
      lines.push({ text: source.toUpperCase(), tone: "accent" });
      for (const record of matches) {
        lines.push({ text: displayPath(record.path), href: record.href });
        if (grep) lines.push(...[...new Set(record.text.split("\n").filter((line) => line.toLowerCase().includes(needle)))].map((text) => ({ text: `  ${text}` })));
      }
    }
  }
  return lines.length ? { lines } : output(`No matches for: ${term}`);
}

export const commands: readonly Command[] = [
  { name: "help", description: "List portfolio shell commands.", usage: "help", examples: "help", handler: () => output("Simulated portfolio shell. No operating-system commands are executed.", ...commands.map((command) => `${command.name}${command.aliases ? ` (${command.aliases.join(", ")})` : ""} — ${command.description}`), "Use man <command> for details. Tab completes names and paths; Shift+Tab moves focus.") },
  { name: "man", description: "Read command documentation.", usage: "man <command>", examples: "man cd\nman open\nman find", handler: (args) => {
    const command = commands.find((command) => command.name === args[0] || command.aliases?.includes(args[0]));
    return command ? output("NAME", `  ${command.name} — ${command.description}`, "USAGE", `  ${command.usage}`, "DESCRIPTION", `  ${command.description} All filesystem operations use in-memory portfolio data.`, "EXAMPLES", command.examples) : error(`man: no manual entry for ${args[0] || "(missing command)"}`);
  } },
  { name: "pwd", description: "Print the virtual working directory.", usage: "pwd", examples: "pwd", handler: (_, context) => output(context.cwd) },
  { name: "cd", description: "Change virtual directory; no argument returns home.", usage: "cd [directory]", examples: "cd projects\ncd ..\ncd ~\ncd /", handler: (args, context) => {
    if (args.length > 1) return error("Usage: cd [directory]");
    const path = resolvePath(context.cwd, args[0] || "~");
    return context.nodes.some((node) => node.path === path && node.kind === "directory") ? { lines: [], cwd: path } : error(`cd: no such file or directory: ${args[0]}`);
  } },
  { name: "ls", description: "List virtual entries; -la adds simulated permissions.", usage: "ls [-la] [directory]", examples: "ls\nls -la\nls ~/lab", handler: (args, context) => {
    const detailed = args.includes("-la");
    const paths = args.filter((arg) => arg !== "-la");
    if (paths.length > 1 || paths.some((arg) => arg.startsWith("-"))) return error("Usage: ls [-la] [directory]");
    const path = resolvePath(context.cwd, paths[0] || ".");
    const node = context.nodes.find((node) => node.path === path);
    if (!node) return error(`ls: no such file or directory: ${paths[0]}`);
    const entries = node.kind === "directory" ? childrenOf(context.nodes, path) : [node];
    const names = entries.map((item) => `${detailed ? `${item.kind === "directory" ? "dr-xr-xr-x" : "-r--r--r--"} virtual rugved portfolio  ` : ""}${item.path.split("/").at(-1)}${item.kind === "directory" ? "/" : ""}`);
    return output(...(detailed ? ["Simulated listing / no real permissions, sizes or timestamps", "dr-xr-xr-x virtual rugved portfolio  ./", "dr-xr-xr-x virtual rugved portfolio  ../"] : []), ...names);
  } },
  { name: "tree", description: "Show the virtual tree from the current directory.", usage: "tree", examples: "cd ~\ntree", handler: (_, context) => output(...renderTree(context.nodes, context.cwd)) },
  { name: "cat", description: "Read a virtual file or an entry summary; defaults to README.txt.", usage: "cat [virtual-file]", examples: "cat about.txt\ncd projects/nyayasetu\ncat README.txt", handler: (args, context) => {
    if (args.length > 1) return error("Usage: cat [virtual-file]");
    const node = context.nodes.find((node) => node.path === resolvePath(context.cwd, args[0] || "README.txt"));
    return node?.text ? output(node.text) : error(`cat: no readable virtual file: ${args[0] || "README.txt"}`);
  } },
  { name: "open", description: "Navigate to a portfolio item or configured destination.", usage: "open <item>", examples: "open nyayasetu\nopen line-tracker-robot\nopen notes\nopen github", handler: (args, context) => {
    if (args.length !== 1) return error("Usage: open <item>");
    const target = args[0];
    const contact = Object.entries(context.data.contact).find(([key]) => key === target)?.[1];
    if (contact) return configured(contact);
    const routes: Record<string, string> = { projects: "/work", work: "/work", lab: "/lab", notes: "/notes", about: "/about" };
    const node = context.nodes.find((node) => node.path === resolvePath(context.cwd, target)) ?? context.nodes.find((node) => node.source && node.path.split("/").at(-1) === target);
    const destination = Object.hasOwn(routes, target) ? routes[target] : node?.href;
    return destination ? configured({ label: target, url: destination }) : error(`open: no configured destination: ${target}`);
  } },
  { name: "find", description: "Search portfolio entries and areas of interest.", usage: "find <term>", examples: "find rag", handler: (_, context, rest) => search(context, rest, false) },
  { name: "grep", description: "Show matching lines in portfolio content (literal text).", usage: "grep <term>", examples: "grep sensors", handler: (_, context, rest) => search(context, rest, true) },
  { name: "history", description: "Show this session's command history.", usage: "history", examples: "history", handler: (_, context) => output(...context.history.map((command, index) => `${index + 1}  ${command}`)) },
  { name: "clear", description: "Clear output while preserving session state.", usage: "clear", examples: "clear", handler: () => ({ lines: [], action: "clear" }) },
  { name: "echo", description: "Print literal text without expansion or execution.", usage: "echo <text>", examples: "echo hello", handler: (_, __, rest) => output(rest) },
  { name: "exit", description: "Close the terminal.", usage: "exit", examples: "exit", handler: () => ({ lines: [], action: "exit" }) },
  { name: "whoami", description: "Show Rugved's identity.", usage: "whoami", examples: "whoami", handler: (_, { data }) => output(data.identity.name, `aka ${data.identity.alias}`, data.identity.positioning) },
  { name: "about", description: "Read the portfolio introduction.", usage: "about", examples: "about", handler: (_, { data }) => output(data.identity.name, data.identity.positioning) },
  { name: "status", description: "Show current focus, building, planning and platform.", usage: "status", examples: "status", handler: (_, { data }) => output(...data.currently.map((item) => `${item.label}: ${item.value}${item.note ? ` / ${item.note}` : ""}`)) },
  ...(["projects", "lab", "notes"] as const).map((name): Command => ({ name, description: `List ${name} from portfolio content.`, usage: name, examples: name, handler: (_, context) => { const result = listEntries(context, name); return result.lines.length ? result : output(`No published ${name}.`); } })),
  { name: "roadmap", description: "List planned future builds, not completed work.", usage: "roadmap", examples: "roadmap", handler: (_, context) => listEntries(context, "lab", true) },
  { name: "skills", description: "List areas of interest, without proficiency claims.", usage: "skills", examples: "skills", handler: (_, { data }) => output(...data.interests) },
  { name: "stack", description: "List technologies confirmed in project and Lab data.", usage: "stack", examples: "stack", handler: (_, { data }) => output(...[...new Set([...data.projects, ...data.labEntries].flatMap((item) => item.technologies ?? []))].sort()) },
  { name: "contact", description: "Show configured contact methods.", usage: "contact", examples: "contact", handler: (_, { data }) => output(...Object.values(data.contact).map((link) => `${link.label}: ${link.url || "Not configured"}`)) },
  ...(["github", "linkedin", "resume"] as const).map((name): Command => ({ name, description: `Open the configured ${name} destination.`, usage: name, examples: name, handler: (_, { data }) => configured(data.contact[name]) })),
  { name: "fastfetch", aliases: ["neofetch"], description: "Show simulated portfolio system information.", usage: "fastfetch | neofetch", examples: "fastfetch\nneofetch", handler: (_, { data }) => output("System: RGB Portfolio / simulated shell", `User: ${data.identity.name}`, `Alias: ${data.identity.alias}`, ...data.currently.map((item) => `${item.label}: ${item.value}${item.note ? ` / ${item.note}` : ""}`), `Interests: ${data.interests.join(" / ")}`) },
  { name: "uname", description: "Show the virtual shell identity, never host information.", usage: "uname [-a]", examples: "uname\nuname -a", handler: (args) => args.length === 0 ? output("RGB Portfolio (simulated)") : args.length === 1 && args[0] === "-a" ? output("RGB Portfolio rgb-official / virtual portfolio shell / no host hardware information") : error("Usage: uname [-a]") },
  { name: "hostname", description: "Show the portfolio's virtual hostname.", usage: "hostname", examples: "hostname", handler: (_, { data }) => output(`${data.prompt.split("@")[1]?.split(":")[0] || "rgb-official"} (virtual)`) },
  { name: "id", description: "Show the simulated portfolio user.", usage: "id", examples: "id", handler: () => output("user=rugved group=portfolio (virtual identity; no system privileges)") },
  { name: "date", description: "Show the browser's current local date and time.", usage: "date", examples: "date", handler: (_, context) => output(context.now.toLocaleString()) },
  { name: "uptime", description: "Show time since this terminal session first opened.", usage: "uptime", examples: "uptime", handler: (_, context) => { const seconds = Math.max(0, Math.floor((context.now.getTime() - context.startedAt) / 1000)); return output(`Terminal session uptime: ${Math.floor(seconds / 3600)}h ${Math.floor(seconds % 3600 / 60)}m ${seconds % 60}s`); } },
  { name: "sudo", description: "A harmless permission joke.", usage: "sudo [su]", examples: "sudo\nsudo su", handler: (args) => output(args[0] === "su" ? "Root access denied. Builder privileges are plenty." : "Permission denied. This workstation runs on curiosity, not sudo.") },
  { name: "rm", description: "Refuse deletion; the virtual filesystem is read-only.", usage: "rm [anything]", examples: "rm -rf /", handler: () => output("Nice try. The portfolio stays. Nothing was deleted.") },
  { name: "reboot", description: "Simulate a reboot message without changing the session.", usage: "reboot", examples: "reboot", handler: () => output("Simulated reboot complete. Page and session left exactly as they were.") },
  { name: "coffee", description: "Take a small coffee break.", usage: "coffee", examples: "coffee", handler: () => output("Coffee queued. Let the next idea brew.") },
  { name: "hack", description: "A reminder from the Lab.", usage: "hack", examples: "hack", handler: () => output("Build a lab. Ask permission. Learn how it works.") },
];

// Deliberately literal parsing: no pipes, substitutions, scripts, or shell interpreter.
export function runCommand(input: string, context: ShellContext): Result {
  const match = input.trim().match(/^(\S+)(?:\s+([\s\S]*))?$/);
  if (!match) return output();
  const name = match[1].toLowerCase();
  const rest = match[2] ?? "";
  const command = commands.find((command) => command.name === name || command.aliases?.includes(name));
  return command ? command.handler(rest ? rest.split(/\s+/) : [], context, rest) : error(`command not found: ${match[1]}\nType help for available commands.`);
}

export function completeInput(input: string, cwd: string, nodes: readonly VirtualNode[]): string {
  const parts = input.split(/\s+/);
  const prefix = parts.pop() ?? "";
  let candidates: string[];
  if (parts.length === 0 || parts[0] === "man") candidates = commands.flatMap((command) => [command.name, ...(command.aliases ?? [])]);
  else {
    const slash = prefix.lastIndexOf("/");
    const base = slash >= 0 ? prefix.slice(0, slash + 1) : "";
    candidates = childrenOf(nodes, resolvePath(cwd, base || "."))
      .filter((node) => parts[0] !== "cd" || node.kind === "directory")
      .map((node) => `${base}${node.path.split("/").at(-1)}${node.kind === "directory" ? "/" : ""}`);
    if (parts[0] === "open" && !base) candidates.push("projects", "lab", "notes", "about", "github", "linkedin", "resume", ...nodes.filter((node) => node.source).map((node) => node.path.split("/").at(-1)!));
    if (prefix === "~") candidates.push("~/");
  }
  const matches = [...new Set(candidates)].filter((candidate) => candidate.startsWith(prefix));
  if (!matches.length) return input;
  let completion = matches[0];
  for (const match of matches.slice(1)) while (!match.startsWith(completion)) completion = completion.slice(0, -1);
  return [...parts, completion].join(" ");
}

export { VIRTUAL_HOME };
