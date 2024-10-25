import { AnimatePresence, motion, type Transition } from "framer-motion";

type Props<T> = {
  listRef: React.RefObject<HTMLUListElement>;
  onScroll?: (e: React.UIEvent<HTMLUListElement>) => void;
  onLayoutAnimationStart?: () => void;
  onLayoutAnimationComplete?: () => void;
  className: string;
  data: T[];
  transition: Transition;
  computeKey: (item: T) => string;
  renderRow: (item: T) => React.ReactNode;
};

export function AnimatedList<T>({
  listRef,
  onScroll,
  onLayoutAnimationStart,
  onLayoutAnimationComplete,
  className,
  data,
  transition,
  computeKey,
  renderRow,
}: Props<T>) {
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
      <AnimatePresence initial={false} mode="popLayout">
        {data.map((item) => {
          return (
            <motion.li
              key={computeKey(item)}
              layout
              initial={{ opacity: 0, y: -100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={transition}
            >
              {renderRow(item)}
            </motion.li>
          );
        })}
      </AnimatePresence>
    </motion.ul>
  );
}
