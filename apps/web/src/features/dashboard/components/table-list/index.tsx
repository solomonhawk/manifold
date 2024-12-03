import type { RouterOutput } from "@manifold/router";
import {
  AnimatedList,
  AnimatedListItem,
} from "@manifold/ui/components/animated-list";
import { Button } from "@manifold/ui/components/core/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@manifold/ui/components/core/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@manifold/ui/components/core/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@manifold/ui/components/core/tooltip";
import { ReactiveButton } from "@manifold/ui/components/reactive-button";
import { useStateGuard } from "@manifold/ui/hooks/use-state-guard";
import { transitionGamma } from "@manifold/ui/lib/animation";
import { cn } from "@manifold/ui/lib/utils";
import {
  type TableListOrderBy,
  tableListOrderByMapping,
} from "@manifold/validators";
import { useCallback, useState } from "react";
import {
  GoCircle,
  GoCircleSlash,
  GoListUnordered,
  GoSquare,
} from "react-icons/go";

import { PrefetchableLink } from "~features/routing/components/prefetchable-link";
import { useSearchParams } from "~features/routing/hooks/use-search-params";
import { useListPrefetchedTables } from "~features/table/api/list";
import { TableCard } from "~features/table/components/table-card";
import { TableListItem } from "~features/table/components/table-list-item";
import {
  TABLE_LIST_ORDER_BY_STORAGE_KEY,
  TABLE_LIST_VIEW_STORAGE_KEY,
  type TableListView,
} from "~features/table/constants";
import { storage, useManifoldStorage } from "~utils/storage";

export function TableList({
  orderBy,
  initialTableListView,
}: {
  orderBy: TableListOrderBy;
  initialTableListView: TableListView;
}) {
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [_, setSearchParams] = useSearchParams();
  const [tableView, setTableView] = useManifoldStorage<"grid" | "list">(
    TABLE_LIST_VIEW_STORAGE_KEY,
    initialTableListView,
  );

  const [tables, tablesListQuery] = useListPrefetchedTables({
    orderBy,
    includeDeleted,
  });

  const isPending = useStateGuard(tablesListQuery.isRefetching, { min: 200 });

  const handleSort = useCallback(
    (nextOrderBy: TableListOrderBy) => {
      storage.setItem(TABLE_LIST_ORDER_BY_STORAGE_KEY, nextOrderBy);

      setSearchParams((params) => {
        const copy = new URLSearchParams(params);
        copy.set("sort", nextOrderBy);
        return copy;
      });
    },
    [setSearchParams],
  );

  const listClassName =
    tableView === "grid"
      ? "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]"
      : "flex flex-col";

  return (
    <Card>
      <CardHeader className="items-center justify-between gap-12 sm:flex-row sm:space-y-0">
        <div>
          <Select value={orderBy} onValueChange={handleSort}>
            <SelectTrigger className="min-w-176">
              {tableListOrderByMapping[orderBy]}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recently_edited">Recently Edited</SelectItem>
              <SelectItem value="recently_not_edited">
                Recently Not Edited
              </SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-8">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() =>
                  setTableView((v) => (v === "grid" ? "list" : "grid"))
                }
              >
                <span className="sr-only">
                  {tableView === "grid" ? "Show as list" : "Show as grid"}
                </span>

                {tableView === "grid" ? <GoListUnordered /> : <GoSquare />}
              </Button>
            </TooltipTrigger>

            <TooltipContent>
              {tableView === "grid" ? "Show as list" : "Show as grid"}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setIncludeDeleted((v) => !v)}
              >
                <span className="sr-only">
                  {includeDeleted ? "Hide deleted" : "Show deleted"}
                </span>

                {includeDeleted ? <GoCircle /> : <GoCircleSlash />}
              </Button>
            </TooltipTrigger>

            <TooltipContent>
              {includeDeleted ? "Hide deleted" : "Show deleted"}
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>

      <CardContent className={cn({ "opacity-50": isPending })}>
        <AnimatedList
          className={cn("gap-12 transition-opacity sm:gap-16", listClassName)}
        >
          {tables.length === 0 && (
            <AnimatedListItem
              className="col-span-full flex items-center gap-16 text-center text-gray-500"
              initial={{ opacity: 0 }}
            >
              You haven’t created any tables yet.
              <ReactiveButton asChild className="border-2">
                <PrefetchableLink to="/table/new">
                  Create a table
                </PrefetchableLink>
              </ReactiveButton>
            </AnimatedListItem>
          )}

          {tables.map((table) => {
            return (
              <AnimatedListItem
                key={table.id}
                initial={{ opacity: 0, scale: 0.95 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={transitionGamma}
              >
                <ListItem
                  table={table}
                  tableView={tableView}
                  isRefetching={tablesListQuery.isRefetching}
                />
              </AnimatedListItem>
            );
          })}
        </AnimatedList>
      </CardContent>
    </Card>
  );
}

function ListItem({
  table,
  tableView,
  isRefetching,
}: {
  table: RouterOutput["table"]["list"][number];
  tableView: "grid" | "list";
  isRefetching: boolean;
}) {
  const href = `/t/${table.ownerUsername}/${table.slug}/edit`;

  if (tableView === "list") {
    return <TableListItem {...table} href={href} />;
  }

  return <TableCard table={table} isRefetching={isRefetching} href={href} />;
}
