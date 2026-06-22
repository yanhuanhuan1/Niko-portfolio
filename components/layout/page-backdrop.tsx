"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const Antigravity = dynamic(() => import("@/components/ui/antigravity"), {
  ssr: false,
});
const LightRays = dynamic(() => import("@/components/ui/light-rays"), {
  ssr: false,
});

export function PageBackdrop(): ReactNode {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),rgba(255,255,255,0.72)_22%,rgba(255,255,255,0.22)_48%,transparent_72%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),rgba(255,255,255,0.06)_24%,transparent_72%)]" />
      <div className="absolute inset-0 opacity-55 dark:opacity-85">
        <Antigravity
          count={220}
          magnetRadius={6}
          ringRadius={7}
          waveSpeed={0.36}
          waveAmplitude={0.6}
          particleSize={1.05}
          lerpSpeed={0.07}
          color="#d7e4f2"
          autoAnimate
          particleVariance={0.72}
          rotationSpeed={0.035}
          depthFactor={0.9}
          pulseSpeed={2.5}
          particleShape="sphere"
          fieldStrength={11}
        />
      </div>
      <div className="absolute inset-x-0 top-0 hidden h-[42rem] dark:block">
        <div className="absolute inset-x-0 top-0 h-[18rem] bg-gradient-to-b from-slate-950/45 via-slate-950/15 to-transparent" />
        <div
          className="absolute inset-x-0 top-0 h-[28rem] opacity-100"
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.35) 72%, transparent)",
            maskImage:
              "linear-gradient(to bottom, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.35) 72%, transparent)",
          }}
        >
          <LightRays
            raysOrigin="top-center"
            raysColor="#d9f6ff"
            raysSpeed={1.45}
            lightSpread={0.82}
            rayLength={1.28}
            followMouse
            mouseInfluence={0.1}
            noiseAmount={0.08}
            distortion={0.05}
            className="opacity-95"
          />
        </div>
      </div>
      <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.26),transparent_68%)] dark:bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.1),transparent_68%)]" />
    </div>
  );
}
