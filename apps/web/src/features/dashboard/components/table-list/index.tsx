import { Button } from "@manifold/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@manifold/ui/components/ui/card";
import { cn } from "@manifold/ui/lib/utils";
import { formatRelative } from "date-fns";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { transitionBeta } from "~utils/animation";
import { trpc } from "~utils/trpc";

const NOW = new Date();

export function TableList() {
  const [data, query] = trpc.table.list.useSuspenseQuery(undefined, {
    staleTime: 1000 * 60 * 5,
  });

  // @TODO: error state
  if (query.isError) {
    console.error(query.error);
  }

  return (
    <Card>
      <CardHeader>
        {/* @TODO: Maybe this is a dropdown - recent/created at/used */}
        <CardTitle>Recently Edited:</CardTitle>
      </CardHeader>

      <CardContent
        className={cn(
          "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-[repeat(auto-fill,minmax(150px,200px))] gap-12 sm:gap-16 transition-opacity",
          {
            "opacity-50": query.isRefetching,
          },
        )}
      >
        {data.length === 0 && (
          <div className="col-span-full text-center text-gray-500 flex gap-16 items-center">
            You haven't created any tables yet.
            <Button asChild>
              <Link to="/table/new">Create a table</Link>
            </Button>
          </div>
        )}

        {data.map((table) => {
          return (
            <div key={table.id} className="border rounded-sm">
              <div className="w-full aspect-square">
                <Button
                  className="group w-full h-full flex flex-col items-center justify-center p-16 gap-6"
                  variant="secondary"
                  asChild
                >
                  <Link
                    to={query.isRefetching ? "#" : `/table/${table.id}/edit`}
                    state={{ table }}
                  >
                    <div className="translate-y-14 group-hover:translate-y-0 transition-transform z-20">
                      <motion.h2
                        layoutId={`table-title-${table.id}`}
                        className="text-lg sm:text-xl text-center whitespace-normal !leading-tight"
                        transition={transitionBeta}
                      >
                        {table.title}
                      </motion.h2>
                    </div>

                    <div className="-translate-y-12 scale-95 opacity-0 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 transition-all z-10">
                      <motion.span
                        layoutId={`table-updated-at-${table.id}`}
                        className="text-gray-500 text-sm text-balance text-center"
                        transition={transitionBeta}
                      >
                        {formatRelative(new Date(table.updatedAt), NOW)}
                      </motion.span>
                    </div>
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
