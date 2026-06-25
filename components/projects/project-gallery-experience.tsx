"use client";

import {
  ArrowUpRight,
  Bot,
  Compass,
  Layers,
  LineChart,
  Sparkles,
  Wand2,
  Workflow,
  X,
  type LucideIcon,
} from "lucide-react";
import gsap from "gsap";
import Flip from "gsap/Flip";
import Lenis from "lenis";
import Image from "next/image";
import { time } from "motion-dom";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { createPortal, flushSync } from "react-dom";

import { siteContent, t, type IconKey } from "@/content/site-content";
import { useIsMobile } from "@/hooks/useIsMobile";
import { subscribeAnimationFrame } from "@/lib/animation-clock";
import { useLanguage } from "@/lib/language";
import { useReducedMotion } from "@/lib/motion";
import type { ProjectItem } from "./project-order";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Flip);
}

const PROJECT_ICONS: Record<IconKey, LucideIcon> = {
  compass: Compass,
  sparkles: Sparkles,
  workflow: Workflow,
  bot: Bot,
  layers: Layers,
  chart: LineChart,
  wand: Wand2,
};

const HORIZONTAL_LENIS_OPTIONS = {
  orientation: "horizontal" as const,
  gestureOrientation: "both" as const,
  smoothWheel: false,
  syncTouch: false,
  wheelMultiplier: 1,
  touchMultiplier: 1.15,
  lerp: 0.09,
  autoRaf: false,
};

const WHEEL_SCROLL_MULTIPLIER = 2;

type ProjectGalleryExperienceProps = {
  items: readonly ProjectItem[];
};

export function ProjectGalleryExperience({
  items,
}: ProjectGalleryExperienceProps): ReactNode {
  const { language } = useLanguage();
  const isMobile = useIsMobile(768);
  const reducedMotion = useReducedMotion();
  const dialogBaseId = useId().replace(/:/g, "");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const detailCardRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const closeProjectRef = useRef<(() => Promise<void>) | null>(null);
  const dragBlockUntilRef = useRef(0);
  const dragStateRef = useRef<{
    pointerId: number | null;
    pressedCardId: string | null;
    startX: number;
    startScrollLeft: number;
    moved: boolean;
  }>({
    pointerId: null,
    pressedCardId: null,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  });
  const cardRefs = useRef(new Map<string, HTMLButtonElement>());

  const activeProject = items.find((item) => item.id === activeId) ?? null;
  const enableDesktopGallery = !isMobile;
  const enableAnimatedOpen = enableDesktopGallery && !reducedMotion;
  const dialogId = `${dialogBaseId}-project-detail`;
  const titleId = `${dialogId}-title`;
  const copy = siteContent.projectsGallery;
  const homeProjectsCopy = siteContent.homeProjects;

  function applyHorizontalDelta(delta: number, immediate = false): boolean {
    const wrapper = scrollerRef.current;
    if (!wrapper) {
      return false;
    }

    const maxScrollLeft = Math.max(0, wrapper.scrollWidth - wrapper.clientWidth);

    if (maxScrollLeft <= 1) {
      return false;
    }

    const currentScrollLeft = wrapper.scrollLeft;
    const nextScrollLeft = Math.min(
      maxScrollLeft,
      Math.max(0, currentScrollLeft + delta)
    );

    if (Math.abs(nextScrollLeft - currentScrollLeft) < 0.5) {
      return false;
    }

    if (lenisRef.current) {
      lenisRef.current.scrollTo(nextScrollLeft, {
        force: true,
        immediate,
      });
    } else {
      wrapper.scrollLeft = nextScrollLeft;
    }

    return true;
  }

  function consumeWheelAsHorizontal(
    event: Pick<WheelEvent, "deltaX" | "deltaY">
  ): boolean {
    if (reducedMotion || activeProject) {
      return false;
    }

    const dominantDelta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY;

    if (Math.abs(dominantDelta) < 0.5) {
      return false;
    }

    return applyHorizontalDelta(dominantDelta * WHEEL_SCROLL_MULTIPLIER);
  }

  useEffect(() => {
    if (!enableDesktopGallery || reducedMotion) {
      lenisRef.current?.destroy();
      lenisRef.current = null;
      return;
    }

    const wrapper = scrollerRef.current;
    const content = railRef.current;
    if (!wrapper || !content) {
      return;
    }

    const lenis = new Lenis({
      wrapper,
      content,
      ...HORIZONTAL_LENIS_OPTIONS,
    });

    lenisRef.current = lenis;
    const unsubscribe = subscribeAnimationFrame(() => {
      lenis.raf(time.now());
    });

    const handleWheel = (event: WheelEvent): void => {
      if (activeProject) {
        return;
      }

      const dominantDelta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;

      if (Math.abs(dominantDelta) < 0.5) {
        return;
      }

      const maxScrollLeft = Math.max(
        0,
        wrapper.scrollWidth - wrapper.clientWidth
      );

      if (maxScrollLeft <= 1) {
        return;
      }

      const currentScrollLeft = wrapper.scrollLeft;
      const nextScrollLeft = Math.min(
        maxScrollLeft,
        Math.max(
          0,
          currentScrollLeft + dominantDelta * WHEEL_SCROLL_MULTIPLIER
        )
      );

      if (Math.abs(nextScrollLeft - currentScrollLeft) < 0.5) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      lenis.scrollTo(nextScrollLeft, {
        force: true,
      });
    };

    wrapper.addEventListener("wheel", handleWheel, {
      passive: false,
      capture: true,
    });

    return () => {
      wrapper.removeEventListener("wheel", handleWheel, {
        capture: true,
      });
      unsubscribe();
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [activeProject, enableDesktopGallery, reducedMotion]);

  useEffect(() => {
    if (!activeProject) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        event.preventDefault();
        void closeProjectRef.current?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeProject]);

  useEffect(() => {
    if (!activeProject) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeProject]);

  useEffect(() => {
    if (!activeProject || enableAnimatedOpen || !closeButtonRef.current) {
      return;
    }

    window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });
  }, [activeProject, enableAnimatedOpen]);

  function setCardRef(id: string, node: HTMLButtonElement | null): void {
    if (node) {
      cardRefs.current.set(id, node);
      return;
    }

    cardRefs.current.delete(id);
  }

  function animateOverlayIn(projectId: string): void {
    const sourceCard = cardRefs.current.get(projectId);
    const detailCard = detailCardRef.current;
    const overlay = overlayRef.current;

    if (!sourceCard || !detailCard || !overlay) {
      setIsAnimating(false);
      closeButtonRef.current?.focus();
      return;
    }

    const clone = createFloatingClone(sourceCard);
    gsap.set(overlay, { opacity: 0 });
    gsap.set(detailCard, { opacity: 0 });

    const timeline = gsap.timeline({
      defaults: {
        ease: "power2.out",
      },
      onComplete: () => {
        clone.remove();
        gsap.set(overlay, { clearProps: "opacity" });
        gsap.set(detailCard, { clearProps: "opacity" });
        setIsAnimating(false);
        closeButtonRef.current?.focus();
      },
    });

    timeline.to(
      overlay,
      {
        opacity: 1,
        duration: 0.12,
      },
      0
    );

    timeline.to(
      detailCard,
      {
        opacity: 1,
        duration: 0.14,
        ease: "power1.out",
      },
      0.06
    );

    const fitTween = Flip.fit(clone, detailCard, {
      absolute: true,
      scale: true,
      duration: 0.32,
      ease: "power2.out",
    }) as gsap.core.Tween | null;

    if (fitTween) {
      timeline.add(fitTween, 0);
    }
  }

  function openProject(project: ProjectItem, trigger: HTMLElement): void {
    if (activeProject || isAnimating || Date.now() < dragBlockUntilRef.current) {
      return;
    }

    lastFocusedRef.current = trigger;

    if (!enableAnimatedOpen) {
      setActiveId(project.id);
      return;
    }

    setIsAnimating(true);

    flushSync(() => {
      setActiveId(project.id);
    });

    window.requestAnimationFrame(() => {
      animateOverlayIn(project.id);
    });
  }

  const closeProject = useCallback((): Promise<void> => {
    if (!activeProject || isAnimating) {
      return Promise.resolve();
    }

    if (!enableAnimatedOpen) {
      setActiveId(null);
      window.requestAnimationFrame(() => {
        lastFocusedRef.current?.focus();
      });
      return Promise.resolve();
    }

    setIsAnimating(true);

    const overlay = overlayRef.current;

    return new Promise((resolve) => {
      if (!overlay) {
        flushSync(() => {
          setActiveId(null);
        });
        setIsAnimating(false);
        window.requestAnimationFrame(() => {
          lastFocusedRef.current?.focus();
        });
        resolve();
        return;
      }

      gsap.killTweensOf(overlay);
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.12,
        ease: "power1.out",
        onComplete: () => {
          flushSync(() => {
            setActiveId(null);
          });
          gsap.set(overlay, { clearProps: "opacity" });
          setIsAnimating(false);
          window.requestAnimationFrame(() => {
            lastFocusedRef.current?.focus();
          });
          resolve();
        },
      });
    });
  }, [activeProject, enableAnimatedOpen, isAnimating]);

  useEffect(() => {
    closeProjectRef.current = closeProject;
  }, [closeProject]);

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>): void {
    if (!enableDesktopGallery || activeProject) {
      return;
    }

    const target = event.target as HTMLElement;
    const pressedCardId =
      target.closest<HTMLElement>("[data-project-id]")?.dataset.projectId ??
      null;

    dragStateRef.current = {
      pointerId: event.pointerId,
      pressedCardId,
      startX: event.clientX,
      startScrollLeft: scrollerRef.current?.scrollLeft ?? 0,
      moved: false,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>): void {
    if (!enableDesktopGallery || activeProject) {
      return;
    }

    const wrapper = scrollerRef.current;
    const dragState = dragStateRef.current;

    if (
      !wrapper ||
      dragState.pointerId === null ||
      dragState.pointerId !== event.pointerId
    ) {
      return;
    }

    if (Math.abs(event.clientX - dragState.startX) > 6) {
      dragState.moved = true;
      dragBlockUntilRef.current = Date.now() + 180;
      event.preventDefault();
    }

    const nextScrollLeft =
      dragState.startScrollLeft - (event.clientX - dragState.startX);
    const delta = nextScrollLeft - wrapper.scrollLeft;
    applyHorizontalDelta(delta, true);
  }

  function endPointerDrag(event?: ReactPointerEvent<HTMLDivElement>): void {
    const wrapper = scrollerRef.current;
    const { moved, pointerId, pressedCardId } = dragStateRef.current;

    if (wrapper && pointerId !== null) {
      try {
        wrapper.releasePointerCapture(event?.pointerId ?? pointerId);
      } catch {
        // Ignore release mismatches when the browser already ended capture.
      }
    }

    dragStateRef.current = {
      pointerId: null,
      pressedCardId: null,
      startX: 0,
      startScrollLeft: 0,
      moved: false,
    };

    if (moved || !pressedCardId || activeProject || isAnimating) {
      return;
    }

    const project = items.find((item) => item.id === pressedCardId);
    const trigger = cardRefs.current.get(pressedCardId);

    if (!project || !trigger) {
      return;
    }

    openProject(project, trigger);
    dragBlockUntilRef.current = Date.now() + 240;
  }

  function handleScrollerKeyDown(
    event: React.KeyboardEvent<HTMLDivElement>
  ): void {
    if (!scrollerRef.current) {
      return;
    }

    const wrapper = scrollerRef.current;
    const delta = Math.max(wrapper.clientWidth * 0.8, 220);

    if (event.key === "ArrowRight") {
      event.preventDefault();
      wrapper.scrollBy({ left: delta, behavior: "smooth" });
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      wrapper.scrollBy({ left: -delta, behavior: "smooth" });
    }
  }

  function handleSectionWheelCapture(
    event: ReactWheelEvent<HTMLElement>
  ): void {
    if (activeProject) {
      return;
    }

    const target = event.target as Node | null;
    if (target && !scrollerRef.current?.contains(target)) {
      return;
    }

    if (!consumeWheelAsHorizontal(event.nativeEvent)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  }

  return (
    <section
      id="projects-gallery"
      onWheelCapture={handleSectionWheelCapture}
      className="relative w-full pb-6 sm:pb-10"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-16 h-[32rem] bg-[radial-gradient(circle_at_20%_15%,rgba(0,0,0,0.05),transparent_26%),radial-gradient(circle_at_82%_30%,rgba(0,0,0,0.04),transparent_28%),linear-gradient(180deg,rgba(0,0,0,0.03),transparent_70%)] dark:bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.08),transparent_26%),radial-gradient(circle_at_82%_30%,rgba(255,255,255,0.06),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_70%)]"
      />

      <div className="mx-auto flex w-full items-center justify-between gap-4 px-6 sm:px-10 lg:px-12">
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-foreground/40 sm:text-xs">
          <span>{String(items.length).padStart(2, "0")}</span>
          <span className="h-px w-8 bg-foreground/12" aria-hidden="true" />
          <span>{t(siteContent.projectsIntro.kicker, language)}</span>
        </div>

        {enableDesktopGallery ? (
          <p className="hidden text-sm tracking-tight text-foreground/45 md:block">
            {t(copy.dragHint, language)}
          </p>
        ) : null}
      </div>

      <div className="relative mt-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background via-background/85 to-transparent sm:w-24"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background via-background/85 to-transparent sm:w-24"
        />

        <div
          ref={scrollerRef}
          tabIndex={0}
          data-active={activeProject ? "true" : "false"}
          data-lenis-prevent-wheel
          data-lenis-prevent-touch
          onKeyDown={handleScrollerKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endPointerDrag}
          onPointerCancel={endPointerDrag}
          onLostPointerCapture={endPointerDrag}
          className="project-gallery__scroller focus-ring relative overflow-x-auto overflow-y-hidden px-6 py-4 outline-none sm:px-10 lg:px-12"
        >
          <div ref={railRef} className="flex min-w-max gap-5 sm:gap-6 lg:gap-8">
            {items.map((project, index) => (
              <ProjectGalleryCard
                key={project.id}
                project={project}
                index={index}
                language={language}
                onOpen={openProject}
                setRef={setCardRef}
                isDimmed={activeProject !== null && activeProject.id !== project.id}
                isHidden={activeProject?.id === project.id}
                dialogId={dialogId}
                mobile={isMobile}
              />
            ))}
          </div>
        </div>
      </div>

      {typeof document !== "undefined" && activeProject
        ? createPortal(
            <ProjectDetailOverlay
              overlayRef={overlayRef}
              detailCardRef={detailCardRef}
              closeButtonRef={closeButtonRef}
              project={activeProject}
              language={language}
              dialogId={dialogId}
              titleId={titleId}
              copy={copy}
              missingLinkLabel={homeProjectsCopy.missingLinkLabel}
              onClose={closeProject}
            />,
            document.body
          )
        : null}
    </section>
  );
}

function ProjectGalleryCard({
  project,
  index,
  language,
  onOpen,
  setRef,
  isDimmed,
  isHidden,
  dialogId,
  mobile = false,
}: {
  project: ProjectItem;
  index: number;
  language: "zh" | "en";
  onOpen: (project: ProjectItem, trigger: HTMLElement) => void;
  setRef: (id: string, node: HTMLButtonElement | null) => void;
  isDimmed: boolean;
  isHidden: boolean;
  dialogId: string;
  mobile?: boolean;
}): ReactNode {
  const Icon = PROJECT_ICONS[project.icon];

  return (
    <button
      type="button"
      draggable={false}
      data-project-id={project.id}
      ref={(node) => setRef(project.id, node)}
      onClick={(event) => onOpen(project, event.currentTarget)}
      aria-haspopup="dialog"
      aria-expanded={isHidden}
      aria-controls={dialogId}
      className={`project-card focus-ring group relative overflow-hidden rounded-[1.6rem] border border-foreground/8 bg-background text-left transition-all duration-500 ${
        mobile
          ? "w-[min(27rem,84vw)] shrink-0 p-3 sm:w-[min(30rem,72vw)] sm:p-4"
          : "w-[min(34rem,86vw)] shrink-0 p-4 sm:w-[min(38rem,78vw)] lg:w-[34rem] xl:w-[36rem]"
      } ${
        isHidden
          ? "pointer-events-none opacity-0"
          : isDimmed
            ? "opacity-20 blur-[1px]"
            : "opacity-100"
      }`}
      style={{
        transitionDelay: `${Math.min(index * 28, 180)}ms`,
      }}
    >
      <div className="flex items-center justify-between gap-3 px-1 pb-3 pt-1">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-foreground/10 bg-background">
            <Icon className="h-4 w-4 text-foreground" aria-hidden="true" />
          </span>
          <div className="space-y-0.5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-foreground/40">
              {String(index + 1).padStart(2, "0")}
            </p>
            <p className="text-sm font-medium tracking-tight text-foreground">
              {t(project.iconLabel, language)}
            </p>
          </div>
        </div>

        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-foreground/8 bg-background text-foreground/65 transition-colors group-hover:text-foreground">
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>

      <div
        className="project-card__image ring-foreground/5 relative overflow-hidden rounded-[1.35rem] bg-foreground/5 ring-1"
        style={{ aspectRatio: project.imageRatio }}
      >
        <div className="project-card__image-inner">
          <Image
            src={project.image.src}
            alt={t(project.image.alt, language)}
            fill
            sizes={
              mobile
                ? "(max-width: 767px) 84vw, 72vw"
                : "(min-width: 1280px) 420px, (min-width: 1024px) 32vw, 76vw"
            }
            className="pointer-events-none select-none object-cover"
            priority={index < 2}
            draggable={false}
          />
        </div>
      </div>

      <div className="space-y-3 px-1 pb-2 pt-4">
        <h2 className="font-serif text-[1.6rem] font-medium leading-[1.04] tracking-tight text-foreground sm:text-[1.9rem]">
          {t(project.title, language)}
        </h2>
        <p className="max-w-[34ch] text-[14px] leading-[1.55] tracking-tight text-foreground/68 sm:text-[15px]">
          {t(project.description, language)}
        </p>
        <p className="text-[12px] tracking-tight text-foreground/50 sm:text-[13px]">
          {t(project.meta, language)}
        </p>
      </div>
    </button>
  );
}

function ProjectDetailOverlay({
  overlayRef,
  detailCardRef,
  closeButtonRef,
  project,
  language,
  dialogId,
  titleId,
  copy,
  missingLinkLabel,
  onClose,
}: {
  overlayRef: React.RefObject<HTMLDivElement | null>;
  detailCardRef: React.RefObject<HTMLElement | null>;
  closeButtonRef: React.RefObject<HTMLButtonElement | null>;
  project: ProjectItem;
  language: "zh" | "en";
  dialogId: string;
  titleId: string;
  copy: (typeof siteContent)["projectsGallery"];
  missingLinkLabel: (typeof siteContent)["homeProjects"]["missingLinkLabel"];
  onClose: () => Promise<void>;
}): ReactNode {
  const Icon = PROJECT_ICONS[project.icon];
  const hasExternalUrl = project.externalUrl.trim().length > 0;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[90] bg-background/72 backdrop-blur-xl"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          void onClose();
        }
      }}
    >
      <div className="flex min-h-full items-center justify-center px-4 py-16 sm:px-10">
        <article
          ref={detailCardRef}
          id={dialogId}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="relative grid w-full max-w-[88rem] overflow-hidden rounded-[2rem] border border-foreground/10 bg-background shadow-[0_40px_120px_-40px_rgba(0,0,0,0.55)] lg:grid-cols-[1.08fr_0.92fr]"
        >
          <div className="relative min-h-[18rem] bg-foreground/[0.04] sm:min-h-[28rem] lg:min-h-[42rem]">
            <Image
              src={project.image.src}
              alt={t(project.image.alt, language)}
              fill
              sizes="(min-width: 1280px) 52vw, (min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background/35 to-transparent lg:hidden" />
          </div>

          <div className="relative flex flex-col gap-6 p-5 sm:p-8 lg:p-10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-foreground/10 bg-background">
                  <Icon className="h-5 w-5 text-foreground" aria-hidden="true" />
                </span>
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-foreground/40">
                    {t(copy.openDetail, language)}
                  </p>
                  <p className="text-sm font-medium tracking-tight text-foreground">
                    {t(project.iconLabel, language)}
                  </p>
                </div>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => {
                  void onClose();
                }}
                aria-label={t(copy.close, language)}
                className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full border border-foreground/10 bg-background text-foreground transition-colors hover:bg-foreground/5"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-5">
              <h2
                id={titleId}
                className="max-w-[12ch] font-serif text-[2rem] font-medium leading-[1.02] tracking-tight text-foreground sm:text-[2.6rem] lg:text-[3.15rem]"
              >
                {t(project.title, language)}
              </h2>

              <p className="max-w-[38ch] text-[15px] leading-[1.7] tracking-tight text-foreground/72 sm:text-[16px]">
                {t(project.description, language)}
              </p>

              <p className="text-[13px] tracking-tight text-foreground/52 sm:text-[14px]">
                {t(project.meta, language)}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                {hasExternalUrl ? (
                  <a
                    href={project.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-ring inline-flex items-center gap-2 rounded-2xl border border-foreground/10 bg-foreground px-5 py-3 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
                  >
                    {t(copy.viewFullProject, language)}
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                ) : (
                  <p className="text-sm font-medium tracking-tight text-foreground/50">
                    {t(missingLinkLabel, language)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

function createFloatingClone(source: HTMLElement): HTMLElement {
  const rect = source.getBoundingClientRect();
  const clone = source.cloneNode(true) as HTMLElement;

  clone.classList.add("project-gallery__floating-clone");
  clone.setAttribute("aria-hidden", "true");
  clone.style.position = "fixed";
  clone.style.inset = "auto";
  clone.style.top = `${rect.top}px`;
  clone.style.left = `${rect.left}px`;
  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;
  clone.style.margin = "0";
  clone.style.zIndex = "120";
  clone.style.pointerEvents = "none";
  clone.style.transformOrigin = "top left";
  clone.style.overflow = "hidden";

  document.body.appendChild(clone);

  return clone;
}
