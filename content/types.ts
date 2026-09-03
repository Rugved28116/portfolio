export const BUILD_STATUSES = [
  "PLANNED",
  "DESIGNING",
  "PROTOTYPING",
  "BUILDING",
  "WORKING",
  "V2",
] as const;

export type BuildStatus = (typeof BUILD_STATUSES)[number];

export const LAB_CATEGORIES = [
  "Security",
  "AI",
  "Robotics",
  "Hardware",
  "Systems",
  "Networking",
  "Web",
] as const;

export type LabCategory = (typeof LAB_CATEGORIES)[number];

export type InternalRoute = "/" | "/work" | "/lab" | "/notes" | "/about";

export type NavigationItem = {
  readonly label: string;
  readonly href: InternalRoute;
};

export type Project = {
  readonly slug: string;
  readonly title: string;
  readonly summary?: string;
  readonly status?: BuildStatus;
  readonly technologies?: readonly string[];
};

export type LabEntry = {
  readonly slug: string;
  readonly title: string;
  readonly category: LabCategory;
  readonly summary?: string;
  readonly status?: BuildStatus;
};

export type Note = {
  readonly slug: string;
  readonly title: string;
  readonly summary?: string;
  readonly publishedAt?: string;
  readonly topics?: readonly string[];
};

export type CurrentItem = {
  readonly label: "FOCUS" | "BUILDING" | "PLANNING" | "PLATFORM";
  readonly value: string;
  readonly note: string | null;
};

export type BuildQueueItem = {
  readonly title: string;
  readonly status: BuildStatus;
};

export type SiteContent = {
  readonly identity: {
    readonly name: string;
    readonly onlineName: string;
    readonly mark: string;
  };
  readonly navigation: readonly NavigationItem[];
  readonly hero: {
    readonly statement: string;
    readonly disciplines: readonly string[];
    readonly description: string;
  };
  readonly currently: readonly CurrentItem[];
  readonly buildQueue: readonly BuildQueueItem[];
  readonly interests: readonly string[];
};
