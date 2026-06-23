"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { time } from "motion-dom";

import { subscribeAnimationFrame } from "@/lib/animation-clock";
import { features } from "@/lib/config";
import { detectMobileDevice } from "@/lib/mobileUtils";

const LENIS_OPTIONS = {
  duration: 0.3,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: "vertical" as const,
  gestureOrientation: "vertical" as const,
  smoothWheel: true,
  wheelMultiplier: 0.8,
  touchMultiplier: 2,
  autoRaf: false,
};

export function SmoothScroll(): null {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const routeResetRef = useRef<number | null>(null);

  useEffect(() => {
    if (!features.smoothScroll) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;
    if (detectMobileDevice()) return;

    const lenis = new Lenis(LENIS_OPTIONS);
    lenisRef.current = lenis;

    unsubscribeRef.current = subscribeAnimationFrame(() => {
      lenis.raf(time.now());
    });

    function handleAnchorClick(e: MouseEvent): void {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      const element = document.querySelector(href);
      if (!element) return;

      e.preventDefault();
      lenis.scrollTo(element as HTMLElement, { offset: -100 });
    }

    document.addEventListener("click", handleAnchorClick);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    if (routeResetRef.current !== null) {
      window.cancelAnimationFrame(routeResetRef.current);
    }

    lenis.scrollTo(0, { immediate: true });
    lenis.stop();

    routeResetRef.current = window.requestAnimationFrame(() => {
      lenis.resize();
      lenis.start();
      routeResetRef.current = null;
    });

    return () => {
      if (routeResetRef.current !== null) {
        window.cancelAnimationFrame(routeResetRef.current);
        routeResetRef.current = null;
      }
    };
  }, [pathname]);

  return null;
}
