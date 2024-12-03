import { capitalize } from "@manifold/lib/utils/string";
import { Separator } from "@manifold/ui/components/core/separator";
import { TableIdentifier } from "@manifold/ui/components/table-identifier";
import { transitionAlpha } from "@manifold/ui/lib/animation";
import { cn } from "@manifold/ui/lib/utils";
import { formatRelative } from "date-fns";
import { motion } from "motion/react";
import { useState } from "react";

import { PrefetchableLink } from "~features/routing/components/prefetchable-link";

export function TableListItem({
  href,
  title,
  description,
  tableIdentifier,
  updatedAt,
  deletedAt,
  availableTables,
}: {
  href: string;
  title: string;
  description: string | null;
  tableIdentifier: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  availableTables: string[];
}) {
  const NOW = new Date();

  const [showAllTables, setShowAllTables] = useState(false);

  return (
    <section className="group relative flex flex-col justify-between rounded border bg-background ring-0 ring-transparent ring-offset-2 ring-offset-background transition-all focus-within:bg-secondary focus-within:ring-2 focus-within:ring-ring hover:bg-secondary sm:flex-row sm:gap-16 sm:p-16">
      <PrefetchableLink
        to={href}
        className="flex flex-col space-y-4 p-16 after:absolute after:inset-0 focus:outline-none sm:space-y-6 sm:p-0 md:space-y-8"
      >
        <motion.h3
          layout="position"
          layoutId={`${tableIdentifier}-list-item-title`}
          transition={transitionAlpha}
          className={cn("-mt-3 text-xl font-bold leading-tight", {
            "line-through": deletedAt !== null && deletedAt !== undefined,
          })}
        >
          {title}
        </motion.h3>

        <span>
          <TableIdentifier
            className="text-sm transition-colors group-focus-within:bg-background group-hover:bg-background"
            tableIdentifier={tableIdentifier}
          />
        </span>

        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </PrefetchableLink>

      <Separator
        className="group-hover:bg-background/50 sm:hidden"
        orientation="horizontal"
      />

      <div className="flex shrink flex-col justify-center gap-8 p-16 sm:items-end sm:p-0">
        <div className="order-2 text-sm text-muted-foreground sm:order-1">
          Last updated: {capitalize(formatRelative(updatedAt, NOW))}
        </div>

        {availableTables.length > 0 ? (
          <div>
            <h4 className="mb-4 text-xs font-semibold text-muted-foreground sm:hidden">
              Tables:
            </h4>

            <button
              className="relative z-10 flex flex-wrap gap-4 rounded-sm bg-none ring-0 ring-offset-0 ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:justify-end"
              type="button"
              disabled={availableTables.length <= 5}
              onClick={() => {
                setShowAllTables((v) => !v);
              }}
            >
              {(showAllTables
                ? availableTables
                : availableTables.slice(0, 5)
              ).map((tableId) => (
                <code
                  key={tableId}
                  className="rounded bg-secondary p-3 px-6 text-xs leading-none text-accent-foreground transition-colors group-focus-within:bg-background group-hover:bg-background"
                >
                  {tableId}
                </code>
              ))}

              {availableTables.length > 5 ? (
                <span className="text-xs text-foreground">
                  {showAllTables
                    ? "show fewer"
                    : `and ${availableTables.length - 5} more`}
                </span>
              ) : null}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
