"use client";

import { Menu, Moon, Sun, X } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { siteContent, t } from "@/content/site-content";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useLanguage } from "@/lib/language";

const NAV_ITEMS = siteContent.nav;

function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

function NavThemeToggle(): ReactNode {
  const mounted = useIsMounted();
  const { language } = useLanguage();
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = mounted && resolvedTheme === "dark";

  const toggleTheme = (event: React.MouseEvent<HTMLButtonElement>): void => {
    const next = isDark ? "light" : "dark";

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const supportsViewTransitions =
      typeof document !== "undefined" &&
      typeof document.startViewTransition === "function";

    if (!supportsViewTransitions || prefersReducedMotion) {
      setTheme(next);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const radius = Math.hypot(
      Math.max(cx, window.innerWidth - cx),
      Math.max(cy, window.innerHeight - cy)
    );

    const root = document.documentElement;
    root.style.setProperty("--theme-cx", `${cx}px`);
    root.style.setProperty("--theme-cy", `${cy}px`);
    root.style.setProperty("--theme-r", `${radius}px`);
    root.dataset.themeAnim = "1";

    const transition = document.startViewTransition(() => {
      setTheme(next);
    });

    transition.finished.finally(() => {
      delete root.dataset.themeAnim;
    });
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        mounted
          ? isDark
            ? language === "zh"
              ? "切换到浅色模式"
              : "Switch to light theme"
            : language === "zh"
              ? "切换到深色模式"
              : "Switch to dark theme"
          : language === "zh"
            ? "切换主题"
            : "Toggle theme"
      }
      aria-pressed={mounted ? isDark : undefined}
      className="focus-ring relative inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-background ring-1 ring-foreground/8 transition-colors"
    >
      <span aria-hidden="true" className="relative h-4 w-4">
        <Sun
          className={`absolute inset-0 h-4 w-4 text-foreground transition-all duration-300 ${
            mounted && isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          }`}
        />
        <Moon
          className={`absolute inset-0 h-4 w-4 text-foreground transition-all duration-300 ${
            mounted && !isDark
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-0 opacity-0"
          }`}
        />
      </span>
    </button>
  );
}

export function Nav(): ReactNode {
  const pathname = usePathname();
  const { language } = useLanguage();
  const isMobile = useIsMobile(640);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const [pillRect, setPillRect] = useState<{
    x: number;
    width: number;
  } | null>(null);
  const [hasMeasured, setHasMeasured] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollToTop = (): void => {
    window.scrollTo({ top: 0, left: 0 });
  };

  const handleNavClick = (): void => {
    setMenuOpen(false);
    scrollToTop();
  };

  const activeIndex = NAV_ITEMS.findIndex((item) =>
    item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname.startsWith(`${item.href}/`)
  );
  const showPill = !isMobile && activeIndex >= 0 && pillRect !== null;

  useLayoutEffect(() => {
    if (isMobile) {
      setPillRect(null);
      return;
    }

    const list = listRef.current;
    const activeEl =
      activeIndex >= 0 ? itemRefs.current[activeIndex] : null;
    if (!list || !activeEl) return;
    const listRect = list.getBoundingClientRect();
    const itemRect = activeEl.getBoundingClientRect();
    setPillRect({
      x: itemRect.left - listRect.left,
      width: itemRect.width,
    });
  }, [activeIndex, isMobile, pathname]);

  useLayoutEffect(() => {
    scrollToTop();
  }, [pathname]);

  useEffect(() => {
    if (!isMobile) {
      setMenuOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobile || !menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobile, menuOpen]);

  useEffect(() => {
    if (!pillRect) return;
    const id = requestAnimationFrame(() => setHasMeasured(true));
    return () => cancelAnimationFrame(id);
  }, [pillRect]);

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed left-1/2 top-6 z-50 -translate-x-1/2"
      >
        <div className="flex items-center gap-1 rounded-full border border-foreground/8 bg-background p-1.5 shadow-sm">
          {isMobile ? (
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-expanded={menuOpen}
              aria-controls="mobile-primary-menu"
              aria-label={
                menuOpen
                  ? language === "zh"
                    ? "关闭菜单"
                    : "Close menu"
                  : language === "zh"
                    ? "打开菜单"
                    : "Open menu"
              }
              className="focus-ring inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-foreground text-background transition-transform active:scale-95"
            >
              {menuOpen ? (
                <X className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Menu className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          ) : null}

          <ul
            ref={listRef}
            className={isMobile ? "hidden" : "relative flex items-center gap-1"}
          >
          {showPill && (
            <motion.span
              aria-hidden="true"
              initial={false}
              animate={{ x: pillRect.x, width: pillRect.width }}
              transition={
                hasMeasured
                  ? { type: "spring", stiffness: 380, damping: 32 }
                  : { duration: 0 }
              }
              style={{ left: 0, top: 0, bottom: 0 }}
              className="absolute rounded-full bg-foreground/5 ring-1 ring-foreground/8"
            />
          )}
          {NAV_ITEMS.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <li
                key={item.href}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                className="relative"
              >
                <Link
                  href={item.href}
                  onClick={scrollToTop}
                  aria-current={isActive ? "page" : undefined}
                  className="focus-ring relative inline-flex cursor-pointer items-center justify-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-300"
                >
                  <span
                    className={
                      isActive
                        ? "relative z-10 text-foreground"
                        : "relative z-10 text-foreground/60 hover:text-foreground"
                    }
                  >
                    {t(item.label, language)}
                  </span>
                </Link>
              </li>
            );
          })}
          </ul>
          <NavThemeToggle />
        </div>
      </nav>

      {isMobile && menuOpen ? (
        <div
          id="mobile-primary-menu"
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-3 bg-background/95 px-6 text-foreground backdrop-blur-xl"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setMenuOpen(false);
            }
          }}
        >
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label={language === "zh" ? "关闭菜单" : "Close menu"}
            className="focus-ring absolute left-1/2 top-6 inline-flex h-14 w-14 -translate-x-1/2 cursor-pointer items-center justify-center rounded-full bg-foreground text-background transition-transform active:scale-95"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                aria-current={isActive ? "page" : undefined}
                className="focus-ring inline-flex min-h-14 w-full max-w-64 items-center justify-center rounded-2xl px-6 text-xl font-medium transition-colors active:scale-[0.98]"
              >
                {t(item.label, language)}
              </Link>
            );
          })}
        </div>
      ) : null}
    </>
  );
}
