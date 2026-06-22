"use client";

import { cancelFrame, frame, time, type FrameData } from "motion-dom";

type FrameSubscriber = (frameData: FrameData, now: number) => void;

const subscribers = new Set<FrameSubscriber>();

let isRunning = false;
let hasVisibilityListener = false;

function stopClock(): void {
  if (!isRunning) return;

  cancelFrame(tick);
  isRunning = false;
}

function startClock(): void {
  if (
    isRunning ||
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    document.hidden ||
    subscribers.size === 0
  ) {
    return;
  }

  isRunning = true;
  frame.update(tick, true);
}

function handleVisibilityChange(): void {
  if (document.hidden) {
    stopClock();
    return;
  }

  startClock();
}

function ensureVisibilityListener(): void {
  if (hasVisibilityListener || typeof document === "undefined") return;

  document.addEventListener("visibilitychange", handleVisibilityChange);
  hasVisibilityListener = true;
}

function tick(frameData: FrameData): void {
  if (typeof document !== "undefined" && document.hidden) {
    stopClock();
    return;
  }

  const now = time.now();

  for (const subscriber of subscribers) {
    try {
      subscriber(frameData, now);
    } catch (error) {
      console.error("[animation-clock] frame subscriber failed", error);
    }
  }
}

export function subscribeAnimationFrame(
  subscriber: FrameSubscriber
): () => void {
  ensureVisibilityListener();
  subscribers.add(subscriber);
  startClock();

  return () => {
    subscribers.delete(subscriber);

    if (subscribers.size === 0) {
      stopClock();
    }
  };
}
