"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createFilesystem, displayPath, type TerminalData } from "@/lib/terminal-filesystem";
import { completeInput, runCommand, VIRTUAL_HOME, type TerminalLine } from "@/lib/terminal-shell";
export type { TerminalData } from "@/lib/terminal-filesystem";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useMemo,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import styles from "./portfolio-terminal.module.css";

type TerminalEntry = {
  readonly id: number;
  readonly command: string;
  readonly cwd: string;
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

function lineToneClass(tone: TerminalLine["tone"]) {
  if (tone === "muted") return "text-muted";
  if (tone === "accent") return "text-accent";
  if (tone === "error") return "text-foreground";

  return "text-foreground";
}

export function TerminalProvider({ children, data }: TerminalProviderProps) {
  const router = useRouter();
  const nodes = useMemo(() => createFilesystem(data), [data]);
  const [cwd, setCwd] = useState(VIRTUAL_HOME);
  const startedAtRef = useRef<number | null>(null);
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
    startedAtRef.current ??= Date.now();
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

  function executeInput(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const rawCommand = input.trim();
    if (!rawCommand) return;
    const history = [...commandHistory, rawCommand];
    const result = runCommand(rawCommand, {
      data, nodes, cwd, history, now: new Date(),
      startedAt: startedAtRef.current ?? Date.now(),
    });
    setInput("");
    setHistoryIndex(null);
    setCommandHistory(history);
    if (result.cwd) setCwd(result.cwd);
    if (result.action === "clear") {
      setEntries([]);
      return;
    }
    if (result.action === "exit") {
      closeTerminal();
      return;
    }
    const entry: TerminalEntry = {
      id: entryIdRef.current++, command: rawCommand, cwd, lines: result.lines,
    };
    setEntries((entries) => [...entries, entry]);
    if (result.destination) {
      if (result.destination.startsWith("/")) {
        router.push(result.destination);
        closeTerminal();
      } else {
        window.open(result.destination, "_blank", "noopener,noreferrer");
      }
    }
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
      if (event.currentTarget.selectionStart !== input.length) return;
      const completed = completeInput(input, cwd, nodes);
      if (completed !== input) {
        event.preventDefault();
        setInput(completed);
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
              {shellUser}: {displayPath(cwd)}
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
              Down for history, Tab to complete commands and paths, Shift+Tab to move focus, and Escape to close.
            </p>

            <div role="log" aria-label="Terminal scrollback" aria-live="polite" aria-relevant="additions">
              {entries.map((entry) => (
                <div key={entry.id} className={styles.entry}>
                  <p className={styles.location}>
                    {shellUser}:<span className={styles.path}>{displayPath(entry.cwd)}</span>$
                  </p>
                  <p className={styles.command}>
                    <span className={styles.symbol}>❯</span>{" "}
                    <span className="text-foreground">{entry.command}</span>
                  </p>
                  <div className={["neofetch", "fastfetch"].includes(entry.command.toLowerCase()) ? styles.systemInfo : styles.output}>
                    {["neofetch", "fastfetch"].includes(entry.command.toLowerCase()) ? (
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
                {shellUser}:<span className={styles.path}>{displayPath(cwd)}</span>$
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
