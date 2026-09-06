import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MaintenanceProvider } from "@/components/maintenance-provider";

import {
  TerminalProvider,
  type TerminalData,
} from "@/components/portfolio-terminal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
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
  title: {
    default: `${siteContent.identity.name} | ${siteContent.identity.onlineName}`,
    template: `%s | ${siteContent.identity.onlineName}`,
  },
  description: siteContent.hero.description,
  // TODO: Add metadataBase and social metadata after public URLs are confirmed.
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
      url: siteContent.about.contact.githubUrl,
    },
    linkedin: {
      label: "LinkedIn",
      url: siteContent.about.contact.linkedinUrl,
    },
    email: {
      label: "Email",
      url: siteContent.about.contact.email
        ? `mailto:${siteContent.about.contact.email}`
        : undefined,
    },
    resume: {
      label: "Resume",
      url: siteContent.about.contact.resumeUrl,
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
            {children}
          </main>
          <SiteFooter />
        </TerminalProvider>
        </MaintenanceProvider>
      </body>
    </html>
  );
}
