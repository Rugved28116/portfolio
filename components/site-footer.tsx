import { siteContent } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-6 font-mono text-xs uppercase tracking-[0.14em] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>{siteContent.identity.name}</p>
        <p>{siteContent.identity.onlineName}</p>
      </div>
    </footer>
  );
}
