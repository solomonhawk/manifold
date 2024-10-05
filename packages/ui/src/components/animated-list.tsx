import { AnimatePresence, motion, type Transition } from "framer-motion";

type Props<T> = {
  className: string;
  data: T[];
  transition: Transition;
  computeKey: (item: T) => string;
  renderRow: (item: T) => React.ReactNode;
};

export function AnimatedList<T>({
  className,
  data,
  transition,
  computeKey,
  renderRow,
}: Props<T>) {
  return (
    <ul className={className}>
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
    </ul>
  );
}
