import { Button } from "@manifold/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@manifold/ui/components/ui/card";
import { formatRelative } from "date-fns";
import { Link } from "react-router-dom";

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

      <CardContent className="grid grid-cols-[repeat(auto-fill,minmax(150px,200px))] gap-12 sm:gap-16">
        {data.map((table) => {
          return (
            <div key={table.id} className="border rounded-sm">
              <div className="w-full aspect-square">
                <Button
                  className="group w-full h-full flex flex-col items-center justify-center p-16 gap-6 !no-underline"
                  variant="link"
                  asChild
                >
                  <Link to={`/table/${table.id}/edit`}>
                    <h3 className="text-lg sm:text-xl group-hover:underline decoration-from-font underline-offset-2 text-center whitespace-normal">
                      {table.title}
                    </h3>

                    <span className="text-gray-500 text-sm text-balance text-center">
                      Last edited{" "}
                      {formatRelative(new Date(table.updatedAt), NOW)}
                    </span>
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
