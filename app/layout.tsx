import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MaintenanceProvider } from "@/components/maintenance-provider";

import {
  TerminalProvider,
  type TerminalData,
} from "@/components/portfolio-terminal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { RouteTransition } from "@/components/route-transition";
import { siteContent } from "@/content/site";
import { getLabEntries, getProjects, getPublishedNotes } from "@/lib/content";

import "./globals.css";
import "@/components/maintenance.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  ...(siteContent.site.siteUrl
    ? { metadataBase: new URL(siteContent.site.siteUrl) }
    : {}),
  title: {
    default: siteContent.site.title,
    template: `%s | ${siteContent.identity.name}`,
  },
  description: siteContent.site.description,
  applicationName: siteContent.site.siteName,
  authors: [{ name: siteContent.identity.name }],
  creator: siteContent.identity.name,
  keywords: [
    siteContent.identity.name,
    siteContent.identity.onlineName,
    "Cybersecurity",
    "Artificial Intelligence",
    "Systems",
    "Robotics",
    "Hardware",
    "Software",
    "Networking",
    "Linux",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: siteContent.site.title,
    description: siteContent.site.description,
    siteName: siteContent.site.siteName,
    locale: "en_US",
    type: "website",
    ...(siteContent.site.siteUrl ? { url: siteContent.site.siteUrl } : {}),
  },
  twitter: {
    card: "summary",
    title: siteContent.site.title,
    description: siteContent.site.description,
  },
};

const terminalData: TerminalData = {
  prompt: siteContent.terminal.prompt,
  identity: {
    name: siteContent.identity.name,
    alias: siteContent.identity.onlineName,
    positioning: siteContent.about.positioning,
  },
  currently: siteContent.currently,
  interests: siteContent.about.interests,
  interestAreas: siteContent.interests,
  projects: getProjects(),
  labEntries: getLabEntries(),
  notes: getPublishedNotes(),
  contact: {
    github: {
      label: "GitHub",
      url: siteContent.site.githubUrl,
    },
    linkedin: {
      label: "LinkedIn",
      url: siteContent.site.linkedinUrl,
    },
    email: {
      label: "Email",
      url: siteContent.site.email
        ? `mailto:${siteContent.site.email}`
        : undefined,
    },
    resume: {
      label: "Resume",
      url: siteContent.site.resumeUrl,
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <MaintenanceProvider>
        <TerminalProvider data={terminalData}>
          <a
            href="#main-content"
            className="sr-only z-50 bg-foreground px-4 py-3 text-background focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="main-content" className="flex-1">
            <RouteTransition>{children}</RouteTransition>
          </main>
          <SiteFooter />
        </TerminalProvider>
        </MaintenanceProvider>
      </body>
    </html>
  );
}
