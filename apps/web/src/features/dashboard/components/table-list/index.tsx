import { capitalize } from "@manifold/lib/utils/string";
import { Button } from "@manifold/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@manifold/ui/components/ui/card";
import { transitionBeta } from "@manifold/ui/lib/animation";
import { cn } from "@manifold/ui/lib/utils";
import { formatRelative } from "date-fns";
import { motion } from "framer-motion";

import { PrefetchableLink } from "~features/routing/components/prefetchable-link";
import { trpc } from "~utils/trpc";

const NOW = new Date();

export function TableList() {
  const listQuery = trpc.table.list.useQuery();

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
      <CardHeader>
        {/* @TODO: Maybe this is a dropdown - recent/created at/used */}
        <CardTitle>Recently Edited:</CardTitle>
      </CardHeader>

      <CardContent
        className={cn(
          "grid grid-cols-2 gap-12 transition-opacity sm:grid-cols-3 sm:gap-16 md:grid-cols-[repeat(auto-fill,minmax(150px,200px))]",
          {
            "opacity-50": listQuery.isRefetching,
          },
        )}
      >
        {listQuery.data.length === 0 && (
          <div className="col-span-full flex items-center gap-16 text-center text-gray-500">
            You haven't created any tables yet.
            <Button asChild>
              <PrefetchableLink to="/table/new">
                Create a table
              </PrefetchableLink>
            </Button>
          </div>
        )}

        {listQuery.data.map((table) => {
          return (
            <div key={table.id} className="rounded-sm border">
              <div className="aspect-square w-full">
                <Button
                  className="group flex h-full w-full flex-col items-center justify-center gap-6 p-16"
                  variant="secondary"
                  asChild
                >
                  <PrefetchableLink
                    to={
                      listQuery.isRefetching ? "#" : `/table/${table.id}/edit`
                    }
                    state={{ table }}
                  >
                    <div className="z-20 translate-y-14 transition-transform group-hover:translate-y-0">
                      <motion.h2
                        layout="position"
                        layoutId={`table-title-${table.id}`}
                        className="whitespace-normal text-center text-lg !leading-tight sm:text-xl"
                        transition={transitionBeta}
                      >
                        {table.title}
                      </motion.h2>
                    </div>

                    <div className="z-10 -translate-y-12 scale-95 opacity-0 transition-all group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100">
                      <motion.span
                        layoutId={`table-updated-at-${table.id}`}
                        className="text-balance text-center text-sm text-gray-500"
                        transition={transitionBeta}
                      >
                        {capitalize(
                          formatRelative(new Date(table.updatedAt), NOW),
                        )}
                      </motion.span>
                    </div>
                  </PrefetchableLink>
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
