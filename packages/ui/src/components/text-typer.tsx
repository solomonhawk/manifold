import type { Transition, Variants } from "framer-motion";
import { motion } from "framer-motion";
import { Fragment } from "react";

const textTyperVariants = {
  show: {
    transition: {
      staggerChildren: 0.05,
    },
  },
} as const satisfies Variants;

const textTyperWordVariants = {
  initial: { y: 3, opacity: 0 },
  show: { y: 0, opacity: 1 },
} as const satisfies Variants;

type Props = {
  className?: string;
  children: string;
  transition?: Transition;
};

export function TextTyper({ className, children, transition }: Props) {
  return (
    <motion.span
      className={className}
      variants={textTyperVariants}
      initial="initial"
      animate="show"
    >
      {children.split(" ").map((word, i) => {
        return (
          <Fragment key={`${word}-${i}`}>
            <motion.span
              variants={textTyperWordVariants}
              className="inline-block"
              transition={transition}
            >
              {word}
            </motion.span>{" "}
          </Fragment>
        );
      })}
    </motion.span>
  );
}
