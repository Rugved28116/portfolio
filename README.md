# RGB Portfolio

The personal engineering portfolio of Rugved Ganesh Bhor, also known online as
RGB Official.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript in strict mode
- Tailwind CSS 4
- Geist Sans and Geist Mono

## Local development

```bash
npm run dev
```

Quality checks:

```bash
npm run lint
npx tsc --noEmit --incremental false
npm run build
```

Portfolio content is centralized in `content/`, shared UI belongs in
`components/`, and small content lookup helpers live in `lib/`.
