import {
  AnimatePresence,
  motion,
  type MotionProps,
  type Transition,
} from "framer-motion";
import { forwardRef } from "react";

type Props = {
  className: string;
  transition?: Transition;
  listRef?: React.RefObject<HTMLUListElement>;
  onScroll?: (e: React.UIEvent<HTMLUListElement>) => void;
  onLayoutAnimationStart?: () => void;
  onLayoutAnimationComplete?: () => void;
  children: React.ReactNode;
  // framer-motion doesn't export this union type sadly
  mode?: "sync" | "popLayout" | "wait";
};

function AnimatedList({
  className,
  transition,
  listRef,
  onScroll,
  onLayoutAnimationStart,
  onLayoutAnimationComplete,
  children,
  mode = "popLayout",
}: Props) {
  return (
    <motion.ul
      layout
      ref={listRef}
      className={className}
      onScroll={onScroll}
      transition={transition}
      onLayoutAnimationStart={onLayoutAnimationStart}
      onLayoutAnimationComplete={onLayoutAnimationComplete}
    >
      <AnimatePresence initial={false} mode={mode}>
        {children}
      </AnimatePresence>
    </motion.ul>
  );
}

const AnimatedListItem = forwardRef<HTMLLIElement, MotionProps>(
  ({ children, ...props }, ref) => {
    return (
      <motion.li
        ref={ref}
        layout
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        {...props}
      >
        {children}
      </motion.li>
    );
  },
);

export { AnimatedList, AnimatedListItem };
