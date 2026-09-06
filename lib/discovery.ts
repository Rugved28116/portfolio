"use client";

import { useEffect, useState } from "react";

export const discoveryKeys = {
  maintenance: "rgb-discovery-maintenance",
  terminal: "rgb-discovery-terminal",
  terminalHelp: "rgb-discovery-terminal-help",
  firstBreak: "rgb-discovery-first-break",
} as const;

export type DiscoveryKey = (typeof discoveryKeys)[keyof typeof discoveryKeys];

type DiscoverySnapshot = {
  readonly hydrated: boolean;
  readonly completed: Readonly<Record<DiscoveryKey, boolean>>;
};

const discoveryEvent = "rgb:discovery-change";
const volatileCompleted = new Set<DiscoveryKey>();

function emptyCompleted(): Record<DiscoveryKey, boolean> {
  return Object.fromEntries(
    Object.values(discoveryKeys).map((key) => [key, false]),
  ) as Record<DiscoveryKey, boolean>;
}

export function isDiscoveryComplete(key: DiscoveryKey) {
  if (typeof window === "undefined") return false;
  if (volatileCompleted.has(key)) return true;
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

export function completeDiscovery(key: DiscoveryKey) {
  if (typeof window === "undefined") return;
  volatileCompleted.add(key);
  try {
    window.localStorage.setItem(key, "1");
  } catch {
    // The in-memory flag still prevents repeated hints for this page session.
  }
  window.dispatchEvent(new Event(discoveryEvent));
}

export function resetDiscovery() {
  if (typeof window === "undefined") return;
  volatileCompleted.clear();
  for (const key of Object.values(discoveryKeys)) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Storage can be unavailable in restrictive browsing contexts.
    }
  }
  window.dispatchEvent(new Event(discoveryEvent));
}

function readSnapshot(): DiscoverySnapshot {
  return {
    hydrated: true,
    completed: Object.fromEntries(
      Object.values(discoveryKeys).map((key) => [key, isDiscoveryComplete(key)]),
    ) as Record<DiscoveryKey, boolean>,
  };
}

export function useDiscoveryState() {
  const [snapshot, setSnapshot] = useState<DiscoverySnapshot>({
    hydrated: false,
    completed: emptyCompleted(),
  });

  useEffect(() => {
    const refresh = () => setSnapshot(readSnapshot());
    refresh();
    window.addEventListener(discoveryEvent, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(discoveryEvent, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return snapshot;
}
