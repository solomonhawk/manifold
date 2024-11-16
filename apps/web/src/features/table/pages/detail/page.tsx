import { buildTableIdentifier } from "@manifold/lib";
import { ClipboardCopy } from "@manifold/ui/components/clipboard-copy";
import { FullScreenLoader } from "@manifold/ui/components/full-screen-loader";
import { TableIdentifier } from "@manifold/ui/components/table-identifier";
import { Badge } from "@manifold/ui/components/ui/badge";
import { Button } from "@manifold/ui/components/ui/button";
import { FlexCol } from "@manifold/ui/components/ui/flex";
import {
  Notice,
  NoticeContent,
  NoticeIcon,
} from "@manifold/ui/components/ui/notice";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from "@manifold/ui/components/ui/tooltip";
import { transitionAlpha } from "@manifold/ui/lib/animation";
import { motion } from "framer-motion";
import {
  GoArrowRight,
  GoCheck,
  GoCopy,
  GoInfo,
  GoPackage,
  GoPencil,
} from "react-icons/go";

import { DialogManager, DIALOGS } from "~features/dialog-manager";
import { useRequiredUserProfile } from "~features/onboarding/hooks/use-required-user-profile";
import { PrefetchableLink } from "~features/routing/components/prefetchable-link";
import { useRouteParams } from "~features/routing/hooks/use-route-params";
import { useGetTable } from "~features/table/api/get";
import { tableDetailParams } from "~features/table/pages/detail/params";

const COLLAPSED_AVAILABLE_TABLES_COUNT = 3;

export function TableDetail() {
  const userProfile = useRequiredUserProfile();
  const { username, slug } = useRouteParams(tableDetailParams);
  const tableQuery = useGetTable({
    tableIdentifier: buildTableIdentifier(username, slug),
  });

  if (tableQuery.isLoading) {
    // @TODO: better loading state
    return <FullScreenLoader />;
  }

  if (tableQuery.isError) {
    // @TODO: better error state
    return <div>Error: {tableQuery.error.message}</div>;
  }

  return (
    <FlexCol className="container max-w-screen-xl">
      <header className="my-12 flex gap-12 sm:my-16 md:mb-24 md:mt-36 md:items-center md:justify-between">
        <motion.div
          layout="position"
          layoutId={`table-title-header-${tableQuery.data.id}`}
          transition={transitionAlpha}
        >
          <h2 className="-mt-4 flex items-center gap-10 text-2xl font-bold sm:text-3xl md:mb-8 md:text-4xl">
            {tableQuery.data.title}

            <motion.span
              layout
              layoutId={`table-title-header-${tableQuery.data.id}-icon`}
              transition={transitionAlpha}
            >
              <GoPackage className="size-20 sm:size-24 md:size-28" />
            </motion.span>
          </h2>

          <div className="flex items-center gap-8">
            <ClipboardCopy>
              {({ copied, onCopy }) => {
                return (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="flex items-center gap-4"
                        disabled={copied}
                        onClick={() => {
                          onCopy(tableQuery.data.tableIdentifier);
                        }}
                      >
                        <span className="sr-only">Copy Table Identifier</span>

                        <TableIdentifier
                          className="text-xs sm:text-base"
                          tableIdentifier={tableQuery.data.tableIdentifier}
                        />

                        {copied ? <GoCheck /> : <GoCopy />}
                      </button>
                    </TooltipTrigger>

                    <TooltipContent>
                      Copy table identifier
                      <TooltipArrow />
                    </TooltipContent>
                  </Tooltip>
                );
              }}
            </ClipboardCopy>

            {tableQuery.data.totalVersionCount === 0 ? (
              <Badge>Unpublished</Badge>
            ) : null}
          </div>

          {tableQuery.data.description ? (
            <p className="mt-12 text-muted-foreground">
              {tableQuery.data.description}
            </p>
          ) : null}
        </motion.div>

        <div className="mb-auto flex grow justify-end gap-8">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  DialogManager.show(DIALOGS.COPY_TABLE.ID, {
                    table: tableQuery.data,
                  });
                }}
              >
                <span className="sr-only">Copy Table</span>
                <GoCopy />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Copy table
              <TooltipArrow />
            </TooltipContent>
          </Tooltip>

          {userProfile.userId === tableQuery.data.ownerId ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild variant="outline" size="icon">
                  <PrefetchableLink to={`/t/${username}/${slug}/edit`}>
                    <span className="sr-only">Edit Table</span>
                    <GoPencil />
                  </PrefetchableLink>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Edit table
                <TooltipArrow />
              </TooltipContent>
            </Tooltip>
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
              {tableQuery.data.updatedAt.toLocaleDateString()}
            </dd>

            <dt className="border-b border-r px-10 py-8 font-semibold text-muted-foreground">
              Total&nbsp;versions
            </dt>
            <dd className="border-b border-r px-10 py-8">
              {tableQuery.data.totalVersionCount}
            </dd>

            <dt className="border-b border-r px-10 py-8 font-semibold text-muted-foreground">
              Available&nbsp;Tables
            </dt>
            <dd className="flex flex-wrap gap-4 border-b border-r px-10 py-8">
              {tableQuery.data.availableTables.map((tableId) => (
                <code
                  key={tableId}
                  className="rounded bg-secondary p-3 px-6 text-xs leading-none text-accent-foreground"
                >
                  {tableId}
                </code>
              ))}
            </dd>

            <dt className="border-b border-r px-10 py-8 font-semibold text-muted-foreground">
              Dependencies
            </dt>
            <dd className="flex flex-wrap gap-4 border-b border-r px-10 py-8">
              {tableQuery.data.dependencies.length > 0 ? (
                tableQuery.data.dependencies.map((dependency) => {
                  return (
                    <PrefetchableLink
                      key={dependency.id}
                      to={{
                        pathname: `/t/${dependency.ownerUsername}/${dependency.tableSlug}/v/${dependency.version}`,
                      }}
                      className="inline-flex"
                    >
                      <code className="rounded bg-secondary p-3 px-6 text-xs leading-none text-accent-foreground transition-colors group-hover:bg-background group-focus:bg-background">
                        {dependency.tableIdentifier}
                      </code>
                    </PrefetchableLink>
                  );
                })
              ) : (
                <em className="text-muted-foreground">No dependencies</em>
              )}
            </dd>
          </dl>

          <h3 className="mb-8 font-semibold">Latest definition</h3>

          <div className="rounded border bg-background">
            <pre className="max-h-384 overflow-auto px-16 py-12 text-xs leading-tight">
              {tableQuery.data.definition}
            </pre>
          </div>
        </section>

        <section>
          <h3 className="mb-8 font-semibold">Versions</h3>

          {tableQuery.data.recentVersions.length === 0 ? (
            <Notice>
              <NoticeIcon>
                <GoInfo className="size-16" />
              </NoticeIcon>

              <NoticeContent>
                This table has no versions yet.{" "}
                {userProfile.userId === tableQuery.data.ownerId
                  ? "When you publish a new version of this table, it will appear here."
                  : null}
              </NoticeContent>
            </Notice>
          ) : (
            <ul className="divide-y rounded border bg-background">
              {tableQuery.data.recentVersions.map((version) => {
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
          )}
        </section>
      </section>
    </FlexCol>
  );
}
