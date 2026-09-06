import Link from "next/link";

import { NotFoundScene } from "@/components/not-found-scene";

export default function NotFound() {
  return (
    <section aria-labelledby="not-found-title" className="border-b border-border">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,0.86fr)_minmax(24rem,0.74fr)] lg:items-center lg:gap-20 lg:py-24">
        <div className="min-w-0">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-accent">
            RGB / ERROR_404
          </p>
          <p
            aria-hidden="true"
            className="mt-6 font-mono text-[clamp(5rem,24vw,10rem)] font-semibold leading-[0.78] tracking-[-0.08em] text-foreground"
          >
            404
          </p>
          <h1
            id="not-found-title"
            className="mt-10 text-balance text-2xl font-semibold uppercase tracking-[-0.035em] text-foreground sm:text-3xl"
          >
            Resource Not Found
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted sm:text-lg sm:leading-8">
            The requested component appears to be missing.
          </p>

          <nav aria-label="Not found recovery" className="mt-9 flex flex-col gap-3 min-[390px]:flex-row">
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center bg-foreground px-5 font-mono text-xs font-semibold uppercase tracking-[0.14em] hover:bg-accent focus-visible:outline-offset-4"
              style={{ color: "var(--rgb-background)" }}
            >
              Return home
            </Link>
            <Link
              href="/work"
              className="inline-flex min-h-12 items-center justify-center border border-border px-5 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-muted hover:border-muted hover:text-foreground focus-visible:outline-offset-4"
            >
              View work
            </Link>
          </nav>
        </div>

        <NotFoundScene />
      </div>
    </section>
  );
}
