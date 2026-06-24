"use client";

import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
  type MouseEvent,
  type ReactNode,
} from "react";

import { DockNav } from "@/components/layout/dock-nav";
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

  const toggleTheme = (event: MouseEvent<HTMLButtonElement>): void => {
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
  const [menuRoute, setMenuRoute] = useState<string | null>(null);
  const menuOpen = isMobile && menuRoute === pathname;

  const dockItems = NAV_ITEMS.map((item) => ({
    href: item.href,
    label: t(item.label, language),
  }));

  const scrollToTop = (): void => {
    window.scrollTo({ top: 0, left: 0 });
  };

  const toggleMenu = (): void => {
    setMenuRoute((current) => (current === pathname ? null : pathname));
  };

  const handleNavClick = (): void => {
    setMenuRoute(null);
    scrollToTop();
  };

  useLayoutEffect(() => {
    scrollToTop();
  }, [pathname]);

  useEffect(() => {
    if (!isMobile || !menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobile, menuOpen]);

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed left-1/2 top-6 z-50 -translate-x-1/2"
      >
        {isMobile ? (
          <div className="flex items-center gap-1 rounded-full border border-foreground/8 bg-background p-1.5 shadow-sm">
            <button
              type="button"
              onClick={toggleMenu}
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

            <NavThemeToggle />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {/* Legacy pill nav replaced by DockNav; routes and theme switching still behave the same. */}
            <DockNav
              items={dockItems}
              activeHref={pathname}
              onItemClick={scrollToTop}
            />
            <NavThemeToggle />
          </div>
        )}
      </nav>

      {isMobile && menuOpen ? (
        <div
          id="mobile-primary-menu"
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-3 bg-background/95 px-6 text-foreground backdrop-blur-xl"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setMenuRoute(null);
            }
          }}
        >
          <button
            type="button"
            onClick={() => setMenuRoute(null)}
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
