"use client";

import { useEffect, useState } from "react";

export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const sync = (): void => setIsMobile(mediaQuery.matches);

    sync();
    mediaQuery.addEventListener("change", sync);

    return () => mediaQuery.removeEventListener("change", sync);
  }, [breakpoint]);

  return isMobile;
}

export function useIsTouchDevice(): boolean {
  const [isTouch] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(hover: none)").matches
    );
  });
  return isTouch;
}
