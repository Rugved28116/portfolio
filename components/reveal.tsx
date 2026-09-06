"use client";

import {
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";

import styles from "./reveal.module.css";

type RevealProps = {
  readonly children: ReactNode;
  readonly className?: string;
  readonly delay?: number;
};

const observedElements = new Set<HTMLElement>();
let revealObserver: IntersectionObserver | null = null;

function stopObserving(element: HTMLElement) {
  revealObserver?.unobserve(element);
  observedElements.delete(element);
  if (observedElements.size === 0) {
    revealObserver?.disconnect();
    revealObserver = null;
  }
}

function observe(element: HTMLElement) {
  revealObserver ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const target = entry.target as HTMLElement;
        target.dataset.revealVisible = "";
        stopObserving(target);
      }
    },
    { rootMargin: "0px 0px -6%", threshold: 0 },
  );

  observedElements.add(element);
  revealObserver.observe(element);
}

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const safeDelay = Math.min(250, Math.max(0, delay));

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (
      !window.IntersectionObserver ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      element.dataset.revealVisible = "";
      return;
    }

    element.dataset.revealPending = "";
    observe(element);
    return () => stopObserving(element);
  }, []);

  return (
    <div
      ref={elementRef}
      className={`${styles.reveal} ${className ?? ""}`}
      style={{ "--reveal-delay": `${safeDelay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
