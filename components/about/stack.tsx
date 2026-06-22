"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { siteContent, t } from "@/content/site-content";
import { useLanguage } from "@/lib/language";

export function Stack(): ReactNode {
  const { language } = useLanguage();
  const section = siteContent.about.sections.stack;
  const note = t(section.note, language).trim();
  const items = section.items as readonly { zh: string; en?: string; href?: string }[];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <h3 className="text-foreground text-[15px] font-semibold tracking-tight">
          {t(section.title, language)}
        </h3>
      </div>
      {note ? (
        <p className="max-w-[44ch] text-sm leading-6 tracking-tight text-foreground/50">
          {note}
        </p>
      ) : null}

      <div className="relative overflow-hidden rounded-4xl border border-foreground/5 bg-foreground/2 p-4 dark:bg-foreground/5 sm:p-5">
        <div className="border-foreground/8 bg-background text-foreground/70 absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-xl border">
          <RotateCcw className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
        </div>

        <div className="grid min-h-40 grid-cols-2 gap-3 rounded-[1.6rem] border border-dashed border-foreground/10 bg-background/70 p-5 sm:grid-cols-3 sm:p-6">
          {items.map((item, index) => (
            <Link
              href={item.href ?? "/projects"}
              key={`${item.zh}-${index}`}
              className="flex items-center justify-center rounded-2xl border border-foreground/8 bg-background/75 px-3 py-4 text-center text-sm font-medium tracking-tight text-foreground/75 transition-colors hover:border-foreground/18 hover:bg-background/90 hover:text-foreground"
            >
              {t(item, language)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
