"use client";

import type { ReactNode } from "react";

import { FadeIn } from "@/components/ui/motion-primitives";
import { SplitText } from "@/components/ui/split-text";
import { siteContent, t } from "@/content/site-content";
import { useLanguage } from "@/lib/language";

export function ProjectsIntro(): ReactNode {
  const { language } = useLanguage();
  const copy = siteContent.projectsIntro;
  const splitType = language === "en" ? "words" : "chars";

  /*
  Legacy layout:
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
  */

  return (
    <section className="relative flex min-h-[56svh] w-full items-center overflow-hidden sm:min-h-[100svh]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_15%,rgba(0,0,0,0.05),transparent_40%),radial-gradient(circle_at_50%_110%,rgba(0,0,0,0.03),transparent_30%)] dark:bg-[radial-gradient(circle_at_50%_15%,rgba(255,255,255,0.07),transparent_40%),radial-gradient(circle_at_50%_110%,rgba(255,255,255,0.03),transparent_30%)]" />

      <div className="mx-auto w-full max-w-275 px-6 py-20 sm:px-10 sm:py-32 lg:py-36">
        <FadeIn className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <SplitText
            key={`${language}-projects-kicker`}
            tag="p"
            text={t(copy.kicker, language)}
            className="text-xs font-medium uppercase tracking-[0.22em] text-foreground/45 sm:text-sm sm:tracking-[0.24em]"
            delay={18}
            duration={0.55}
            splitType={splitType}
            from={{ opacity: 0, y: 16 }}
            to={{ opacity: 1, y: 0 }}
          />

          <SplitText
            key={`${language}-projects-title`}
            tag="h1"
            text={t(copy.title, language)}
            className={`mt-4 whitespace-normal font-serif font-medium leading-[1.12] tracking-normal text-foreground sm:mt-5 sm:text-[2.75rem] md:text-[3.35rem] lg:text-[3.95rem] ${
              language === "en" ? "text-[1.35rem]" : "text-[1.2rem]"
            }`}
            delay={30}
            duration={0.72}
            splitType={splitType}
            from={{ opacity: 0, y: 18 }}
            to={{ opacity: 1, y: 0 }}
          />

          <SplitText
            key={`${language}-projects-description`}
            tag="p"
            text={t(copy.description, language)}
            className="mt-4 max-w-[26ch] text-[16px] leading-[1.45] tracking-normal text-foreground/65 sm:mt-5 sm:max-w-[34ch] sm:text-[22px]"
            delay={24}
            duration={0.68}
            splitType={splitType}
            from={{ opacity: 0, y: 14 }}
            to={{ opacity: 1, y: 0 }}
          />
        </FadeIn>
      </div>
    </section>
  );
}
