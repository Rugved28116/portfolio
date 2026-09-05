"use client";

import Link from "next/link";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";

type TerminalLink = {
  readonly label: string;
  readonly url?: string;
};

export type TerminalData = {
  readonly prompt: string;
  readonly identity: {
    readonly name: string;
    readonly alias: string;
    readonly positioning: string;
  };
  readonly currently: readonly {
    readonly label: string;
    readonly value: string;
  }[];
  readonly interests: readonly string[];
  readonly projects: readonly {
    readonly slug: string;
    readonly title: string;
    readonly href?: string;
  }[];
  readonly labEntries: readonly {
    readonly id: string;
    readonly slug: string;
    readonly title: string;
    readonly status?: string;
  }[];
  readonly notes: readonly {
    readonly slug: string;
    readonly title: string;
  }[];
  readonly contact: {
    readonly github: TerminalLink;
    readonly linkedin: TerminalLink;
    readonly email: TerminalLink;
    readonly resume: TerminalLink;
  };
};

type TerminalLine = {
  readonly text: string;
  readonly href?: string;
  readonly tone?: "default" | "muted" | "accent" | "error";
};

type TerminalEntry = {
  readonly id: number;
  readonly command: string;
  readonly lines: readonly TerminalLine[];
};

type TerminalContextValue = {
  openTerminal: (opener: HTMLButtonElement) => void;
};

type TerminalProviderProps = {
  readonly children: ReactNode;
  readonly data: TerminalData;
};

type TerminalTriggerProps = {
  readonly children: ReactNode;
  readonly className?: string;
  readonly ariaLabel?: string;
  readonly title?: string;
};

const commandDefinitions = [
  ["help", "Show available portfolio commands."],
  ["whoami", "Show identity and positioning."],
  ["projects", "List major projects."],
  ["lab", "List Lab experiments and plans."],
  ["skills", "List areas of interest."],
  ["notes", "List published technical notes."],
  ["contact", "Show configured contact methods."],
  ["github", "Open the configured GitHub profile."],
  ["linkedin", "Open the configured LinkedIn profile."],
  ["resume", "Open the configured resume."],
  ["neofetch", "Show portfolio system information."],
  ["clear", "Clear terminal output."],
  ["exit", "Close the terminal."],
] as const;

const commandNames = commandDefinitions.map(([name]) => name);
const TerminalContext = createContext<TerminalContextValue | null>(null);

function useTerminalContext() {
  const context = useContext(TerminalContext);

  if (!context) {
    throw new Error("TerminalTrigger must be used within TerminalProvider.");
  }

  return context;
}

function findCurrentValue(data: TerminalData, label: string) {
  return data.currently.find((item) => item.label === label)?.value;
}

function lineToneClass(tone: TerminalLine["tone"]) {
  if (tone === "muted") return "text-muted";
  if (tone === "accent") return "text-accent";
  if (tone === "error") return "text-foreground";

  return "text-foreground";
}

export function TerminalProvider({ children, data }: TerminalProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState<readonly TerminalEntry[]>([]);
  const [commandHistory, setCommandHistory] = useState<readonly string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const entryIdRef = useRef(0);

  function restoreOpenerFocus() {
    requestAnimationFrame(() => {
      if (openerRef.current?.isConnected) {
        openerRef.current.focus();
      }
    });
  }

  function closeTerminal() {
    if (dialogRef.current?.open) {
      dialogRef.current.close();
    }
    setIsOpen(false);
    restoreOpenerFocus();
  }

  function openTerminal(opener: HTMLButtonElement) {
    openerRef.current = opener;
    setHistoryIndex(null);
    setIsOpen(true);
  }

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog || !isOpen) return;

    if (!dialog.open) {
      dialog.showModal();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = requestAnimationFrame(() => inputRef.current?.focus());

    return () => {
      cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
    };
  }, [isOpen]);

  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight });
  }, [entries]);

  function openConfiguredLink(link: TerminalLink, successMessage: string) {
    if (!link.url) return undefined;

    window.open(link.url, "_blank", "noopener,noreferrer");
    return [{ text: successMessage, href: link.url, tone: "accent" }] satisfies
      readonly TerminalLine[];
  }

  function getCommandOutput(command: string): readonly TerminalLine[] {
    switch (command) {
      case "help":
        return commandDefinitions.map(([name, description]) => ({
          text: `${name.padEnd(10)} ${description}`,
        }));
      case "whoami":
        return [
          { text: data.identity.name.toUpperCase(), tone: "accent" },
          { text: `aka ${data.identity.alias}` },
          { text: "" },
          { text: data.identity.positioning },
        ];
      case "projects":
        return data.projects.map((project, index) => ({
          text: `${String(index + 1).padStart(2, "0")} / ${project.title}`,
          href: project.href,
        }));
      case "lab":
        return data.labEntries.map((entry) => ({
          text: `${entry.id} / ${entry.title}${entry.status ? ` / ${entry.status}` : ""}`,
          href: `/lab#${entry.slug}`,
          tone: entry.status === "PLANNED" ? "accent" : "default",
        }));
      case "skills":
        return data.interests.map((interest, index) => ({
          text: `${String(index + 1).padStart(2, "0")} / ${interest}`,
        }));
      case "notes":
        return data.notes.length > 0
          ? data.notes.map((note, index) => ({
              text: `${String(index + 1).padStart(2, "0")} / ${note.title}`,
              href: `/notes/${note.slug}`,
            }))
          : [{ text: "No published notes.", tone: "muted" }];
      case "contact": {
        const configuredLinks = Object.values(data.contact).filter(
          (link): link is TerminalLink & { url: string } =>
            link.url !== undefined,
        );

        return configuredLinks.length > 0
          ? configuredLinks.map((link) => ({
              text: `${link.label} / ${link.url}`,
              href: link.url,
            }))
          : [{ text: "No contact methods configured.", tone: "muted" }];
      }
      case "github":
        return (
          openConfiguredLink(data.contact.github, "Opening GitHub.") ?? [
            { text: "GitHub link not configured.", tone: "muted" },
          ]
        );
      case "linkedin":
        return (
          openConfiguredLink(data.contact.linkedin, "Opening LinkedIn.") ?? [
            { text: "LinkedIn link not configured.", tone: "muted" },
          ]
        );
      case "resume":
        return (
          openConfiguredLink(data.contact.resume, "Opening resume.") ?? [
            { text: "Resume not configured.", tone: "muted" },
          ]
        );
      case "neofetch": {
        const focus = findCurrentValue(data, "FOCUS");
        const building = findCurrentValue(data, "BUILDING");
        const planning = findCurrentValue(data, "PLANNING");
        const platform = findCurrentValue(data, "PLATFORM");

        return [
          { text: "RGB PORTFOLIO", tone: "accent" },
          { text: "─────────────", tone: "muted" },
          { text: `USER       ${data.identity.name}` },
          { text: `ALIAS      ${data.identity.alias}` },
          ...(focus ? [{ text: `FOCUS      ${focus}` }] : []),
          ...(building ? [{ text: `BUILDING   ${building}` }] : []),
          ...(planning ? [{ text: `PLANNING   ${planning}` }] : []),
          ...(platform ? [{ text: `PLATFORM   ${platform}` }] : []),
          { text: `INTERESTS  ${data.interests.slice(0, 6).join(" / ")}` },
        ];
      }
      default:
        return [
          { text: `command not found: ${command}`, tone: "error" },
          { text: "type 'help' for available commands", tone: "muted" },
        ];
    }
  }

  function executeInput(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const rawCommand = input.trim();

    if (!rawCommand) return;

    const command = rawCommand.toLowerCase();
    setInput("");
    setHistoryIndex(null);
    setCommandHistory((history) => [...history, rawCommand]);

    if (command === "clear") {
      setEntries([]);
      return;
    }

    if (command === "exit") {
      closeTerminal();
      return;
    }

    const nextEntry: TerminalEntry = {
      id: entryIdRef.current,
      command: rawCommand,
      lines: getCommandOutput(command),
    };
    entryIdRef.current += 1;
    setEntries((history) => [...history, nextEntry]);
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (commandHistory.length === 0) return;

      const nextIndex =
        historyIndex === null
          ? commandHistory.length - 1
          : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(commandHistory[nextIndex]);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex === null) return;

      if (historyIndex >= commandHistory.length - 1) {
        setHistoryIndex(null);
        setInput("");
      } else {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setInput(commandHistory[nextIndex]);
      }
      return;
    }

    if (event.key === "Tab") {
      const inputPrefix = input.trim().toLowerCase();
      const matches = commandNames.filter((name) => name.startsWith(inputPrefix));

      if (inputPrefix && matches.length === 1) {
        event.preventDefault();
        setInput(matches[0]);
      }
    }
  }

  return (
    <TerminalContext.Provider value={{ openTerminal }}>
      {children}
      <dialog
        ref={dialogRef}
        aria-labelledby="portfolio-terminal-title"
        aria-describedby="portfolio-terminal-description"
        aria-modal="true"
        onCancel={(event) => {
          event.preventDefault();
          closeTerminal();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeTerminal();
        }}
        className="m-auto h-[min(42rem,calc(100dvh-1.5rem))] w-[min(56rem,calc(100vw-1.5rem))] max-h-none max-w-none overflow-hidden border border-border bg-background p-0 text-foreground backdrop:bg-black/80"
      >
        <div className="flex h-full min-h-0 flex-col font-mono">
          <header className="flex min-h-12 items-center justify-between border-b border-border bg-surface pl-4">
            <div className="flex min-w-0 items-center gap-3">
              <span
                aria-hidden="true"
                className="size-2 shrink-0 bg-accent"
              />
              <h2
                id="portfolio-terminal-title"
                className="truncate text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-foreground"
              >
                RGB Portfolio Terminal
              </h2>
            </div>
            <button
              type="button"
              aria-label="Close portfolio terminal"
              onClick={closeTerminal}
              className="flex size-12 shrink-0 items-center justify-center border-l border-border text-lg text-muted hover:bg-background hover:text-foreground focus-visible:outline-offset-[-3px]"
            >
              <span aria-hidden="true">×</span>
            </button>
          </header>

          <div
            ref={outputRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 text-xs leading-6 sm:px-6 sm:text-sm"
          >
            <div id="portfolio-terminal-description" className="mb-6">
              <p className="font-semibold uppercase tracking-[0.1em] text-accent">
                Rugved Ganesh Bhor / RGB Official
              </p>
              <p className="mt-1 text-muted">
                Portfolio navigation and information interface. Type
                &apos;help&apos; to begin.
              </p>
            </div>

            <div role="log" aria-live="polite" aria-relevant="additions">
              {entries.map((entry) => (
                <div key={entry.id} className="mb-5">
                  <p className="break-words">
                    <span className="text-accent">{data.prompt}</span>{" "}
                    <span className="text-foreground">{entry.command}</span>
                  </p>
                  <div className="mt-2 space-y-1 border-l border-border pl-3">
                    {entry.lines.map((line, index) => {
                      const className = `block whitespace-pre-wrap break-words ${lineToneClass(line.tone)}`;

                      if (!line.href) {
                        return (
                          <p key={`${entry.id}-${index}`} className={className}>
                            {line.text || "\u00a0"}
                          </p>
                        );
                      }

                      if (line.href.startsWith("/")) {
                        return (
                          <Link
                            key={`${entry.id}-${index}`}
                            href={line.href}
                            onClick={closeTerminal}
                            className={`${className} w-fit max-w-full underline decoration-border underline-offset-4 hover:text-accent focus-visible:text-accent`}
                          >
                            {line.text}
                          </Link>
                        );
                      }

                      return (
                        <a
                          key={`${entry.id}-${index}`}
                          href={line.href}
                          className={`${className} w-fit max-w-full underline decoration-border underline-offset-4 hover:text-accent focus-visible:text-accent`}
                        >
                          {line.text}
                        </a>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={executeInput}
            className="flex min-w-0 items-center gap-2 border-t border-border bg-surface px-4 py-3 sm:px-6"
          >
            <label
              htmlFor="portfolio-terminal-input"
              className="sr-only"
            >
              Terminal command
            </label>
            <span
              aria-hidden="true"
              className="shrink-0 text-[0.6875rem] text-accent sm:text-xs"
            >
              {data.prompt}
            </span>
            <input
              ref={inputRef}
              id="portfolio-terminal-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleInputKeyDown}
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="min-w-0 flex-1 border-0 bg-transparent p-1 text-sm text-foreground outline-none placeholder:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              placeholder="type a command"
            />
          </form>
        </div>
      </dialog>
    </TerminalContext.Provider>
  );
}

export function TerminalTrigger({
  children,
  className,
  ariaLabel = "Open portfolio terminal",
  title,
}: TerminalTriggerProps) {
  const { openTerminal } = useTerminalContext();

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      title={title}
      onClick={(event) => openTerminal(event.currentTarget)}
      className={className}
    >
      {children}
    </button>
  );
}
