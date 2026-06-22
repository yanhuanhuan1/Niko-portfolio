"use client";

import { Languages } from "lucide-react";
import type { ReactNode } from "react";

import { useLanguage } from "@/lib/language";

export function LanguageToggle(): ReactNode {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={language === "zh" ? "切换到英文" : "Switch to Chinese"}
      className="focus-ring fixed right-6 top-6 z-50 inline-flex items-center gap-2 rounded-full border border-foreground/8 bg-background px-3 py-2 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm transition-colors sm:right-10"
    >
      <Languages className="h-4 w-4 text-foreground/60" aria-hidden="true" />
      <span
        className={`rounded-full px-2 py-0.5 transition-colors ${
          language === "zh"
            ? "bg-foreground text-background"
            : "text-foreground/55"
        }`}
      >
        中
      </span>
      <span
        className={`rounded-full px-2 py-0.5 transition-colors ${
          language === "en"
            ? "bg-foreground text-background"
            : "text-foreground/55"
        }`}
      >
        EN
      </span>
    </button>
  );
}
