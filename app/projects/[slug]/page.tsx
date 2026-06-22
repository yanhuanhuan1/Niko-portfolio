import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ProjectCanvasPage } from "@/components/projects/project-canvas-page";
import { createMetadata } from "@/lib/metadata";
import { getProjectCanvas, projectCanvases } from "@/data/projectCanvases";
import { t } from "@/content/site-content";

export function generateStaticParams(): Array<{ slug: string }> {
  return projectCanvases.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectCanvas(slug);
  if (!project) {
    return createMetadata({
      title: "Project not found",
      description: "The requested project canvas could not be found.",
      path: `/projects/${slug}`,
      noIndex: true,
    });
  }

  return createMetadata({
    title: t(project.title, "zh"),
    description: t(project.subtitle, "zh"),
    path: `/projects/${project.slug}`,
  });
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<ReactNode> {
  const { slug } = await params;
  const project = getProjectCanvas(slug);

  if (!project) {
    notFound();
  }

  return <ProjectCanvasPage project={project} />;
}
