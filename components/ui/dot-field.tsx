"use client";

import { memo, useEffect, useId, useRef, type HTMLAttributes, type ReactNode } from "react";

import { subscribeAnimationFrame } from "@/lib/animation-clock";
import styles from "./dot-field.module.css";

type Dot = {
  ax: number;
  ay: number;
  sx: number;
  sy: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
};

export type DotFieldProps = HTMLAttributes<HTMLDivElement> & {
  dotRadius?: number;
  dotSpacing?: number;
  cursorRadius?: number;
  cursorForce?: number;
  bulgeOnly?: boolean;
  bulgeStrength?: number;
  glowRadius?: number;
  sparkle?: boolean;
  waveAmplitude?: number;
  gradientFrom?: string;
  gradientTo?: string;
  glowColor?: string;
};

const TWO_PI = Math.PI * 2;
const DOTFIELD_DPR_CAP = 1.5;
const IDLE_SPEED_EPSILON = 0.01;
const IDLE_ENERGY_EPSILON = 0.005;

const DEFAULTS = {
  dotRadius: 1.5,
  dotSpacing: 14,
  cursorRadius: 500,
  cursorForce: 0.1,
  bulgeOnly: true,
  bulgeStrength: 67,
  glowRadius: 160,
  sparkle: false,
  waveAmplitude: 0,
  gradientFrom: "rgba(59, 130, 246, 0.24)",
  gradientTo: "rgba(37, 99, 235, 0.12)",
  glowColor: "rgba(59, 130, 246, 0.14)",
} as const;

const DotField = memo(function DotField({
  dotRadius = DEFAULTS.dotRadius,
  dotSpacing = DEFAULTS.dotSpacing,
  cursorRadius = DEFAULTS.cursorRadius,
  cursorForce = DEFAULTS.cursorForce,
  bulgeOnly = DEFAULTS.bulgeOnly,
  bulgeStrength = DEFAULTS.bulgeStrength,
  glowRadius = DEFAULTS.glowRadius,
  sparkle = DEFAULTS.sparkle,
  waveAmplitude = DEFAULTS.waveAmplitude,
  gradientFrom = DEFAULTS.gradientFrom,
  gradientTo = DEFAULTS.gradientTo,
  glowColor = DEFAULTS.glowColor,
  className,
  style,
  ...rest
}: DotFieldProps): ReactNode {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glowRef = useRef<SVGCircleElement | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  const mouseRef = useRef({
    x: -9999,
    y: -9999,
    prevX: -9999,
    prevY: -9999,
    speed: 0,
  });
  const sizeRef = useRef({
    w: 0,
    h: 0,
    offsetX: 0,
    offsetY: 0,
  });
  const gradientRef = useRef<CanvasGradient | null>(null);
  const glowOpacityRef = useRef(0);
  const engagementRef = useRef(0);
  const needsDrawRef = useRef(true);
  const idleRef = useRef(false);
  const propsRef = useRef({
    dotRadius,
    dotSpacing,
    cursorRadius,
    cursorForce,
    bulgeOnly,
    bulgeStrength,
    sparkle,
    waveAmplitude,
    gradientFrom,
    gradientTo,
  });
  const rebuildRef = useRef<(() => void) | null>(null);
  const rebuildGradientRef = useRef<(() => void) | null>(null);
  const glowId = useId();

  useEffect(() => {
    propsRef.current = {
      dotRadius,
      dotSpacing,
      cursorRadius,
      cursorForce,
      bulgeOnly,
      bulgeStrength,
      sparkle,
      waveAmplitude,
      gradientFrom,
      gradientTo,
    };
  }, [
    dotRadius,
    dotSpacing,
    cursorRadius,
    cursorForce,
    bulgeOnly,
    bulgeStrength,
    sparkle,
    waveAmplitude,
    gradientFrom,
    gradientTo,
  ]);

  useEffect(() => {
    rebuildGradientRef.current?.();
    needsDrawRef.current = true;
    idleRef.current = false;
  }, [gradientFrom, gradientTo]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const glow = glowRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, DOTFIELD_DPR_CAP);
    let resizeTimer: number | undefined;
    let onScreen = true;

    const rebuildGradient = (): void => {
      const { w, h } = sizeRef.current;
      if (w <= 0 || h <= 0) return;

      const p = propsRef.current;
      const gradient = ctx.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, p.gradientFrom);
      gradient.addColorStop(1, p.gradientTo);
      gradientRef.current = gradient;
    };
    rebuildGradientRef.current = rebuildGradient;

    const buildDots = (w: number, h: number): void => {
      const p = propsRef.current;
      const step = Math.max(6, p.dotSpacing);
      const cols = Math.max(1, Math.floor(w / step));
      const rows = Math.max(1, Math.floor(h / step));
      const padX = Math.max(0, (w - cols * step) / 2);
      const padY = Math.max(0, (h - rows * step) / 2);
      const dots: Dot[] = [];

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const ax = padX + col * step + step / 2;
          const ay = padY + row * step + step / 2;
          dots.push({
            ax,
            ay,
            sx: ax,
            sy: ay,
            vx: 0,
            vy: 0,
            x: ax,
            y: ay,
          });
        }
      }

      dotsRef.current = dots;
    };

    const doResize = (): void => {
      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      if (w <= 0 || h <= 0) return;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      sizeRef.current = {
        w,
        h,
        offsetX: rect.left + window.scrollX,
        offsetY: rect.top + window.scrollY,
      };

      buildDots(w, h);
      rebuildGradient();
      needsDrawRef.current = true;
      idleRef.current = false;
    };

    const scheduleResize = (): void => {
      if (resizeTimer !== undefined) {
        window.clearTimeout(resizeTimer);
      }

      resizeTimer = window.setTimeout(doResize, 100);
    };

    const onMouseMove = (event: MouseEvent): void => {
      const size = sizeRef.current;
      mouseRef.current.x = event.clientX - size.offsetX;
      mouseRef.current.y = event.clientY - size.offsetY;
      needsDrawRef.current = true;
      idleRef.current = false;
    };
    let frameCount = 0;
    const unsubscribe = subscribeAnimationFrame(() => {
      if (!onScreen) return;
      if (idleRef.current && !needsDrawRef.current) return;

      frameCount += 1;
      const wasDirty = needsDrawRef.current;
      needsDrawRef.current = false;

      const mouse = mouseRef.current;
      const dx = mouse.prevX - mouse.x;
      const dy = mouse.prevY - mouse.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      mouse.speed += (distance - mouse.speed) * 0.5;
      if (mouse.speed < 0.001) mouse.speed = 0;
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;

      if (!onScreen) return;

      const dots = dotsRef.current;
      const { w, h } = sizeRef.current;
      const p = propsRef.current;
      const len = dots.length;
      const t = frameCount * 0.02;

      const targetEngagement = Math.min(mouse.speed / 5, 1);
      engagementRef.current += (targetEngagement - engagementRef.current) * 0.06;
      if (engagementRef.current < 0.001) engagementRef.current = 0;

      const engagement = engagementRef.current;
      glowOpacityRef.current += (engagement - glowOpacityRef.current) * 0.08;

      if (glow) {
        glow.setAttribute("cx", `${mouse.x}`);
        glow.setAttribute("cy", `${mouse.y}`);
        glow.style.opacity = `${glowOpacityRef.current}`;
      }

      ctx.clearRect(0, 0, w, h);

      if (!gradientRef.current) {
        rebuildGradient();
      }

      if (gradientRef.current) {
        ctx.fillStyle = gradientRef.current;
      }
      ctx.beginPath();

      const cr = p.cursorRadius;
      const crSq = cr * cr;
      const baseRadius = p.dotRadius / 2;

      for (let i = 0; i < len; i += 1) {
        const dot = dots[i]!;
        const dotDx = mouse.x - dot.ax;
        const dotDy = mouse.y - dot.ay;
        const distSq = dotDx * dotDx + dotDy * dotDy;

        if (distSq < crSq && engagement > 0.01) {
          const dist = Math.sqrt(distSq) || 0.001;
          const angle = Math.atan2(dotDy, dotDx);

          if (p.bulgeOnly) {
            const mix = 1 - dist / cr;
            const push = mix * mix * p.bulgeStrength * engagement;
            dot.sx += (dot.ax - Math.cos(angle) * push - dot.sx) * 0.15;
            dot.sy += (dot.ay - Math.sin(angle) * push - dot.sy) * 0.15;
          } else {
            const move = (500 / dist) * (mouse.speed * p.cursorForce);
            dot.vx += Math.cos(angle) * -move;
            dot.vy += Math.sin(angle) * -move;
          }
        } else if (p.bulgeOnly) {
          dot.sx += (dot.ax - dot.sx) * 0.1;
          dot.sy += (dot.ay - dot.sy) * 0.1;
        }

        if (!p.bulgeOnly) {
          dot.vx *= 0.9;
          dot.vy *= 0.9;
          dot.x = dot.ax + dot.vx;
          dot.y = dot.ay + dot.vy;
          dot.sx += (dot.x - dot.sx) * 0.1;
          dot.sy += (dot.y - dot.sy) * 0.1;
        }

        let drawX = dot.sx;
        let drawY = dot.sy;

        if (p.waveAmplitude > 0) {
          drawY += Math.sin(dot.ax * 0.03 + t) * p.waveAmplitude;
          drawX += Math.cos(dot.ay * 0.03 + t * 0.7) * p.waveAmplitude * 0.5;
        }

        if (p.sparkle) {
          const hash = ((i * 2654435761) ^ (frameCount >> 3)) >>> 0;
          const size = hash % 100 < 3 ? baseRadius * 1.8 : baseRadius;
          ctx.moveTo(drawX + size, drawY);
          ctx.arc(drawX, drawY, size, 0, TWO_PI);
        } else {
          ctx.moveTo(drawX + baseRadius, drawY);
          ctx.arc(drawX, drawY, baseRadius, 0, TWO_PI);
        }
      }

      ctx.fill();

      const shouldStayActive =
        p.waveAmplitude > 0 ||
        mouse.speed > IDLE_SPEED_EPSILON ||
        engagementRef.current > IDLE_ENERGY_EPSILON ||
        glowOpacityRef.current > IDLE_ENERGY_EPSILON;

      idleRef.current = !shouldStayActive && !wasDirty;
    });

    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries.some((entry) => entry.isIntersecting);
        if (onScreen) {
          needsDrawRef.current = true;
          idleRef.current = false;
        }
      },
      { rootMargin: "100px" }
    );

    const ro = new ResizeObserver(scheduleResize);
    ro.observe(container);
    io.observe(container);

    doResize();
    window.addEventListener("resize", scheduleResize);
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    rebuildRef.current = () => {
      const { w, h } = sizeRef.current;
      if (w > 0 && h > 0) {
        buildDots(w, h);
        rebuildGradient();
        needsDrawRef.current = true;
        idleRef.current = false;
      }
    };

    return () => {
      unsubscribe();
      if (resizeTimer !== undefined) {
        window.clearTimeout(resizeTimer);
      }

      ro.disconnect();
      io.disconnect();
      window.removeEventListener("resize", scheduleResize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  useEffect(() => {
    rebuildRef.current?.();
  }, [dotRadius, dotSpacing]);

  return (
    <div ref={containerRef} className={[styles.container, className].filter(Boolean).join(" ")} style={style} {...rest}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <defs>
          <radialGradient id={`dot-field-glow-${glowId.replace(/:/g, "")}`}>
            <stop offset="0%" stopColor={glowColor} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <circle
          ref={glowRef}
          cx="-9999"
          cy="-9999"
          r={glowRadius}
          fill={`url(#dot-field-glow-${glowId.replace(/:/g, "")})`}
          style={{ opacity: 0, willChange: "opacity" }}
        />
      </svg>
    </div>
  );
});

DotField.displayName = "DotField";

export default DotField;
