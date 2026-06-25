import { ProjectGalleryExperience } from "@/components/projects/project-gallery-experience";
import { ProjectsIntro } from "@/components/projects/projects-intro";
import { orderProjects } from "@/components/projects/project-order";
import { siteContent, t } from "@/content/site-content";
import { createMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import type { ReactNode } from "react";

const projectPageItems = orderProjects([
  "rhythm",
  "atlas",
  "loom",
  "groove",
  "fieldnote",
  "talkback",
]);

const projectsPageDescription = {
  zh: "椤圭洰鎬昏鍏ュ彛锛岀偣鍑诲崱鐗囧悗浼氬厛灞曞紑绔欏唴璇︽儏锛岀劧鍚庡彲浠ユ煡鐪嬪畬鏁村閮ㄤ綔鍝併€?",
  en: "A project index that first opens an in-site detail view and then lets you visit the full external project.",
} as const;

export const metadata: Metadata = createMetadata({
  title: t(siteContent.metadata.projects.title, "zh"),
  description: t(projectsPageDescription, "zh"),
  path: "/projects",
});

export default function ProjectsPage(): ReactNode {
  return (
    <main id="main-content" className="flex flex-1 flex-col gap-16 sm:gap-24">
      <ProjectsIntro />
      <ProjectGalleryExperience items={projectPageItems} />
      <div className="h-10 sm:h-14" />
    </main>
  );
}
