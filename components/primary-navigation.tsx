"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavigationItem = {
  readonly label: string;
  readonly href: string;
};

function matchesRoute(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PrimaryNavigation({
  items,
}: {
  readonly items: readonly NavigationItem[];
}) {
  const pathname = usePathname();
  const navigationItems = [{ label: "Home", href: "/" }, ...items];

  return (
    <nav
      aria-label="Primary navigation"
      className="col-span-2 row-start-2 border-t border-border md:ml-auto md:border-0"
    >
      <ul className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.14em] text-muted md:justify-start md:gap-2">
        {navigationItems.map((item) => {
          const isActive = matchesRoute(pathname, item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex min-h-11 items-center border-b px-2 transition-colors duration-150 motion-reduce:transition-none md:px-3 ${
                  isActive
                    ? "border-accent text-foreground"
                    : "border-transparent hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
