"use client";

import { ArrowRight, Compass, Sparkles, Workflow } from "lucide-react";
import type { ComponentType, ReactNode } from "react";

import { FadeIn } from "@/components/ui/motion-primitives";
import { siteContent, t } from "@/content/site-content";
import { useLanguage } from "@/lib/language";

const SYSTEM_ICONS = {
  compass: Compass,
  sparkles: Sparkles,
  workflow: Workflow,
} as const satisfies Record<
  (typeof siteContent.systemCaseStudy.pillars)[number]["icon"],
  ComponentType<{ className?: string }>
>;

type CommandLine = {
  prompt: string;
  command: string;
  output: {
    zh: string;
    en: string;
  };
  accent?: boolean;
};

export function SystemCaseStudy(): ReactNode {
  const { language } = useLanguage();
  const content = siteContent.systemCaseStudy;
  const commands = content.terminal as readonly CommandLine[];

  return (
    <section className="relative w-full">
      <div className="mx-auto grid w-full max-w-275 gap-8 px-6 sm:px-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] lg:items-start">
        <FadeIn className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-2">
            {content.badges.map((badge) => (
              <Badge key={badge.zh}>{t(badge, language)}</Badge>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-foreground/45">
              {t(content.eyebrow, language)}
            </p>
            <h2 className="max-w-4xl font-serif text-[2.45rem] font-medium leading-[1.03] tracking-tight text-foreground md:text-[3.05rem] lg:text-[3.55rem]">
              {t(content.headline, language)}
            </h2>
            <p className="max-w-[46ch] text-[18px] leading-[1.58] tracking-tight text-foreground/65 sm:text-[19px]">
              {t(content.intro, language)}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {content.metrics.map((metric) => (
              <Metric
                key={metric.label.zh}
                label={t(metric.label, language)}
                value={metric.value}
                copy={t(metric.copy, language)}
              />
            ))}
          </div>

          <div className="rounded-4xl border border-foreground/8 bg-background p-1.5 shadow-sm">
            <div className="rounded-[1.6rem] border border-foreground/5 bg-foreground/[0.015] p-6 sm:p-7">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-foreground/45">
                {t(content.designLabel, language)}
              </p>
              <p className="mt-4 max-w-2xl text-[17px] leading-[1.65] tracking-tight text-foreground/75 sm:text-[18px]">
                {t(content.designCopy, language)}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {content.designTags.map((tag) => (
                  <span
                    key={tag.zh}
                    className="rounded-full border border-foreground/8 bg-background px-3 py-1 text-xs tracking-tight text-foreground/60"
                  >
                    {t(tag, language)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.08} className="lg:sticky lg:top-28">
          <div className="rounded-4xl border border-foreground/8 bg-background p-1.5 shadow-sm">
            <div className="rounded-[1.6rem] border border-foreground/5 bg-background p-5 sm:p-6">
              <div className="flex items-center gap-2 border-b border-foreground/8 pb-4">
                <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                <span className="h-3 w-3 rounded-full bg-[#28ca41]" />
                <span className="mx-auto text-xs tracking-[0.18em] text-foreground/40">
                  {t(content.shellLabel, language)}
                </span>
              </div>

              <div className="mt-5 space-y-3 font-mono text-[13px] leading-7 text-foreground/80">
                {commands.map((line) => (
                  <TerminalLine key={line.command} line={line} language={language} />
                ))}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {content.miniCards.map((mini) => (
                  <MiniCard
                    key={mini.title.zh}
                    title={t(mini.title, language)}
                    copy={t(mini.copy, language)}
                  />
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>

      <div className="mt-20 border-y border-foreground/5 bg-foreground/[0.015] sm:mt-24">
        <div className="mx-auto w-full max-w-275 px-6 py-16 sm:px-10 sm:py-20">
          <FadeIn>
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-foreground/45">
                {language === "zh" ? "系统层级" : "System pillars"}
              </p>
              <h3 className="font-serif text-[2.1rem] font-medium tracking-tight text-foreground sm:text-[2.45rem]">
                {t(content.pillarsTitle, language)}
              </h3>
            </div>
          </FadeIn>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {content.pillars.map((pillar, index) => {
              const Icon = SYSTEM_ICONS[pillar.icon];

              return (
                <FadeIn key={pillar.label.zh} delay={0.08 + index * 0.05}>
                  <article className="h-full rounded-4xl border border-foreground/8 bg-background p-5 shadow-sm transition-transform duration-300 hover:-translate-y-1">
                    <header className="flex items-center gap-3">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-foreground/8 bg-foreground/[0.02]">
                        <Icon className="h-4 w-4 text-foreground" aria-hidden="true" />
                      </span>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium uppercase tracking-[0.22em] text-foreground/45">
                          {t(pillar.label, language)}
                        </span>
                        <h4 className="mt-1 text-[19px] font-medium tracking-tight text-foreground">
                          {t(pillar.title, language)}
                        </h4>
                      </div>
                    </header>
                    <p className="mt-4 text-[14px] leading-[1.7] tracking-tight text-foreground/65">
                      {t(pillar.copy, language)}
                    </p>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {pillar.bullets.map((bullet) => (
                        <li
                          key={bullet.zh}
                          className="rounded-full border border-foreground/8 bg-background px-3 py-1 text-xs tracking-tight text-foreground/60"
                        >
                          {t(bullet, language)}
                        </li>
                      ))}
                    </ul>
                  </article>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-275 px-6 py-20 sm:px-10 sm:py-24">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <FadeIn className="rounded-4xl border border-foreground/8 bg-background p-6 shadow-sm sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-foreground/45">
              {t(content.timelineTitle, language)}
            </p>
            <div className="mt-6 space-y-5">
              {content.timeline.map((step, index) => (
                <div
                  key={step.index}
                  className={`flex gap-4 rounded-3xl border border-foreground/5 p-4 ${
                    index === 0 ? "bg-foreground/[0.02]" : "bg-background"
                  }`}
                >
                  <div className="font-mono text-xs tracking-[0.24em] text-foreground/45">
                    {step.index}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[17px] font-medium tracking-tight text-foreground">
                      {t(step.title, language)}
                    </h4>
                    <p className="mt-2 text-[14px] leading-[1.7] tracking-tight text-foreground/65">
                      {t(step.copy, language)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.08} className="rounded-4xl border border-foreground/8 bg-background p-6 shadow-sm sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-foreground/45">
              {t(content.changesTitle, language)}
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {content.outcomes.map((item, index) => (
                <article
                  key={item.title.zh}
                  className={`rounded-3xl border border-foreground/5 p-5 ${
                    index === 0 ? "bg-foreground/[0.02]" : "bg-background"
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-medium tracking-tight text-foreground">
                    <ArrowRight className="h-4 w-4 text-[#2b7fd8]" aria-hidden="true" />
                    {t(item.title, language)}
                  </div>
                  <p className="mt-3 text-[14px] leading-[1.7] tracking-tight text-foreground/65">
                    {t(item.copy, language)}
                  </p>
                </article>
              ))}
            </div>

            <blockquote className="mt-6 rounded-3xl border border-[#f4d758]/50 bg-[#f4d758]/10 p-5 text-[15px] leading-[1.7] tracking-tight text-foreground/80">
              {t(content.quote, language)}
              <span className="block text-foreground/55">{t(content.quoteNote, language)}</span>
            </blockquote>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function Badge({ children }: { children: ReactNode }): ReactNode {
  return (
    <span className="rounded-full border border-foreground/8 bg-background px-3 py-1 text-xs font-medium tracking-tight text-foreground/60">
      {children}
    </span>
  );
}

function Metric({
  label,
  value,
  copy,
}: {
  label: string;
  value: string;
  copy: string;
}): ReactNode {
  return (
    <div className="rounded-3xl border border-foreground/8 bg-background p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-[0.24em] text-foreground/45">
        {label}
      </p>
      <div className="mt-3 text-[2rem] font-medium leading-none tracking-tight text-foreground">
        {value}
      </div>
      <p className="mt-3 text-[13px] leading-[1.65] tracking-tight text-foreground/60">
        {copy}
      </p>
    </div>
  );
}

function MiniCard({
  title,
  copy,
}: {
  title: string;
  copy: string;
}): ReactNode {
  return (
    <div className="rounded-3xl border border-foreground/5 bg-background p-4">
      <p className="text-sm font-medium tracking-tight text-foreground">{title}</p>
      <p className="mt-2 text-[13px] leading-[1.65] tracking-tight text-foreground/60">
        {copy}
      </p>
    </div>
  );
}

function TerminalLine({
  line,
  language,
}: {
  line: CommandLine;
  language: "zh" | "en";
}): ReactNode {
  return (
    <div className="rounded-2xl bg-foreground/[0.02] px-4 py-3">
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-foreground/45">{line.prompt}</span>
        <span className="text-foreground">{line.command}</span>
        {line.accent ? (
          <span className="ml-2 rounded-full bg-[#f4d758] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#1e5ba8]">
            highlight
          </span>
        ) : null}
      </div>
      <div className="mt-1 text-foreground/65">{`> ${t(line.output, language)}`}</div>
    </div>
  );
}
