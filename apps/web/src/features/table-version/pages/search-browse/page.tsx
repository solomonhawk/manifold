import { capitalize } from "@manifold/lib/utils/string";
import {
  AnimatedList,
  AnimatedListItem,
} from "@manifold/ui/components/animated-list";
import { Button } from "@manifold/ui/components/core/button";
import { FlexCol } from "@manifold/ui/components/core/flex";
import { Input, InputAdornment } from "@manifold/ui/components/core/input";
import { Pagination } from "@manifold/ui/components/core/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@manifold/ui/components/core/select";
import { Separator } from "@manifold/ui/components/core/separator";
import { TableIdentifier } from "@manifold/ui/components/table-identifier";
import { usePaginationURLState } from "@manifold/ui/hooks/pagination/use-pagination-url-state";
import { transitionAlpha } from "@manifold/ui/lib/animation";
import { tableListOrderByMapping } from "@manifold/validators";
import { formatRelative } from "date-fns";
import { LayoutGroup, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { GiMagnifyingGlass } from "react-icons/gi";
import { GoSearch, GoX } from "react-icons/go";
import { useLoaderData } from "react-router-dom";

import { PrefetchableLink } from "~features/routing/components/prefetchable-link";
import { useSearchParams } from "~features/routing/hooks/use-search-params";
import type { TableVersionsSearchBrowseLoaderData } from "~features/table-version/pages/search-browse/loader";
import { trpc } from "~utils/trpc";

export function TableVersionsSearchBrowse() {
  const [_, setSearchParams] = useSearchParams();
  const { orderBy, searchQuery, pagination } =
    useLoaderData() as TableVersionsSearchBrowseLoaderData;

  const [paginationState, paginator] = usePaginationURLState(pagination);

  const [tableVersions] = trpc.tableVersion.list.useSuspenseQuery({
    orderBy,
    searchQuery,
    page: paginationState.page,
    perPage: paginationState.perPage,
  });

  function handleSearch(value: string) {
    setSearchParams((params) => {
      const copy = new URLSearchParams(params);
      copy.set("q", value);
      copy.set("page", "1");
      return copy;
    });
  }

  function handleSort(value: string) {
    setSearchParams((params) => {
      const copy = new URLSearchParams(params);
      copy.set("sort", value);
      return copy;
    });
  }

  return (
    <FlexCol className="bg-architect overflow-auto bg-local">
      <div className="container max-w-screen-xl">
        <section className="pb-24 sm:pb-32">
          <header className="my-12 flex flex-col gap-12 sm:my-16 md:mb-24 md:mt-36 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="-mt-4 flex items-center gap-10 text-2xl font-bold sm:text-3xl md:mb-8 md:text-4xl">
                Discover{" "}
                <GiMagnifyingGlass className="size-20 sm:size-24 md:size-28" />
              </h2>

              <p className="text-muted-foreground">
                Search and browse for tables that suit your needs.
              </p>
            </div>

            <div className="flex grow justify-end gap-8">
              <SearchForm
                onSubmit={handleSearch}
                defaultSearchQuery={searchQuery}
              />

              <Select value={orderBy} onValueChange={handleSort}>
                <SelectTrigger className="max-w-176">
                  {tableListOrderByMapping[orderBy]}
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="recently_edited">
                    Recently Edited
                  </SelectItem>
                  <SelectItem value="recently_not_edited">
                    Recently Not Edited
                  </SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </header>

          <Pagination.Root paginator={paginator} metadata={pagination}>
            <Pagination.RootLayout className="my-12 sm:my-16">
              <Pagination.Metadata />

              <Pagination.RightArea>
                <Pagination.PrevPageLink variant="outline" />
                <Pagination.NextPageLink variant="outline" />
              </Pagination.RightArea>
            </Pagination.RootLayout>
          </Pagination.Root>

          <LayoutGroup>
            <AnimatedList
              className="relative"
              transition={transitionAlpha}
              initial
            >
              {tableVersions.data.length === 0 ? (
                <AnimatedListItem
                  key="empty"
                  transition={transitionAlpha}
                  initial={{ opacity: 0 }}
                >
                  <div className="flex flex-col items-center gap-8 rounded bg-background p-16 text-center">
                    <h3 className="text-lg font-bold sm:text-xl">
                      No tables found for{" "}
                      <span className="text-accent-foreground">
                        “{searchQuery}”
                      </span>
                    </h3>
                    <p className="text-muted-foreground">
                      Try searching for something else.
                    </p>
                  </div>
                </AnimatedListItem>
              ) : null}

              {tableVersions.data.map((tableVersion) => {
                return (
                  <AnimatedListItem
                    key={tableVersion.id}
                    transition={transitionAlpha}
                    initial={{ opacity: 0, y: 8 }}
                    className="mb-12 sm:mb-16"
                  >
                    <ListItem tableVersion={tableVersion} />
                  </AnimatedListItem>
                );
              })}
            </AnimatedList>

            {tableVersions.data.length > 0 ? (
              <motion.div layout transition={transitionAlpha}>
                <Pagination.Root paginator={paginator} metadata={pagination}>
                  <Pagination.RootLayout>
                    <Pagination.RightArea>
                      <Pagination.PrevPageLink variant="outline" />
                      <Pagination.NextPageLink variant="outline" />
                    </Pagination.RightArea>
                  </Pagination.RootLayout>
                </Pagination.Root>
              </motion.div>
            ) : null}
          </LayoutGroup>
        </section>
      </div>
    </FlexCol>
  );
}

function SearchForm({
  onSubmit,
  defaultSearchQuery,
}: {
  onSubmit: (value: string) => void;
  defaultSearchQuery: string | undefined;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultSearchQuery ?? "");

  /**
   * If something causes the default search query to change, update the input
   * to stay in sync (e.g. when the URL changes externally).
   */
  useEffect(() => {
    setValue(defaultSearchQuery ?? "");
  }, [defaultSearchQuery]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    onSubmit(formData.get("q") as string);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grow transition-all md:max-w-256 md:focus-within:max-w-384"
    >
      <Input
        ref={inputRef}
        inputProps={{
          name: "q",
          placeholder: "Search tables",
          value,
          onChange: (e) => setValue(e.target.value),
          className: "focus:bg-background",
        }}
        startAdornment={
          <InputAdornment>
            <GoSearch />
          </InputAdornment>
        }
        endAdornment={
          <InputAdornment className="shrink-0">
            {value && (
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                onClick={(e) => {
                  e.preventDefault();

                  setValue("");
                  onSubmit("");

                  inputRef.current?.focus();
                }}
              >
                <GoX />
              </Button>
            )}

            <Button
              type="submit"
              size="sm"
              variant="ghost"
              className="mr-1"
              disabled={value === defaultSearchQuery}
            >
              Search
            </Button>
          </InputAdornment>
        }
      />
    </form>
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
    createdAt: Date;
    updatedAt: Date;
    availableTables: string[];
    table: {
      title: string;
      description: string | null;
    };
  };
}) {
  const NOW = new Date();

  const [showAllTables, setShowAllTables] = useState(false);

  return (
    <section className="group relative flex flex-col justify-between rounded border bg-background ring-0 ring-transparent ring-offset-2 ring-offset-background transition-all focus-within:bg-secondary focus-within:ring-2 focus-within:ring-ring hover:bg-secondary sm:flex-row sm:gap-16 sm:p-16">
      <PrefetchableLink
        to={`/t/${tableVersion.ownerUsername}/${tableVersion.tableSlug}`}
        className="flex flex-col space-y-4 p-16 after:absolute after:inset-0 focus:outline-none sm:space-y-6 sm:p-0 md:space-y-8"
      >
        <h3 className="-mt-3 text-xl font-bold leading-tight">
          {tableVersion.table.title}
        </h3>

        <span>
          <TableIdentifier
            className="text-sm transition-colors group-focus-within:bg-background group-hover:bg-background"
            tableIdentifier={tableVersion.tableIdentifier}
          />
        </span>

        {tableVersion.table.description ? (
          <p className="text-sm text-muted-foreground">
            {tableVersion.table.description}
          </p>
        ) : null}
      </PrefetchableLink>

      <Separator
        className="group-hover:bg-background/50 sm:hidden"
        orientation="horizontal"
      />

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
            className="relative z-10 flex flex-wrap gap-4 rounded-sm bg-none ring-0 ring-offset-0 ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:justify-end"
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
                className="rounded bg-secondary p-3 px-6 text-xs leading-none text-accent-foreground transition-colors group-focus-within:bg-background group-hover:bg-background"
              >
                {tableId}
              </code>
            ))}

            {tableVersion.availableTables.length > 5 ? (
              <span className="text-xs text-foreground">
                {showAllTables
                  ? "show fewer"
                  : `and ${tableVersion.availableTables.length - 5} more`}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </section>
  );
}
