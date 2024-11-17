import { MotionGlobalConfig } from "motion/react";

export const GlobalAnimation = {
  subscribeToReducedMotionPreferenceChanges() {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      MotionGlobalConfig.skipAnimations = e.matches;
    };

    mediaQuery.addEventListener("change", handleReducedMotionChange);

    MotionGlobalConfig.skipAnimations = mediaQuery.matches;
  },
};
