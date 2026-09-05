import type { SiteContent } from "@/content/types";

export const siteContent = {
  identity: {
    name: "Rugved Ganesh Bhor",
    onlineName: "RGB Official",
    mark: "RGB_",
  },
  navigation: [
    { label: "Work", href: "/work" },
    { label: "Lab", href: "/lab" },
    { label: "Notes", href: "/notes" },
    { label: "About", href: "/about" },
  ],
  hero: {
    statement: "I build systems.",
    disciplines: ["Security", "AI", "Systems", "Robotics"],
    description:
      "I build, test and explore software, hardware and intelligent systems.",
  },
  currently: [
    { label: "FOCUS", value: "Systems Security", note: null },
    { label: "BUILDING", value: "Robotics experiments", note: null },
    {
      label: "PLANNING",
      value: "Portable Cyberdeck",
      note: "Future project / not built",
    },
    { label: "PLATFORM", value: "Arch Linux", note: null },
  ],
  buildQueue: [{ title: "Portable Cyberdeck", status: "PLANNED" }],
  interests: [
    {
      label: "CYBERSECURITY",
      description:
        "Systems security, AI security, integrity, assurance and networking.",
      related: [
        {
          kind: "project",
          slug: "computer-vision-assurance-framework",
        },
      ],
    },
    {
      label: "AI",
      description:
        "RAG, agent workflows, computer vision and intelligent systems.",
      related: [{ kind: "project", slug: "voice-enabled-rag" }],
    },
    {
      label: "SYSTEMS",
      description:
        "Linux, networking, virtualization and systems thinking.",
      related: [{ kind: "lab", slug: "portable-cyberdeck" }],
    },
    {
      label: "ROBOTICS",
      description:
        "Autonomous systems, sensors, embedded control and small robots.",
      related: [{ kind: "lab", slug: "line-tracker-robot" }],
    },
    {
      label: "HARDWARE",
      description:
        "Embedded systems, electronics and planned portable computing.",
      related: [{ kind: "lab", slug: "portable-cyberdeck" }],
    },
    {
      label: "WEB",
      description: "Full-stack interfaces, APIs and AI-enabled web systems.",
      related: [{ kind: "project", slug: "ask-my-notes" }],
    },
  ],
} satisfies SiteContent;

// TODO: Add confirmed contact and social links when they are provided.
