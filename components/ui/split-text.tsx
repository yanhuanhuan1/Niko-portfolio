"use client";

import gsap from "gsap";
import { SplitText as GSAPSplitText } from "gsap/SplitText";
import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";

import { useReducedMotion } from "@/lib/motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(GSAPSplitText);
}

type SplitTextTag = "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";

type SplitType = "chars" | "lines" | "words" | "words, chars" | "lines, chars";

const DEFAULT_FROM = { opacity: 0, y: 24 } as const;
const DEFAULT_TO = { opacity: 1, y: 0 } as const;

export type SplitTextProps = {
  tag?: SplitTextTag;
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: SplitType;
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
  rootMargin?: string;
  textAlign?: CSSProperties["textAlign"];
  onLetterAnimationComplete?: () => void;
};

function pickSplitTargets(
  split: GSAPSplitText,
  splitType: SplitType
): Element[] {
  const normalizedType = splitType.toLowerCase();

  if (normalizedType.includes("chars") && split.chars.length > 0) {
    return split.chars;
  }

  if (normalizedType.includes("words") && split.words.length > 0) {
    return split.words;
  }

  if (normalizedType.includes("lines") && split.lines.length > 0) {
    return split.lines;
  }

  if (split.chars.length > 0) {
    return split.chars;
  }

  if (split.words.length > 0) {
    return split.words;
  }

  return split.lines;
}

async function waitForFonts(): Promise<void> {
  if (typeof document === "undefined") {
    return;
  }

  const { fonts } = document;
  if (!fonts || fonts.status === "loaded") {
    return;
  }

  await fonts.ready;
}

export function SplitText({
  tag: Tag = "p",
  text,
  className = "",
  delay = 50,
  duration = 1.25,
  ease = "power3.out",
  splitType = "chars",
  from = DEFAULT_FROM,
  to = DEFAULT_TO,
  threshold = 0.1,
  rootMargin = "-100px",
  textAlign = "center",
  onLetterAnimationComplete,
}: SplitTextProps): ReactNode {
  const ref = useRef<HTMLElement | null>(null);
  const splitRef = useRef<GSAPSplitText | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element || !text || reducedMotion) {
      return;
    }

    let isCancelled = false;
    let observer: IntersectionObserver | null = null;

    const runAnimation = (): void => {
      if (isCancelled || !ref.current) {
        return;
      }

      tweenRef.current?.kill();
      splitRef.current?.revert();

      const split = new GSAPSplitText(ref.current, {
        type: splitType,
        aria: "auto",
        smartWrap: true,
        reduceWhiteSpace: false,
        linesClass: "split-line",
        wordsClass: "split-word",
        charsClass: "split-char",
      });

      splitRef.current = split;
      const targets = pickSplitTargets(split, splitType);

      if (targets.length === 0) {
        onLetterAnimationComplete?.();
        return;
      }

      tweenRef.current = gsap.fromTo(
        targets,
        { ...from },
        {
          ...to,
          duration,
          ease,
          stagger: delay / 1000,
          overwrite: "auto",
          force3D: true,
          willChange: "transform, opacity",
          onComplete: () => {
            onLetterAnimationComplete?.();
          },
        }
      );
    };

    const start = async (): Promise<void> => {
      await waitForFonts();

      if (isCancelled || !ref.current) {
        return;
      }

      if (typeof IntersectionObserver === "undefined") {
        runAnimation();
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer?.disconnect();
            observer = null;
            runAnimation();
          }
        },
        {
          threshold,
          rootMargin,
        }
      );

      observer.observe(ref.current);
    };

    void start();

    return () => {
      isCancelled = true;
      observer?.disconnect();
      tweenRef.current?.kill();
      tweenRef.current = null;

      splitRef.current?.revert();
      splitRef.current = null;
    };
  }, [
    delay,
    duration,
    ease,
    from,
    onLetterAnimationComplete,
    reducedMotion,
    rootMargin,
    splitType,
    text,
    threshold,
    to,
  ]);

  const setRef = (node: HTMLElement | null): void => {
    ref.current = node;
  };

  return (
    <Tag
      ref={setRef}
      className={className}
      style={{
        textAlign,
        display: "block",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {text}
    </Tag>
  );
}
