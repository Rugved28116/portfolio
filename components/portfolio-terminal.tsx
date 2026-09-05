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

import styles from "./portfolio-terminal.module.css";

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
const systemMark = [
  " RRRR   GGGG  BBBB",
  " R   R G      B   B",
  " RRRR  G  GG  BBBB",
  " R  R  G   G  B   B",
  " R   R  GGG   BBBB  ___",
].join("\n");
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
  const caretRef = useRef<HTMLSpanElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const entryIdRef = useRef(0);
  const savedInputRef = useRef("");
  const shellUser = data.prompt.split(":")[0];

  function syncCaret() {
    const field = inputRef.current;
    const caret = caretRef.current;
    if (!field || !caret) return;
    caret.style.left = `calc(${field.selectionStart ?? field.value.length}ch - ${field.scrollLeft}px)`;
    caret.style.visibility = field.selectionStart === field.selectionEnd ? "visible" : "hidden";
  }

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
  }, [entries, isOpen]);

  useEffect(() => {
    syncCaret();
  }, [input]);

  useEffect(() => {
    if (!isOpen) return;
    const viewport = window.visualViewport;
    function fitViewport() {
      dialogRef.current?.style.setProperty("--terminal-viewport-height", `${viewport?.height ?? window.innerHeight}px`);
      dialogRef.current?.style.setProperty("--terminal-viewport-top", `${viewport?.offsetTop ?? 0}px`);
      outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight });
    }
    fitViewport();
    viewport?.addEventListener("resize", fitViewport);
    viewport?.addEventListener("scroll", fitViewport);
    return () => {
      viewport?.removeEventListener("resize", fitViewport);
      viewport?.removeEventListener("scroll", fitViewport);
    };
  }, [isOpen]);

  function openConfiguredLink(link: TerminalLink, successMessage: string) {
    if (!link.url) return undefined;

    window.open(link.url, "_blank", "noopener,noreferrer");
    return [{ text: successMessage, href: link.url, tone: "accent" }] satisfies
      readonly TerminalLine[];
  }

  function getCommandOutput(command: string): readonly TerminalLine[] {
    switch (command.toLowerCase()) {
      case "help":
        return [
          { text: "Available commands" },
          { text: "" },
          ...commandDefinitions.map(([name, description]) => ({
            text: `  ${name.padEnd(10)} ${description}`,
          })),
        ];
      case "whoami":
        return [
          { text: data.identity.name.toUpperCase(), tone: "accent" },
          { text: `aka ${data.identity.alias}` },
          { text: "" },
          { text: data.identity.positioning },
        ];
      case "projects":
        return data.projects.map((project, index) => ({
          text: `${String(index + 1).padStart(2, "0")}  ${project.title}`,
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
          { text: "OS        RGB Portfolio" },
          { text: `User      ${data.identity.name}` },
          { text: `Alias     ${data.identity.alias}` },
          ...(focus ? [{ text: `Focus     ${focus}` }] : []),
          ...(building ? [{ text: `Building  ${building}` }] : []),
          ...(planning ? [{ text: `Planning  ${planning}` }] : []),
          ...(platform ? [{ text: `Platform  ${platform}` }] : []),
          { text: `Interests ${data.interests.slice(0, 6).join(" / ")}` },
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
      lines: getCommandOutput(rawCommand),
    };
    entryIdRef.current += 1;
    setEntries((history) => [...history, nextEntry]);
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (commandHistory.length === 0) return;
      if (historyIndex === null) savedInputRef.current = input;

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
        setInput(savedInputRef.current);
      } else {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setInput(commandHistory[nextIndex]);
      }
      return;
    }

    if (event.key === "Tab" && !event.shiftKey) {
      const inputPrefix = input.trim().toLowerCase();
      const matches = commandNames.filter((name) => name.startsWith(inputPrefix));

      if (inputPrefix && matches.length === 1 && matches[0] !== inputPrefix) {
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
        onKeyDown={(event) => {
          if (event.key !== "Tab" || event.defaultPrevented) return;
          const controls = event.currentTarget.querySelectorAll<HTMLElement>(
            'button, a[href], input',
          );
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeTerminal();
        }}
        className={styles.window}
      >
        <div className={styles.session}>
          <header className={styles.titleBar}>
            <h2 id="portfolio-terminal-title" className={styles.title}>
              {shellUser}: ~
            </h2>
            <button
              type="button"
              aria-label="Close portfolio terminal"
              onClick={closeTerminal}
              className={styles.close}
            >
              <span aria-hidden="true">×</span>
            </button>
          </header>

          <div
            ref={outputRef}
            className={styles.scrollback}
            onClick={(event) => {
              if ((event.target as HTMLElement).closest("a, button, input")) return;
              if (window.getSelection()?.toString()) return;
              inputRef.current?.focus();
            }}
          >
            <p id="portfolio-terminal-description" className="sr-only">
              Simulated portfolio terminal. Type help for commands. Use Up and
              Down for history, Tab to complete a command, and Escape to close.
            </p>

            <div role="log" aria-label="Terminal scrollback" aria-live="polite" aria-relevant="additions">
              {entries.map((entry) => (
                <div key={entry.id} className={styles.entry}>
                  <p className={styles.location}>
                    {shellUser} <span className={styles.path}>~</span>
                  </p>
                  <p className={styles.command}>
                    <span className={styles.symbol}>❯</span>{" "}
                    <span className="text-foreground">{entry.command}</span>
                  </p>
                  <div className={entry.command.toLowerCase() === "neofetch" ? styles.systemInfo : styles.output}>
                    {entry.command.toLowerCase() === "neofetch" ? (
                      <pre aria-hidden="true" className={styles.systemMark}>{systemMark}</pre>
                    ) : null}
                    <div>
                    {entry.lines.map((line, index) => {
                      const className = `${styles.line} ${lineToneClass(line.tone)}`;

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
                            className={`${className} ${styles.outputLink}`}
                          >
                            {line.text}
                          </Link>
                        );
                      }

                      return (
                        <a
                          key={`${entry.id}-${index}`}
                          href={line.href}
                          className={`${className} ${styles.outputLink}`}
                        >
                          {line.text}
                        </a>
                      );
                    })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={executeInput} className={styles.prompt}>
              <p aria-hidden="true" className={styles.location}>
                {shellUser} <span className={styles.path}>~</span>
              </p>
              <label htmlFor="portfolio-terminal-input" className="sr-only">
                Terminal command
              </label>
              <div className={styles.inputLine}>
                <span aria-hidden="true" className={styles.symbol}>❯</span>
                <div className={styles.inputWrap}>
                  <input
                    ref={inputRef}
                    id="portfolio-terminal-input"
                    value={input}
                    onChange={(event) => {
                      setInput(event.target.value);
                      setHistoryIndex(null);
                    }}
                    onKeyDown={handleInputKeyDown}
                    onSelect={syncCaret}
                    onScroll={syncCaret}
                    onFocus={syncCaret}
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint="send"
                    className={styles.input}
                  />
                  <span ref={caretRef} aria-hidden="true" className={styles.caret} />
                </div>
              </div>
            </form>
          </div>
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
