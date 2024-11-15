import { buildTableIdentifier } from "@manifold/lib";
import { FullScreenLoader } from "@manifold/ui/components/full-screen-loader";
import { Badge } from "@manifold/ui/components/ui/badge";
import { Button } from "@manifold/ui/components/ui/button";
import { transitionAlpha } from "@manifold/ui/lib/animation";
import { cn } from "@manifold/ui/lib/utils";
import { motion } from "framer-motion";
import { GoArrowRight } from "react-icons/go";

import { PrefetchableLink } from "~features/routing/components/prefetchable-link";
import { useRouteParams } from "~features/routing/hooks/use-route-params";
import { tableVersionDetailParams } from "~features/table-version/pages/detail/params";
import { trpc } from "~utils/trpc";

const COLLAPSED_AVAILABLE_TABLES_COUNT = 3;

export function TableVersionDetail() {
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
    <section className="grid grid-cols-1 gap-12 pb-24 sm:gap-16 md:grid-cols-2 md:pb-36">
      <section>
        <h3 className="mb-8 font-semibold">Table details</h3>

        <dl className="mb-16 grid grid-cols-[min-content,_1fr] border-l border-t bg-background text-sm">
          <dt className="border-b border-r px-10 py-8 font-semibold text-muted-foreground">
            Published
          </dt>
          <dd className="border-b border-r px-10 py-8">
            {tableVersion.data.createdAt.toLocaleDateString()}
          </dd>

          {tableVersion.data.versions.length > 0 ? (
            <>
              <dt className="border-b border-r px-10 py-8 font-semibold text-muted-foreground">
                Release&nbsp;notes
              </dt>
              <dd className="border-b border-r px-10 py-8">
                {tableVersion.data.releaseNotes || (
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
        <h3 className="mb-8 font-semibold">Versions</h3>

        <ul className="divide-y overflow-hidden rounded border bg-background">
          {tableVersion.data.versions.map((version, i) => {
            const isCurrentVersion =
              version.version === tableVersion.data.version;
            const LinkComponent = isCurrentVersion ? "span" : PrefetchableLink;

            return (
              <li key={version.id}>
                <LinkComponent
                  to={{
                    pathname: `/t/${username}/${slug}/v/${version.version}`,
                  }}
                  state={{ previousVersion: tableVersion.data.version }}
                  className={cn("group relative flex transition-colors", {
                    "border-accent-foreground": isCurrentVersion,
                    "hover:bg-secondary focus:bg-secondary": !isCurrentVersion,
                  })}
                >
                  {isCurrentVersion ? (
                    <motion.div
                      layout
                      layoutId="table-version-current-indicator"
                      className="absolute inset-y-0 left-0 w-4 bg-accent-foreground"
                      transition={transitionAlpha}
                    />
                  ) : null}

                  <div className="flex grow items-center justify-between p-12 pl-16 sm:p-16 sm:pl-20">
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
                          <Badge variant="accent">Current</Badge>
                        ) : null}
                        {i === 0 ? <Badge>Latest</Badge> : null}
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
                              className={cn(
                                "rounded bg-secondary p-3 px-6 text-xs leading-none text-accent-foreground",
                                {
                                  "group-hover:bg-background group-focus:bg-background":
                                    !isCurrentVersion,
                                },
                              )}
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
                  </div>
                </LinkComponent>
              </li>
            );
          })}
        </ul>
      </section>
    </section>
  );
}
