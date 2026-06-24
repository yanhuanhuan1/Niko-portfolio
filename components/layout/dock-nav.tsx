"use client";

import Link from "next/link";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useReducedMotion } from "@/lib/motion";

export type DockNavItem = {
  href: string;
  label: string;
  ariaLabel?: string;
};

type DockNavProps = {
  items: DockNavItem[];
  activeHref: string;
  onItemClick?: () => void;
  className?: string;
};

function isItemActive(activeHref: string, href: string): boolean {
  return href === "/"
    ? activeHref === "/"
    : activeHref === href || activeHref.startsWith(`${href}/`);
}

function DockNavEntry({
  item,
  activeHref,
  onItemClick,
  mouseX,
  setRef,
  reducedMotion,
}: {
  item: DockNavItem;
  activeHref: string;
  onItemClick?: () => void;
  mouseX: MotionValue<number>;
  setRef: (node: HTMLLIElement | null) => void;
  reducedMotion: boolean;
}): ReactNode {
  const itemRef = useRef<HTMLLIElement>(null);
  const isActive = isItemActive(activeHref, item.href);

  const distanceFromPointer = useTransform(mouseX, (value) => {
    const rect = itemRef.current?.getBoundingClientRect();
    if (!rect) return 180;
    return Math.abs(value - (rect.left + rect.width / 2));
  });

  const targetScale = useTransform(
    distanceFromPointer,
    [0, 180],
    [1.08, 1],
    { clamp: true }
  );
  const targetLift = useTransform(
    distanceFromPointer,
    [0, 180],
    [-2, 0],
    { clamp: true }
  );

  const scale = useSpring(targetScale, {
    mass: 0.12,
    stiffness: 260,
    damping: 24,
  });
  const lift = useSpring(targetLift, {
    mass: 0.12,
    stiffness: 260,
    damping: 24,
  });

  return (
    <motion.li
      ref={(node) => {
        itemRef.current = node;
        setRef(node);
      }}
      style={{
        scale: reducedMotion ? 1 : scale,
        y: reducedMotion ? 0 : lift,
      }}
      className="relative"
    >
      <Link
        href={item.href}
        onClick={onItemClick}
        aria-current={isActive ? "page" : undefined}
        aria-label={item.ariaLabel ?? item.label}
        className="focus-ring relative inline-flex min-h-9 cursor-pointer items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300"
      >
        <span
          className={
            isActive
              ? "relative z-10 text-foreground"
              : "relative z-10 text-foreground/60 hover:text-foreground"
          }
        >
          {item.label}
        </span>
      </Link>
    </motion.li>
  );
}

export function DockNav({
  items,
  activeHref,
  onItemClick,
  className = "",
}: DockNavProps): ReactNode {
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY);
  const reducedMotion = useReducedMotion();
  const [pillRect, setPillRect] = useState<{ x: number; width: number } | null>(
    null
  );
  const [hasMeasured, setHasMeasured] = useState(false);

  const activeIndex = items.findIndex((item) => isItemActive(activeHref, item.href));
  const showPill = activeIndex >= 0 && pillRect !== null;

  useLayoutEffect(() => {
    const list = listRef.current;
    const activeEl =
      activeIndex >= 0 ? itemRefs.current[activeIndex] : null;

    if (!list || !activeEl) {
      setPillRect(null);
      setHasMeasured(false);
      return;
    }

    const measure = (): void => {
      const listRect = list.getBoundingClientRect();
      const itemRect = activeEl.getBoundingClientRect();

      setPillRect({
        x: itemRect.left - listRect.left,
        width: itemRect.width,
      });
    };

    measure();

    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [activeIndex, activeHref, items]);

  useEffect(() => {
    if (!pillRect) return;
    const id = requestAnimationFrame(() => setHasMeasured(true));
    return () => cancelAnimationFrame(id);
  }, [pillRect]);

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: -8, scale: 0.98 }}
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      transition={
        reducedMotion
          ? { duration: 0.01 }
          : { duration: 0.42, ease: [0.22, 1, 0.36, 1] }
      }
      className={`rounded-full border border-foreground/10 bg-background/80 px-2 py-1.5 shadow-[0_14px_40px_-24px_rgba(0,0,0,0.45)] backdrop-blur-xl ${className}`}
    >
      <div className="relative">
        <ul
          ref={listRef}
          onMouseMove={(event) => {
            if (reducedMotion) return;
            mouseX.set(event.clientX);
          }}
          onMouseLeave={() => {
            if (reducedMotion) return;
            mouseX.set(Number.POSITIVE_INFINITY);
          }}
          className="relative flex items-center gap-1"
        >
          {showPill ? (
            <motion.span
              aria-hidden="true"
              initial={false}
              animate={{ x: pillRect.x, width: pillRect.width }}
              transition={
                hasMeasured && !reducedMotion
                  ? { type: "spring", stiffness: 380, damping: 34 }
                  : { duration: 0.01 }
              }
              style={{ left: 0, top: 0, bottom: 0 }}
              className="absolute rounded-full bg-foreground/[0.06] ring-1 ring-foreground/10"
            />
          ) : null}

          {items.map((item, index) => (
            <DockNavEntry
              key={item.href}
              item={item}
              activeHref={activeHref}
              onItemClick={onItemClick}
              mouseX={mouseX}
              setRef={(node) => {
                itemRefs.current[index] = node;
              }}
              reducedMotion={reducedMotion}
            />
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
