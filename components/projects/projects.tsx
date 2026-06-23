"use client";

import {
  ArrowRight,
  Bot,
  Compass,
  Layers,
  LineChart,
  Sparkles,
  Wand2,
  Workflow,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, type ComponentType, type ReactNode } from "react";

import { FadeIn } from "@/components/ui/motion-primitives";
import { siteContent, t, type IconKey } from "@/content/site-content";
import { useLanguage } from "@/lib/language";
import type { ProjectItem } from "./project-order";

/**
 * Project imagery below is mockup-only. All visuals are sourced from
 * Dribbble and credit belongs to the original creators on dribbble.com.
 * Replace these with your own work before shipping.
 */

const PROJECT_ICONS: Record<IconKey, ComponentType<{ className?: string }>> = {
  compass: Compass,
  sparkles: Sparkles,
  workflow: Workflow,
  bot: Bot,
  layers: Layers,
  chart: LineChart,
  wand: Wand2,
};

const PROJECTS = siteContent.homeProjects.items;
const MISSING_LINKS_WARNED = new Set<string>();

export type ProjectsProps = {
  withHeadline?: boolean;
  viewMoreVisible?: boolean;
  items?: readonly ProjectItem[];
};

export function Projects({
  withHeadline = false,
  viewMoreVisible = false,
  items = PROJECTS,
}: ProjectsProps): ReactNode {
  const { language } = useLanguage();
  const visibleItems = viewMoreVisible ? items.slice(0, 4) : items;
  const copy = siteContent.homeProjects;

  return (
    <section className="relative w-full">
      <div className="mx-auto w-full max-w-275 px-6 sm:px-10">
        {withHeadline ? (
          <FadeIn className="flex flex-col items-center gap-5 pb-10 pt-12 text-center sm:pb-14 sm:pt-20">
            <h2 className="font-serif text-[2.5rem] font-medium leading-[1.05] tracking-tight text-foreground md:text-[3rem] lg:text-[3.5rem]">
              {t(copy.heading, language)}
            </h2>
            <p className="max-w-[33ch] text-[18px] leading-[1.45] tracking-tight text-foreground/65 sm:text-[20px]">
              {t(copy.description, language)}
            </p>
          </FadeIn>
        ) : null}

        <div className="columns-1 gap-6 md:columns-2 md:gap-7">
          {visibleItems.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>

        {viewMoreVisible ? (
          <div className="mt-12 flex justify-center sm:mt-16">
            <Link
              href="/projects"
              className="border border-foreground/8 focus-ring group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
            >
              {t(copy.viewAll, language)}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ProjectCard({
  project,
  index,
}: {
  project: ProjectItem;
  index: number;
}): ReactNode {
  const { language } = useLanguage();
  const copy = siteContent.homeProjects;
  const Icon = PROJECT_ICONS[project.icon];
  const externalUrl = project.externalUrl.trim();
  const hasExternalUrl = externalUrl.length > 0;

  useEffect(() => {
    if (hasExternalUrl || MISSING_LINKS_WARNED.has(project.id)) {
      return;
    }

    MISSING_LINKS_WARNED.add(project.id);
    console.warn(
      `[projects] Missing externalUrl for project "${project.id}" (${t(project.title, "zh")}).`
    );
  }, [hasExternalUrl, project.id, project.title]);

  const content = (
    <article className="project-card flex flex-col gap-4 rounded-3xl border border-foreground/8 bg-background p-3 sm:p-3.5">
      <header className="flex items-center gap-2.5 px-1 pt-2">
        <span className="border-foreground/10 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-background">
          <Icon className="h-3.5 w-3.5 text-foreground" aria-hidden="true" />
        </span>
        <span className="text-sm font-medium tracking-tight text-foreground">
          {t(project.iconLabel, language)}
        </span>
      </header>

      <div
        className="project-card__image ring-foreground/5 relative w-full overflow-hidden rounded-2xl bg-foreground/5 ring-1"
        style={{ aspectRatio: project.imageRatio }}
      >
        <div className="project-card__image-inner">
          <Image
            src={project.image.src}
            alt={t(project.image.alt, language)}
            fill
            sizes="(min-width: 1024px) 540px, (min-width: 768px) 45vw, 100vw"
            className="object-cover"
            priority={index < 2}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2.5 px-1 pb-1">
        <h3 className="text-[20px] font-medium leading-[1.2] tracking-tight text-foreground sm:text-[22px]">
          {t(project.title, language)}
        </h3>
        <p className="text-[14px] leading-normal tracking-tight text-foreground/65 sm:text-[15px]">
          {t(project.description, language)}
        </p>
      </div>

      <div className="flex flex-col gap-1 px-1 pb-2">
        <p className="text-[12px] tracking-tight text-foreground/50">
          {t(project.meta, language)}
        </p>
        {!hasExternalUrl ? (
          <p className="text-[12px] font-medium tracking-tight text-foreground/45">
            {t(copy.missingLinkLabel, language)}
          </p>
        ) : null}
      </div>
    </article>
  );

  return (
    <FadeIn
      delay={Math.min(index * 0.06, 0.3)}
      className="mb-6 break-inside-avoid md:mb-7"
    >
      {hasExternalUrl ? (
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${t(project.title, language)} ${t(project.meta, language)}`}
          className="group block focus-ring"
        >
          {content}
        </a>
      ) : (
        <div
          aria-disabled="true"
          title={t(copy.missingLinkLabel, language)}
          className="group block cursor-not-allowed"
        >
          {content}
        </div>
      )}
    </FadeIn>
  );
}
