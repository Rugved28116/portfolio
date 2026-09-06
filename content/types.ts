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
  "Embedded Systems",
  "Linux",
] as const;

export type LabCategory = (typeof LAB_CATEGORIES)[number];

export const LAB_STATUSES = [
  "COMPLETE",
  "ACTIVE",
  "BUILDING",
  "PLANNED",
  "ABANDONED",
] as const;

export type LabStatus = (typeof LAB_STATUSES)[number];

export type LabEntryId = `RGB / ${"LAB" | "PLAN"}_${string}`;

export type InternalRoute = "/" | "/work" | "/lab" | "/notes" | "/about";

export type NavigationItem = {
  readonly label: string;
  readonly href: InternalRoute;
};

export type Project = {
  readonly slug: string;
  readonly title: string;
  readonly shortDescription?: string;
  readonly year?: number;
  readonly status?: BuildStatus;
  readonly categories?: readonly string[];
  readonly technologies?: readonly string[];
  readonly role?: string;
  readonly featured?: boolean;
  readonly thumbnail?: string;
  readonly githubUrl?: string;
  readonly liveUrl?: string;
  readonly caseStudy?: ProjectCaseStudy;
};

export type ProjectCaseStudy = {
  readonly overview?: string;
  readonly problem?: string;
  readonly approach?: string;
  readonly architecture?: string;
  readonly challenges?: string;
  readonly lessons?: string;
  readonly outcome?: string;
};

export type LabEntry = {
  readonly id: LabEntryId;
  readonly slug: string;
  readonly title: string;
  readonly shortDescription: string;
  readonly categories: readonly LabCategory[];
  readonly status?: LabStatus;
  readonly year?: number;
  readonly technologies?: readonly string[];
  readonly hardware?: readonly string[];
  readonly featured?: boolean;
  readonly githubUrl?: string;
  readonly thumbnail?: string;
};

export type LabFilter = {
  readonly label: string;
  readonly category: LabCategory | null;
};

type NoteBase = {
  readonly slug: string;
  readonly title: string;
  readonly type: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly readingTime?: number;
  readonly relatedLabEntryId?: LabEntryId;
  readonly content: readonly NoteContentBlock[];
};

export type NoteContentBlock =
  | {
      readonly kind: "heading";
      readonly text: string;
    }
  | {
      readonly kind: "paragraph";
      readonly text: string;
    }
  | {
      readonly kind: "code";
      readonly code: string;
      readonly label: "Command" | "Output" | "Architecture" | "Example";
    }
  | {
      readonly kind: "list";
      readonly items: readonly string[];
    }
  | {
      readonly kind: "ordered-list";
      readonly items: readonly string[];
    };

export type PublishedNote = NoteBase & {
  readonly date?: `${number}-${number}-${number}`;
  readonly published: true;
  readonly draft: false;
};

export type DraftNote = NoteBase & {
  readonly date?: `${number}-${number}-${number}`;
  readonly published: false;
  readonly draft: true;
};

export type Note = PublishedNote | DraftNote;

export type CurrentItem = {
  readonly label: "FOCUS" | "BUILDING" | "PLANNING" | "PLATFORM";
  readonly value: string;
  readonly note: string | null;
};

export type BuildQueueItem = {
  readonly title: string;
  readonly status: BuildStatus;
};

export type InterestReference =
  | {
      readonly kind: "project";
      readonly slug: string;
    }
  | {
      readonly kind: "lab";
      readonly slug: string;
    };

export type InterestArea = {
  readonly label:
    | "CYBERSECURITY"
    | "AI"
    | "SYSTEMS"
    | "ROBOTICS"
    | "HARDWARE"
    | "WEB";
  readonly description: string;
  readonly related: readonly InterestReference[];
};

export type AboutInterest =
  | "Cybersecurity"
  | "AI"
  | "Systems"
  | "Robotics"
  | "Hardware"
  | "Web"
  | "Networking"
  | "Linux";

export type AboutContent = {
  readonly positioning: string;
  readonly interests: readonly AboutInterest[];
  readonly featuredReferences: readonly InterestReference[];
  readonly approach: readonly string[];
};

export type SiteConfiguration = {
  readonly siteName: string;
  readonly title: string;
  readonly description: string;
  readonly siteUrl?: string;
  readonly githubUrl?: string;
  readonly linkedinUrl?: string;
  readonly email?: string;
  readonly resumeUrl?: string;
};

export type SiteContent = {
  readonly site: SiteConfiguration;
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
  readonly interests: readonly InterestArea[];
  readonly about: AboutContent;
  readonly terminal: {
    readonly prompt: string;
  };
};
