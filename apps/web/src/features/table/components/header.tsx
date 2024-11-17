import { capitalize } from "@manifold/lib";
import type { RouterOutput } from "@manifold/router";
import { Button } from "@manifold/ui/components/ui/button";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from "@manifold/ui/components/ui/tooltip";
import { transitionAlpha } from "@manifold/ui/lib/animation";
import { cn } from "@manifold/ui/lib/utils";
import { formatRelative } from "date-fns";
import { motion } from "motion/react";
import { GoArrowLeft, GoEye } from "react-icons/go";

import { PrefetchableLink } from "~features/routing/components/prefetchable-link";
import { DeleteButton } from "~features/table/components/table-update-form/delete-button";
import { FavoriteButton } from "~features/table/components/table-update-form/favorite-button";
import { RestoreButton } from "~features/table/components/table-update-form/restore-button";
import { ViewDependenciesButton } from "~features/table/components/table-update-form/view-dependencies-button";

export const TABLE_UPDATE_HEADER_PORTAL_ID = "table-update-header-portal";

export function Header({ table }: { table: RouterOutput["table"]["get"] }) {
  const NOW = new Date();

  return (
    <header className="flex items-center justify-between">
      <motion.div
        className="flex items-center gap-12"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={transitionAlpha}
      >
        <Button asChild size="icon" variant="ghost">
          <PrefetchableLink to="/dashboard">
            <span className="sr-only">Go back to dashboard</span>
            <GoArrowLeft />
          </PrefetchableLink>
        </Button>

        <div className="flex flex-col justify-center">
          <h2 className="text-lg font-bold leading-tight">{table.title}</h2>

          {table.deletedAt ? (
            <span className="text-xs text-destructive">
              Deleted {formatRelative(new Date(table.deletedAt), NOW)}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/80">
              {capitalize(formatRelative(new Date(table.updatedAt), NOW))}
            </span>
          )}
        </div>
      </motion.div>

      <div className="flex items-center gap-8">
        <div
          id={TABLE_UPDATE_HEADER_PORTAL_ID}
          className={cn("flex items-center gap-8", {
            hidden: table.deletedAt !== null,
          })}
        />

        {table.deletedAt ? (
          <RestoreButton
            title={table.title}
            tableId={table.id}
            tableIdentifier={table.tableIdentifier}
          />
        ) : (
          <>
            {table.dependencies.length > 0 ? (
              <ViewDependenciesButton
                tableTitle={table.title}
                tableIdentifier={table.tableIdentifier}
                dependencies={table.dependencies}
              />
            ) : null}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild size="icon" variant="outline">
                  <PrefetchableLink
                    to={`/t/${table.ownerUsername}/${table.slug}`}
                  >
                    <span className="sr-only">View public table page</span>
                    <GoEye />
                  </PrefetchableLink>
                </Button>
              </TooltipTrigger>

              <TooltipContent>
                View public table page
                <TooltipArrow />
              </TooltipContent>
            </Tooltip>

            <FavoriteButton
              tableId={table.id}
              tableIdentifier={table.tableIdentifier}
              isFavorite={table.favorited ?? false}
            />
            <DeleteButton
              title={table.title}
              tableId={table.id}
              tableIdentifier={table.tableIdentifier}
            />
          </>
        )}
      </div>
    </header>
  );
}
