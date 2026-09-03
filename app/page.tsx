import Link from "next/link";

import { Currently } from "@/components/currently";
import { SelectedWork } from "@/components/selected-work";
import { siteContent } from "@/content/site";

export default function Home() {
  return (
    <>
      <section
        aria-labelledby="hero-title"
        className="overflow-hidden border-b border-border"
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col px-5 py-10 sm:px-8 sm:py-14 lg:py-16">
          <dl className="grid gap-6 border-b border-border pb-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:gap-12">
            <div>
              <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-muted">
                Primary identity
              </dt>
              <dd className="mt-2 text-lg font-medium uppercase tracking-[0.08em] text-foreground sm:text-xl">
                {siteContent.identity.name}
              </dd>
            </div>
            <div className="sm:text-right">
              <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-muted">
                Online / builder identity
              </dt>
              <dd className="mt-2 font-mono text-sm uppercase tracking-[0.12em] text-accent">
                {siteContent.identity.onlineName}
              </dd>
            </div>
          </dl>

          <div className="flex min-h-72 items-center py-16 sm:min-h-96 sm:py-20 lg:py-24">
            <h1
              id="hero-title"
              className="max-w-5xl text-balance text-[clamp(3.25rem,10.8vw,8.25rem)] font-semibold uppercase leading-[0.88] tracking-[-0.065em] text-foreground"
            >
              {siteContent.hero.statement}
            </h1>
          </div>

          <div className="grid gap-10 border-t border-border pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.7fr)] lg:gap-16">
            <div>
              <p className="font-mono text-xs uppercase leading-6 tracking-[0.14em] text-muted sm:text-sm">
                {siteContent.hero.disciplines.join(" / ")}
              </p>
            </div>

            <div className="lg:border-l lg:border-border lg:pl-8">
              <p className="max-w-xl text-base leading-7 text-foreground sm:text-lg sm:leading-8">
                {siteContent.hero.description}
              </p>
              <div className="mt-8 flex flex-col gap-3 min-[390px]:flex-row">
                <Link
                  href="/work"
                  className="inline-flex min-h-12 items-center justify-center bg-foreground px-5 font-mono text-xs font-semibold uppercase tracking-[0.14em] hover:bg-accent focus-visible:outline-offset-4"
                  style={{ color: "var(--rgb-background)" }}
                >
                  View work
                </Link>
                <button
                  type="button"
                  aria-label="Terminal (coming soon)"
                  aria-disabled="true"
                  title="Terminal coming soon"
                  className="inline-flex min-h-12 cursor-not-allowed items-center justify-center gap-2 border border-border px-5 font-mono text-xs uppercase tracking-[0.14em] text-muted"
                >
                  <span aria-hidden="true">&gt;_</span>
                  <span>Terminal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Currently />
      <SelectedWork />
    </>
  );
}
