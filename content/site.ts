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
    { label: "FOCUS", value: "Systems Security" },
    { label: "BUILDING", value: "Robotics experiments" },
    { label: "PLANNING", value: "Portable Cyberdeck" },
    { label: "PLATFORM", value: "Arch Linux" },
  ],
  buildQueue: [{ title: "Portable Cyberdeck", status: "PLANNED" }],
  interests: [
    "Cybersecurity",
    "Artificial Intelligence",
    "Systems",
    "Robotics",
    "Hardware",
    "Web Development",
    "Networking",
    "Linux",
  ],
} satisfies SiteContent;

// TODO: Add confirmed contact and social links when they are provided.
