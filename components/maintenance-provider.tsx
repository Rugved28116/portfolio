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
import transitionStyles from "./maintenance-transition.module.css";
import toggleStyles from "./maintenance-toggle.module.css";

type DamageVariant = "fall" | "hang" | "shift" | "fade" | "collapse" | "tilt";
type BrokenElements = ReadonlyMap<string, DamageVariant>;
type SystemStatus = "maintenance-on" | "restoring" | "normal" | null;
type MaintenanceContextValue = {
  maintenanceMode: boolean;
  maintenanceCrewVisible: boolean;
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
const WORKER_EXIT_DURATION = 760;

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
  const maintenanceModeRef = useRef(false);
  const statusTimers = useRef<number[]>([]);
  const workerExitTimer = useRef<number | null>(null);
  const previousPathname = useRef(pathname);
  const [showCrewNotice, setShowCrewNotice] = useState(false);
  const [hoverHint, setHoverHint] = useState<{ left: number; top: number } | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>(null);
  const [workerPresentation, setWorkerPresentation] = useState<{
    readonly phase: "inactive" | "active" | "exiting";
    readonly session: number;
  }>({ phase: "inactive", session: 0 });
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

  const clearStatusTimers = useCallback(() => {
    for (const timer of statusTimers.current) window.clearTimeout(timer);
    statusTimers.current = [];
  }, []);

  const clearWorkerExitTimer = useCallback(() => {
    if (workerExitTimer.current === null) return;
    window.clearTimeout(workerExitTimer.current);
    workerExitTimer.current = null;
  }, []);

  const showSystemTransition = useCallback((maintenanceMode: boolean) => {
    clearStatusTimers();
    const scheduleStatus = (status: SystemStatus, delay: number) => {
      const timer = window.setTimeout(() => {
        statusTimers.current = statusTimers.current.filter(
          (activeTimer) => activeTimer !== timer,
        );
        setSystemStatus(status);
      }, delay);
      statusTimers.current.push(timer);
    };

    if (maintenanceMode) {
      setSystemStatus("maintenance-on");
      scheduleStatus(null, 1250);
      return;
    }

    setSystemStatus("restoring");
    scheduleStatus("normal", 280);
    scheduleStatus(null, 760);
  }, [clearStatusTimers]);

  const toggleMaintenanceMode = useCallback(() => {
    const maintenanceMode = !maintenanceModeRef.current;
    maintenanceModeRef.current = maintenanceMode;
    clearWorkerExitTimer();
    setHoverHint(null);
    setShowCrewNotice(false);
    setState((current) => ({ ...current, maintenanceMode, brokenElements: new Map(), repairingElements: new Set() }));

    if (maintenanceMode) {
      setWorkerPresentation((current) => ({
        phase: "active",
        session: current.session + 1,
      }));
    } else if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setWorkerPresentation((current) => ({ ...current, phase: "inactive" }));
    } else {
      setWorkerPresentation((current) => ({ ...current, phase: "exiting" }));
      workerExitTimer.current = window.setTimeout(() => {
        workerExitTimer.current = null;
        setWorkerPresentation((current) =>
          current.phase === "exiting"
            ? { ...current, phase: "inactive" }
            : current,
        );
      }, WORKER_EXIT_DURATION);
    }

    showSystemTransition(maintenanceMode);
  }, [clearWorkerExitTimer, showSystemTransition]);
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
    return () => {
      clearStatusTimers();
      clearWorkerExitTimer();
    };
  }, [clearStatusTimers, clearWorkerExitTimer]);

  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;
    clearWorkerExitTimer();
    setWorkerPresentation((current) => {
      if (current.phase === "exiting") return { ...current, phase: "inactive" };
      if (current.phase === "active") return { phase: "active", session: current.session + 1 };
      return current;
    });
  }, [pathname, clearWorkerExitTimer]);

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
    <MaintenanceContext.Provider
      value={{
        ...state,
        maintenanceCrewVisible: workerPresentation.phase !== "inactive",
        toggleMaintenanceMode,
        breakElement,
        beginRepair,
        repairElement,
        repairAll,
      }}
    >
      {children}
      {workerPresentation.phase !== "inactive" ? (
        <MaintenanceWorkerLayer
          key={workerPresentation.session}
          brokenElementIds={
            workerPresentation.phase === "active"
              ? [...state.brokenElements.keys()]
              : []
          }
          beginRepair={beginRepair}
          repairElement={repairElement}
          exiting={workerPresentation.phase === "exiting"}
        />
      ) : null}
      {state.maintenanceMode &&
      systemStatus === null &&
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
      {showCrewNotice && systemStatus === null ? (
        <p aria-hidden="true" className={hintStyles.crewNotice}>
          CREW DISPATCHED
        </p>
      ) : null}
      {systemStatus ? (
        <aside
          className={transitionStyles.status}
          data-system-status={systemStatus}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className={transitionStyles.statusLabel}>RGB / SYSTEM</span>
          <span className={transitionStyles.statusValue}>
            {systemStatus === "maintenance-on"
              ? "MAINTENANCE / ON"
              : systemStatus === "restoring"
                ? "RESTORING INTERFACE..."
                : "SYSTEM / NORMAL"}
          </span>
          {systemStatus === "maintenance-on" ? (
            <span className={transitionStyles.statusDetail}>crew standing by</span>
          ) : null}
        </aside>
      ) : null}
      {systemStatus === "maintenance-on" ? (
        <span className={transitionStyles.scan} aria-hidden="true" />
      ) : null}
    </MaintenanceContext.Provider>
  );
}

export function MaintenanceToggle({ mark }: { mark: string }) {
  const { maintenanceMode, toggleMaintenanceMode } = useMaintenance();
  const discovery = useDiscoveryState();
  const [feedback, setFeedback] = useState<"maintenance" | "ok" | null>(null);
  const feedbackTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current !== null) {
        window.clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  function showFeedback(nextFeedback: "maintenance" | "ok") {
    if (feedbackTimerRef.current !== null) {
      window.clearTimeout(feedbackTimerRef.current);
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFeedback(null);
      feedbackTimerRef.current = null;
      return;
    }

    setFeedback(nextFeedback);
    feedbackTimerRef.current = window.setTimeout(
      () => {
        setFeedback(null);
        feedbackTimerRef.current = null;
      },
      nextFeedback === "maintenance" ? 650 : 500,
    );
  }

  return (
    <div className={`flex min-w-0 flex-wrap items-center gap-x-3 font-mono ${hintStyles.control}`}>
      <button
        type="button"
        onClick={() => {
          if (!maintenanceMode) completeDiscovery(discoveryKeys.maintenance);
          toggleMaintenanceMode();
          showFeedback(maintenanceMode ? "ok" : "maintenance");
        }}
        aria-label="Toggle RGB maintenance mode"
        aria-pressed={maintenanceMode}
        aria-describedby="maintenance-instructions"
        title="Toggle RGB maintenance mode"
        className={`${toggleStyles.button} flex min-h-11 cursor-pointer items-center text-sm font-semibold tracking-[0.08em] text-foreground hover:text-accent`}
      >
        <span aria-hidden="true" className={toggleStyles.visual}>
          <span
            className={`${toggleStyles.idle} ${feedback ? toggleStyles.idleHidden : ""}`}
          >
            {mark.slice(0, -1)}
            <span className={toggleStyles.cursor}>
              <span className={toggleStyles.underscore}>_</span>
              <span className={toggleStyles.block}>█</span>
            </span>
          </span>
          {feedback ? (
            <span className={toggleStyles.feedback}>
              {feedback === "maintenance" ? "RGB_MAINT" : "RGB_OK"}
            </span>
          ) : null}
        </span>
      </button>
      {discovery.hydrated &&
      !discovery.completed[discoveryKeys.maintenance] ? (
        <span
          aria-hidden="true"
          className={`${hintStyles.controlHint} ${toggleStyles.discoveryHint}`}
        >
          CLICK ME <span className={hintStyles.desktopTitle}>↑</span>
          <span className={hintStyles.mobileTitle}>←</span>
        </span>
      ) : null}
      <span id="maintenance-instructions" className="sr-only">
        Optional visual mode. When enabled, click marked content to damage or repair it.
        Links always navigate normally. Disable to restore everything. Changing pages clears damage.
      </span>
    </div>
  );
}
