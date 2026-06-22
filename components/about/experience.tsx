"use client";

import type { ReactNode } from "react";

import { siteContent, t } from "@/content/site-content";
import { useLanguage } from "@/lib/language";

function ExperienceItem({
  period,
  title,
  subtitle,
  description,
}: {
  period: string;
  title: string;
  subtitle: string;
  description: string;
}): ReactNode {
  const showPeriod = period.trim().length > 0;

  return (
    <article className="rounded-[1.6rem] border border-foreground/10 bg-background/75 p-4 shadow-sm">
      {showPeriod ? (
        <p className="text-[11px] font-semibold tracking-[0.22em] text-foreground/42 uppercase">
          {period}
        </p>
      ) : null}
      <h4 className="mt-2 text-[1rem] font-semibold tracking-tight text-foreground">
        {title}
      </h4>
      <p className="mt-1 text-[13px] font-medium tracking-tight text-foreground/55">
        {subtitle}
      </p>
      <p className="mt-3 text-[13px] leading-6 tracking-tight text-foreground/64">
        {description}
      </p>
    </article>
  );
}

export function Experience(): ReactNode {
  const { language } = useLanguage();
  const section = siteContent.about.sections.experience;
  const note = t(section.note, language).trim();

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
        {t(section.title, language)}
      </h3>
      {note ? (
        <p className="max-w-[44ch] text-sm leading-6 tracking-tight text-foreground/50">
          {note}
        </p>
      ) : null}
      <div className="rounded-4xl border border-foreground/5 bg-foreground/2 p-4 dark:bg-foreground/5 sm:p-5">
        <div className="flex flex-col gap-3 rounded-[1.6rem] border border-dashed border-foreground/10 bg-background/70 p-5 sm:p-6">
          <div className="space-y-4">
            {section.items.map((item, index) => (
              <ExperienceItem
                key={`${item.title.zh}-${index}`}
                period={t(item.period, language)}
                title={t(item.title, language)}
                subtitle={t(item.subtitle, language)}
                description={t(item.description, language)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
