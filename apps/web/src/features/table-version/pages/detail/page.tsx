import { buildTableIdentifier } from "@manifold/lib";
import type { RouterOutput } from "@manifold/router";
import { FullScreenLoader } from "@manifold/ui/components/full-screen-loader";
import { TableIdentifier } from "@manifold/ui/components/table-identifier";
import { Badge } from "@manifold/ui/components/ui/badge";
import { Button } from "@manifold/ui/components/ui/button";
import { FlexCol } from "@manifold/ui/components/ui/flex";
import { transitionAlpha } from "@manifold/ui/lib/animation";
import { cn } from "@manifold/ui/lib/utils";
import { motion } from "framer-motion";
import {
  GoArrowLeft,
  GoArrowRight,
  GoChevronLeft,
  GoChevronRight,
  GoCopy,
  GoPackage,
  GoPencil,
} from "react-icons/go";

import { useRequiredUserProfile } from "~features/onboarding/hooks/use-required-user-profile";
import { PrefetchableLink } from "~features/routing/components/prefetchable-link";
import { useRouteParams } from "~features/routing/hooks/use-route-params";
import { tableVersionDetailParams } from "~features/table-version/pages/detail/params";
import { trpc } from "~utils/trpc";

const COLLAPSED_AVAILABLE_TABLES_COUNT = 3;

export function TableVersionDetail() {
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
              <span className="text-muted-foreground">v{version}</span>
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

          <Button variant="outline" size="icon">
            <span className="sr-only">Copy Table</span>
            <GoCopy />
          </Button>

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

      <section className="grid grid-cols-1 gap-12 pb-24 sm:gap-16 md:grid-cols-2 md:pb-36">
        <section>
          <h3 className="mb-8 font-semibold">Table details</h3>

          <dl className="mb-16 grid grid-cols-[min-content,_1fr] border-l border-t bg-background text-sm">
            <dt className="border-b border-r px-10 py-8 font-semibold text-muted-foreground">
              Last&nbsp;updated
            </dt>
            <dd className="border-b border-r px-10 py-8">
              {tableVersion.data.table.updatedAt.toLocaleDateString()}
            </dd>

            <dt className="border-b border-r px-10 py-8 font-semibold text-muted-foreground">
              Total versions
            </dt>
            <dd className="border-b border-r px-10 py-8">
              {tableVersion.data.versions.length}
            </dd>

            {tableVersion.data.versions.length > 0 ? (
              <>
                <dt className="border-b border-r px-10 py-8 font-semibold text-muted-foreground">
                  Latest&nbsp;release&nbsp;notes
                </dt>
                <dd className="border-b border-r px-10 py-8">
                  {tableVersion.data.versions[0].releaseNotes || (
                    <em className="text-muted-foreground">No release notes</em>
                  )}
                </dd>
                <dt className="border-b border-r px-10 py-8 font-semibold text-muted-foreground">
                  Available&nbsp;Tables
                </dt>
                <dd className="flex flex-wrap gap-4 border-b border-r px-10 py-8">
                  {tableVersion.data.versions[0].availableTables.map(
                    (tableId) => (
                      <code
                        key={tableId}
                        className="rounded bg-secondary p-3 px-6 text-xs leading-none text-accent-foreground"
                      >
                        {tableId}
                      </code>
                    ),
                  )}
                </dd>
              </>
            ) : null}
          </dl>

          <h3 className="mb-8 font-semibold">Definition</h3>

          <div className="rounded border bg-background">
            <pre className="max-h-384 overflow-auto px-16 py-12 text-xs leading-tight">
              {tableVersion.data.definition}
            </pre>
          </div>
        </section>

        <section>
          <h3 className="mb-8 font-semibold">Other Versions</h3>

          <ul className="divide-y overflow-hidden rounded border bg-background">
            {tableVersion.data.versions.map((version) => {
              const isCurrentVersion =
                version.version === tableVersion.data.version;
              const LinkComponent = isCurrentVersion
                ? "span"
                : PrefetchableLink;

              return (
                <li key={version.id}>
                  <LinkComponent
                    to={`/t/${username}/${slug}/v/${version.version}`}
                    className={cn(
                      "group flex items-center justify-between border-l-4 border-transparent p-12 pl-16 sm:p-16 sm:pl-20",
                      {
                        "border-accent-foreground": isCurrentVersion,
                      },
                    )}
                  >
                    <div className="flex flex-col gap-4 pr-16">
                      <div className="flex items-center gap-6 text-base text-muted-foreground">
                        <strong className="text-xl text-accent-foreground">
                          v{version.version}
                        </strong>{" "}
                        published on{" "}
                        <span className="text-foreground">
                          {version.createdAt.toLocaleDateString()}
                        </span>
                        {isCurrentVersion ? (
                          <Badge variant="outline">Current</Badge>
                        ) : null}
                      </div>

                      {version.releaseNotes ? (
                        <pre
                          className="my-4 mb-8 line-clamp-2 text-ellipsis whitespace-break-spaces border-l-2 border-muted pl-8 font-sans text-xs text-muted-foreground/70"
                          title={version.releaseNotes}
                        >
                          {version.releaseNotes}
                        </pre>
                      ) : null}

                      <div className="flex flex-wrap gap-4">
                        {version.availableTables
                          .slice(0, COLLAPSED_AVAILABLE_TABLES_COUNT)
                          .map((tableId) => (
                            <code
                              key={tableId}
                              className="rounded bg-secondary p-3 px-6 text-xs leading-none text-accent-foreground"
                            >
                              {tableId}
                            </code>
                          ))}

                        {version.availableTables.length >
                        COLLAPSED_AVAILABLE_TABLES_COUNT ? (
                          <span className="text-xs text-foreground">
                            {`and ${version.availableTables.length - COLLAPSED_AVAILABLE_TABLES_COUNT} more`}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {!isCurrentVersion ? (
                      <Button
                        size="icon"
                        variant="ghost"
                        type="button"
                        tabIndex={-1}
                      >
                        <GoArrowRight />
                      </Button>
                    ) : null}
                  </LinkComponent>
                </li>
              );
            })}
          </ul>
        </section>
      </section>
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
        >
          <span className="sr-only">Previous version</span>
          <GoChevronLeft />
        </PrevLinkComponent>
      </Button>

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
        >
          <span className="sr-only">Next version</span>
          <GoChevronRight />
        </NextLinkComponent>
      </Button>
    </>
  );
}
