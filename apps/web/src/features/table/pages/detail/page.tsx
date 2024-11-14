import { buildTableIdentifier } from "@manifold/lib";
import { FullScreenLoader } from "@manifold/ui/components/full-screen-loader";
import { TableIdentifier } from "@manifold/ui/components/table-identifier";
import { Button } from "@manifold/ui/components/ui/button";
import { FlexCol } from "@manifold/ui/components/ui/flex";
import { transitionAlpha } from "@manifold/ui/lib/animation";
import { motion } from "framer-motion";
import { GoArrowRight, GoCopy, GoPackage, GoPencil } from "react-icons/go";

import { useRequiredUserProfile } from "~features/onboarding/hooks/use-required-user-profile";
import { PrefetchableLink } from "~features/routing/components/prefetchable-link";
import { useRouteParams } from "~features/routing/hooks/use-route-params";
import { tableDetailParams } from "~features/table/pages/detail/params";
import { trpc } from "~utils/trpc";

const COLLAPSED_AVAILABLE_TABLES_COUNT = 3;

export function TableDetail() {
  const userProfile = useRequiredUserProfile();
  const { username, slug } = useRouteParams(tableDetailParams);
  const table = trpc.table.get.useQuery({
    tableIdentifier: buildTableIdentifier(username, slug),
  });

  if (table.isLoading) {
    // @TODO: better loading state
    return <FullScreenLoader />;
  }

  if (table.isError) {
    // @TODO: better error state
    return <div>Error: {table.error.message}</div>;
  }

  return (
    <FlexCol className="container max-w-screen-xl">
      <header className="my-12 flex gap-12 sm:my-16 md:mb-24 md:mt-36 md:items-center md:justify-between">
        <motion.div
          layout="position"
          layoutId={`table-title-header-${table.data.id}`}
          transition={transitionAlpha}
        >
          <h2 className="-mt-4 flex items-center gap-10 text-2xl font-bold sm:text-3xl md:mb-8 md:text-4xl">
            {table.data.title}

            <motion.span
              layout
              layoutId={`table-title-header-${table.data.id}-icon`}
              transition={transitionAlpha}
            >
              <GoPackage className="size-20 sm:size-24 md:size-28" />
            </motion.span>
          </h2>

          <TableIdentifier
            className="text-xs sm:text-base"
            tableIdentifier={table.data.tableIdentifier}
          />

          {table.data.description ? (
            <p className="mt-12 text-muted-foreground">
              {table.data.description}
            </p>
          ) : null}
        </motion.div>

        <div className="mb-auto flex grow justify-end gap-8">
          <Button variant="outline" size="icon">
            <span className="sr-only">Copy Table</span>
            <GoCopy />
          </Button>

          {userProfile.userId === table.data.ownerId ? (
            <Button asChild variant="outline" size="icon">
              <PrefetchableLink
                to={`/t/${username}/${slug}/edit`}
                state={{ fromTable: true }}
              >
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
              {table.data.updatedAt.toLocaleDateString()}
            </dd>

            <dt className="border-b border-r px-10 py-8 font-semibold text-muted-foreground">
              Total&nbsp;versions
            </dt>
            <dd className="border-b border-r px-10 py-8">
              {table.data.totalVersionCount}
            </dd>
          </dl>

          <h3 className="mb-8 font-semibold">Latest definition</h3>

          <div className="rounded border bg-background">
            <pre className="max-h-384 overflow-auto px-16 py-12 text-xs leading-tight">
              {table.data.definition}
            </pre>
          </div>
        </section>

        <section>
          <h3 className="mb-8 font-semibold">Versions</h3>

          <ul className="divide-y rounded border bg-background">
            {table.data.recentVersions.map((version) => {
              return (
                <li key={version.id}>
                  <PrefetchableLink
                    to={`/t/${username}/${slug}/v/${version.version}`}
                    className="group flex items-center justify-between p-12 pl-16 transition-colors hover:bg-secondary focus:bg-secondary sm:p-16 sm:pl-20"
                  >
                    <div className="flex flex-col gap-4 pr-16">
                      <div className="flex items-center gap-6 text-base text-muted-foreground">
                        <strong className="text-xl text-accent-foreground">
                          v{version.version}
                        </strong>{" "}
                        published on{" "}
                        <span className="text-foreground">
                          {new Date(version.createdAt).toLocaleDateString()}
                        </span>
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
                              className="rounded bg-secondary p-3 px-6 text-xs leading-none text-accent-foreground transition-colors group-hover:bg-background group-focus:bg-background"
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

                    <Button
                      size="icon"
                      variant="ghost"
                      type="button"
                      tabIndex={-1}
                    >
                      <GoArrowRight />
                    </Button>
                  </PrefetchableLink>
                </li>
              );
            })}
          </ul>
        </section>
      </section>
    </FlexCol>
  );
}
