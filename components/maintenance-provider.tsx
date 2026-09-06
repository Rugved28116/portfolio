"use client";

import { usePathname } from "next/navigation";
import { MaintenanceWorkerLayer } from "@/components/maintenance-worker-layer";
import {
  completeDiscovery,
  discoveryKeys,
  isDiscoveryComplete,
  useDiscoveryState,
} from "@/lib/discovery";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import hintStyles from "./discovery-hints.module.css";

type DamageVariant = "fall" | "hang" | "shift" | "fade" | "collapse" | "tilt";
type BrokenElements = ReadonlyMap<string, DamageVariant>;
type MaintenanceContextValue = {
  maintenanceMode: boolean;
  brokenElements: BrokenElements;
  repairingElements: ReadonlySet<string>;
  toggleMaintenanceMode: () => void;
  breakElement: (id: string) => void;
  beginRepair: (id: string) => void;
  repairElement: (id: string) => void;
  repairAll: () => void;
};

const MaintenanceContext = createContext<MaintenanceContextValue | null>(null);
const selector = "[data-maintenance-breakable][data-maintenance-id]";
const protectedSelector = "a[href], nav, footer, dialog, form, button, input, select, textarea, [role='button'], [role='dialog'], [contenteditable], [data-maintenance-protected]";

function registeredElements() {
  return Array.from(document.querySelectorAll<HTMLElement>(`#main-content ${selector}`))
    .filter((element) => !element.closest(protectedSelector));
}

export function useMaintenance() {
  const context = useContext(MaintenanceContext);
  if (!context) throw new Error("Maintenance controls require MaintenanceProvider.");
  return context;
}

export function MaintenanceProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const discovery = useDiscoveryState();
  const paintedParts = useRef(new Set<HTMLElement>());
  const [showCrewNotice, setShowCrewNotice] = useState(false);
  const [hoverHint, setHoverHint] = useState<{ left: number; top: number } | null>(null);
  const [state, setState] = useState(() => ({
    pathname,
    maintenanceMode: false,
    brokenElements: new Map<string, DamageVariant>() as BrokenElements,
    repairingElements: new Set<string>() as ReadonlySet<string>,
  }));

  // Reset route-local damage before rendering a new page. Mode itself persists.
  if (state.pathname !== pathname) {
    setState({ ...state, pathname, brokenElements: new Map(), repairingElements: new Set() });
  }

  const toggleMaintenanceMode = useCallback(() => {
    setHoverHint(null);
    setState((current) => ({ ...current, maintenanceMode: !current.maintenanceMode, brokenElements: new Map(), repairingElements: new Set() }));
  }, []);
  const repairAll = useCallback(() => {
    setState((current) => ({ ...current, brokenElements: new Map(), repairingElements: new Set() }));
  }, []);
  const beginRepair = useCallback((id: string) => {
    setState((current) => {
      if (!current.brokenElements.has(id) || current.repairingElements.has(id)) return current;
      const repairingElements = new Set(current.repairingElements);
      repairingElements.add(id);
      return { ...current, repairingElements };
    });
  }, []);
  const repairElement = useCallback((id: string) => {
    setState((current) => {
      const brokenElements = new Map(current.brokenElements);
      brokenElements.delete(id);
      const repairingElements = new Set(current.repairingElements);
      repairingElements.delete(id);
      return { ...current, brokenElements, repairingElements };
    });
  }, []);
  const breakElement = useCallback((id: string) => {
    // No dynamic selector interpolation: IDs are matched as literal strings.
    if (!registeredElements().some((element) => element.dataset.maintenanceId === id)) return;
    const variants: readonly DamageVariant[] = ["fall", "hang", "shift", "fade", "collapse", "tilt"];
    const variant = variants[Math.floor(Math.random() * variants.length)];
    setState((current) => {
      if (!current.maintenanceMode || current.brokenElements.has(id)) return current;
      const brokenElements = new Map(current.brokenElements);
      brokenElements.set(id, variant);
      const repairingElements = new Set(current.repairingElements);
      repairingElements.delete(id);
      return { ...current, brokenElements, repairingElements };
    });
  }, []);

  const recordFirstBreak = useCallback(() => {
    if (isDiscoveryComplete(discoveryKeys.firstBreak)) return;
    completeDiscovery(discoveryKeys.firstBreak);
    setHoverHint(null);
    setShowCrewNotice(true);
  }, []);

  useEffect(() => {
    if (!showCrewNotice) return;
    const timer = window.setTimeout(() => setShowCrewNotice(false), 1600);
    return () => window.clearTimeout(timer);
  }, [showCrewNotice]);

  useLayoutEffect(() => {
    if (!state.maintenanceMode) return;
    const main = document.getElementById("main-content");
    main?.setAttribute("data-maintenance-active", "");
    const painted = paintedParts.current;
    return () => {
      main?.removeAttribute("data-maintenance-active");
      for (const element of painted) {
        element.removeAttribute("data-maintenance-damage");
        element.removeAttribute("data-maintenance-repairing");
      }
      painted.clear();
    };
  }, [state.maintenanceMode, pathname]);

  useLayoutEffect(() => {
    if (!state.maintenanceMode) return;
    const elements = registeredElements();
    for (const element of elements) {
      const variant = state.brokenElements.get(element.dataset.maintenanceId!);
      const isRepairing = state.repairingElements.has(element.dataset.maintenanceId!);
      if (variant) {
        if (element.dataset.maintenanceDamage !== variant) element.setAttribute("data-maintenance-damage", variant);
        if (isRepairing) element.setAttribute("data-maintenance-repairing", "");
        else element.removeAttribute("data-maintenance-repairing");
        paintedParts.current.add(element);
      } else {
        element.removeAttribute("data-maintenance-damage");
        element.removeAttribute("data-maintenance-repairing");
        paintedParts.current.delete(element);
      }
    }
  }, [state.maintenanceMode, state.brokenElements, state.repairingElements, pathname]);

  useEffect(() => {
    if (!state.maintenanceMode) return;
    function handleClick(event: MouseEvent) {
      // Keyboard/assistive activation and modified clicks retain normal behavior.
      if (event.detail === 0 || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      const target = event.target;
      if (!(target instanceof Element) || target.closest(protectedSelector)) return;
      if (window.getSelection()?.toString()) return;
      const element = target.closest<HTMLElement>(selector);
      if (!element || !registeredElements().includes(element)) return;
      const id = element.dataset.maintenanceId!;
      event.preventDefault();
      event.stopPropagation();
      if (state.brokenElements.has(id)) repairElement(id);
      else {
        recordFirstBreak();
        breakElement(id);
      }
    }
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [state.maintenanceMode, state.brokenElements, breakElement, recordFirstBreak, repairElement]);

  useEffect(() => {
    if (
      !state.maintenanceMode ||
      !discovery.hydrated ||
      discovery.completed[discoveryKeys.firstBreak] ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      return;
    }

    let timer: number | null = null;
    let activeElement: HTMLElement | null = null;

    function clearHint() {
      if (timer !== null) window.clearTimeout(timer);
      timer = null;
      activeElement = null;
      setHoverHint(null);
    }

    function handlePointerOver(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element) || target.closest(protectedSelector)) return;
      const element = target.closest<HTMLElement>(selector);
      if (!element || !registeredElements().includes(element) || element === activeElement) return;
      clearHint();
      activeElement = element;
      timer = window.setTimeout(() => {
        const rect = element.getBoundingClientRect();
        setHoverHint({
          left: Math.min(window.innerWidth - 36, Math.max(36, rect.left + rect.width / 2)),
          top: Math.max(28, rect.top),
        });
      }, 400);
    }

    function handlePointerOut(event: PointerEvent) {
      if (!activeElement) return;
      const related = event.relatedTarget;
      if (related instanceof Node && activeElement.contains(related)) return;
      clearHint();
    }

    document.addEventListener("pointerover", handlePointerOver, true);
    document.addEventListener("pointerout", handlePointerOut, true);
    window.addEventListener("scroll", clearHint, true);
    return () => {
      clearHint();
      document.removeEventListener("pointerover", handlePointerOver, true);
      document.removeEventListener("pointerout", handlePointerOut, true);
      window.removeEventListener("scroll", clearHint, true);
    };
  }, [state.maintenanceMode, discovery.hydrated, discovery.completed]);

  return (
    <MaintenanceContext.Provider value={{ ...state, toggleMaintenanceMode, breakElement, beginRepair, repairElement, repairAll }}>
      {children}
      {state.maintenanceMode ? (
        <MaintenanceWorkerLayer
          brokenElementIds={[...state.brokenElements.keys()]}
          beginRepair={beginRepair}
          repairElement={repairElement}
        />
      ) : null}
      {state.maintenanceMode &&
      discovery.hydrated &&
      !discovery.completed[discoveryKeys.firstBreak] ? (
        <aside aria-hidden="true" className={hintStyles.guide}>
          <p className={hintStyles.guideTitle}>
            <span className={hintStyles.desktopTitle}>CLICK SOMETHING</span>
            <span className={hintStyles.mobileTitle}>TAP TEXT TO BREAK</span>
          </p>
          <p className={hintStyles.guideCopy}>
            Break the interface. The crew will repair it.
          </p>
        </aside>
      ) : null}
      {hoverHint ? (
        <span
          aria-hidden="true"
          className={hintStyles.hoverHint}
          style={{ left: hoverHint.left, top: hoverHint.top }}
        >
          BREAK ME
        </span>
      ) : null}
      {showCrewNotice ? (
        <p aria-hidden="true" className={hintStyles.crewNotice}>
          CREW DISPATCHED
        </p>
      ) : null}
    </MaintenanceContext.Provider>
  );
}

export function MaintenanceToggle({ mark }: { mark: string }) {
  const { maintenanceMode, toggleMaintenanceMode } = useMaintenance();
  const discovery = useDiscoveryState();
  const label = `${maintenanceMode ? "Disable" : "Enable"} RGB maintenance mode`;
  return (
    <div className={`flex min-w-0 flex-wrap items-center gap-x-3 font-mono ${hintStyles.control}`}>
      <button
        type="button"
        onClick={() => {
          if (!maintenanceMode) completeDiscovery(discoveryKeys.maintenance);
          toggleMaintenanceMode();
        }}
        aria-label={label}
        aria-pressed={maintenanceMode}
        aria-describedby="maintenance-instructions"
        title={label}
        className="flex min-h-11 cursor-pointer items-center text-sm font-semibold tracking-[0.08em] text-foreground hover:text-accent"
      >
        {mark}
      </button>
      {discovery.hydrated &&
      !discovery.completed[discoveryKeys.maintenance] ? (
        <span aria-hidden="true" className={hintStyles.controlHint}>
          CLICK ME <span className={hintStyles.desktopTitle}>↑</span>
          <span className={hintStyles.mobileTitle}>←</span>
        </span>
      ) : null}
      <span role="status" className="text-[0.5625rem] uppercase tracking-[0.1em] text-accent">
        {maintenanceMode ? "MAINTENANCE / ON" : ""}
      </span>
      <span id="maintenance-instructions" className="sr-only">
        Optional visual mode. When enabled, click marked content to damage or repair it.
        Links always navigate normally. Disable to restore everything. Changing pages clears damage.
      </span>
    </div>
  );
}
