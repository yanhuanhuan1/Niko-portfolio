export function detectMobileDevice(): boolean {
  if (typeof window === "undefined") return false;

  const uaCheck = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  const widthCheck = window.innerWidth < 768;
  const touchCheck =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;

  return uaCheck || (widthCheck && touchCheck);
}

export function createFPSLimiter(
  callback: (time: number) => void,
  fps = 30
): (time: number) => void {
  let lastTime = 0;
  const interval = 1000 / fps;

  return (time: number) => {
    if (time - lastTime < interval) return;

    lastTime = time;
    callback(time);
  };
}

export function getSafeDPR(maxMobileDpr = 1.5, maxDesktopDpr = 2): number {
  if (typeof window === "undefined") return 1;

  const dpr = window.devicePixelRatio || 1;
  return detectMobileDevice()
    ? Math.min(dpr, maxMobileDpr)
    : Math.min(dpr, maxDesktopDpr);
}

export function listenToVisibility(
  onHide: () => void,
  onShow: () => void
): () => void {
  const handler = (): void => {
    if (document.hidden) {
      onHide();
      return;
    }

    onShow();
  };

  document.addEventListener("visibilitychange", handler);
  return () => document.removeEventListener("visibilitychange", handler);
}
