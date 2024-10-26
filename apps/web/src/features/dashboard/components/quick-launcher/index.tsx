import { Button } from "@manifold/ui/components/ui/button";
import { Card, CardContent } from "@manifold/ui/components/ui/card";
import { Link } from "react-router-dom";

import { trpc } from "~utils/trpc";

export function QuickLauncher() {
  const [data, query] = trpc.table.favorites.useSuspenseQuery();

  // @TODO: error state
  if (query.isError) {
    console.error(query.error);
  }

  return (
    <section className="flex gap-12 sm:gap-16">
      {data.map((table) => {
        return <QuickLaunchTile key={table.title} table={table} />;
      })}
    </section>
  );
}

function QuickLaunchTile({ table }: { table: { id: string; title: string } }) {
  return (
    <Card>
      <CardContent className="!p-0 flex items-center h-full">
        <Button asChild className="w-full h-full p-24" variant="link">
          <Link to={`/table/${table.id}`}>
            <h3>{table.title}</h3>
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
