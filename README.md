# Rugved Ganesh Bhor | RGB Official

Personal portfolio and interactive builder's workstation focused on cybersecurity, AI, systems, robotics, hardware, Linux, and software engineering.

- **Live Portfolio:** [portfolio-ochre-psi-74.vercel.app](https://portfolio-ochre-psi-74.vercel.app)
- **GitHub:** [github.com/Rugved28116](https://github.com/Rugved28116)
- **LinkedIn:** [linkedin.com/in/rugved28116](https://www.linkedin.com/in/rugved28116/)

## Overview

This repository is more than a static portfolio. It combines a project portfolio, engineering Lab, technical Notes, a simulated terminal, RGB Maintenance Mode, an animated worker-bot system, and a responsive technical interface. Portfolio facts and contact details are kept in centralized typed content rather than repeated across components.

## Features

### Interactive Portfolio Terminal

The `>_` control opens a simulated portfolio shell. It supports safe commands including `help`, `projects`, `lab`, `notes`, `about`, `contact`, `github`, `linkedin`, `resume`, `fastfetch`, `tree`, `cat`, `cd`, and `history`, along with related navigation, search, and virtual system commands.

The terminal reads from an in-memory portfolio filesystem generated from the same project, Lab, note, and contact data used by the site. Input is parsed literally. It does not use `eval`, `child_process`, process spawning, or real shell execution, and it cannot execute operating-system commands.

### RGB Maintenance Mode

The `RGB_` control enables an optional visual maintenance layer. Eligible interface elements can be temporarily damaged, after which worker bots locate and repair them. The effect changes presentation only and does not modify portfolio content or application data.

Repair work uses document-space positioning, so workers remain associated with page locations while the visitor scrolls. Appropriate jobs can deploy ladders or scaffolding. Workers can inspect intact elements, patrol between content targets, carry tools, and use the Crew Bay. Disabling Maintenance Mode restores the interface and clears the temporary crew and equipment.

### Worker Crew

The maintenance crew includes five roles:

- Engineer
- Generalist
- Inspector
- Carrier
- Slacker

Crew size responds to damage with nonlinear scaling and hard limits for mobile, tablet, desktop, and large desktop layouts. Workers enter gradually, prioritize visible repair work, circulate through purposeful activities when no repairs are queued, and retire progressively as workload falls. Worker speech remains throttled independently of crew size.

### First-Visit Discovery

Small first-visit hints introduce the `RGB_` control, terminal trigger, terminal help, and Maintenance Mode interaction. Compact boolean completion flags are stored locally in the browser, with an in-memory fallback when storage is unavailable. The terminal's `tutorial reset` command can restore these hints.

### Engineering Lab

The [`/lab`](https://portfolio-ochre-psi-74.vercel.app/lab) route presents experiments, prototypes, hardware ideas, and planned builds through engineering-log identifiers, categories, and optional statuses.

Current entries include:

- **Line Tracker Robot**, identified as `RGB / LAB_001`
- **Portable Cyberdeck**, identified as `RGB / PLAN_001` and explicitly marked **PLANNED / NOT BUILT**

### Engineering Notes

The [`/notes`](https://portfolio-ochre-psi-74.vercel.app/notes) route contains typed technical notes and build logs with statically generated detail pages. Published examples include:

- Fixing VirtualBox Kernel Modules After an Arch Linux Update
- Designing a Multi-Strategy Chunking Pipeline for RAG
- Line Tracker Robot Build Log

### Project Pages

The work index links to statically generated `/work/[slug]` detail pages. Each page reads from centralized project data, generates project-specific metadata, handles optional fields without placeholders, and returns a not-found page for unknown slugs.

## Selected Work

- **NyayaSetu:** An AI legal assistant for simplifying legal documents, summarizing case facts, processing FIR-related information, and surfacing relevant cases and precedents.
- **AskMyNotes:** A second-brain and AI knowledge retrieval platform for organizing notes and querying them through semantic search and natural language.
- **FinGuard AI:** An SMB financial intelligence project for identifying anomalies, duplicate transactions, cash-flow risks, alerts, and actionable insights in uploaded data.
- **Voice-enabled RAG:** A retrieval-augmented generation system that transcribes spoken questions, retrieves relevant vector-database context, and generates an answer from that context.
- **Computer Vision Assurance Framework:** An offline, model-agnostic framework for assessing training-data, model, and inference integrity through anomaly detection, behavioural checks, provenance, and risk reporting.

No project completion status, dates, roles, repositories, or live URLs are asserted here because those fields are not configured in the current project data.

## Tech Stack

- Next.js 16.3.4 with the App Router
- React 19.2.8
- TypeScript 5 in strict mode
- Tailwind CSS 4
- CSS Modules and global CSS
- Geist Sans and Geist Mono through `next/font`
- ESLint 9 with `eslint-config-next`
- Vercel deployment
- Git and GitHub

This list describes the portfolio implementation. Technologies listed inside individual project records are project content, not necessarily dependencies of this repository.

## Project Structure

```text
portfolio/
├── app/             # Next.js routes, layouts, metadata, robots, and sitemap
├── components/      # Shared UI, terminal, discovery, and maintenance systems
├── content/         # Centralized typed portfolio content
├── lib/             # Content lookups, discovery state, and virtual shell logic
├── public/          # Static assets, including the public resume
├── next.config.ts
├── package.json
└── tsconfig.json
```

The `app/` directory contains App Router pages and route metadata. `components/` contains the reusable interface and interactive client systems. `content/` is the source of truth for portfolio facts. `lib/` provides content access and isolated terminal/discovery logic. `public/` contains files served directly by Next.js.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Homepage and portfolio overview |
| `/work` | Project index |
| `/work/[slug]` | Statically generated project details |
| `/lab` | Engineering Lab index |
| `/notes` | Engineering Notes index |
| `/notes/[slug]` | Statically generated note details |
| `/about` | Identity, interests, references, and contact links |

The application also generates `/robots.txt` and `/sitemap.xml` from the centralized production site URL and published content. There is currently no `/lab/[slug]` route.

## Local Development

Requirements: a current Node.js environment compatible with Next.js 16 and npm.

```bash
git clone https://github.com/Rugved28116/portfolio.git
cd portfolio
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Available package scripts:

```bash
npm run dev
npm run lint
npm run build -- --webpack
npm run start
```

`npm run build -- --webpack` is the known-good production validation path used for this repository.

## Content Management

Portfolio content is maintained as typed TypeScript data:

- `content/projects.ts` contains project records and work-page slugs.
- `content/lab.ts` contains Lab filters, engineering identifiers, entries, and statuses.
- `content/notes.ts` contains published or draft note records and structured note content.
- `content/site.ts` contains identity, navigation, homepage, contact, resume, and production-site configuration.
- `content/types.ts` defines the shared content model.

Lookup helpers in `lib/content.ts` expose this data to routes and components. New UI should consume these centralized sources instead of duplicating project facts, Lab status, or contact information.

## Design Direction

The interface follows a dark-first, editorial technical aesthetic called the Builder's Workstation. It uses Geist Sans and Geist Mono, restrained accent color, compact engineering metadata, minimal decorative effects, and progressive enhancement. Motion systems provide reduced-motion alternatives.

## Accessibility

Implemented accessibility practices include:

- semantic headings, navigation, articles, lists, and dialog structure
- keyboard-operable navigation, links, Maintenance Mode, and terminal controls
- visible global and component-level focus states
- `aria-current="page"` on the active navigation route
- an accessible pressed state and instructions for the Maintenance Mode toggle
- `prefers-reduced-motion` handling across reveal, route, terminal, maintenance, and worker effects
- decorative maintenance workers and equipment marked non-interactive with `pointer-events: none`

Maintenance Mode preserves ordinary link activation, so the optional visual system is never required for navigation.

## Deployment

The portfolio is hosted on Vercel:

[https://portfolio-ochre-psi-74.vercel.app](https://portfolio-ochre-psi-74.vercel.app)

When the Vercel project is connected to the GitHub repository, pushes can trigger new deployments. The repository does not claim a custom domain.

## Contact

**Rugved Ganesh Bhor**

- Email: [rugved4327@gmail.com](mailto:rugved4327@gmail.com)
- GitHub: [github.com/Rugved28116](https://github.com/Rugved28116)
- LinkedIn: [linkedin.com/in/rugved28116](https://www.linkedin.com/in/rugved28116/)
- Portfolio: [portfolio-ochre-psi-74.vercel.app](https://portfolio-ochre-psi-74.vercel.app)
