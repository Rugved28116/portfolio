import { getLabEntryById } from "@/lib/content";

const buildLifecycle = [
  "PLANNED",
  "DESIGNING",
  "PROTOTYPING",
  "BUILDING",
  "WORKING",
  "V2",
] as const;

export function BuildQueue() {
  const entry = getLabEntryById("RGB / PLAN_001");

  if (!entry) {
    return null;
  }

  return (
    <section
      aria-labelledby="build-queue-title"
      className="border-b border-border"
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
        <header className="grid gap-5 border-b border-border pb-7 md:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)] md:items-end md:gap-12">
          <div>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-accent">
              Future engineering roadmap
            </p>
            <h2
              id="build-queue-title"
              className="mt-3 text-2xl font-semibold uppercase tracking-[-0.03em] text-foreground sm:text-3xl"
            >
              Build Queue
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted md:justify-self-end">
            Planned systems and ideas awaiting design, prototyping and a future
            build.
          </p>
        </header>

        <article
          aria-labelledby="build-queue-entry-title"
          className="grid border-b border-border lg:grid-cols-[10rem_minmax(0,1fr)_13rem]"
        >
          <div className="border-b border-border py-5 lg:border-r lg:border-b-0 lg:pr-6">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-accent">
              Queue / 01
            </p>
            <p className="mt-2 font-mono text-xs uppercase leading-5 tracking-[0.1em] text-muted">
              {entry.id}
            </p>
          </div>

          <div className="min-w-0 border-b border-border py-6 lg:border-r lg:border-b-0 lg:px-8">
            <h3
              id="build-queue-entry-title"
              className="break-words text-2xl font-semibold uppercase tracking-[-0.035em] text-foreground sm:text-3xl"
            >
              {entry.title}
            </h3>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
              {entry.shortDescription}
            </p>
            <p className="mt-5 break-words font-mono text-xs uppercase leading-5 tracking-[0.1em] text-muted">
              {entry.categories.join(" / ")}
            </p>
          </div>

          <div className="flex flex-col justify-between gap-5 py-6 lg:pl-8">
            <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-muted">
              Current state
            </p>
            {entry.status ? (
              <p className="w-fit border border-accent px-3 py-2 font-mono text-sm font-semibold uppercase tracking-[0.16em] text-foreground">
                {entry.status}
              </p>
            ) : null}
            <p className="font-mono text-[0.6875rem] uppercase leading-5 tracking-[0.12em] text-muted">
              Future work / not yet built
            </p>
          </div>
        </article>

        <div className="pt-7">
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-muted">
            Intended lifecycle
          </p>
          <ol
            aria-label={`${entry.title} lifecycle`}
            className="mt-4 grid grid-cols-2 border-t border-l border-border sm:grid-cols-3 lg:grid-cols-6"
          >
            {buildLifecycle.map((stage, index) => {
              const isCurrent = stage === entry.status;

              return (
                <li
                  key={stage}
                  aria-current={isCurrent ? "step" : undefined}
                  className="min-w-0 border-r border-b border-border p-3"
                >
                  <span
                    className={`block font-mono text-[0.625rem] tracking-[0.14em] ${
                      isCurrent ? "text-accent" : "text-muted"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`mt-2 block break-words font-mono text-[0.6875rem] font-semibold uppercase leading-5 tracking-[0.08em] ${
                      isCurrent ? "text-foreground" : "text-muted"
                    }`}
                  >
                    {stage}
                  </span>
                  {isCurrent ? (
                    <span className="mt-1 block font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-accent">
                      Current
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
