import type { NoteContentBlock } from "@/content/types";

type NoteContentProps = {
  blocks: readonly NoteContentBlock[];
};

export function NoteContent({ blocks }: NoteContentProps) {
  return (
    <div className="mx-auto max-w-3xl">
      {blocks.map((block, index) => {
        if (block.kind === "heading") {
          return (
            <h2
              key={`${block.kind}-${index}`}
              className="mt-14 border-t border-border pt-6 text-2xl font-semibold tracking-[-0.025em] text-foreground first:mt-0 sm:text-3xl"
            >
              {block.text}
            </h2>
          );
        }

        if (block.kind === "code") {
          return (
            <figure
              key={`${block.kind}-${index}`}
              className="my-6 min-w-0 border border-border bg-surface"
            >
              <figcaption className="border-b border-border px-4 py-2 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-muted">
                {block.label}
              </figcaption>
              <pre
                tabIndex={0}
                className="max-w-full overflow-x-auto p-4 font-mono text-xs leading-6 text-foreground focus-visible:outline-offset-[-2px] sm:text-sm"
              >
                <code>{block.code}</code>
              </pre>
            </figure>
          );
        }

        if (block.kind === "list") {
          return (
            <ul
              key={`${block.kind}-${index}`}
              className="mt-5 space-y-2 border-l border-border pl-5 text-base leading-7 text-foreground/90"
            >
              {block.items.map((item) => (
                <li key={item} className="relative before:absolute before:-left-5 before:text-accent before:content-['—']">
                  {item}
                </li>
              ))}
            </ul>
          );
        }

        if (block.kind === "ordered-list") {
          return (
            <ol
              key={`${block.kind}-${index}`}
              className="mt-5 list-decimal space-y-2 border-l border-border pl-10 text-base leading-7 text-foreground/90 marker:font-mono marker:text-accent"
            >
              {block.items.map((item) => (
                <li key={item} className="pl-1">
                  {item}
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p
            key={`${block.kind}-${index}`}
            className="mt-5 text-base leading-8 text-foreground/90"
          >
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
