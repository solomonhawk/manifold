import { Button } from "@manifold/ui/components/ui/button";
import { Card, CardContent } from "@manifold/ui/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";

import { transitionAlpha } from "~utils/animation";
import { trpc } from "~utils/trpc";

export function QuickLauncher() {
  const [data, query] = trpc.table.favorites.useSuspenseQuery();

  // @TODO: error state
  if (query.isError) {
    console.error(query.error);
  }

  return (
    <AnimatePresence initial={false} mode="popLayout">
      <ul className="flex gap-6 sm:gap-8">
        {data.map((table) => {
          return <QuickLaunchTile key={table.title} table={table} />;
        })}
      </ul>
    </AnimatePresence>
  );
}

function QuickLaunchTile({ table }: { table: { id: string; title: string } }) {
  return (
    <motion.li
      layout
      transition={transitionAlpha}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <Card>
        <CardContent className="!p-0 flex items-center h-full">
          <Button asChild className="w-full h-full p-16" variant="link">
            <Link to={`/table/${table.id}`}>
              <h3>{table.title}</h3>
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.li>
  );
}
