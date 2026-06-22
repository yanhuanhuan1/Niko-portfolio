"use client";

import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";
import { useSyncExternalStore } from "react";

import { useLanguage } from "@/lib/language";
import type { ProjectCanvas } from "@/data/projectCanvases";

import styles from "./project-canvas.module.css";

const LightRays = dynamic(() => import("@/components/ui/light-rays"), {
  ssr: false,
});

const ProjectCanvasView = dynamic(
  () => import("./project-canvas").then((module) => module.ProjectCanvas),
  {
    ssr: false,
    loading: () => <div className={styles.tldrawLoading} />,
  }
);

function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

type ProjectCanvasPageProps = {
  project: ProjectCanvas;
};

export function ProjectCanvasPage({
  project,
}: ProjectCanvasPageProps): ReactNode {
  const { language } = useLanguage();
  const mounted = useIsMounted();
  const { resolvedTheme } = useTheme();
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <main id="main-content" className={styles.page}>
      <section className="relative mx-auto w-full max-w-[1680px] px-4 py-4 sm:px-6 sm:py-6">
        <div className="relative min-h-[calc(100svh-2rem)] overflow-hidden rounded-[2rem] border border-border/60 bg-background shadow-[0_30px_120px_rgba(15,23,42,0.08)] dark:border-white/10 dark:shadow-[0_40px_140px_rgba(0,0,0,0.28)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.06),transparent_58%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_58%)]" />
          {isDark ? (
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] opacity-90"
              style={{
                WebkitMaskImage:
                  "linear-gradient(to bottom, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.35) 72%, transparent)",
                maskImage:
                  "linear-gradient(to bottom, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.35) 72%, transparent)",
              }}
            >
              <LightRays
                raysOrigin="top-center"
                raysColor="#d9f6ff"
                raysSpeed={1.35}
                lightSpread={0.82}
                rayLength={1.2}
                followMouse
                mouseInfluence={0.08}
                noiseAmount={0.08}
                distortion={0.04}
              />
            </div>
          ) : null}

          <Link
            href="/projects"
            className="focus-ring absolute left-4 top-20 z-[350] inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/85 px-4 py-2 text-sm font-medium tracking-tight text-foreground shadow-sm backdrop-blur-xl transition-colors hover:bg-background dark:border-white/10 dark:bg-white/[0.08] dark:text-white dark:hover:bg-white/[0.12]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {language === "zh" ? "返回项目列表" : "Back to projects"}
          </Link>

          <div className="absolute inset-0">
            <ProjectCanvasView key={`${project.slug}-${language}`} project={project} />
          </div>
        </div>
      </section>
    </main>
  );
}
