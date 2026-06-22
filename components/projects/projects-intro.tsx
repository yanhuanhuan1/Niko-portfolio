"use client";

import type { ReactNode } from "react";

import { FadeIn } from "@/components/ui/motion-primitives";
import { siteContent, t } from "@/content/site-content";
import { useLanguage } from "@/lib/language";

export function ProjectsIntro(): ReactNode {
  const { language } = useLanguage();
  const copy = siteContent.projectsIntro;

  return (
    <section className="mx-auto w-full max-w-275 px-6 pt-44 sm:px-10 sm:pt-56">
      <FadeIn className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-foreground/45">
          {t(copy.kicker, language)}
        </p>
        <h1 className="mt-5 font-serif text-[2.75rem] font-medium leading-[1.03] tracking-tight text-foreground md:text-[3.35rem] lg:text-[3.95rem]">
          {t(copy.title, language)}
        </h1>
        <p className="mt-5 max-w-[34ch] text-[20px] leading-[1.42] tracking-tight text-foreground/65 sm:text-[22px]">
          {t(copy.description, language)}
        </p>
      </FadeIn>
    </section>
  );
}
