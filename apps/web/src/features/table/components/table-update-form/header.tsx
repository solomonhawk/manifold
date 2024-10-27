import type { TableModel } from "@manifold/db/schema/table";
import { Button } from "@manifold/ui/components/ui/button";
import { transitionBeta } from "@manifold/ui/lib/animation";
import { formatRelative } from "date-fns";
import { motion } from "framer-motion";
import { GoArrowLeft } from "react-icons/go";
import { Link } from "react-router-dom";

import { DeleteButton } from "~features/table/components/table-update-form/delete-button";
import { FavoriteButton } from "~features/table/components/table-update-form/favorite-button";

const NOW = new Date();

export const TABLE_UPDATE_HEADER_PORTAL_ID = "table-update-header-portal";

export function Header({ table }: { table: TableModel }) {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-12">
        <Button asChild size="icon" variant="ghost">
          <Link to="/dashboard">
            <GoArrowLeft />
          </Link>
        </Button>

        <div className="flex flex-col justify-center">
          <motion.h2
            layout="position"
            layoutId={`table-title-${table.id}`}
            className="text-lg font-bold leading-tight"
            transition={transitionBeta}
          >
            {table.title}
          </motion.h2>

          <motion.span
            layoutId={`table-updated-at-${table.id}`}
            className="text-xs text-gray-500"
            transition={transitionBeta}
          >
            {formatRelative(new Date(table.updatedAt), NOW)}
          </motion.span>
        </div>
      </div>

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
