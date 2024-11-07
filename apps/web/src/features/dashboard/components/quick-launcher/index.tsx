import { Button } from "@manifold/ui/components/ui/button";
import { Card, CardContent } from "@manifold/ui/components/ui/card";
import { transitionAlpha } from "@manifold/ui/lib/animation";
import { AnimatePresence, motion } from "framer-motion";

import { useRequiredUserProfile } from "~features/onboarding/hooks/use-required-user-profile";
import { PrefetchableLink } from "~features/routing/components/prefetchable-link";
import { useListTableFavorites } from "~features/table/api/favorite";
import { log } from "~utils/logger";

export function QuickLauncher() {
  const userProfile = useRequiredUserProfile();
  const favoritesQuery = useListTableFavorites();

  // @TODO: error state
  if (favoritesQuery.isError) {
    log.error(favoritesQuery.error);
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
              <QuickLaunchTile table={table} userProfile={userProfile} />
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}

function QuickLaunchTile({
  table,
  userProfile,
}: {
  table: { slug: string; title: string };
  userProfile: { username: string };
}) {
  return (
    <Card>
      <CardContent className="flex h-full items-center !p-0">
        <Button asChild className="size-full p-16" variant="link">
          <PrefetchableLink
            to={`/t/${userProfile.username}/${table.slug}/edit`}
          >
            <h3>{table.title}</h3>
          </PrefetchableLink>
        </Button>
      </CardContent>
    </Card>
  );
}
