"use client";

import { gsap } from "gsap";
import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { useEffect, useRef } from "react";

import styles from "./chroma-panel.module.css";

export type ChromaPanelProps = {
  children: ReactNode;
  className?: string;
  radius?: number;
  damping?: number;
  fadeOut?: number;
  ease?: string;
};

export function ChromaPanel({
  children,
  className = "",
  radius = 160,
  damping = 0.32,
  fadeOut = 0.6,
  ease = "power3.out",
}: ChromaPanelProps): ReactNode {
  type Setter = (value: number) => void;

  const rootRef = useRef<HTMLDivElement | null>(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const setXRef = useRef<Setter | null>(null);
  const setYRef = useRef<Setter | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    setXRef.current = gsap.quickSetter(root, "--x", "px") as Setter;
    setYRef.current = gsap.quickSetter(root, "--y", "px") as Setter;

    const { width, height } = root.getBoundingClientRect();
    positionRef.current = { x: width / 2, y: height / 2 };
    setXRef.current?.(positionRef.current.x);
    setYRef.current?.(positionRef.current.y);
    gsap.set(root, { "--r": "0px" });
  }, []);

  const syncVariables = (): void => {
    setXRef.current?.(positionRef.current.x);
    setYRef.current?.(positionRef.current.y);
  };

  const moveTo = (x: number, y: number): void => {
    gsap.to(positionRef.current, {
      x,
      y,
      duration: damping,
      ease,
      overwrite: true,
      onUpdate: syncVariables,
    });
  };

  const setRevealRadius = (nextRadius: string, duration: number): void => {
    const root = rootRef.current;
    if (!root) return;

    gsap.to(root, {
      "--r": nextRadius,
      duration,
      ease,
      overwrite: true,
    });
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>): void => {
    const root = rootRef.current;
    if (!root) return;

    const rect = root.getBoundingClientRect();
    moveTo(event.clientX - rect.left, event.clientY - rect.top);
    setRevealRadius(`${radius}px`, 0.28);
  };

  const handlePointerEnter = (event: PointerEvent<HTMLDivElement>): void => {
    handlePointerMove(event);
  };

  const handlePointerLeave = (): void => {
    setRevealRadius("0px", fadeOut);
  };

  return (
    <div
      ref={rootRef}
      className={[styles.root, className].filter(Boolean).join(" ")}
      style={{ "--r": "0px" } as CSSProperties}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className={styles.content}>{children}</div>
      <div aria-hidden="true" className={styles.halo} />
    </div>
  );
}
