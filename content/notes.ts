import type { Note } from "@/content/types";

export const notes: readonly Note[] = [
  {
    slug: "fixing-virtualbox-kernel-modules-arch-linux",
    title: "Fixing VirtualBox Kernel Modules After an Arch Linux Update",
    type: "Debug Note",
    description:
      "A practical troubleshooting note about fixing VirtualBox kernel module failures caused by a mismatch between the running Arch Linux kernel and the installed kernel/module packages.",
    date: "2026-08-31",
    tags: [
      "Arch Linux",
      "VirtualBox",
      "Linux",
      "Kernel",
      "Troubleshooting",
    ],
    published: true,
    draft: false,
    readingTime: undefined,
    content: [
      { kind: "heading", text: "Problem" },
      {
        kind: "paragraph",
        text: "VirtualBox stopped starting virtual machines correctly after an Arch Linux kernel update.",
      },
      { kind: "paragraph", text: "Running:" },
      { kind: "code", label: "Command", code: "sudo vboxreload" },
      {
        kind: "paragraph",
        text: "produced errors similar to:",
      },
      {
        kind: "code",
        label: "Output",
        code: "modprobe: FATAL: Module vboxnetadp not found\nmodprobe: FATAL: Module vboxnetflt not found\nmodprobe: FATAL: Module vboxdrv not found",
      },
      { kind: "heading", text: "Diagnosis" },
      {
        kind: "paragraph",
        text: "The first thing to check was the currently running kernel:",
      },
      { kind: "code", label: "Command", code: "uname -r" },
      {
        kind: "paragraph",
        text: "The system was still running:",
      },
      { kind: "code", label: "Output", code: "7.1.8-arch1-3" },
      {
        kind: "paragraph",
        text: "while the installed Arch Linux kernel package had already been updated to:",
      },
      { kind: "code", label: "Output", code: "7.1.11.arch1-1" },
      {
        kind: "paragraph",
        text: "This meant the kernel running in memory did not match the kernel modules installed on disk.",
      },
      {
        kind: "paragraph",
        text: "VirtualBox therefore could not find the modules it expected under the running kernel's module directory.",
      },
      { kind: "heading", text: "Fix" },
      {
        kind: "paragraph",
        text: "The system was rebooted so it could start using the newly installed kernel.",
      },
      {
        kind: "paragraph",
        text: "After rebooting, verify the active kernel:",
      },
      { kind: "code", label: "Command", code: "uname -r" },
      {
        kind: "paragraph",
        text: "Then verify the VirtualBox modules:",
      },
      { kind: "code", label: "Command", code: "lsmod | grep vbox" },
      {
        kind: "paragraph",
        text: "The expected modules included:",
      },
      {
        kind: "code",
        label: "Output",
        code: "vboxdrv\nvboxnetflt\nvboxnetadp",
      },
      {
        kind: "paragraph",
        text: "VirtualBox was later running version 7.2.16 with the correct host modules loaded for the active kernel.",
      },
      { kind: "heading", text: "Lesson" },
      {
        kind: "paragraph",
        text: "When VirtualBox suddenly breaks after an Arch Linux update, check the kernel version before reinstalling everything.",
      },
      { kind: "paragraph", text: "Compare:" },
      { kind: "code", label: "Command", code: "uname -r" },
      {
        kind: "paragraph",
        text: "with the installed kernel package.",
      },
      {
        kind: "paragraph",
        text: "A mismatch between the running kernel and the installed modules can make VirtualBox appear broken even when the package installation itself is fine.",
      },
      {
        kind: "paragraph",
        text: "Rebooting into the updated kernel can resolve the issue immediately.",
      },
      { kind: "heading", text: "Useful checks" },
      {
        kind: "code",
        label: "Command",
        code: "uname -r\npacman -Q | grep -E 'virtualbox|linux'\nlsmod | grep vbox\nVBoxManage --version",
      },
    ],
  },
  {
    slug: "designing-multi-strategy-chunking-rag",
    title: "Designing a Multi-Strategy Chunking Pipeline for RAG",
    type: "AI Note",
    description:
      "A practical design note on why retrieval-augmented generation systems benefit from multiple chunking strategies instead of relying on one fixed-size splitter.",
    date: undefined,
    tags: ["AI", "RAG", "Chunking", "Vector Search", "Retrieval", "LLMs"],
    published: true,
    draft: false,
    readingTime: undefined,
    content: [
      { kind: "heading", text: "Problem" },
      {
        kind: "paragraph",
        text: "A basic RAG pipeline often splits every document using one fixed chunk size.",
      },
      { kind: "paragraph", text: "For example:" },
      {
        kind: "code",
        label: "Architecture",
        code: "document\n→ split every N tokens\n→ embed chunks\n→ store in vector database\n→ retrieve nearest chunks\n→ generate answer",
      },
      {
        kind: "paragraph",
        text: "This is simple, but it can perform poorly when the underlying data contains different document structures, passage lengths, topics, or semantic boundaries.",
      },
      { kind: "paragraph", text: "A chunk can become:" },
      {
        kind: "list",
        items: [
          "too small to preserve enough context",
          "too large and contain unrelated information",
          "split in the middle of an important sentence or topic",
          "difficult to retrieve precisely",
          "redundant because of excessive overlap",
        ],
      },
      {
        kind: "paragraph",
        text: "For the Voice-enabled RAG project, the chunking stage was therefore designed around multiple strategies rather than one naive fixed-size approach.",
      },
      { kind: "heading", text: "Goal" },
      {
        kind: "paragraph",
        text: "Build a retrieval pipeline where different chunking methods can be evaluated and combined depending on the characteristics of the data.",
      },
      { kind: "paragraph", text: "The target pipeline is:" },
      {
        kind: "code",
        label: "Architecture",
        code: "Voice input\n→ Speech-to-text\n→ Query processing\n→ Retrieval\n→ Answer generation",
      },
      {
        kind: "paragraph",
        text: "The retrieval stage depends heavily on how the source data is divided and indexed.",
      },
      { kind: "heading", text: "Strategy 1: Fixed-size chunking" },
      {
        kind: "paragraph",
        text: "The simplest approach divides text using a fixed token or character limit.",
      },
      { kind: "paragraph", text: "Example:" },
      {
        kind: "code",
        label: "Example",
        code: "Document\n→ 500-token chunks\n→ overlap between adjacent chunks",
      },
      { kind: "paragraph", text: "Advantages:" },
      {
        kind: "list",
        items: [
          "easy to implement",
          "predictable chunk size",
          "efficient indexing",
          "useful as a baseline",
        ],
      },
      { kind: "paragraph", text: "Disadvantages:" },
      {
        kind: "list",
        items: [
          "ignores document meaning",
          "may split sentences or topics",
          "one chunk size may not work well for every passage",
        ],
      },
      {
        kind: "paragraph",
        text: "This strategy is still useful because it provides a baseline for comparison.",
      },
      { kind: "heading", text: "Strategy 2: Overlapping chunks" },
      {
        kind: "paragraph",
        text: "Instead of completely independent chunks, adjacent chunks can share some content.",
      },
      { kind: "paragraph", text: "Example:" },
      {
        kind: "code",
        label: "Example",
        code: "Chunk 1:\ntokens 0 to 500\n\nChunk 2:\ntokens 400 to 900",
      },
      {
        kind: "paragraph",
        text: "The shared region helps preserve information that lies near a chunk boundary.",
      },
      { kind: "paragraph", text: "Benefits:" },
      {
        kind: "list",
        items: [
          "reduces information loss at boundaries",
          "increases the chance that complete context is retrieved",
        ],
      },
      { kind: "paragraph", text: "Trade-off:" },
      {
        kind: "paragraph",
        text: "Too much overlap creates redundant vectors and increases storage and retrieval noise.",
      },
      {
        kind: "paragraph",
        text: "Overlap should therefore be treated as a parameter to tune rather than a constant chosen blindly.",
      },
      { kind: "heading", text: "Strategy 3: Sentence-aware chunking" },
      {
        kind: "paragraph",
        text: "Instead of cutting text at arbitrary token boundaries, the splitter tries to preserve complete sentences.",
      },
      { kind: "paragraph", text: "A rough approach is:" },
      {
        kind: "code",
        label: "Architecture",
        code: "document\n→ sentences\n→ accumulate sentences until target chunk size\n→ start next chunk",
      },
      {
        kind: "paragraph",
        text: "This usually produces more readable and semantically coherent chunks.",
      },
      {
        kind: "paragraph",
        text: "It is especially useful when retrieved context will be directly shown to or consumed by an LLM.",
      },
      { kind: "heading", text: "Strategy 4: Semantic chunking" },
      {
        kind: "paragraph",
        text: "Semantic chunking attempts to identify changes in meaning or topic.",
      },
      { kind: "paragraph", text: "Instead of asking:" },
      { kind: "paragraph", text: '"Have we reached 500 tokens?"' },
      { kind: "paragraph", text: "the system asks:" },
      {
        kind: "paragraph",
        text: '"Has the semantic topic changed enough that a new chunk should begin?"',
      },
      { kind: "paragraph", text: "A possible pipeline is:" },
      {
        kind: "code",
        label: "Architecture",
        code: "sentences\n→ sentence embeddings\n→ similarity comparison\n→ detect semantic boundary\n→ create chunk",
      },
      {
        kind: "paragraph",
        text: "This can create more meaningful retrieval units than fixed-size splitting.",
      },
      {
        kind: "paragraph",
        text: "However, it is computationally more expensive.",
      },
      { kind: "heading", text: "Strategy 5: Metadata-aware chunking" },
      {
        kind: "paragraph",
        text: "Documents may contain useful structure such as:",
      },
      {
        kind: "list",
        items: [
          "document ID",
          "title",
          "section",
          "language",
          "source",
          "passage ID",
          "category",
        ],
      },
      {
        kind: "paragraph",
        text: "Chunking should preserve this metadata.",
      },
      { kind: "paragraph", text: "A chunk should not just contain:" },
      { kind: "code", label: "Example", code: "text" },
      { kind: "paragraph", text: "It can contain:" },
      {
        kind: "code",
        label: "Example",
        code: "text\ndocument_id\nsection\nlanguage\nsource\nchunk_strategy\nchunk_index",
      },
      {
        kind: "paragraph",
        text: "This makes filtering, debugging, evaluation, and hybrid retrieval much easier.",
      },
      { kind: "heading", text: "Multi-index approach" },
      {
        kind: "paragraph",
        text: "Instead of choosing one strategy and discarding the others, one approach is to create multiple retrieval views.",
      },
      { kind: "paragraph", text: "For example:" },
      {
        kind: "code",
        label: "Architecture",
        code: "INDEX A\nfixed-size chunks\n\nINDEX B\nsentence-aware chunks\n\nINDEX C\nsemantic chunks",
      },
      {
        kind: "paragraph",
        text: "The same query can retrieve candidates from multiple indexes.",
      },
      { kind: "paragraph", text: "The results can then be:" },
      {
        kind: "code",
        label: "Architecture",
        code: "merged\n→ deduplicated\n→ reranked\n→ passed to the generator",
      },
      {
        kind: "paragraph",
        text: "This allows different chunking strategies to contribute useful context.",
      },
      { kind: "heading", text: "Retrieval pipeline" },
      {
        kind: "paragraph",
        text: "A possible retrieval architecture is:",
      },
      {
        kind: "code",
        label: "Architecture",
        code: "User query\n→ Query embedding\n→ Search multiple chunk indexes\n→ Candidate collection\n→ Deduplication\n→ Reranking\n→ Top-K context\n→ LLM",
      },
      {
        kind: "paragraph",
        text: "The final generator receives a smaller set of highly relevant passages rather than whichever chunks happened to be nearest in one vector index.",
      },
      { kind: "heading", text: "Deduplication" },
      {
        kind: "paragraph",
        text: "Using overlap and multiple chunking strategies can produce very similar retrieval results.",
      },
      {
        kind: "paragraph",
        text: "Before sending context to the LLM, duplicate or near-duplicate chunks should be removed.",
      },
      { kind: "paragraph", text: "Possible approaches include:" },
      {
        kind: "list",
        items: [
          "document ID + chunk index checks",
          "text similarity",
          "embedding similarity",
          "normalized text hashing",
        ],
      },
      {
        kind: "paragraph",
        text: "This reduces unnecessary context-window usage.",
      },
      { kind: "heading", text: "Reranking" },
      {
        kind: "paragraph",
        text: "Vector similarity alone does not always identify the best context.",
      },
      {
        kind: "paragraph",
        text: "A reranking stage can take the retrieved candidate set and reorder it based on relevance to the original query.",
      },
      { kind: "paragraph", text: "Conceptually:" },
      {
        kind: "code",
        label: "Architecture",
        code: "Vector search\n→ retrieve 20 candidates\n→ reranker\n→ keep best 5\n→ answer generation",
      },
      {
        kind: "paragraph",
        text: "This separates fast candidate retrieval from more precise relevance selection.",
      },
      { kind: "heading", text: "Evaluation" },
      {
        kind: "paragraph",
        text: "Chunking quality should be measured rather than judged only by intuition.",
      },
      { kind: "paragraph", text: "Useful retrieval metrics can include:" },
      {
        kind: "list",
        items: [
          "Recall@K",
          "Precision@K",
          "Mean Reciprocal Rank",
          "answer relevance",
          "context relevance",
        ],
      },
      {
        kind: "paragraph",
        text: "Latency should also be measured because semantic chunking, multiple indexes, and reranking add computational cost.",
      },
      {
        kind: "paragraph",
        text: "The best pipeline is not necessarily the most complicated one.",
      },
      {
        kind: "paragraph",
        text: "It is the pipeline that provides the best retrieval quality within the latency and infrastructure constraints of the project.",
      },
      { kind: "heading", text: "Design principle" },
      {
        kind: "paragraph",
        text: "Chunking is not just preprocessing.",
      },
      {
        kind: "paragraph",
        text: "It directly affects what information the retrieval system is capable of finding.",
      },
      { kind: "paragraph", text: "A strong RAG pipeline should therefore treat:" },
      {
        kind: "list",
        items: [
          "chunk size",
          "overlap",
          "semantic boundaries",
          "metadata",
          "retrieval strategy",
          "reranking",
        ],
      },
      {
        kind: "paragraph",
        text: "as parts of one retrieval design rather than isolated configuration values.",
      },
      { kind: "heading", text: "Project context" },
      {
        kind: "paragraph",
        text: "This approach was explored for a Voice-enabled RAG system using the MSMARCO-XI dataset.",
      },
      {
        kind: "paragraph",
        text: "The intended system pipeline was:",
      },
      {
        kind: "code",
        label: "Architecture",
        code: "Voice input\n→ Speech-to-text\n→ Chunking and retrieval\n→ Answer generation",
      },
      {
        kind: "paragraph",
        text: "The project requirement explicitly called for a broad chunking strategy rather than a single naive fixed-size splitter.",
      },
    ],
  },
  {
    slug: "line-tracker-robot-build-log",
    title: "Line Tracker Robot Build Log",
    type: "Robotics Build Log",
    description:
      "A build log documenting the planning and development of a small autonomous line-tracking robot using sensors, motor control, and feedback.",
    date: undefined,
    tags: [
      "Robotics",
      "Embedded Systems",
      "Sensors",
      "Motor Control",
      "Autonomous Systems",
    ],
    published: true,
    draft: false,
    readingTime: undefined,
    relatedLabEntryId: "RGB / LAB_001",
    content: [
      { kind: "heading", text: "Goal" },
      {
        kind: "paragraph",
        text: "Build a small autonomous robot capable of following a predefined line using sensor feedback and motor control.",
      },
      {
        kind: "paragraph",
        text: "The project is intended as a practical introduction to:",
      },
      {
        kind: "list",
        items: [
          "robotics",
          "embedded systems",
          "sensors",
          "motor control",
          "feedback-based behaviour",
          "basic autonomous navigation",
        ],
      },
      { kind: "heading", text: "Core idea" },
      {
        kind: "paragraph",
        text: "A line tracker works by continuously sensing the position of a line relative to the robot.",
      },
      {
        kind: "paragraph",
        text: "The control loop is conceptually:",
      },
      {
        kind: "code",
        label: "Architecture",
        code: "Read sensors\n→ determine line position\n→ adjust motor speeds\n→ move\n→ repeat",
      },
      {
        kind: "paragraph",
        text: "The robot does not follow a pre-programmed path.",
      },
      {
        kind: "paragraph",
        text: "Instead, it continuously reacts to sensor readings.",
      },
      { kind: "heading", text: "Sensor input" },
      {
        kind: "paragraph",
        text: "Line tracker robots commonly use infrared sensors pointed toward the ground.",
      },
      {
        kind: "paragraph",
        text: "The sensors detect differences in surface reflectivity.",
      },
      {
        kind: "paragraph",
        text: "A dark line and a lighter surface reflect infrared light differently.",
      },
      {
        kind: "paragraph",
        text: "The controller can use these differences to estimate whether the robot is:",
      },
      {
        kind: "list",
        items: [
          "centered on the line",
          "drifting left",
          "drifting right",
          "no longer detecting the line",
        ],
      },
      {
        kind: "paragraph",
        text: "The exact sensor hardware for this build has not been finalized unless already confirmed elsewhere in the repository.",
      },
      { kind: "heading", text: "Basic control logic" },
      {
        kind: "paragraph",
        text: "A simple two-sensor approach can use logic such as:",
      },
      {
        kind: "code",
        label: "Example",
        code: "Left sensor   Right sensor   Action\n\nLine          Line           Move forward\nLine          Surface        Turn left\nSurface       Line           Turn right\nSurface       Surface        Search or stop",
      },
      {
        kind: "paragraph",
        text: "This is only a conceptual example.",
      },
      { kind: "paragraph", text: "The actual behaviour depends on:" },
      {
        kind: "list",
        items: [
          "sensor arrangement",
          "line color",
          "surface color",
          "motor orientation",
          "wiring",
          "control logic",
        ],
      },
      { kind: "heading", text: "Motor control" },
      {
        kind: "paragraph",
        text: "The controller needs to adjust the speed or direction of the left and right motors independently.",
      },
      { kind: "paragraph", text: "For example:" },
      {
        kind: "code",
        label: "Example",
        code: "move forward\n→ both motors run\n\nturn left\n→ reduce or stop the left motor\n→ keep the right motor moving\n\nturn right\n→ reduce or stop the right motor\n→ keep the left motor moving",
      },
      {
        kind: "paragraph",
        text: "More advanced control can vary motor speed instead of making only binary stop/run decisions.",
      },
      { kind: "heading", text: "Feedback" },
      {
        kind: "paragraph",
        text: "The important part of the robot is the feedback loop.",
      },
      { kind: "paragraph", text: "Instead of:" },
      {
        kind: "code",
        label: "Architecture",
        code: "sense once\n→ decide once",
      },
      {
        kind: "paragraph",
        text: "the robot repeatedly performs:",
      },
      {
        kind: "code",
        label: "Architecture",
        code: "sense\n→ decide\n→ act\n→ sense again",
      },
      {
        kind: "paragraph",
        text: "This continuous feedback allows the robot to correct its path as it moves.",
      },
      { kind: "heading", text: "First control strategy" },
      {
        kind: "paragraph",
        text: "The initial version should use simple rule-based control.",
      },
      {
        kind: "paragraph",
        text: "The goal is to first achieve reliable tracking before introducing more complex control methods.",
      },
      {
        kind: "paragraph",
        text: "A basic version can be implemented using:",
      },
      {
        kind: "list",
        items: [
          "discrete sensor states",
          "left/right correction",
          "fixed motor speeds",
        ],
      },
      {
        kind: "paragraph",
        text: "Once this works reliably, the project can evolve toward smoother control.",
      },
      { kind: "heading", text: "Possible future improvement: PID control" },
      {
        kind: "paragraph",
        text: "A more advanced version can treat the robot's distance from the center of the line as an error value.",
      },
      { kind: "paragraph", text: "Conceptually:" },
      {
        kind: "code",
        label: "Example",
        code: "error = desired_position - measured_position",
      },
      {
        kind: "paragraph",
        text: "A PID-style controller can then adjust motor speeds based on that error.",
      },
      {
        kind: "paragraph",
        text: "This can produce smoother and faster tracking than simple left/right switching.",
      },
      {
        kind: "paragraph",
        text: "However, PID control should be treated as a later improvement rather than a requirement for the first working version.",
      },
      { kind: "heading", text: "Mechanical considerations" },
      {
        kind: "paragraph",
        text: "Software is only part of the problem.",
      },
      {
        kind: "paragraph",
        text: "The physical design also affects tracking performance.",
      },
      { kind: "paragraph", text: "Important factors include:" },
      {
        kind: "list",
        items: [
          "distance between sensors and the floor",
          "sensor spacing",
          "wheel alignment",
          "motor speed differences",
          "robot weight distribution",
          "wheel traction",
          "battery voltage",
        ],
      },
      {
        kind: "paragraph",
        text: "A poor mechanical setup can cause unstable behaviour even when the control logic is correct.",
      },
      { kind: "heading", text: "Testing plan" },
      {
        kind: "paragraph",
        text: "Testing should progress gradually.",
      },
      { kind: "paragraph", text: "Suggested sequence:" },
      {
        kind: "ordered-list",
        items: [
          "verify individual sensors",
          "verify left and right motor control",
          "test forward movement",
          "test left and right corrections",
          "test on a simple straight line",
          "test gentle curves",
          "test sharper turns",
          "tune speed and control behaviour",
        ],
      },
      {
        kind: "paragraph",
        text: "This makes debugging easier than testing the entire robot at once.",
      },
      { kind: "heading", text: "What this project is teaching" },
      {
        kind: "paragraph",
        text: "The main value of the Line Tracker Robot is not the final robot itself.",
      },
      {
        kind: "paragraph",
        text: "The project combines several concepts in one small system:",
      },
      {
        kind: "code",
        label: "Architecture",
        code: "Sensors\n→ embedded logic\n→ motor control\n→ mechanical behaviour\n→ feedback\n→ autonomous movement",
      },
      {
        kind: "paragraph",
        text: "It is a useful introduction to how software interacts with the physical world.",
      },
      { kind: "heading", text: "Current state" },
      {
        kind: "paragraph",
        text: "This is an ongoing robotics project.",
      },
      {
        kind: "paragraph",
        text: "Future updates to this build log can document:",
      },
      {
        kind: "list",
        items: [
          "selected hardware",
          "wiring",
          "controller code",
          "motor driver",
          "sensor calibration",
          "first successful tracking",
          "failures and corrections",
          "performance improvements",
        ],
      },
    ],
  },
];
