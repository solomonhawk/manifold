import { capitalize } from "@manifold/lib";
import { FullScreenLoader } from "@manifold/ui/components/full-screen-loader";
import { TableIdentifier } from "@manifold/ui/components/table-identifier";
import { Button } from "@manifold/ui/components/ui/button";
import { FlexCol } from "@manifold/ui/components/ui/flex";
import { Input, InputAdornment } from "@manifold/ui/components/ui/input";
import { Pagination } from "@manifold/ui/components/ui/pagination/pagination";
import { Separator } from "@manifold/ui/components/ui/separator";
import { usePaginationURLState } from "@manifold/ui/hooks/pagination/use-pagination-url-state";
import { formatRelative } from "date-fns";
import { useState } from "react";
import { GiMagnifyingGlass } from "react-icons/gi";
import { GoSearch } from "react-icons/go";
import { Link, useLoaderData, useSearchParams } from "react-router-dom";

import type { TableVersionsSearchBrowseLoaderData } from "~features/table-version/pages/search-browse/loader";
import { trpc } from "~utils/trpc";

export function TableVersionsSearchBrowse() {
  const [_, setSearchParams] = useSearchParams();
  const { orderBy, searchQuery, pagination } =
    useLoaderData() as TableVersionsSearchBrowseLoaderData;

  const [paginationState, paginator] = usePaginationURLState(pagination);

  const tableVersions = trpc.tableVersion.list.useQuery({
    orderBy,
    searchQuery,
    page: paginationState.page,
    perPage: paginationState.perPage,
  });

  if (tableVersions.isLoading) {
    // @TODO: better loading state
    return <FullScreenLoader />;
  }

  if (tableVersions.isError) {
    // @TODO: better error state
    return <div>Error: {tableVersions.error.message}</div>;
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();

    params.set("q", formData.get("q") as string);

    setSearchParams(params);
  }

  return (
    <FlexCol className="container max-w-screen-xl">
      <header className="my-12 flex flex-col gap-12 sm:my-16 md:mb-24 md:mt-36 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="flex items-center gap-10 text-2xl font-bold sm:text-3xl md:mb-8 md:text-4xl">
            Discover{" "}
            <GiMagnifyingGlass className="size-20 sm:size-24 md:size-28" />
          </h2>
          <p className="text-muted-foreground">
            Find the table you’ve been searching for:
          </p>
        </div>

        <div className="flex grow justify-end">
          <form
            onSubmit={handleSearch}
            className="grow transition-all md:max-w-256 md:focus-within:max-w-384"
          >
            <Input
              inputProps={{
                name: "q",
                placeholder: "Search tables",
                defaultValue: searchQuery,
              }}
              startAdornment={
                <InputAdornment>
                  <GoSearch />
                </InputAdornment>
              }
              endAdornment={
                <InputAdornment className="shrink-0">
                  <Button
                    type="submit"
                    size="sm"
                    variant="ghost"
                    className="mr-1"
                  >
                    Search
                  </Button>
                </InputAdornment>
              }
            />
          </form>
        </div>
      </header>

      <div className="my-12 sm:my-16">
        <Pagination.Root paginator={paginator} metadata={pagination}>
          <Pagination.RootLayout>
            <Pagination.Metadata />

            <Pagination.RightArea>
              <Pagination.PrevPageLink variant="outline" />
              <Pagination.NextPageLink variant="outline" />
            </Pagination.RightArea>
          </Pagination.RootLayout>
        </Pagination.Root>
      </div>

      <ul className="space-y-12 sm:space-y-16">
        {tableVersions.data.data.map((tableVersion) => {
          return (
            <li key={tableVersion.id}>
              <ListItem tableVersion={tableVersion} />
            </li>
          );
        })}
      </ul>

      <div className="mt-12 sm:mt-16">
        <Pagination.Root paginator={paginator} metadata={pagination}>
          <Pagination.RootLayout>
            <Pagination.RightArea>
              <Pagination.PrevPageLink variant="outline" />
              <Pagination.NextPageLink variant="outline" />
            </Pagination.RightArea>
          </Pagination.RootLayout>
        </Pagination.Root>
      </div>
    </FlexCol>
  );
}

function ListItem({
  tableVersion,
}: {
  tableVersion: {
    ownerUsername: string;
    tableSlug: string;
    title: string;
    tableIdentifier: string;
    updatedAt: Date;
    availableTables: string[];
  };
}) {
  const NOW = new Date();

  const [showAllTables, setShowAllTables] = useState(false);

  return (
    <section className="group relative flex flex-col justify-between rounded border bg-background transition-colors hover:bg-secondary sm:flex-row sm:gap-16 sm:p-16">
      <Link
        to={`/t/${tableVersion.ownerUsername}/${tableVersion.tableSlug}`}
        className="flex flex-col p-16 after:absolute after:inset-0 sm:p-0"
      >
        <h3 className="-mt-3 mb-4 text-xl font-bold leading-tight sm:mb-6 md:mb-8">
          {tableVersion.title}
        </h3>
        <span>
          <TableIdentifier
            className="text-sm transition-colors group-hover:bg-background"
            tableIdentifier={tableVersion.tableIdentifier}
          />
        </span>
      </Link>

      <Separator className="sm:hidden" orientation="horizontal" />

      <div className="flex shrink flex-col justify-center gap-8 p-16 sm:items-end sm:p-0">
        <div className="order-2 text-sm text-muted-foreground sm:order-1">
          Last updated:{" "}
          {capitalize(formatRelative(tableVersion.updatedAt, NOW))}
        </div>

        <div>
          <h4 className="mb-4 text-xs font-semibold text-muted-foreground sm:hidden">
            Tables:
          </h4>

          <button
            className="relative z-10 flex flex-wrap gap-4 bg-none sm:justify-end"
            type="button"
            disabled={tableVersion.availableTables.length <= 5}
            onClick={() => {
              setShowAllTables((v) => !v);
            }}
          >
            {(showAllTables
              ? tableVersion.availableTables
              : tableVersion.availableTables.slice(0, 5)
            ).map((tableId) => (
              <code
                key={tableId}
                className="rounded bg-secondary p-3 px-6 text-xs leading-none text-accent-foreground transition-colors group-hover:bg-background"
              >
                {tableId}
              </code>
            ))}

            {tableVersion.availableTables.length > 5 ? (
              <span className="text-xs text-foreground">
                {showAllTables
                  ? "Show fewer"
                  : `and ${tableVersion.availableTables.length - 5} more`}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </section>
  );
}
