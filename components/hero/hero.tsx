"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";
import { useSyncExternalStore } from "react";

import { FadeIn, ScaleUnblur } from "@/components/ui/motion-primitives";
import { ChromaPanel } from "@/components/ui/chroma-panel";
import ShinyText from "@/components/ui/shiny-text";
import { siteContent, t } from "@/content/site-content";
import { useLanguage } from "@/lib/language";

import { HeroCtas } from "./hero-ctas";
import type { PortraitMorphProps } from "./portrait-morph";

const PortraitMorph = dynamic<PortraitMorphProps>(
  () => import("./portrait-morph").then((mod) => mod.PortraitMorph),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.14),transparent_34%),linear-gradient(145deg,rgba(8,12,20,0.96),rgba(17,24,39,0.86))]" />
    ),
  }
);

function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function Hero(): ReactNode {
  const { language } = useLanguage();
  const mounted = useIsMounted();
  const { resolvedTheme } = useTheme();
  const isDark = mounted && resolvedTheme === "dark";
  const copy = siteContent.hero;
  const [primaryPhoto, secondaryPhoto] = copy.panel.photos;
  const titleBaseColor = isDark
    ? "rgba(243, 246, 252, 0.94)"
    : "rgba(48, 48, 48, 0.94)";
  const titleShineColor = "rgba(255, 255, 255, 1)";
  const titleShadow = isDark
    ? "0 0 24px rgba(255, 255, 255, 0.28), 0 0 60px rgba(125, 211, 252, 0.2), 0 0 96px rgba(255, 255, 255, 0.08)"
    : "0 0 18px rgba(255, 255, 255, 0.18), 0 0 42px rgba(0, 0, 0, 0.08), 0 0 80px rgba(255, 255, 255, 0.08)";
  const titleFilter = isDark
    ? "drop-shadow(0 0 16px rgba(255, 255, 255, 0.16)) drop-shadow(0 0 36px rgba(125, 211, 252, 0.14))"
    : "drop-shadow(0 0 14px rgba(255, 255, 255, 0.12)) drop-shadow(0 0 30px rgba(0, 0, 0, 0.06))";

  return (
    <section className="relative flex min-h-[100svh] w-full items-center">
      <div className="mx-auto w-full max-w-275 px-6 pb-16 pt-32 sm:px-10 sm:pb-20 sm:pt-36">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-8">
          <FadeIn className="flex flex-col gap-4">
            <p className="text-[20px] font-medium leading-tight tracking-tight text-foreground">
              {t(copy.kicker, language)}
            </p>

            <h1 className="max-w-[14ch] text-[2.75rem] font-medium leading-[1.03] tracking-tight text-foreground md:text-[2.5rem] lg:text-[3.65rem]">
              <ShinyText
                text={t(copy.title, language)}
                speed={3}
                delay={0}
                color={titleBaseColor}
                shineColor={titleShineColor}
                spread={280}
                direction="left"
                yoyo={false}
                pauseOnHover={false}
                textShadow={titleShadow}
                filter={titleFilter}
              />
            </h1>

            <p className="max-w-[34ch] text-[22px] leading-[1.4] tracking-tight text-foreground/65">
              {t(copy.description, language)}
            </p>

            <HeroCtas />
          </FadeIn>

          <ScaleUnblur className="flex justify-stretch md:justify-end">
            <div className="relative aspect-square w-full overflow-hidden rounded-4xl border border-foreground/8 bg-background p-1.5 shadow-sm md:max-w-105">
              <ChromaPanel className="relative h-full w-full overflow-hidden rounded-[1.6rem] border border-foreground/5 bg-foreground/[0.02]">
                <PortraitMorph
                  srcA={primaryPhoto?.src ?? ""}
                  srcB={secondaryPhoto?.src ?? ""}
                  alt={
                    primaryPhoto
                      ? t(primaryPhoto.alt, language)
                      : t(copy.title, language)
                  }
                  className="h-full w-full"
                />
              </ChromaPanel>
            </div>
          </ScaleUnblur>
        </div>
      </div>
    </section>
  );
}
