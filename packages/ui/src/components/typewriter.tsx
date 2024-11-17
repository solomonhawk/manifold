import type { Transition, Variants } from "motion/react";
import { motion } from "motion/react";
import React, { Fragment } from "react";

const typewriterVariants = {
  show: {
    transition: {
      staggerChildren: 0.05,
    },
  },
} as const satisfies Variants;

const typewriterWordVariants = {
  initial: { y: "0.25em", opacity: 0 },
  show: { y: 0, opacity: 1 },
} as const satisfies Variants;

type Props = {
  className?: string;
  children: React.ReactNode;
  transition?: Transition;
};

export function Typewriter({ className, children, transition }: Props) {
  const childNodes = React.Children.map(children, (child, i) => {
    if (typeof child === "string") {
      return child
        .trim()
        .split(" ")
        .map((word, j) => {
          if (!word) {
            return null;
          }

          return (
            <Fragment key={`${word}-${j}`}>
              <motion.span
                variants={typewriterWordVariants}
                className="inline-block"
                transition={transition}
              >
                {word}
              </motion.span>{" "}
            </Fragment>
          );
        });
    }

    return (
      <Fragment key={i}>
        <motion.span
          variants={typewriterWordVariants}
          className="inline-block"
          transition={transition}
        >
          {child}
        </motion.span>{" "}
      </Fragment>
    );
  });

  return (
    <motion.span
      className={className}
      variants={typewriterVariants}
      initial="initial"
      animate="show"
    >
      {childNodes}
    </motion.span>
  );
}
