import type { MetadataRoute } from "next";

import { siteContent } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    ...(siteContent.site.siteUrl
      ? { sitemap: new URL("/sitemap.xml", siteContent.site.siteUrl).toString() }
      : {}),
  };
}
