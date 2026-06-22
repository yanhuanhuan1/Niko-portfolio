import { ContactCard } from "@/components/contact/contact-card";
import { Projects } from "@/components/projects/projects";
import { ProjectsIntro } from "@/components/projects/projects-intro";
import { siteContent, t } from "@/content/site-content";
import { createMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = createMetadata({
  title: t(siteContent.metadata.projects.title, "zh"),
  description: t(siteContent.metadata.projects.description, "zh"),
  path: "/projects",
});

export default function ProjectsPage(): ReactNode {
  return (
    <main id="main-content" className="flex flex-1 flex-col gap-20 sm:gap-28">
      <ProjectsIntro />
      <Projects />
      <ContactCard secondaryHref="/" />
      <div className="h-12 sm:h-16" />
    </main>
  );
}
