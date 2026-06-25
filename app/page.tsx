import { ContactCard } from "@/components/contact/contact-card";
import { Hero } from "@/components/hero/hero";
import { Projects } from "@/components/projects/projects";
import { orderProjects } from "@/components/projects/project-order";
import { siteContent, t } from "@/content/site-content";
import { createMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import type { ReactNode } from "react";

const homeProjectItems = orderProjects([
  "groove",
  "atlas",
  "rhythm",
  "talkback",
  "fieldnote",
  "loom",
]);

export const metadata: Metadata = createMetadata({
  title: t(siteContent.metadata.home.title, "zh"),
  description: t(siteContent.metadata.home.description, "zh"),
  path: "/",
});

export default function HomePage(): ReactNode {
  return (
    <main id="main-content" className="flex flex-1 flex-col gap-20 sm:gap-28">
      <Hero />
      <Projects withHeadline viewMoreVisible items={homeProjectItems} />
      <ContactCard />
      <div className="h-12 sm:h-16" />
    </main>
  );
}
