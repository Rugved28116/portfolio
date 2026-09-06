"use client";

import { usePathname } from "next/navigation";
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

type DamageVariant = "fall" | "hang" | "shift" | "fade" | "collapse" | "tilt";
type BrokenElements = ReadonlyMap<string, DamageVariant>;
type MaintenanceContextValue = {
  maintenanceMode: boolean;
  brokenElements: BrokenElements;
  toggleMaintenanceMode: () => void;
  breakElement: (id: string) => void;
  repairElement: (id: string) => void;
  repairAll: () => void;
};

const MaintenanceContext = createContext<MaintenanceContextValue | null>(null);
const selector = "[data-maintenance-breakable][data-maintenance-id]";
const protectedSelector = "nav, footer, dialog, form, button, input, select, textarea, [role='button'], [role='dialog'], [contenteditable], [data-maintenance-protected]";

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
  const paintedParts = useRef(new Set<HTMLElement>());
  const [state, setState] = useState(() => ({
    pathname,
    maintenanceMode: false,
    brokenElements: new Map<string, DamageVariant>() as BrokenElements,
  }));

  // Reset route-local damage before rendering a new page. Mode itself persists.
  if (state.pathname !== pathname) {
    setState({ ...state, pathname, brokenElements: new Map() });
  }

  const toggleMaintenanceMode = useCallback(() => {
    setState((current) => ({ ...current, maintenanceMode: !current.maintenanceMode, brokenElements: new Map() }));
  }, []);
  const repairAll = useCallback(() => {
    setState((current) => ({ ...current, brokenElements: new Map() }));
  }, []);
  const repairElement = useCallback((id: string) => {
    setState((current) => {
      const brokenElements = new Map(current.brokenElements);
      brokenElements.delete(id);
      return { ...current, brokenElements };
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
      return { ...current, brokenElements };
    });
  }, []);

  useLayoutEffect(() => {
    if (!state.maintenanceMode) return;
    const main = document.getElementById("main-content");
    main?.setAttribute("data-maintenance-active", "");
    const painted = paintedParts.current;
    return () => {
      main?.removeAttribute("data-maintenance-active");
      for (const element of painted) element.removeAttribute("data-maintenance-damage");
      painted.clear();
    };
  }, [state.maintenanceMode, pathname]);

  useLayoutEffect(() => {
    if (!state.maintenanceMode) return;
    const elements = registeredElements();
    for (const element of elements) {
      const variant = state.brokenElements.get(element.dataset.maintenanceId!);
      if (variant) {
        if (element.dataset.maintenanceDamage !== variant) element.setAttribute("data-maintenance-damage", variant);
        paintedParts.current.add(element);
      } else {
        element.removeAttribute("data-maintenance-damage");
        paintedParts.current.delete(element);
      }
    }
  }, [state.maintenanceMode, state.brokenElements, pathname]);

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
      else breakElement(id);
    }
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [state.maintenanceMode, state.brokenElements, breakElement, repairElement]);

  return (
    <MaintenanceContext.Provider value={{ ...state, toggleMaintenanceMode, breakElement, repairElement, repairAll }}>
      {children}
    </MaintenanceContext.Provider>
  );
}

export function MaintenanceToggle({ mark }: { mark: string }) {
  const { maintenanceMode, toggleMaintenanceMode } = useMaintenance();
  const label = `${maintenanceMode ? "Disable" : "Enable"} RGB maintenance mode`;
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-3 font-mono">
      <button
        type="button"
        onClick={toggleMaintenanceMode}
        aria-label={label}
        aria-pressed={maintenanceMode}
        aria-describedby="maintenance-instructions"
        title={label}
        className="flex min-h-11 cursor-pointer items-center text-sm font-semibold tracking-[0.08em] text-foreground hover:text-accent"
      >
        {mark}
      </button>
      <span role="status" className="text-[0.5625rem] uppercase tracking-[0.1em] text-accent">
        {maintenanceMode ? "MAINTENANCE / ON" : ""}
      </span>
      <span id="maintenance-instructions" className="sr-only">
        Optional visual mode. When enabled, click marked content to damage or repair it.
        Keyboard links work normally. Disable to restore everything. Changing pages clears damage.
      </span>
    </div>
  );
}
