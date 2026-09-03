import type { Project } from "@/content/types";

export const projects: readonly Project[] = [
  {
    slug: "nyayasetu",
    title: "NyayaSetu",
    shortDescription:
      "An AI legal assistant built during a hackathon to simplify legal documents, summarize case facts, process FIR-related information, and surface relevant cases and precedents.",
    year: undefined,
    status: undefined,
    categories: ["AI", "LegalTech"],
    technologies: [
      "Next.js",
      "Node.js / TypeScript",
      "MongoDB",
      "Firebase",
      "LangGraph",
      "OCR / document processing",
    ],
    role: undefined,
    featured: true,
    thumbnail: undefined,
    githubUrl: undefined,
    liveUrl: undefined,
    caseStudy: undefined,
  },
  {
    slug: "ask-my-notes",
    title: "AskMyNotes",
    shortDescription:
      "A second-brain and AI knowledge retrieval platform for organizing notes and retrieving information through semantic search and natural-language queries.",
    year: undefined,
    status: undefined,
    categories: ["AI", "Web", "Knowledge Systems"],
    technologies: [
      "MERN Stack",
      "Vector Search",
      "NLP",
      "LangGraph",
      "REST APIs",
    ],
    role: undefined,
    featured: true,
    thumbnail: undefined,
    githubUrl: undefined,
    liveUrl: undefined,
    caseStudy: undefined,
  },
  {
    slug: "finguard-ai",
    title: "FinGuard AI",
    shortDescription:
      "An SMB financial intelligence project that analyzes uploaded financial data for anomalies, duplicate transactions, cash-flow risks, alerts, and actionable insights.",
    year: undefined,
    status: undefined,
    categories: ["AI", "FinTech", "Web"],
    technologies: ["React", "Vite"],
    role: undefined,
    featured: true,
    thumbnail: undefined,
    githubUrl: undefined,
    liveUrl: undefined,
    caseStudy: undefined,
  },
  {
    slug: "voice-enabled-rag",
    title: "Voice-enabled RAG",
    shortDescription:
      "A voice-enabled retrieval-augmented generation system where spoken questions are transcribed, relevant information is retrieved from a vector database, and an answer is generated from the retrieved context.",
    year: undefined,
    status: undefined,
    categories: ["AI", "RAG", "Speech"],
    technologies: undefined,
    role: undefined,
    featured: true,
    thumbnail: undefined,
    githubUrl: undefined,
    liveUrl: undefined,
    caseStudy: {
      overview: "Built around the MSMARCO-XI dataset.",
      problem: undefined,
      approach:
        "Speech-to-text is intended to use Sarvam or ElevenLabs. Retrieval is intended to support multiple chunking strategies rather than one naive fixed-size approach.",
      outcome: undefined,
    },
  },
  {
    slug: "computer-vision-assurance-framework",
    title: "Computer Vision Assurance Framework",
    shortDescription:
      "An offline, model-agnostic computer-vision assurance framework for assessing training-data, model, and inference integrity through anomaly detection, behavioural checks, provenance, and evidence-based risk reporting.",
    year: undefined,
    status: undefined,
    categories: ["Cybersecurity", "AI Security", "Computer Vision"],
    technologies: undefined,
    role: undefined,
    featured: true,
    thumbnail: undefined,
    githubUrl: undefined,
    liveUrl: undefined,
    caseStudy: {
      overview:
        "Capabilities include training-data integrity assessment, model integrity assessment, inference integrity assessment, poisoning and backdoor detection, model substitution and tampering checks, replay and inference-record integrity checks, out-of-distribution and distribution-shift analysis, and evidence-based reports and audit logs.",
      problem: undefined,
      approach:
        "Compatibility goals include COCO, YOLO, ONNX, PyTorch, and TorchScript.",
      outcome: undefined,
    },
  },
];

// Unconfirmed optional fields intentionally remain undefined.
