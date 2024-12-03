import { capitalize } from "@manifold/lib/utils/string";
import type { RouterOutput } from "@manifold/router";
import { Button } from "@manifold/ui/components/core/button";
import { transitionAlpha } from "@manifold/ui/lib/animation";
import { cn } from "@manifold/ui/lib/utils";
import { formatRelative } from "date-fns";
import { motion } from "motion/react";

import { PrefetchableLink } from "~features/routing/components/prefetchable-link";

export function TableCard({
  href,
  table,
  isRefetching,
}: {
  href: string;
  table: RouterOutput["table"]["list"][number];
  isRefetching: boolean;
}) {
  const NOW = new Date();

  return (
    <div className="aspect-square w-full">
      <Button
        className="group flex size-full flex-col items-center justify-center gap-6 p-16"
        variant="outline"
        asChild
      >
        <PrefetchableLink
          to={isRefetching ? "#" : href}
          state={{ table }}
          title={table.title}
        >
          <div className="z-20 translate-y-14 transition-transform group-hover:translate-y-0">
            <motion.h3
              layout="position"
              layoutId={`${table.tableIdentifier}-list-item-title`}
              transition={transitionAlpha}
              className={cn(
                "line-clamp-2 whitespace-normal text-center text-sm !leading-tight sm:text-base md:text-lg",
                {
                  "line-through": table.deletedAt !== null,
                },
              )}
            >
              {table.title}
            </motion.h3>
          </div>

          <div className="z-10 -translate-y-12 scale-95 opacity-0 transition-all group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100">
            <span
              className={cn(
                "block text-balance text-center text-xs leading-tight",
                {
                  "text-gray-500": table.deletedAt === null,
                  "text-destructive": table.deletedAt !== null,
                },
              )}
            >
              {table.deletedAt
                ? `Deleted ${formatRelative(new Date(table.deletedAt), NOW)}`
                : capitalize(formatRelative(new Date(table.updatedAt), NOW))}
            </span>
          </div>
        </PrefetchableLink>
      </Button>
    </div>
  );
}
