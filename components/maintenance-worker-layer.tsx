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

type WorkerState =
  | "spawning"
  | "idle"
  | "wandering"
  | "moving-to-rest"
  | "inspecting"
  | "inspecting-console"
  | "moving-to-job"
  | "positioning"
  | "deploying-ladder"
  | "climbing"
  | "repairing"
  | "climbing-down"
  | "packing-ladder"
  | "celebrating"
  | "resting";
type WorkerPersonality = "engineer" | "inspector" | "carrier" | "slacker" | "generalist";
type Facing = "left" | "right";
type AfterMove = "idle" | "inspecting" | "resting";
type EquipmentType = "ladder" | "scaffold";
type RestKind = "bench" | "crate" | "console";

type RestSlot = {
  readonly id: string;
  readonly kind: RestKind;
  readonly point: Point;
};

type Scaffold = {
  readonly id: string;
  readonly damageIds: readonly string[];
  readonly x: number;
  readonly platformY: number;
  readonly width: number;
  readonly visible: boolean;
};

type Worker = {
  readonly id: string;
  readonly personality: WorkerPersonality;
  readonly x: number;
  readonly y: number;
  readonly state: WorkerState;
  readonly assignedDamageId?: string;
  readonly activityTargetId?: string;
  readonly afterMove?: AfterMove;
  readonly facing: Facing;
  readonly duration: number;
  readonly pauseDuration?: number;
  readonly carrying: boolean;
  readonly climbing: boolean;
  readonly equipment?: EquipmentType;
  readonly scaffoldId?: string;
  readonly repairX?: number;
  readonly repairY?: number;
  readonly baseX?: number;
  readonly baseY?: number;
  readonly equipmentX?: number;
  readonly equipmentY?: number;
  readonly equipmentHeight?: number;
  readonly restSlotId?: string;
  readonly restKind?: RestKind;
};

type WorkerSystem = {
  readonly workers: readonly Worker[];
  readonly queue: readonly string[];
  readonly scaffolds: readonly Scaffold[];
};

type WorkerLayerProps = {
  readonly brokenElementIds: readonly string[];
  readonly beginRepair: (id: string) => void;
  readonly repairElement: (id: string) => void;
};

type Point = { readonly x: number; readonly y: number };
type ScheduledTask = {
  readonly signature: string;
  readonly timer: ReturnType<typeof setTimeout>;
};
type SpeechContext = "damage" | "cluster" | "inspection" | "repair" | "completion" | "rest";
type WorkerSpeech = {
  readonly workerId: string;
  readonly text: string;
  readonly context: SpeechContext;
  readonly duration: number;
  readonly expiresAt: number;
};

const WORKER_WIDTH = 30;
const WORKER_HEIGHT = 34;
const HEADER_CLEARANCE = 72;
const POSITIONING_DURATION = 220;
const DAMAGE_INSPECTION_DURATION = 360;
const CELEBRATION_DURATION = 360;
const LADDER_THRESHOLD = 75;
const LADDER_DEPLOY_DURATION = 300;
const LADDER_PACK_DURATION = 220;
const speechPhrases: Record<WorkerPersonality, Record<Exclude<SpeechContext, "damage" | "cluster">, readonly string[]>> = {
  engineer: {
    inspection: ["checking alignment"],
    repair: ["repairing", "almost there"],
    completion: ["system stable", "that should hold"],
    rest: ["system stable"],
  },
  inspector: {
    inspection: ["inspection", "checking integrity", "interesting", "no fault detected"],
    repair: ["checking integrity"],
    completion: ["looks stable"],
    rest: ["logs look clean"],
  },
  carrier: {
    inspection: ["tooling ready"],
    repair: ["parts incoming", "got the replacement", "tooling ready"],
    completion: ["delivery complete"],
    rest: ["restocking"],
  },
  slacker: {
    inspection: ["quality control", "totally working"],
    repair: ["busy.", "totally working"],
    completion: ["quality control"],
    rest: ["on break", "five more minutes", "maintenance pause", "totally necessary"],
  },
  generalist: {
    inspection: ["checking"],
    repair: ["on it", "repair queued"],
    completion: ["done"],
    rest: ["checking"],
  },
};
const damageSpeech = ["new fault", "damage detected", "again?", "repair requested"] as const;
const clusterSpeech = ["that's a lot", "crew needed", "multiple faults"] as const;
const desktopPersonalities: readonly WorkerPersonality[] = [
  "engineer",
  "inspector",
  "carrier",
  "slacker",
  "generalist",
];
const mobilePersonalities: readonly WorkerPersonality[] = [
  "engineer",
  "inspector",
  "generalist",
];

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), Math.max(minimum, maximum));
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function hashText(value: string) {
  let hash = 0;
  for (const character of value) hash = (hash * 31 + character.charCodeAt(0)) | 0;
  return Math.abs(hash);
}

function phrasesFor(personality: WorkerPersonality, context: SpeechContext) {
  if (context === "damage") return damageSpeech;
  if (context === "cluster") return clusterSpeech;
  return speechPhrases[personality][context];
}

function initialWorkers(): readonly Worker[] {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const personalities = width < 640 ? mobilePersonalities : desktopPersonalities;

  return personalities.map((personality, index) => {
    const edge = index % 3;
    return {
      id: `rgb-worker-${String(index + 1).padStart(2, "0")}`,
      personality,
      x: edge === 0 ? -WORKER_WIDTH - 8 : edge === 1 ? width + 8 : width * (0.2 + index * 0.13),
      y: edge === 2 ? height + 8 : height * (0.25 + (index % 3) * 0.22),
      state: "spawning",
      facing: edge === 1 ? "left" : "right",
      duration: 0,
      carrying: false,
      climbing: false,
    };
  });
}

function spawnDestination(index: number): Point {
  const columns = [0.12, 0.84, 0.28, 0.68, 0.48];
  const rows = [0.28, 0.52, 0.74, 0.34, 0.66];
  return {
    x: clamp(window.innerWidth * columns[index], 18, window.innerWidth - WORKER_WIDTH - 18),
    y: clamp(window.innerHeight * rows[index], HEADER_CLEARANCE, window.innerHeight - WORKER_HEIGHT - 18),
  };
}

function registeredParts() {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-maintenance-breakable][data-maintenance-id]"));
}

function findMaintenanceElement(id: string) {
  return registeredParts().find((element) => element.dataset.maintenanceId === id);
}

function visibleRect(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return rect.bottom > HEADER_CLEARANCE && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth
    ? rect
    : undefined;
}

function positionIsClear(point: Point) {
  return !document
    .elementFromPoint(point.x + WORKER_WIDTH / 2, point.y + WORKER_HEIGHT / 2)
    ?.closest("button, input, select, textarea, [role='button']");
}

function targetBesideElement(id: string, occupied: readonly Worker[]): Point | undefined {
  const element = findMaintenanceElement(id);
  if (!element) return undefined;
  const rect = visibleRect(element);
  if (!rect) return undefined;

  const candidates: Point[] = [
    { x: rect.left - WORKER_WIDTH / 2, y: rect.bottom + 4 },
    { x: rect.right - WORKER_WIDTH / 2, y: rect.bottom + 4 },
    { x: rect.left - WORKER_WIDTH - 6, y: rect.top + rect.height / 2 - WORKER_HEIGHT / 2 },
    { x: rect.right + 6, y: rect.top + rect.height / 2 - WORKER_HEIGHT / 2 },
  ].filter((point) =>
    point.x >= 8 &&
    point.x <= window.innerWidth - WORKER_WIDTH - 8 &&
    point.y >= HEADER_CLEARANCE &&
    point.y <= window.innerHeight - WORKER_HEIGHT - 8,
  );

  const fallback = {
    x: clamp(rect.left + rect.width / 2 - WORKER_WIDTH / 2, 8, window.innerWidth - WORKER_WIDTH - 8),
    y: clamp(rect.bottom + 4, HEADER_CLEARANCE, window.innerHeight - WORKER_HEIGHT - 8),
  };
  const options = candidates.length > 0 ? candidates : [fallback];
  const offset = hashText(id) % options.length;
  const ordered = [...options.slice(offset), ...options.slice(0, offset)];

  return ordered
    .map((point) => ({
      point,
      clear: positionIsClear(point),
      separation: occupied.length === 0
        ? Number.POSITIVE_INFINITY
        : Math.min(...occupied.map((worker) => Math.hypot(point.x - worker.x, point.y - worker.y))),
    }))
    .sort((a, b) => Number(b.clear) - Number(a.clear) || b.separation - a.separation)[0]?.point;
}

function scaffoldGeometry(id: string, damageIds: readonly string[]): Scaffold | undefined {
  const rects = damageIds.flatMap((damageId) => {
    const element = findMaintenanceElement(damageId);
    const rect = element ? visibleRect(element) : undefined;
    return rect ? [rect] : [];
  });
  if (rects.length === 0) return undefined;

  const minimumX = Math.min(...rects.map((rect) => rect.left));
  const maximumX = Math.max(...rects.map((rect) => rect.right));
  const maximumY = Math.max(...rects.map((rect) => rect.bottom));
  const width = clamp(maximumX - minimumX + 24, 54, 260);
  return {
    id,
    damageIds,
    x: clamp(minimumX - 12, 8, window.innerWidth - width - 8),
    platformY: clamp(maximumY + WORKER_HEIGHT + 8, HEADER_CLEARANCE + WORKER_HEIGHT, window.innerHeight - 44),
    width,
    visible: true,
  };
}

function reconcileScaffolds(existing: readonly Scaffold[], brokenIds: readonly string[]) {
  const broken = new Set(brokenIds);
  const retained = existing.flatMap((scaffold) => {
    const activeIds = scaffold.damageIds.filter((id) => broken.has(id));
    if (activeIds.length === 0) return [];
    const geometry = scaffoldGeometry(scaffold.id, scaffold.damageIds);
    return [{ ...scaffold, ...(geometry ?? {}), visible: geometry !== undefined }];
  });
  const claimed = new Set(retained.flatMap((scaffold) => scaffold.damageIds));
  const remaining = brokenIds.filter((id) => !claimed.has(id));
  const created: Scaffold[] = [];
  const used = new Set<string>();

  for (const seedId of remaining) {
    if (used.has(seedId)) continue;
    const seed = findMaintenanceElement(seedId);
    const seedRect = seed ? visibleRect(seed) : undefined;
    if (!seedRect) continue;
    const cluster = [seedId];
    let minimumX = seedRect.left;
    let maximumX = seedRect.right;
    let minimumY = seedRect.top;
    let maximumY = seedRect.bottom;

    for (const candidateId of remaining) {
      if (candidateId === seedId || used.has(candidateId)) continue;
      const candidate = findMaintenanceElement(candidateId);
      const rect = candidate ? visibleRect(candidate) : undefined;
      if (!rect) continue;
      const nextMinimumX = Math.min(minimumX, rect.left);
      const nextMaximumX = Math.max(maximumX, rect.right);
      const nextMinimumY = Math.min(minimumY, rect.top);
      const nextMaximumY = Math.max(maximumY, rect.bottom);
      if (nextMaximumX - nextMinimumX <= 250 && nextMaximumY - nextMinimumY <= 140) {
        cluster.push(candidateId);
        minimumX = nextMinimumX;
        maximumX = nextMaximumX;
        minimumY = nextMinimumY;
        maximumY = nextMaximumY;
      }
    }

    if (cluster.length >= 3) {
      cluster.forEach((id) => used.add(id));
      const sortedIds = [...cluster].sort();
      const scaffold = scaffoldGeometry(`rgb-scaffold-${hashText(sortedIds.join("|"))}`, sortedIds);
      if (scaffold) created.push(scaffold);
    }
  }

  return [...retained, ...created];
}

function scaffoldRepairPoint(scaffold: Scaffold, damageId: string): Point | undefined {
  if (!scaffold.visible) return undefined;
  const element = findMaintenanceElement(damageId);
  const rect = element ? visibleRect(element) : undefined;
  if (!rect) return undefined;
  const slot = scaffold.damageIds.indexOf(damageId);
  const offset = (slot - (scaffold.damageIds.length - 1) / 2) * 4;
  return {
    x: clamp(rect.left + rect.width / 2 - WORKER_WIDTH / 2 + offset, scaffold.x + 3, scaffold.x + scaffold.width - WORKER_WIDTH - 3),
    y: scaffold.platformY - WORKER_HEIGHT,
  };
}

function jobPlan(worker: Worker, damageId: string, scaffolds: readonly Scaffold[], occupied: readonly Worker[]) {
  const scaffold = scaffolds.find((candidate) => candidate.damageIds.includes(damageId));
  const repairPoint = scaffold
    ? scaffoldRepairPoint(scaffold, damageId)
    : targetBesideElement(damageId, occupied);
  if (!repairPoint) return undefined;

  if (scaffold) {
    return {
      destination: repairPoint,
      equipment: "scaffold" as const,
      scaffoldId: scaffold.id,
      repairX: repairPoint.x,
      repairY: repairPoint.y,
    };
  }

  const verticalDifference = worker.y - repairPoint.y;
  if (verticalDifference > LADDER_THRESHOLD) {
    const ladderHeight = clamp(verticalDifference + 4, 40, 90);
    const basePoint = {
      x: repairPoint.x,
      y: clamp(repairPoint.y + ladderHeight - 4, HEADER_CLEARANCE, window.innerHeight - WORKER_HEIGHT - 8),
    };
    return {
      destination: basePoint,
      equipment: "ladder" as const,
      repairX: repairPoint.x,
      repairY: repairPoint.y,
      baseX: basePoint.x,
      baseY: basePoint.y,
      equipmentX: repairPoint.x + 7,
      equipmentY: repairPoint.y + WORKER_HEIGHT - 4,
      equipmentHeight: basePoint.y - repairPoint.y + 4,
    };
  }

  return {
    destination: repairPoint,
    equipment: undefined,
    repairX: repairPoint.x,
    repairY: repairPoint.y,
  };
}

function refreshedJobPlan(worker: Worker, damageId: string, scaffolds: readonly Scaffold[], occupied: readonly Worker[]) {
  const scaffold = scaffolds.find((candidate) => candidate.damageIds.includes(damageId));
  if (scaffold || worker.equipment !== "ladder") return jobPlan(worker, damageId, scaffolds, occupied);

  const repairPoint = targetBesideElement(damageId, occupied);
  if (!repairPoint) return undefined;
  const requestedHeight = clamp(worker.equipmentHeight ?? LADDER_THRESHOLD, 40, 90);
  const baseY = clamp(repairPoint.y + requestedHeight - 4, HEADER_CLEARANCE, window.innerHeight - WORKER_HEIGHT - 8);
  return {
    destination: { x: repairPoint.x, y: baseY },
    equipment: "ladder" as const,
    repairX: repairPoint.x,
    repairY: repairPoint.y,
    baseX: repairPoint.x,
    baseY,
    equipmentX: repairPoint.x + 7,
    equipmentY: repairPoint.y + WORKER_HEIGHT - 4,
    equipmentHeight: baseY - repairPoint.y + 4,
  };
}

function crewBayIsNear() {
  const bay = document.querySelector<HTMLElement>("[data-maintenance-crew-bay]");
  if (!bay) return false;
  const rect = bay.getBoundingClientRect();
  return rect.top < window.innerHeight + 240 && rect.bottom > HEADER_CLEARANCE - 160;
}

function findRestSlot(id: string): RestSlot | undefined {
  const element = Array.from(document.querySelectorAll<HTMLElement>("[data-maintenance-rest-slot]"))
    .find((candidate) => candidate.dataset.maintenanceRestSlot === id);
  const kind = element?.dataset.restKind as RestKind | undefined;
  const rect = element?.getBoundingClientRect();
  if (!element || !kind || !rect || rect.width === 0 || rect.height === 0) return undefined;
  return { id, kind, point: { x: rect.left, y: rect.top } };
}

function chooseRestSlot(worker: Worker, workers: readonly Worker[]): RestSlot | undefined {
  if (!crewBayIsNear()) return undefined;
  const capacity = window.innerWidth < 640 ? 1 : 2;
  const reserved = new Set(workers.flatMap((candidate) => candidate.restSlotId ? [candidate.restSlotId] : []));
  if (reserved.size >= capacity) return undefined;

  const chance: Record<WorkerPersonality, number> = {
    slacker: 1,
    carrier: 0.34,
    inspector: 0.28,
    generalist: 0.12,
    engineer: 0.06,
  };
  if (Math.random() > chance[worker.personality]) return undefined;

  const preference: Record<WorkerPersonality, readonly RestKind[]> = {
    slacker: ["bench", "crate"],
    carrier: ["crate", "bench"],
    inspector: ["console", "bench"],
    generalist: ["bench", "console"],
    engineer: ["bench", "console"],
  };
  const slots = Array.from(document.querySelectorAll<HTMLElement>("[data-maintenance-rest-slot]"))
    .flatMap((element) => {
      const id = element.dataset.maintenanceRestSlot;
      return id && !reserved.has(id) ? [findRestSlot(id)].filter((slot): slot is RestSlot => slot !== undefined) : [];
    });

  for (const kind of preference[worker.personality]) {
    const matching = slots.filter((slot) => slot.kind === kind);
    if (matching.length > 0) return matching[hashText(worker.id) % matching.length];
  }
  return undefined;
}

function restDuration(worker: Worker, kind: RestKind) {
  if (kind === "console") return 3000 + Math.random() * 2000;
  if (kind === "crate") return 2500 + Math.random() * 2000;
  return worker.personality === "slacker"
    ? 4000 + Math.random() * 5000
    : 4000 + Math.random() * 2500;
}

function safeIdleDestination(worker: Worker): Point {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const point = {
      x: clamp(worker.x + (Math.random() - 0.5) * 180, 18, window.innerWidth - WORKER_WIDTH - 18),
      y: clamp(worker.y + (Math.random() - 0.5) * 120, HEADER_CLEARANCE, window.innerHeight - WORKER_HEIGHT - 18),
    };
    if (positionIsClear(point)) return point;
  }
  return { x: worker.x, y: worker.y };
}

function restingDestination(worker: Worker): Point {
  return {
    x: hashText(worker.id) % 2 === 0 ? 18 : window.innerWidth - WORKER_WIDTH - 18,
    y: clamp(worker.y + (Math.random() - 0.5) * 160, HEADER_CLEARANCE, window.innerHeight - WORKER_HEIGHT - 18),
  };
}

function inspectionDestination(worker: Worker): { readonly point: Point; readonly id: string } | undefined {
  const intactVisible = registeredParts().filter((element) =>
    !element.hasAttribute("data-maintenance-damage") && visibleRect(element) !== undefined,
  );
  if (intactVisible.length === 0) return undefined;
  const element = intactVisible[hashText(`${worker.id}-${Date.now() >> 12}`) % intactVisible.length];
  const id = element.dataset.maintenanceId;
  if (!id) return undefined;
  const point = targetBesideElement(id, []);
  return point ? { point, id } : undefined;
}

function movementDuration(distance: number) {
  if (prefersReducedMotion()) return 0;
  return Math.round(clamp(280 + distance * 1.25, 320, 1500));
}

function repairDuration(personality: WorkerPersonality) {
  if (personality === "engineer") return 850;
  if (personality === "carrier") return 1120;
  if (personality === "slacker") return 1220;
  return 1020;
}

function idleWait(personality: WorkerPersonality) {
  const ranges: Record<WorkerPersonality, readonly [number, number]> = {
    engineer: [2400, 4400],
    inspector: [1900, 3400],
    carrier: [2800, 5200],
    slacker: [3600, 6200],
    generalist: [2300, 4800],
  };
  const [minimum, maximum] = ranges[personality];
  return minimum + Math.random() * (maximum - minimum);
}

function shouldCarry(worker: Worker, damageId: string) {
  return worker.personality === "carrier" && hashText(damageId) % 2 === 0;
}

function WorkerBot({ worker, speech }: { readonly worker: Worker; readonly speech?: WorkerSpeech }) {
  const style = {
    "--worker-x": `${worker.x}px`,
    "--worker-y": `${worker.y}px`,
    "--worker-duration": `${worker.duration}ms`,
  } as CSSProperties;
  const speechStyle = speech ? {
    "--speech-lifetime": `${speech.duration}ms`,
  } as CSSProperties : undefined;
  const bubbleSide = worker.x > window.innerWidth - 170 ? "left" : "right";
  const bubbleVertical = worker.y < HEADER_CLEARANCE + 54 ? "below" : "above";

  return (
    <div
      className={styles.worker}
      data-worker-id={worker.id}
      data-worker-state={worker.state}
      data-worker-personality={worker.personality}
      data-worker-assignment={worker.assignedDamageId}
      data-worker-carrying={worker.carrying ? "true" : undefined}
      data-worker-climbing={worker.climbing ? "true" : undefined}
      data-worker-equipment={worker.equipment}
      data-worker-rest-slot={worker.restSlotId}
      data-worker-rest-kind={worker.restKind}
      style={style}
    >
      {speech ? (
        <span
          className={styles.speechBubble}
          data-worker-speech={speech.context}
          data-bubble-side={bubbleSide}
          data-bubble-vertical={bubbleVertical}
          aria-hidden="true"
          style={speechStyle}
        >
          {speech.text}
        </span>
      ) : null}
      <div className={styles.facing} data-facing={worker.facing}>
        <svg className={styles.bot} viewBox="0 0 30 34" width="30" height="34" focusable="false" shapeRendering="crispEdges">
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
            <path className={styles.cargo} d="M1 21h7v7H1zM3 19h3v2H3z" />
          </g>
          <path className={styles.inspectBeam} d="M20 11h5v1h-5zM22 13h5v1h-5z" />
          <path className={styles.spark} d="M27 16h2v2h-2zM25 14h2v2h-2zM27 12h2v2h-2z" />
        </svg>
      </div>
    </div>
  );
}

function WorkerLadder({ worker }: { readonly worker: Worker }) {
  if (
    worker.equipment !== "ladder" ||
    !["deploying-ladder", "climbing", "inspecting", "repairing", "climbing-down", "packing-ladder"].includes(worker.state) ||
    worker.equipmentX === undefined ||
    worker.equipmentY === undefined ||
    worker.equipmentHeight === undefined
  ) return null;

  const style = {
    "--equipment-x": `${worker.equipmentX}px`,
    "--equipment-y": `${worker.equipmentY}px`,
    "--ladder-height": `${worker.equipmentHeight}px`,
  } as CSSProperties;

  return (
    <div className={styles.ladder} data-equipment-id={`ladder-${worker.id}`} data-equipment-phase={worker.state} style={style}>
      <span className={styles.ladderRungs} />
      <span className={styles.ladderMarker} />
    </div>
  );
}

function WorkerScaffold({ scaffold }: { readonly scaffold: Scaffold }) {
  if (!scaffold.visible) return null;
  const style = {
    "--equipment-x": `${scaffold.x}px`,
    "--equipment-y": `${scaffold.platformY}px`,
    "--scaffold-width": `${scaffold.width}px`,
  } as CSSProperties;

  return (
    <div className={styles.scaffold} data-equipment-id={scaffold.id} style={style}>
      <span className={styles.scaffoldPlatform} />
      <span className={styles.scaffoldFrame} />
      <span className={styles.scaffoldMarker} />
    </div>
  );
}

export function MaintenanceWorkerLayer({ brokenElementIds, beginRepair, repairElement }: WorkerLayerProps) {
  const [system, setSystem] = useState<WorkerSystem>(() => ({ workers: initialWorkers(), queue: [], scaffolds: [] }));
  const [speech, setSpeech] = useState<readonly WorkerSpeech[]>([]);
  const [viewportRevision, setViewportRevision] = useState(0);
  const stateTasks = useRef(new Map<string, ScheduledTask>());
  const spawnTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const speechTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const speechRef = useRef<readonly WorkerSpeech[]>([]);
  const globalSpeechCooldownUntil = useRef(0);
  const workerSpeechCooldowns = useRef(new Map<string, number>());
  const lastWorkerPhrase = useRef(new Map<string, string>());
  const previousWorkerStates = useRef(new Map<string, WorkerState>());
  const previousBrokenIds = useRef(new Set(brokenElementIds));
  const reactedScaffolds = useRef(new Set<string>());
  const viewportFrame = useRef<number | undefined>(undefined);
  const brokenIdsRef = useRef(new Set(brokenElementIds));
  const brokenKey = useMemo(() => [...brokenElementIds].sort().join("\u0000"), [brokenElementIds]);
  const scaffoldKey = useMemo(() => system.scaffolds.map((scaffold) => scaffold.id).sort().join("\u0000"), [system.scaffolds]);

  const dismissSpeech = useCallback((workerId: string) => {
    const timer = speechTimers.current.get(workerId);
    if (timer) clearTimeout(timer);
    speechTimers.current.delete(workerId);
    const next = speechRef.current.filter((entry) => entry.workerId !== workerId);
    if (next.length === speechRef.current.length) return;
    speechRef.current = next;
    setSpeech(next);
  }, []);

  const trySpeak = useCallback((worker: Worker, context: SpeechContext) => {
    const now = Date.now();
    const notable = context === "cluster";
    if (globalSpeechCooldownUntil.current === 0) {
      globalSpeechCooldownUntil.current = now + 8000;
      if (!notable) return false;
    }
    if (!notable && now < globalSpeechCooldownUntil.current) return false;
    if (!notable && now < (workerSpeechCooldowns.current.get(worker.id) ?? 0)) return false;

    const chance: Record<SpeechContext, number> = {
      damage: 0.28,
      cluster: 0.82,
      inspection: 0.16,
      repair: 0.12,
      completion: 0.24,
      rest: 0.2,
    };
    const mobileAdjustment = window.innerWidth < 640 ? 0.55 : 1;
    if (Math.random() > chance[context] * mobileAdjustment) return false;

    const active = speechRef.current.filter((entry) => entry.expiresAt > now);
    if (active.some((entry) => entry.workerId === worker.id)) return false;
    const limit = notable && window.innerWidth >= 640 ? 2 : 1;
    if (active.length >= limit) return false;

    const pool = phrasesFor(worker.personality, context);
    const previous = lastWorkerPhrase.current.get(worker.id);
    const options = pool.filter((phrase) => phrase !== previous);
    const available = options.length > 0 ? options : pool;
    const text = available[Math.floor(Math.random() * available.length)];
    const duration = Math.round(window.innerWidth < 640
      ? 1200 + Math.random() * 700
      : 1400 + Math.random() * 1100);
    const entry: WorkerSpeech = { workerId: worker.id, text, context, duration, expiresAt: now + duration };
    const next = [...active, entry];

    speechRef.current = next;
    setSpeech(next);
    lastWorkerPhrase.current.set(worker.id, text);
    workerSpeechCooldowns.current.set(worker.id, now + 12000);
    globalSpeechCooldownUntil.current = now + (window.innerWidth < 640
      ? 14000 + Math.random() * 6000
      : 8000 + Math.random() * 12000);
    speechTimers.current.set(worker.id, setTimeout(() => dismissSpeech(worker.id), duration));
    return true;
  }, [dismissSpeech]);

  useEffect(() => {
    brokenIdsRef.current = new Set(brokenElementIds);
  }, [brokenElementIds]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const previous = previousBrokenIds.current;
      const added = brokenElementIds.filter((id) => !previous.has(id));
      previousBrokenIds.current = new Set(brokenElementIds);
      const damageId = added[0];
      if (!damageId) return;
      const element = findMaintenanceElement(damageId);
      const rect = element ? visibleRect(element) : undefined;
      const candidates = system.workers.filter((worker) => worker.state !== "spawning");
      if (!rect || candidates.length === 0) return;
      const target = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      const worker = [...candidates].sort((a, b) =>
        Math.hypot(a.x - target.x, a.y - target.y) - Math.hypot(b.x - target.x, b.y - target.y))[0];
      trySpeak(worker, "damage");
    }, 0);
    return () => clearTimeout(timer);
    // IDs are compared as a set; worker movement must not retrigger damage reactions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brokenKey, trySpeak]);

  useEffect(() => {
    const timer = setTimeout(() => {
      for (const scaffold of system.scaffolds) {
        if (reactedScaffolds.current.has(scaffold.id)) continue;
        reactedScaffolds.current.add(scaffold.id);
        const speakingWorkerIds = new Set(speechRef.current.map((entry) => entry.workerId));
        const assigned = system.workers.find((worker) =>
          !speakingWorkerIds.has(worker.id) && worker.assignedDamageId && scaffold.damageIds.includes(worker.assignedDamageId));
        const available = assigned ?? system.workers.find((worker) =>
          worker.state !== "spawning" && !speakingWorkerIds.has(worker.id));
        if (available) trySpeak(available, "cluster");
      }
    }, 0);
    return () => clearTimeout(timer);
    // Geometry changes do not create a new cluster reaction.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scaffoldKey, trySpeak]);

  useEffect(() => {
    const timer = setTimeout(() => {
      for (const worker of system.workers) {
        const previous = previousWorkerStates.current.get(worker.id);
        previousWorkerStates.current.set(worker.id, worker.state);
        if (!previous || previous === worker.state) continue;
        if (worker.state === "inspecting" && !worker.assignedDamageId) trySpeak(worker, "inspection");
        else if (worker.state === "repairing") trySpeak(worker, "repair");
        else if (worker.state === "celebrating") trySpeak(worker, "completion");
        else if (worker.state === "resting" || worker.state === "inspecting-console") trySpeak(worker, "rest");
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [system.workers, trySpeak]);

  useEffect(() => {
    const timer = setTimeout(() => {
      for (const entry of speechRef.current) {
        if (entry.context !== "rest") continue;
        const worker = system.workers.find((candidate) => candidate.id === entry.workerId);
        if (!worker || worker.assignedDamageId || !["resting", "inspecting-console"].includes(worker.state)) {
          dismissSpeech(entry.workerId);
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [system.workers, dismissSpeech]);

  useEffect(() => {
    function refreshViewport() {
      if (viewportFrame.current !== undefined) return;
      viewportFrame.current = requestAnimationFrame(() => {
        viewportFrame.current = undefined;
        setViewportRevision((revision) => revision + 1);
      });
    }
    window.addEventListener("scroll", refreshViewport, { passive: true });
    window.addEventListener("resize", refreshViewport);
    return () => {
      window.removeEventListener("scroll", refreshViewport);
      window.removeEventListener("resize", refreshViewport);
      if (viewportFrame.current !== undefined) cancelAnimationFrame(viewportFrame.current);
    };
  }, []);

  const updateWorker = useCallback((workerId: string, update: (worker: Worker) => Worker) => {
    setSystem((current) => {
      let changed = false;
      const workers = current.workers.map((worker) => {
        if (worker.id !== workerId) return worker;
        const next = update(worker);
        changed = next !== worker;
        return next;
      });
      return changed ? { ...current, workers } : current;
    });
  }, []);

  useEffect(() => {
    const reducedMotion = prefersReducedMotion();
    system.workers.forEach((worker, index) => {
      const delay = reducedMotion ? 0 : index * 140;
      const duration = reducedMotion ? 0 : 520 + index * 35;
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
    // The initial worker set remains stable until the layer unmounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateWorker]);

  useEffect(() => {
    const broken = new Set(brokenElementIds);
    const timer = setTimeout(() => {
      setSystem((current) => {
        let changed = false;
        const postRepairStates = new Set<WorkerState>(["climbing-down", "packing-ladder", "celebrating"]);
        let workers = current.workers.map((worker) => {
          if (!worker.assignedDamageId || broken.has(worker.assignedDamageId) || postRepairStates.has(worker.state)) return worker;
          changed = true;
          return {
            ...worker,
            state: "idle" as const,
            assignedDamageId: undefined,
            activityTargetId: undefined,
            afterMove: undefined,
            carrying: false,
            climbing: false,
            equipment: undefined,
            scaffoldId: undefined,
            duration: 0,
          };
        });
        const scaffolds = reconcileScaffolds(current.scaffolds, brokenElementIds);
        workers = workers.map((worker) => {
          if (!worker.restSlotId) return worker;
          const slot = crewBayIsNear() ? findRestSlot(worker.restSlotId) : undefined;
          if (!slot) {
            changed = true;
            return {
              ...worker,
              state: "idle" as const,
              restSlotId: undefined,
              restKind: undefined,
              pauseDuration: undefined,
              carrying: false,
              duration: 0,
            };
          }
          if (worker.x === slot.point.x && worker.y === slot.point.y) return worker;
          changed = true;
          const distance = Math.hypot(slot.point.x - worker.x, slot.point.y - worker.y);
          return {
            ...worker,
            ...slot.point,
            facing: slot.point.x < worker.x ? "left" as const : "right" as const,
            duration: worker.state === "moving-to-rest" ? movementDuration(distance) : 0,
          };
        });
        const activeJobStates = new Set<WorkerState>([
          "moving-to-job",
          "positioning",
          "deploying-ladder",
          "climbing",
          "inspecting",
          "repairing",
        ]);
        workers = workers.map((worker) => {
          if (!worker.assignedDamageId || !activeJobStates.has(worker.state)) return worker;
          const occupied = workers.filter((candidate) => candidate.id !== worker.id && candidate.assignedDamageId !== undefined);
          const plan = refreshedJobPlan(worker, worker.assignedDamageId, scaffolds, occupied);
          if (!plan) {
            changed = true;
            return {
              ...worker,
              state: "idle" as const,
              assignedDamageId: undefined,
              carrying: false,
              climbing: false,
              equipment: undefined,
              scaffoldId: undefined,
              duration: 0,
            };
          }

          const { destination, ...equipmentPlan } = plan;
          const atRepairPosition = ["climbing", "inspecting", "repairing"].includes(worker.state);
          const position = atRepairPosition && plan.repairX !== undefined && plan.repairY !== undefined
            ? { x: plan.repairX, y: plan.repairY }
            : destination;
          const migratingToScaffold = plan.equipment === "scaffold" && worker.scaffoldId !== plan.scaffoldId &&
            ["moving-to-job", "positioning", "deploying-ladder"].includes(worker.state);
          const migrationDistance = Math.hypot(destination.x - worker.x, destination.y - worker.y);
          const next = {
            ...worker,
            ...equipmentPlan,
            ...position,
            state: migratingToScaffold ? "moving-to-job" as const : worker.state,
            facing: position.x < worker.x ? "left" as const : "right" as const,
            duration: migratingToScaffold ? movementDuration(migrationDistance) : worker.duration,
            climbing: migratingToScaffold ? false : worker.climbing,
          };
          const equipmentChanged = [
            "equipment",
            "scaffoldId",
            "repairX",
            "repairY",
            "baseX",
            "baseY",
            "equipmentX",
            "equipmentY",
            "equipmentHeight",
            "x",
            "y",
          ].some((key) => worker[key as keyof Worker] !== next[key as keyof Worker]);
          if (!equipmentChanged) return worker;
          changed = true;
          return next;
        });
        const assigned = new Set(workers.flatMap((worker) => worker.assignedDamageId ? [worker.assignedDamageId] : []));
        const queue = current.queue.filter((id) => broken.has(id) && !assigned.has(id));
        for (const id of broken) {
          if (!assigned.has(id) && !queue.includes(id)) queue.push(id);
        }
        const scaffoldChanged = JSON.stringify(scaffolds) !== JSON.stringify(current.scaffolds);
        if (!changed && !scaffoldChanged && queue.length === current.queue.length && queue.every((id, index) => id === current.queue[index])) return current;
        return { workers, queue, scaffolds };
      });
    }, 0);
    return () => clearTimeout(timer);
    // IDs are compared as a set while insertion order remains the queue's age order.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brokenKey, viewportRevision]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSystem((current) => {
        const availableStates = new Set<WorkerState>([
          "idle",
          "wandering",
          "moving-to-rest",
          "inspecting",
          "inspecting-console",
          "resting",
        ]);
        const available = current.workers.filter((worker) => availableStates.has(worker.state));
        if (available.length === 0 || current.queue.length === 0) return current;
        const workers = [...current.workers];
        const queue = [...current.queue];
        let changed = false;

        // Queue order is oldest-first; offscreen work stays queued while later visible jobs proceed.
        for (const damageId of [...current.queue]) {
          if (available.length === 0) break;
          const occupied = workers.filter((worker) => worker.assignedDamageId !== undefined);
          let nearestIndex = -1;
          let nearestDistance = Number.POSITIVE_INFINITY;
          let nearestScore = Number.POSITIVE_INFINITY;
          let nearestPlan: ReturnType<typeof jobPlan>;
          available.forEach((worker, index) => {
            const plan = jobPlan(worker, damageId, current.scaffolds, occupied);
            if (!plan) return;
            const restPenalty = ["moving-to-rest", "resting", "inspecting-console"].includes(worker.state) ? 10000 : 0;
            const distance = Math.hypot(plan.destination.x - worker.x, plan.destination.y - worker.y);
            const score = distance + restPenalty;
            if (score < nearestScore) {
              nearestDistance = distance;
              nearestScore = score;
              nearestIndex = index;
              nearestPlan = plan;
            }
          });
          if (nearestIndex < 0 || !nearestPlan) continue;

          const worker = available.splice(nearestIndex, 1)[0];
          const workerIndex = workers.findIndex((candidate) => candidate.id === worker.id);
          const { destination, ...equipmentPlan } = nearestPlan;
          workers[workerIndex] = {
            ...worker,
            ...equipmentPlan,
            ...destination,
            state: "moving-to-job",
            assignedDamageId: damageId,
            activityTargetId: undefined,
            afterMove: undefined,
            restSlotId: undefined,
            restKind: undefined,
            pauseDuration: undefined,
            facing: destination.x < worker.x ? "left" : "right",
            duration: movementDuration(nearestDistance),
            carrying: shouldCarry(worker, damageId),
            climbing: false,
          };
          queue.splice(queue.indexOf(damageId), 1);
          changed = true;
        }
        return changed ? { workers, queue, scaffolds: current.scaffolds } : current;
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [system.queue, system.workers]);

  useEffect(() => {
    const activeSignatures = new Map<string, string>();

    for (const worker of system.workers) {
      if (worker.state === "spawning") continue;
      const signature = [
        worker.state,
        worker.assignedDamageId,
        worker.activityTargetId,
        worker.equipment,
        worker.scaffoldId,
        worker.x,
        worker.y,
        worker.repairX,
        worker.repairY,
        worker.baseX,
        worker.baseY,
        worker.restSlotId,
        worker.restKind,
      ].join(":");
      activeSignatures.set(worker.id, signature);
      const scheduled = stateTasks.current.get(worker.id);
      if (scheduled?.signature === signature) continue;
      if (scheduled) clearTimeout(scheduled.timer);

      let delay = 0;
      if (worker.state === "idle") delay = idleWait(worker.personality);
      else if (["wandering", "moving-to-rest", "moving-to-job", "climbing", "climbing-down"].includes(worker.state)) delay = worker.duration + 40;
      else if (worker.state === "positioning") delay = POSITIONING_DURATION;
      else if (worker.state === "deploying-ladder") delay = prefersReducedMotion() ? 0 : LADDER_DEPLOY_DURATION;
      else if (worker.state === "inspecting") delay = worker.assignedDamageId ? DAMAGE_INSPECTION_DURATION : 900 + Math.random() * 500;
      else if (worker.state === "inspecting-console") delay = worker.pauseDuration ?? 4000;
      else if (worker.state === "repairing") delay = repairDuration(worker.personality);
      else if (worker.state === "packing-ladder") delay = prefersReducedMotion() ? 0 : LADDER_PACK_DURATION;
      else if (worker.state === "celebrating") delay = CELEBRATION_DURATION;
      else if (worker.state === "resting") delay = worker.pauseDuration ?? 4000;

      const timer = setTimeout(() => {
        stateTasks.current.delete(worker.id);

        if (worker.state === "idle") {
          setSystem((currentSystem) => {
            const current = currentSystem.workers.find((candidate) => candidate.id === worker.id);
            if (!current || current.state !== "idle") return currentSystem;
            const restSlot = currentSystem.queue.length === 0
              ? chooseRestSlot(current, currentSystem.workers)
              : undefined;
            let next: Worker;
            if (restSlot) {
              const distance = Math.hypot(restSlot.point.x - current.x, restSlot.point.y - current.y);
              next = {
                ...current,
                ...restSlot.point,
                state: "moving-to-rest",
                activityTargetId: undefined,
                afterMove: undefined,
                restSlotId: restSlot.id,
                restKind: restSlot.kind,
                facing: restSlot.point.x < current.x ? "left" : "right",
                duration: movementDuration(distance),
                pauseDuration: restDuration(current, restSlot.kind),
                carrying: false,
                climbing: false,
              };
            } else if (current.personality === "inspector") {
              const inspection = inspectionDestination(current);
              if (inspection) {
                const distance = Math.hypot(inspection.point.x - current.x, inspection.point.y - current.y);
                next = {
                  ...current,
                  ...inspection.point,
                  state: "wandering",
                  activityTargetId: inspection.id,
                  afterMove: "inspecting",
                  facing: inspection.point.x < current.x ? "left" : "right",
                  duration: movementDuration(distance),
                  carrying: false,
                  climbing: false,
                };
              } else {
                const destination = safeIdleDestination(current);
                const distance = Math.hypot(destination.x - current.x, destination.y - current.y);
                next = {
                  ...current,
                  ...destination,
                  state: "wandering",
                  afterMove: "idle",
                  facing: destination.x < current.x ? "left" : "right",
                  duration: movementDuration(distance),
                  carrying: false,
                  climbing: false,
                };
              }
            } else {
              const destination = current.personality === "slacker" ? restingDestination(current) : safeIdleDestination(current);
              const distance = Math.hypot(destination.x - current.x, destination.y - current.y);
              next = {
                ...current,
                ...destination,
                state: "wandering",
                afterMove: current.personality === "slacker" ? "resting" : "idle",
                facing: destination.x < current.x ? "left" : "right",
                duration: movementDuration(distance),
                pauseDuration: current.personality === "slacker" ? 4000 + Math.random() * 5000 : undefined,
                carrying: current.personality === "carrier",
                climbing: false,
              };
            }
            return {
              ...currentSystem,
              workers: currentSystem.workers.map((candidate) => candidate.id === worker.id ? next : candidate),
            };
          });
          return;
        }

        if (worker.state === "moving-to-rest") {
          setSystem((currentSystem) => {
            const current = currentSystem.workers.find((candidate) => candidate.id === worker.id);
            if (!current || current.state !== "moving-to-rest") return currentSystem;
            const slot = current.restSlotId && crewBayIsNear() ? findRestSlot(current.restSlotId) : undefined;
            if (!slot || currentSystem.queue.length > 0) {
              return {
                ...currentSystem,
                workers: currentSystem.workers.map((candidate) => candidate.id === worker.id ? {
                  ...candidate,
                  state: "idle",
                  restSlotId: undefined,
                  restKind: undefined,
                  pauseDuration: undefined,
                  carrying: false,
                  duration: 0,
                } : candidate),
              };
            }
            const distance = Math.hypot(slot.point.x - current.x, slot.point.y - current.y);
            const next = distance > 18
              ? {
                  ...current,
                  ...slot.point,
                  facing: slot.point.x < current.x ? "left" as const : "right" as const,
                  duration: movementDuration(distance),
                }
              : {
                  ...current,
                  ...slot.point,
                  state: slot.kind === "console" ? "inspecting-console" as const : "resting" as const,
                  carrying: slot.kind === "crate" && current.personality === "carrier",
                  duration: 0,
                };
            return {
              ...currentSystem,
              workers: currentSystem.workers.map((candidate) => candidate.id === worker.id ? next : candidate),
            };
          });
          return;
        }

        if (worker.state === "wandering") {
          updateWorker(worker.id, (current) => {
            if (current.state !== "wandering") return current;
            if (current.afterMove === "inspecting" && current.activityTargetId) {
              const target = targetBesideElement(current.activityTargetId, []);
              if (!target) return { ...current, state: "idle", activityTargetId: undefined, afterMove: undefined, carrying: false, duration: 0 };
              const distance = Math.hypot(target.x - current.x, target.y - current.y);
              if (distance > 18) return { ...current, ...target, facing: target.x < current.x ? "left" : "right", duration: movementDuration(distance) };
            }
            return {
              ...current,
              state: current.afterMove ?? "idle",
              afterMove: undefined,
              carrying: false,
              duration: 0,
            };
          });
          return;
        }

        if (worker.state === "moving-to-job") {
          const assignment = worker.assignedDamageId;
          if (!assignment || !brokenIdsRef.current.has(assignment)) {
            updateWorker(worker.id, (current) => ({
              ...current,
              state: "idle",
              assignedDamageId: undefined,
              carrying: false,
              climbing: false,
              equipment: undefined,
              scaffoldId: undefined,
              duration: 0,
            }));
            return;
          }
          setSystem((current) => {
            const currentWorker = current.workers.find((candidate) => candidate.id === worker.id);
            if (!currentWorker || currentWorker.assignedDamageId !== assignment) return current;
            const occupied = current.workers.filter((candidate) => candidate.id !== worker.id && candidate.assignedDamageId !== undefined);
            const plan = jobPlan(currentWorker, assignment, current.scaffolds, occupied);
            if (!plan) {
              return {
                ...current,
                workers: current.workers.map((candidate) => candidate.id === worker.id ? {
                  ...candidate,
                  state: "idle",
                  assignedDamageId: undefined,
                  carrying: false,
                  climbing: false,
                  equipment: undefined,
                  scaffoldId: undefined,
                  duration: 0,
                } : candidate),
                queue: current.queue.includes(assignment) ? current.queue : [assignment, ...current.queue],
              };
            }
            const { destination, ...equipmentPlan } = plan;
            const distance = Math.hypot(destination.x - currentWorker.x, destination.y - currentWorker.y);
            return {
              ...current,
              workers: current.workers.map((candidate) => candidate.id !== worker.id ? candidate : distance > 18 ? {
                ...candidate,
                ...equipmentPlan,
                ...destination,
                facing: destination.x < candidate.x ? "left" : "right",
                duration: movementDuration(distance),
                climbing: false,
              } : {
                ...candidate,
                ...equipmentPlan,
                state: "positioning",
                carrying: candidate.carrying,
                climbing: false,
                duration: 0,
              }),
            };
          });
          return;
        }

        if (worker.state === "positioning") {
          updateWorker(worker.id, (current) => current.state === "positioning"
            ? { ...current, state: current.equipment === "ladder" ? "deploying-ladder" : "inspecting", duration: 0 }
            : current);
          return;
        }

        if (worker.state === "deploying-ladder") {
          updateWorker(worker.id, (current) => {
            if (current.state !== "deploying-ladder" || current.repairX === undefined || current.repairY === undefined) return current;
            const distance = Math.hypot(current.repairX - current.x, current.repairY - current.y);
            return {
              ...current,
              x: current.repairX,
              y: current.repairY,
              state: "climbing",
              climbing: true,
              carrying: false,
              duration: movementDuration(distance),
            };
          });
          return;
        }

        if (worker.state === "climbing") {
          updateWorker(worker.id, (current) => current.state === "climbing"
            ? { ...current, state: "inspecting", climbing: false, duration: 0 }
            : current);
          return;
        }

        if (worker.state === "inspecting") {
          if (!worker.assignedDamageId) {
            updateWorker(worker.id, (current) => current.state === "inspecting"
              ? { ...current, state: "idle", activityTargetId: undefined, duration: 0 }
              : current);
            return;
          }
          if (!brokenIdsRef.current.has(worker.assignedDamageId)) {
            updateWorker(worker.id, (current) => ({
              ...current,
              state: "idle",
              assignedDamageId: undefined,
              carrying: false,
              equipment: undefined,
              scaffoldId: undefined,
              duration: 0,
            }));
            return;
          }
          beginRepair(worker.assignedDamageId);
          updateWorker(worker.id, (current) => current.state === "inspecting"
            ? { ...current, state: "repairing", carrying: false, duration: 0 }
            : current);
          return;
        }

        if (worker.state === "repairing") {
          const assignment = worker.assignedDamageId;
          if (assignment && brokenIdsRef.current.has(assignment)) repairElement(assignment);
          updateWorker(worker.id, (current) => {
            if (current.state !== "repairing") return current;
            if (current.equipment === "ladder" && current.baseX !== undefined && current.baseY !== undefined) {
              const distance = Math.hypot(current.baseX - current.x, current.baseY - current.y);
              return {
                ...current,
                x: current.baseX,
                y: current.baseY,
                state: "climbing-down",
                carrying: false,
                climbing: true,
                duration: movementDuration(distance),
              };
            }
            return {
              ...current,
              state: "celebrating",
              assignedDamageId: undefined,
              carrying: false,
              equipment: undefined,
              scaffoldId: undefined,
              duration: 0,
            };
          });
          return;
        }

        if (worker.state === "climbing-down") {
          updateWorker(worker.id, (current) => current.state === "climbing-down"
            ? { ...current, state: "packing-ladder", climbing: false, duration: 0 }
            : current);
          return;
        }

        if (worker.state === "packing-ladder") {
          updateWorker(worker.id, (current) => current.state === "packing-ladder"
            ? {
                ...current,
                state: "celebrating",
                assignedDamageId: undefined,
                equipment: undefined,
                scaffoldId: undefined,
                duration: 0,
              }
            : current);
          return;
        }

        if (worker.state === "celebrating" || worker.state === "resting" || worker.state === "inspecting-console") {
          updateWorker(worker.id, (current) => current.state === worker.state
            ? {
                ...current,
                state: "idle",
                restSlotId: undefined,
                restKind: undefined,
                pauseDuration: undefined,
                carrying: false,
                duration: 0,
              }
            : current);
        }
      }, delay);

      stateTasks.current.set(worker.id, { signature, timer });
    }

    for (const [workerId, task] of stateTasks.current) {
      if (!activeSignatures.has(workerId)) {
        clearTimeout(task.timer);
        stateTasks.current.delete(workerId);
      }
    }
  }, [system.workers, beginRepair, repairElement, updateWorker]);

  useEffect(() => () => {
    for (const task of stateTasks.current.values()) clearTimeout(task.timer);
    for (const timer of spawnTimers.current) clearTimeout(timer);
    for (const timer of speechTimers.current.values()) clearTimeout(timer);
    stateTasks.current.clear();
    spawnTimers.current = [];
    speechTimers.current.clear();
    speechRef.current = [];
    globalSpeechCooldownUntil.current = 0;
    workerSpeechCooldowns.current.clear();
    lastWorkerPhrase.current.clear();
    previousWorkerStates.current.clear();
    reactedScaffolds.current.clear();
  }, []);

  return (
    <div className={styles.layer} aria-hidden="true" data-worker-layer data-repair-queue-size={system.queue.length}>
      {system.scaffolds.map((scaffold) => <WorkerScaffold key={scaffold.id} scaffold={scaffold} />)}
      {system.workers.map((worker) => <WorkerLadder key={`ladder-${worker.id}`} worker={worker} />)}
      {system.workers.map((worker) => (
        <WorkerBot key={worker.id} worker={worker} speech={speech.find((entry) => entry.workerId === worker.id)} />
      ))}
    </div>
  );
}
