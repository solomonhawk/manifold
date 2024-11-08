import { capitalize } from "@manifold/lib";
import {
  AnimatedList,
  AnimatedListItem,
} from "@manifold/ui/components/animated-list";
import { ReactiveButton } from "@manifold/ui/components/reactive-button";
import { Button } from "@manifold/ui/components/ui/button";
import { Card, CardContent, CardHeader } from "@manifold/ui/components/ui/card";
import { Checkbox } from "@manifold/ui/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@manifold/ui/components/ui/select";
import { useStateGuard } from "@manifold/ui/hooks/use-state-guard";
import { transitionGamma } from "@manifold/ui/lib/animation";
import { cn } from "@manifold/ui/lib/utils";
import {
  type TableListOrderBy,
  tableListOrderBy,
  tableListOrderByMapping,
} from "@manifold/validators";
import { formatRelative } from "date-fns";
import { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useRequiredUserProfile } from "~features/onboarding/hooks/use-required-user-profile";
import { PrefetchableLink } from "~features/routing/components/prefetchable-link";
import { useListTables } from "~features/table/api/list";
import { TABLE_LIST_ORDER_BY_STORAGE_KEY } from "~features/table/constants";
import { log } from "~utils/logger";
import { storage } from "~utils/storage";

const NOW = new Date();

export function TableList({
  routeOrderBy,
}: {
  routeOrderBy: TableListOrderBy;
}) {
  const userProfile = useRequiredUserProfile();
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const orderByFromUrl = tableListOrderBy.safeParse(searchParams.get("sort"));
  const orderBy = orderByFromUrl.success ? orderByFromUrl.data : routeOrderBy;

  const listQuery = useListTables({ orderBy, includeDeleted });
  const isPending = useStateGuard(listQuery.isRefetching, { min: 200 });

  const handleOrderChange = useCallback(
    (nextOrderBy: TableListOrderBy) => {
      storage.setItem(TABLE_LIST_ORDER_BY_STORAGE_KEY, nextOrderBy);

      setSearchParams(
        (params) => {
          params.set("sort", nextOrderBy);
          return params;
        },
        {
          preventScrollReset: true,
        },
      );
    },
    [setSearchParams],
  );

  // @TODO: error state
  if (listQuery.isError) {
    log.error(listQuery.error);
    return null;
  }

  // @TODO: loading state
  if (listQuery.isLoading) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="items-center justify-between gap-12 sm:flex-row sm:space-y-0">
        <div>
          <Select value={orderBy} onValueChange={handleOrderChange}>
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

        <div className="flex items-center">
          <Checkbox
            id="deleted"
            aria-labelledby="deleted-label"
            checked={includeDeleted}
            onCheckedChange={(checked) =>
              setIncludeDeleted(checked === "indeterminate" ? false : checked)
            }
          />
          <label
            id="deleted-label"
            htmlFor="deleted"
            className="pl-8 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Show Deleted
          </label>
        </div>
      </CardHeader>

      <CardContent className={cn({ "opacity-50": isPending })}>
        <AnimatedList className="grid grid-cols-2 gap-12 transition-opacity sm:grid-cols-3 sm:gap-16 md:grid-cols-[repeat(auto-fill,minmax(150px,200px))]">
          {listQuery.data.length === 0 && (
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

          {listQuery.data.map((table) => {
            return (
              <AnimatedListItem
                key={table.id}
                initial={{ opacity: 0, scale: 0.95 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={transitionGamma}
              >
                <div className="aspect-square w-full">
                  <Button
                    className="group flex size-full flex-col items-center justify-center gap-6 p-16"
                    variant="outline"
                    asChild
                  >
                    <PrefetchableLink
                      to={
                        listQuery.isRefetching
                          ? "#"
                          : `/t/${userProfile.username}/${table.slug}/edit`
                      }
                      state={{ table }}
                    >
                      <div className="z-20 translate-y-14 transition-transform group-hover:translate-y-0">
                        <h2 className="whitespace-normal text-center text-lg !leading-tight sm:text-xl">
                          {table.title}
                        </h2>
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
                            : capitalize(
                                formatRelative(new Date(table.updatedAt), NOW),
                              )}
                        </span>
                      </div>
                    </PrefetchableLink>
                  </Button>
                </div>
              </AnimatedListItem>
            );
          })}
        </AnimatedList>
      </CardContent>
    </Card>
  );
}
