import type { TableModel } from "@manifold/db/schema/table";
import { capitalize } from "@manifold/lib/utils/string";
import { Button } from "@manifold/ui/components/ui/button";
import { transitionAlpha } from "@manifold/ui/lib/animation";
import { formatRelative } from "date-fns";
import { motion } from "framer-motion";
import { GoArrowLeft } from "react-icons/go";

import { PrefetchableLink } from "~features/routing/components/prefetchable-link";
import { DeleteButton } from "~features/table/components/table-update-form/delete-button";
import { FavoriteButton } from "~features/table/components/table-update-form/favorite-button";

const NOW = new Date();

export const TABLE_UPDATE_HEADER_PORTAL_ID = "table-update-header-portal";

export function Header({ table }: { table: TableModel }) {
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

          <span className="text-muted-foreground/80 text-xs">
            {capitalize(formatRelative(new Date(table.updatedAt), NOW))}
          </span>
        </div>
      </motion.div>

      <div className="flex items-center gap-8">
        <div
          className="flex items-center gap-8"
          id={TABLE_UPDATE_HEADER_PORTAL_ID}
        />

        <FavoriteButton
          tableId={table.id}
          isFavorite={table.favorited ?? false}
        />
        <DeleteButton title={table.title} tableId={table.id} />
      </div>
    </header>
  );
}
