import { injectNamespacePragmasWorkaround } from "@manifold/lib/utils/engine";
import { buildTableIdentifier } from "@manifold/lib/utils/table-identifier";
import { ClipboardCopy } from "@manifold/ui/components/clipboard-copy";
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
import { motion } from "motion/react";
import {
  GoArrowRight,
  GoCheck,
  GoCopy,
  GoInfo,
  GoPackage,
  GoPencil,
} from "react-icons/go";

import { useAuth } from "~features/auth/hooks/use-auth";
import { DialogManager, DIALOGS } from "~features/dialog-manager";
import RollPreview from "~features/engine/components/roll-preview";
import { PrefetchableLink } from "~features/routing/components/prefetchable-link";
import { useRouteParams } from "~features/routing/hooks/use-route-params";
import { useGetTable } from "~features/table/api/get";
import { tableDetailParams } from "~features/table/pages/detail/params";

const COLLAPSED_AVAILABLE_TABLES_COUNT = 3;

export function TableDetail() {
  const session = useAuth();
  const { username, slug } = useRouteParams(tableDetailParams);
  const [table] = useGetTable({
    tableIdentifier: buildTableIdentifier(username, slug),
  });

  return (
    <FlexCol className="bg-architect overflow-auto bg-local">
      <div className="container max-w-screen-xl">
        <header className="my-12 flex flex-col gap-12 sm:my-16 md:mb-24 md:mt-36 md:flex-row md:items-center md:justify-between">
          <motion.div
            layout="position"
            layoutId={`table-title-header-${table.id}`}
            transition={transitionAlpha}
          >
            <h2 className="-mt-4 flex items-center gap-10 text-2xl font-bold sm:text-3xl md:mb-8 md:text-4xl">
              {table.title}

              <motion.span
                layout
                layoutId={`table-title-header-${table.id}-icon`}
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
                            onCopy(table.tableIdentifier);
                          }}
                        >
                          <span className="sr-only">Copy Table Identifier</span>

                          <TableIdentifier
                            className="text-xs sm:text-base"
                            tableIdentifier={table.tableIdentifier}
                          />

                          {copied ? <GoCheck /> : <GoCopy />}
                        </button>
                      </TooltipTrigger>

                      <TooltipContent side="right">
                        Copy table identifier
                        <TooltipArrow />
                      </TooltipContent>
                    </Tooltip>
                  );
                }}
              </ClipboardCopy>

              {table.totalVersionCount === 0 ? (
                <Badge>Unpublished</Badge>
              ) : null}
            </div>

            {table.description ? (
              <p className="mt-12 text-muted-foreground">{table.description}</p>
            ) : null}
          </motion.div>

          <div className="mb-auto flex grow justify-end gap-8">
            {session.status === "authenticated" ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    {...DialogManager.dialogButtonProps(DIALOGS.COPY_TABLE.ID, {
                      table: table,
                    })}
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
            ) : null}

            {session.data?.user.id === table.ownerId ? (
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
                {table.updatedAt.toLocaleDateString()}
              </dd>

              <dt className="border-b border-r px-10 py-8 font-semibold text-muted-foreground">
                Total&nbsp;versions
              </dt>
              <dd className="border-b border-r px-10 py-8">
                {table.totalVersionCount}
              </dd>

              <dt className="border-b border-r px-10 py-8 font-semibold text-muted-foreground">
                Available&nbsp;Tables
              </dt>
              <dd className="flex flex-wrap gap-4 border-b border-r px-10 py-8">
                {table.availableTables.map((tableId) => (
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
                {table.dependencies.length > 0 ? (
                  table.dependencies.map((dependency) => {
                    return (
                      <PrefetchableLink
                        key={dependency.id}
                        to={`/t/${dependency.ownerUsername}/${dependency.tableSlug}/v/${dependency.version}`}
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
              <pre className="max-h-384 overflow-auto whitespace-pre-wrap px-16 py-12 text-xs leading-tight">
                {table.definition}
              </pre>
            </div>
          </section>

          <section>
            <h3 className="mb-8 font-semibold">Try it out:</h3>

            <RollPreview
              definition={injectNamespacePragmasWorkaround(
                table.definition.trim(),
                table.dependencies,
              )}
            />

            <h3 className="mb-8 font-semibold">Versions</h3>

            {table.recentVersions.length === 0 ? (
              <Notice>
                <NoticeIcon>
                  <GoInfo className="size-16" />
                </NoticeIcon>

                <NoticeContent>
                  This table has no versions yet.{" "}
                  {session.data?.user.id === table.ownerId
                    ? "When you publish a new version of this table, it will appear here."
                    : null}
                </NoticeContent>
              </Notice>
            ) : (
              <div className="flex flex-col gap-16">
                <motion.ul
                  layout
                  layoutId={`table-versions-list-${table.id}`}
                  className="divide-y rounded border bg-background"
                  transition={transitionAlpha}
                >
                  {table.recentVersions.map((version) => {
                    return (
                      <li key={version.id}>
                        <PrefetchableLink
                          to={`/t/${username}/${slug}/v/${version.version}`}
                          className="group/link flex items-center justify-between p-12 pl-16 transition-colors hover:bg-secondary focus:bg-secondary sm:p-16 sm:pl-20"
                        >
                          <div className="flex flex-col gap-4 pr-16">
                            <div className="flex items-center gap-6 text-base text-muted-foreground">
                              <strong className="text-xl text-accent-foreground">
                                v{version.version}
                              </strong>{" "}
                              published on{" "}
                              <span className="text-foreground">
                                {new Date(
                                  version.createdAt,
                                ).toLocaleDateString()}
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
                                    className="rounded bg-secondary p-3 px-6 text-xs leading-none text-accent-foreground transition-colors group-hover/link:bg-background group-focus/link:bg-background"
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
                </motion.ul>
              </div>
            )}
          </section>
        </section>
      </div>
    </FlexCol>
  );
}
