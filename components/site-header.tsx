import Link from "next/link";

import { MaintenanceToggle } from "@/components/maintenance-provider";
import { TerminalTrigger } from "@/components/portfolio-terminal";
import { siteContent } from "@/content/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-[1fr_auto] items-center gap-x-4 px-5 py-2 sm:px-8 md:flex md:min-h-16 md:flex-nowrap md:py-0">
        <MaintenanceToggle mark={siteContent.identity.mark} />
        <nav
          aria-label="Primary navigation"
          className="col-span-2 row-start-2 border-t border-border md:ml-auto md:border-0"
        >
          <ul className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.14em] text-muted md:justify-start md:gap-2">
            <li>
              <Link href="/" className="flex min-h-11 items-center px-2 hover:text-foreground md:px-3">
                Home
              </Link>
            </li>
            {siteContent.navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex min-h-11 items-center px-2 hover:text-foreground md:px-3"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <TerminalTrigger
          discoveryHint
          ariaLabel="Open portfolio terminal"
          title="Open terminal"
          className="col-start-2 row-start-1 flex size-11 items-center justify-center border border-border font-mono text-sm text-muted hover:border-muted hover:text-foreground focus-visible:outline-offset-2 md:ml-4"
        >
          <span aria-hidden="true">&gt;_</span>
        </TerminalTrigger>
      </div>
    </header>
  );
}
