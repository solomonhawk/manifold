import { buildTableIdentifier } from "@manifold/lib";
import type { RouterOutput } from "@manifold/router";
import { FullScreenLoader } from "@manifold/ui/components/full-screen-loader";
import { TableIdentifier } from "@manifold/ui/components/table-identifier";
import { Button } from "@manifold/ui/components/ui/button";
import { FlexCol } from "@manifold/ui/components/ui/flex";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from "@manifold/ui/components/ui/tooltip";
import { transitionAlpha } from "@manifold/ui/lib/animation";
import { AnimatePresence, motion } from "framer-motion";
import {
  GoArrowLeft,
  GoChevronLeft,
  GoChevronRight,
  GoCopy,
  GoDiff,
  GoPackage,
  GoPencil,
} from "react-icons/go";
import { Outlet, useLocation } from "react-router-dom";

import { DialogManager, DIALOGS } from "~features/dialog-manager";
import { useRequiredUserProfile } from "~features/onboarding/hooks/use-required-user-profile";
import { PrefetchableLink } from "~features/routing/components/prefetchable-link";
import { useRouteParams } from "~features/routing/hooks/use-route-params";
import { tableVersionDetailParams } from "~features/table-version/pages/detail/params";
import { trpc } from "~utils/trpc";

export function TableVersionLayout() {
  const location = useLocation();
  const userProfile = useRequiredUserProfile();
  const { username, slug, version } = useRouteParams(tableVersionDetailParams);
  const tableVersion = trpc.tableVersion.get.useQuery({
    tableIdentifier: buildTableIdentifier(username, slug),
    version,
  });

  if (tableVersion.isLoading) {
    // @TODO: better loading state
    return <FullScreenLoader />;
  }

  if (tableVersion.isError) {
    // @TODO: better error state
    return <div>Error: {tableVersion.error.message}</div>;
  }

  const direction =
    location.state?.previousVersion !== undefined
      ? location.state.previousVersion > version
        ? "up"
        : "down"
      : location.state?.fromTable
        ? "left"
        : undefined;

  const variants = {
    exit: (direction: "left" | "up" | "down") => {
      return {
        left: { x: -12, opacity: 0 },
        up: { y: "-100%", opacity: 0 },
        down: { y: "100%", opacity: 0 },
      }[direction];
    },
    enter: (direction: "left" | "up" | "down") => {
      return {
        left: { x: -12 },
        up: { y: "100%" },
        down: { y: "-100%" },
      }[direction];
    },
  };

  return (
    <FlexCol className="container max-w-screen-xl">
      <header className="my-12 flex gap-12 sm:my-16 md:mb-24 md:mt-36 md:items-center md:justify-between">
        <div className="flex gap-12">
          <Button asChild size="icon" variant="ghost">
            <PrefetchableLink
              to={`/t/${tableVersion.data.ownerUsername}/${tableVersion.data.tableSlug}`}
            >
              <span className="sr-only">Go back to dashboard</span>
              <GoArrowLeft />
            </PrefetchableLink>
          </Button>

          <motion.div
            layout="position"
            layoutId={`table-title-header-${tableVersion.data.table.id}`}
            transition={transitionAlpha}
            className="flex flex-col justify-center"
          >
            <h2 className="-mt-4 flex items-center gap-10 text-2xl font-bold sm:text-3xl md:mb-8 md:text-4xl">
              {tableVersion.data.table.title}{" "}
              <AnimatePresence mode="popLayout" custom={direction}>
                <motion.span
                  key={version}
                  className="text-accent-foreground"
                  transition={transitionAlpha}
                  custom={direction}
                  variants={variants}
                  initial={direction ? "enter" : false}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={"exit"}
                >
                  v{version}
                </motion.span>
              </AnimatePresence>
              <motion.span
                layout
                layoutId={`table-title-header-${tableVersion.data.table.id}-icon`}
                transition={transitionAlpha}
              >
                <GoPackage className="size-20 sm:size-24 md:size-28" />
              </motion.span>
            </h2>

            <div>
              <TableIdentifier
                className="text-xs sm:text-base"
                tableIdentifier={tableVersion.data.table.tableIdentifier}
              />
            </div>

            {tableVersion.data.table.description ? (
              <p className="mt-12 text-muted-foreground">
                {tableVersion.data.table.description}
              </p>
            ) : null}
          </motion.div>
        </div>

        <div className="mb-auto flex grow justify-end gap-8">
          <VersionNavigation version={tableVersion.data} />

          <Button
            variant="outline"
            className="flex items-center gap-6"
            disabled={tableVersion.data.versions.length < 2}
            onClick={() => {
              DialogManager.show(DIALOGS.COMPARE_VERSIONS.ID, {
                defaultVisible: false,
                table: tableVersion.data.table,
                versions: tableVersion.data.versions,
                currentVersion: tableVersion.data.version,
              });
            }}
          >
            <GoDiff className="-ml-2" /> Compare Versions
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon">
                <span className="sr-only">Copy Table</span>
                <GoCopy />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Copy table
              <TooltipArrow />
            </TooltipContent>
          </Tooltip>

          {userProfile.userId === tableVersion.data.table.ownerId ? (
            <Button asChild variant="outline" size="icon">
              <PrefetchableLink to={`/t/${username}/${slug}/edit`}>
                <span className="sr-only">Edit Table</span>
                <GoPencil />
              </PrefetchableLink>
            </Button>
          ) : null}
        </div>
      </header>

      <Outlet />
    </FlexCol>
  );
}

function VersionNavigation({
  version,
}: {
  version: RouterOutput["tableVersion"]["get"];
}) {
  const currentIndex = version.versions.findIndex(
    (v) => v.version === version.version,
  );
  const totalVersions = version.versions.length;

  // versions are in descending order by `version`, so these seem backwards
  const hasNextVersion = currentIndex > 0;
  const hasPreviousVersion = currentIndex < totalVersions - 1;

  const PrevLinkComponent = hasPreviousVersion ? PrefetchableLink : "span";
  const NextLinkComponent = hasNextVersion ? PrefetchableLink : "span";

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            asChild={hasPreviousVersion}
            disabled={!hasPreviousVersion}
          >
            <PrevLinkComponent
              to={
                hasPreviousVersion
                  ? `/t/${version.ownerUsername}/${version.tableSlug}/v/${version.version - 1}`
                  : "#"
              }
              state={{ previousVersion: version.version }}
            >
              <span className="sr-only">Previous version</span>
              <GoChevronLeft />
            </PrevLinkComponent>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Previous version
          <TooltipArrow />
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            asChild={hasNextVersion}
            disabled={!hasNextVersion}
          >
            <NextLinkComponent
              to={
                hasNextVersion
                  ? `/t/${version.ownerUsername}/${version.tableSlug}/v/${version.version + 1}`
                  : "#"
              }
              state={{ previousVersion: version.version }}
            >
              <span className="sr-only">Next version</span>
              <GoChevronRight />
            </NextLinkComponent>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Next version
          <TooltipArrow />
        </TooltipContent>
      </Tooltip>
    </>
  );
}
