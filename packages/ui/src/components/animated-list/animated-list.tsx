import {
  AnimatePresence,
  type AnimatePresenceProps,
  motion,
  type MotionProps,
  type Transition,
} from "motion/react";
import { forwardRef } from "react";

import { transitionAlpha } from "#lib/animation.ts";

type Props = {
  className?: string;
  transition?: Transition;
  listRef?: React.RefObject<HTMLUListElement>;
  onScroll?: (e: React.UIEvent<HTMLUListElement>) => void;
  children: React.ReactNode;
} & MotionProps &
  Pick<AnimatePresenceProps, "initial" | "mode">;

function AnimatedList({
  listRef,
  className,
  children,
  transition = transitionAlpha,
  initial = false,
  mode = "popLayout",
  ...props
}: Props) {
  return (
    <motion.ul
      layoutScroll
      ref={listRef}
      className={className}
      transition={transition}
      {...props}
    >
      <AnimatePresence initial={initial} mode={mode}>
        {children}
      </AnimatePresence>
    </motion.ul>
  );
}

const AnimatedListItem = forwardRef<
  HTMLLIElement,
  MotionProps & { className?: string }
>(({ children, ...props }, ref) => {
  return (
    <motion.li
      ref={ref}
      layout
      initial={{ opacity: 0, y: -100, z: 0 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1, z: 0 }}
      exit={{ opacity: 0, z: 0 }}
      {...props}
    >
      {children}
    </motion.li>
  );
});

export { AnimatedList, AnimatedListItem };
