"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import styles from "./maintenance-worker-layer.module.css";

type WorkerState = "spawning" | "idle" | "moving" | "repairing";
type Facing = "left" | "right";

type Worker = {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly state: WorkerState;
  readonly assignedDamageId?: string;
  readonly facing: Facing;
  readonly duration: number;
};

type WorkerSystem = {
  readonly workers: readonly Worker[];
  readonly queue: readonly string[];
};

type WorkerLayerProps = {
  readonly brokenElementIds: readonly string[];
  readonly repairElement: (id: string) => void;
};

const WORKER_WIDTH = 30;
const WORKER_HEIGHT = 34;
const HEADER_CLEARANCE = 72;
const REPAIR_DURATION = 1100;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), Math.max(minimum, maximum));
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function initialWorkers(): readonly Worker[] {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const count = width < 640 ? 3 : 5;

  return Array.from({ length: count }, (_, index) => {
    const entry = index % 3;
    const x = entry === 0 ? -WORKER_WIDTH - 8 : entry === 1 ? width + 8 : width * (0.2 + index * 0.13);
    const y = entry === 2 ? height + 8 : height * (0.25 + (index % 3) * 0.22);

    return {
      id: `rgb-worker-${String(index + 1).padStart(2, "0")}`,
      x,
      y,
      state: "spawning" as const,
      facing: entry === 1 ? "left" as const : "right" as const,
      duration: 0,
    };
  });
}

function spawnDestination(index: number) {
  const columns = [0.12, 0.84, 0.28, 0.68, 0.48];
  const rows = [0.28, 0.52, 0.74, 0.34, 0.66];
  return {
    x: clamp(window.innerWidth * columns[index], 18, window.innerWidth - WORKER_WIDTH - 18),
    y: clamp(window.innerHeight * rows[index], HEADER_CLEARANCE, window.innerHeight - WORKER_HEIGHT - 18),
  };
}

function findMaintenanceElement(id: string) {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-maintenance-id]"))
    .find((element) => element.dataset.maintenanceId === id);
}

function repairTarget(id: string) {
  const element = findMaintenanceElement(id);
  if (!element) return undefined;

  const rect = element.getBoundingClientRect();
  const visible = rect.bottom > HEADER_CLEARANCE && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
  if (!visible) return undefined;

  const roomBelow = rect.bottom + WORKER_HEIGHT + 6 < window.innerHeight;
  return {
    x: clamp(rect.left + rect.width / 2 - WORKER_WIDTH / 2, 8, window.innerWidth - WORKER_WIDTH - 8),
    y: clamp(roomBelow ? rect.bottom + 4 : rect.top - WORKER_HEIGHT - 4, HEADER_CLEARANCE, window.innerHeight - WORKER_HEIGHT - 8),
  };
}

function safeIdleDestination(worker: Worker) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const x = clamp(worker.x + (Math.random() - 0.5) * 180, 18, window.innerWidth - WORKER_WIDTH - 18);
    const y = clamp(worker.y + (Math.random() - 0.5) * 120, HEADER_CLEARANCE, window.innerHeight - WORKER_HEIGHT - 18);
    const obstruction = document.elementFromPoint(x + WORKER_WIDTH / 2, y + WORKER_HEIGHT / 2)?.closest("a[href], button, input, select, textarea, [role='button']");
    if (!obstruction) return { x, y };
  }
  return { x: worker.x, y: worker.y };
}

function movementDuration(distance: number) {
  if (prefersReducedMotion()) return 0;
  return Math.round(clamp(280 + distance * 1.25, 320, 1500));
}

function WorkerBot({ worker }: { readonly worker: Worker }) {
  const style = {
    "--worker-x": `${worker.x}px`,
    "--worker-y": `${worker.y}px`,
    "--worker-duration": `${worker.duration}ms`,
  } as CSSProperties;

  return (
    <div
      className={styles.worker}
      data-worker-id={worker.id}
      data-worker-state={worker.state}
      data-worker-assignment={worker.assignedDamageId}
      style={style}
    >
      <div className={styles.facing} data-facing={worker.facing}>
        <svg
          className={styles.bot}
          viewBox="0 0 30 34"
          width="30"
          height="34"
          focusable="false"
          shapeRendering="crispEdges"
        >
          <g className={styles.body}>
            <path className={styles.antenna} d="M14 1h2v4h-2zM12 0h6v2h-6z" />
            <path className={styles.shell} d="M7 5h16v3h3v11h-3v8H7v-8H4V8h3z" />
            <path className={styles.panel} d="M9 8h12v8H9z" />
            <path className={styles.visor} d="M11 10h8v3h-8z" />
            <path className={styles.chest} d="M11 19h8v5h-8z" />
            <path className={styles.legLeft} d="M8 27h6v5H7v-2h1z" />
            <path className={styles.legRight} d="M16 27h6v3h1v2h-7z" />
            <g className={styles.toolArm}>
              <path className={styles.arm} d="M23 17h3v8h-3z" />
              <path className={styles.tool} d="M25 22h2v5h-2zM24 26h4v2h-4zM24 20h4v2h-4z" />
            </g>
          </g>
          <path className={styles.spark} d="M27 16h2v2h-2zM25 14h2v2h-2zM27 12h2v2h-2z" />
        </svg>
      </div>
    </div>
  );
}

export function MaintenanceWorkerLayer({ brokenElementIds, repairElement }: WorkerLayerProps) {
  const [system, setSystem] = useState<WorkerSystem>(() => ({ workers: initialWorkers(), queue: [] }));
  const movementTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const repairTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const idleTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const spawnTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const brokenIdsRef = useRef(new Set(brokenElementIds));
  const brokenKey = useMemo(() => [...brokenElementIds].sort().join("\u0000"), [brokenElementIds]);

  useEffect(() => {
    brokenIdsRef.current = new Set(brokenElementIds);
  }, [brokenElementIds]);

  const updateWorker = useCallback((workerId: string, update: (worker: Worker) => Worker) => {
    setSystem((current) => ({
      ...current,
      workers: current.workers.map((worker) => worker.id === workerId ? update(worker) : worker),
    }));
  }, []);

  useEffect(() => {
    const reducedMotion = prefersReducedMotion();
    if (reducedMotion) {
      const timer = setTimeout(() => {
        setSystem((current) => ({
          ...current,
          workers: current.workers.map((worker, index) => ({
            ...worker,
            ...spawnDestination(index),
            state: "idle",
            duration: 0,
          })),
        }));
      }, 0);
      return () => clearTimeout(timer);
    }

    system.workers.forEach((worker, index) => {
      const delay = index * 140;
      const duration = 520 + index * 35;
      const destination = spawnDestination(index);
      spawnTimers.current.push(setTimeout(() => {
        updateWorker(worker.id, (current) => ({ ...current, ...destination, duration }));
      }, delay));
      spawnTimers.current.push(setTimeout(() => {
        updateWorker(worker.id, (current) => ({ ...current, state: "idle", duration: 0 }));
      }, delay + duration));
    });

    return () => {
      for (const timer of spawnTimers.current) clearTimeout(timer);
      spawnTimers.current = [];
    };
    // The initial worker set is stable for this layer's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateWorker]);

  useEffect(() => {
    const broken = new Set(brokenElementIds);
    const timer = setTimeout(() => {
      setSystem((current) => {
        let changed = false;
        const workers = current.workers.map((worker) => {
          if (!worker.assignedDamageId || broken.has(worker.assignedDamageId)) return worker;
          changed = true;
          return { ...worker, state: "idle" as const, assignedDamageId: undefined, duration: 0 };
        });
        const assigned = new Set(workers.flatMap((worker) => worker.assignedDamageId ? [worker.assignedDamageId] : []));
        const queue = current.queue.filter((id) => broken.has(id) && !assigned.has(id));
        for (const id of broken) {
          if (!assigned.has(id) && !queue.includes(id)) queue.push(id);
        }
        if (!changed && queue.length === current.queue.length && queue.every((id, index) => id === current.queue[index])) return current;
        return { workers, queue };
      });
    }, 0);
    return () => clearTimeout(timer);
    // A delimiter-safe key prevents this effect rerunning for equivalent ID sets.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brokenKey]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSystem((current) => {
        const available = current.workers.filter((worker) => worker.state === "idle");
        if (available.length === 0 || current.queue.length === 0) return current;

        const workers = [...current.workers];
        const queue = [...current.queue];
        let changed = false;

        for (const damageId of [...current.queue]) {
          if (available.length === 0) break;
          const target = repairTarget(damageId);
          if (!target) continue;

          let nearestIndex = 0;
          let nearestDistance = Number.POSITIVE_INFINITY;
          available.forEach((worker, index) => {
            const distance = Math.hypot(target.x - worker.x, target.y - worker.y);
            if (distance < nearestDistance) {
              nearestDistance = distance;
              nearestIndex = index;
            }
          });

          const worker = available.splice(nearestIndex, 1)[0];
          const workerIndex = workers.findIndex((candidate) => candidate.id === worker.id);
          workers[workerIndex] = {
            ...worker,
            ...target,
            state: "moving",
            assignedDamageId: damageId,
            facing: target.x < worker.x ? "left" : "right",
            duration: movementDuration(nearestDistance),
          };
          queue.splice(queue.indexOf(damageId), 1);
          changed = true;
        }

        return changed ? { workers, queue } : current;
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [system.queue, system.workers]);

  useEffect(() => {
    const movingIds = new Set(system.workers.filter((worker) => worker.state === "moving").map((worker) => worker.id));
    for (const [workerId, timer] of movementTimers.current) {
      if (!movingIds.has(workerId)) {
        clearTimeout(timer);
        movementTimers.current.delete(workerId);
      }
    }

    for (const worker of system.workers) {
      if (worker.state !== "moving" || movementTimers.current.has(worker.id)) continue;
      const assignment = worker.assignedDamageId;
      const timer = setTimeout(() => {
        movementTimers.current.delete(worker.id);
        if (!assignment) {
          updateWorker(worker.id, (current) => ({ ...current, state: "idle", duration: 0 }));
          return;
        }

        if (!brokenIdsRef.current.has(assignment)) {
          updateWorker(worker.id, (current) => ({ ...current, state: "idle", assignedDamageId: undefined, duration: 0 }));
          return;
        }

        const target = repairTarget(assignment);
        if (!target) {
          setSystem((current) => ({
            workers: current.workers.map((candidate) => candidate.id === worker.id ? { ...candidate, state: "idle", assignedDamageId: undefined, duration: 0 } : candidate),
            queue: current.queue.includes(assignment) ? current.queue : [...current.queue, assignment],
          }));
          return;
        }

        setSystem((current) => {
          const currentWorker = current.workers.find((candidate) => candidate.id === worker.id);
          if (!currentWorker || currentWorker.assignedDamageId !== assignment) return current;
          const distance = Math.hypot(target.x - currentWorker.x, target.y - currentWorker.y);
          return {
            ...current,
            workers: current.workers.map((candidate) => candidate.id !== worker.id ? candidate : distance > 18 ? {
              ...candidate,
              ...target,
              facing: target.x < candidate.x ? "left" : "right",
              duration: movementDuration(distance),
            } : {
              ...candidate,
              state: "repairing",
              duration: 0,
            }),
          };
        });
      }, worker.duration + 40);
      movementTimers.current.set(worker.id, timer);
    }
  }, [system.workers, updateWorker]);

  useEffect(() => {
    const repairingIds = new Set(system.workers.filter((worker) => worker.state === "repairing").map((worker) => worker.id));
    for (const [workerId, timer] of repairTimers.current) {
      if (!repairingIds.has(workerId)) {
        clearTimeout(timer);
        repairTimers.current.delete(workerId);
      }
    }

    for (const worker of system.workers) {
      if (worker.state !== "repairing" || repairTimers.current.has(worker.id)) continue;
      const assignment = worker.assignedDamageId;
      const timer = setTimeout(() => {
        repairTimers.current.delete(worker.id);
        if (assignment && brokenIdsRef.current.has(assignment)) repairElement(assignment);
        updateWorker(worker.id, (current) => ({ ...current, state: "idle", assignedDamageId: undefined, duration: 0 }));
      }, REPAIR_DURATION);
      repairTimers.current.set(worker.id, timer);
    }
  }, [system.workers, repairElement, updateWorker]);

  useEffect(() => {
    const idleIds = new Set(system.workers.filter((worker) => worker.state === "idle").map((worker) => worker.id));
    for (const [workerId, timer] of idleTimers.current) {
      if (!idleIds.has(workerId)) {
        clearTimeout(timer);
        idleTimers.current.delete(workerId);
      }
    }

    for (const worker of system.workers) {
      if (worker.state !== "idle" || idleTimers.current.has(worker.id)) continue;
      const wait = 2200 + Math.random() * 3600;
      const timer = setTimeout(() => {
        idleTimers.current.delete(worker.id);
        updateWorker(worker.id, (current) => {
          if (current.state !== "idle") return current;
          const target = safeIdleDestination(current);
          const distance = Math.hypot(target.x - current.x, target.y - current.y);
          return {
            ...current,
            ...target,
            state: "moving",
            facing: target.x < current.x ? "left" : "right",
            duration: movementDuration(distance),
          };
        });
      }, wait);
      idleTimers.current.set(worker.id, timer);
    }
  }, [system.workers, updateWorker]);

  useEffect(() => () => {
    for (const timer of movementTimers.current.values()) clearTimeout(timer);
    for (const timer of repairTimers.current.values()) clearTimeout(timer);
    for (const timer of idleTimers.current.values()) clearTimeout(timer);
    for (const timer of spawnTimers.current) clearTimeout(timer);
  }, []);

  return (
    <div className={styles.layer} aria-hidden="true" data-worker-layer data-repair-queue-size={system.queue.length}>
      {system.workers.map((worker) => <WorkerBot key={worker.id} worker={worker} />)}
    </div>
  );
}
