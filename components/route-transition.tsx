"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import styles from "./route-transition.module.css";

export function RouteTransition({ children }: { readonly children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className={styles.page}>
      {children}
    </div>
  );
}
