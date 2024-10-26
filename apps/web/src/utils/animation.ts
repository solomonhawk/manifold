import type { Transition } from "framer-motion";

export const transitionAlpha = {
  type: "spring",
  damping: 40,
  stiffness: 500,
  mass: 0.5,
} satisfies Transition;

export const transitionBeta = {
  type: "spring",
  damping: 40,
  stiffness: 500,
  mass: 0.8,
} satisfies Transition;
