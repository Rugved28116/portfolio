import { maintenancePart } from "@/lib/maintenance-parts";
import { siteContent } from "@/content/site";

export function Currently() {
  return (
    <section aria-labelledby="currently-title" className="bg-surface">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="border-x border-border">
          <header className="flex items-baseline justify-between gap-4 border-b border-border px-4 py-4 sm:px-5">
            <h2
              id="currently-title"
              className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-foreground"
            >
              Currently
            </h2>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
              System status
            </p>
          </header>

          <dl className="divide-y divide-border lg:grid lg:grid-cols-4 lg:divide-y-0">
            {siteContent.currently.map((item) => {
              const isBuilding = item.label === "BUILDING";
              const isPlanning = item.label === "PLANNING";

              return (
                <div
                  key={item.label}
                  className={`grid grid-cols-[7rem_minmax(0,1fr)] gap-4 px-4 py-4 sm:px-5 lg:block lg:border-l lg:py-5 lg:first:border-l-0 ${
                    isPlanning
                      ? "border-l border-accent bg-background lg:border-accent"
                      : "lg:border-border"
                  }`}
                >
                  <dt
                    className={`font-mono text-[0.6875rem] font-medium uppercase tracking-[0.16em] ${
                      isPlanning
                        ? "text-accent"
                        : isBuilding
                          ? "text-foreground"
                          : "text-muted"
                    }`}
                  >
                    {item.label}
                  </dt>
                  <dd className="min-w-0 text-sm leading-5 text-foreground lg:mt-3">
                    <span className="inline-block" {...maintenancePart(`currently-${item.label.toLowerCase()}-value`)}>{item.value}</span>
                    {item.note ? (
                      <span className="mt-2 block font-mono text-[0.625rem] uppercase tracking-[0.14em] text-accent">
                        {item.note}
                      </span>
                    ) : null}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </section>
  );
}
