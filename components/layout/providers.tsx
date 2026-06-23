"use client";

import { LanguageProvider } from "@/lib/language";
import { ReducedMotionProvider } from "@/lib/motion";
import { ThemeProvider } from "next-themes";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const SmoothScroll = dynamic(
  () => import("@/components/layout/smooth-scroll").then((mod) => mod.SmoothScroll),
  {
    ssr: false,
  }
);

export function Providers({ children }: { children: ReactNode }): ReactNode {
  return (
    // Previous first-visit behavior followed the OS preference:
    // defaultTheme="system" with enableSystem.
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <LanguageProvider>
        <ReducedMotionProvider>
          {children}
          <SmoothScroll />
        </ReducedMotionProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
