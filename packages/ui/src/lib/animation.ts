import type { Transition } from "motion/react";

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

export const transitionGamma = {
  type: "spring",
  damping: 30,
  stiffness: 700,
  mass: 0.1,
} satisfies Transition;
