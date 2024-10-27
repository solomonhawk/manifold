import { Button } from "@manifold/ui/components/ui/button";
import { Card, CardContent } from "@manifold/ui/components/ui/card";
import { transitionAlpha } from "@manifold/ui/lib/animation";
import { AnimatePresence, motion } from "framer-motion";

import { PrefetchableLink } from "~features/routing/components/prefetchable-link";
import { trpc } from "~utils/trpc";

export function QuickLauncher() {
  const favoritesQuery = trpc.table.favorites.useQuery();

  // @TODO: error state
  if (favoritesQuery.isError) {
    console.error(favoritesQuery.error);
    return null;
  }

  // @TODO: loading state
  if (favoritesQuery.isLoading) {
    return null;
  }

  return (
    <ul className="flex gap-6 sm:gap-8">
      <AnimatePresence initial={false} mode="popLayout">
        {favoritesQuery.data.map((table) => {
          return (
            <motion.li
              key={table.id}
              layout
              transition={transitionAlpha}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <QuickLaunchTile table={table} />
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}

function QuickLaunchTile({ table }: { table: { id: string; title: string } }) {
  return (
    <Card>
      <CardContent className="flex h-full items-center !p-0">
        <Button asChild className="h-full w-full p-16" variant="link">
          <PrefetchableLink to={`/table/${table.id}/edit`}>
            <h3>{table.title}</h3>
          </PrefetchableLink>
        </Button>
      </CardContent>
    </Card>
  );
}
