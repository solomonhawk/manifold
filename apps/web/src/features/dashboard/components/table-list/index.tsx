import { capitalize } from "@manifold/lib/utils/string";
import {
  AnimatedList,
  AnimatedListItem,
} from "@manifold/ui/components/animated-list";
import { Button } from "@manifold/ui/components/ui/button";
import { Card, CardContent, CardHeader } from "@manifold/ui/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@manifold/ui/components/ui/select";
import { useStateGuard } from "@manifold/ui/hooks/use-state-guard";
import { cn } from "@manifold/ui/lib/utils";
import {
  type TableListOrderBy,
  tableListOrderBy,
  tableListOrderByMapping,
} from "@manifold/validators";
import { formatRelative } from "date-fns";
import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

import { PrefetchableLink } from "~features/routing/components/prefetchable-link";
import { TABLE_LIST_ORDER_BY_STORAGE_KEY } from "~features/table/constants";
import { storage } from "~utils/storage";
import { trpc } from "~utils/trpc";

const NOW = new Date();

export function TableList({
  routeOrderBy,
}: {
  routeOrderBy: TableListOrderBy;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const orderByFromUrl = tableListOrderBy.safeParse(searchParams.get("sort"));
  const orderBy = orderByFromUrl.success ? orderByFromUrl.data : routeOrderBy;

  const listQuery = trpc.table.list.useQuery(
    { orderBy },
    {
      keepPreviousData: true,
    },
  );

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
    console.error(listQuery.error);
    return null;
  }

  // @TODO: loading state
  if (listQuery.isLoading) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="items-center justify-between gap-12 sm:flex-row">
        {/* @TODO: Maybe this is a dropdown - recent/created at/used */}
        {/* <CardTitle className="whitespace-nowrap">Your Tables:</CardTitle> */}
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
      </CardHeader>

      <CardContent className={cn({ "opacity-50": isPending })}>
        <AnimatedList className="grid grid-cols-2 gap-12 transition-opacity sm:grid-cols-3 sm:gap-16 md:grid-cols-[repeat(auto-fill,minmax(150px,200px))]">
          {listQuery.data.length === 0 && (
            <AnimatedListItem
              className="col-span-full flex items-center gap-16 text-center text-gray-500"
              initial={{ opacity: 0 }}
            >
              You haven't created any tables yet.
              <Button asChild>
                <PrefetchableLink to="/table/new">
                  Create a table
                </PrefetchableLink>
              </Button>
            </AnimatedListItem>
          )}

          {listQuery.data.map((table) => {
            return (
              <AnimatedListItem
                key={table.id}
                initial={{ opacity: 0, scale: 0.95 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="aspect-square w-full">
                  <Button
                    className="group flex h-full w-full flex-col items-center justify-center gap-6 p-16"
                    variant="outline"
                    asChild
                  >
                    <PrefetchableLink
                      to={
                        listQuery.isRefetching ? "#" : `/table/${table.id}/edit`
                      }
                      state={{ table }}
                    >
                      <div className="z-20 translate-y-14 transition-transform group-hover:translate-y-0">
                        <h2 className="whitespace-normal text-center text-lg !leading-tight sm:text-xl">
                          {table.title}
                        </h2>
                      </div>

                      <div className="z-10 -translate-y-12 scale-95 opacity-0 transition-all group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100">
                        <span className="text-balance text-center text-sm text-gray-500">
                          {capitalize(
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
