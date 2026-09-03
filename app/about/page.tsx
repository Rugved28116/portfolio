import type { Metadata } from "next";

import { PageIntro } from "@/components/page-intro";
import { siteContent } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${siteContent.identity.name}, also known as ${siteContent.identity.onlineName}.`,
};

export default function AboutPage() {
  return (
    <PageIntro
      eyebrow="About"
      title={siteContent.identity.name}
      description={siteContent.hero.description}
    >
      <p className="max-w-2xl text-sm leading-7 text-muted">
        {siteContent.identity.onlineName} is Rugved&apos;s online and builder
        identity.
      </p>
    </PageIntro>
  );
}
