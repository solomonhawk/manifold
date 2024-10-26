import { formatRelative } from "date-fns";
import { motion } from "framer-motion";

import { transitionBeta } from "~utils/animation";

const NOW = new Date();

export function Header({
  id,
  title,
  updatedAt,
  children,
}: {
  id: string;
  title: string;
  updatedAt: Date;
  children: React.ReactNode;
}) {
  return (
    <header className="flex justify-between items-center">
      <div className="flex flex-col gap-2 justify-center">
        <motion.h2
          layoutId={`table-title-${id}`}
          className="text-lg font-bold leading-tight"
          transition={transitionBeta}
        >
          {title}
        </motion.h2>

        <motion.span
          layoutId={`table-updated-at-${id}`}
          className="text-xs text-gray-500"
          transition={transitionBeta}
        >
          {formatRelative(new Date(updatedAt), NOW)}
        </motion.span>
      </div>

      {children}
    </header>
  );
}
