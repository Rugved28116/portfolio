import { PageIntro } from "@/components/page-intro";
import { siteContent } from "@/content/site";

export default function Home() {
  return (
    <PageIntro
      eyebrow={siteContent.identity.name}
      title={siteContent.hero.statement}
      description={siteContent.hero.description}
    >
      <p className="font-mono text-sm uppercase tracking-[0.16em] text-muted">
        {siteContent.hero.disciplines.join(" / ")}
      </p>
    </PageIntro>
  );
}
