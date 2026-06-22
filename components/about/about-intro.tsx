"use client";

import type { ReactNode } from "react";

import { FadeIn } from "@/components/ui/motion-primitives";
import { siteContent, t } from "@/content/site-content";
import { useLanguage } from "@/lib/language";

function ProfileRow({
  label,
  value,
}: {
  label: string;
  value: string;
}): ReactNode {
  return (
    <div className="flex flex-col gap-2 rounded-3xl border border-foreground/5 bg-background p-4 sm:flex-row sm:items-center sm:gap-4">
      <span className="text-sm font-medium tracking-tight text-foreground/55 sm:w-20">
        {label}
      </span>
      <span className="hidden h-px flex-1 bg-foreground/10 sm:block" />
      <span className="text-sm font-medium tracking-tight text-foreground/85">
        {value}
      </span>
    </div>
  );
}

export function AboutIntro(): ReactNode {
  const { language } = useLanguage();
  const copy = siteContent.about.intro;
  const note = t(copy.note, language).trim();

  return (
    <section className="mx-auto w-full max-w-160 px-6 pt-20 pb-16 sm:px-10 sm:pt-28 sm:pb-24">
      <FadeIn delay={0.5}>
        <div className="rounded-4xl border border-foreground/5 bg-foreground/1.5 p-8 sm:p-12 dark:bg-foreground/3">
          <h1 className="font-serif text-[1.75rem] font-medium tracking-tight text-foreground sm:text-[2rem]">
            {t(copy.title, language)}
          </h1>
          <p className="mt-5 max-w-[34ch] text-[15px] leading-7 tracking-tight text-foreground/62">
            {t(copy.description, language)}
          </p>
          {note ? (
            <p className="mt-3 max-w-[38ch] text-[13px] leading-6 tracking-tight text-foreground/45">
              {note}
            </p>
          ) : null}
          <div className="mt-8 space-y-4">
            {copy.rows.map((row, index) => (
              <ProfileRow
                key={`${row.label.zh}-${index}`}
                label={t(row.label, language)}
                value={t(row.value, language)}
              />
            ))}
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
