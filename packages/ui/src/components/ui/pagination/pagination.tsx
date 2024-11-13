import { DEFAULT_PER_PAGE_OPTIONS } from "@manifold/lib/models/pagination";
import { memo, useRef } from "react";
import { GoChevronLeft, GoChevronRight } from "react-icons/go";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import { Button, type ButtonProps } from "#components/ui/button.js";
import { FormControl, FormLabel } from "#components/ui/form.js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "#components/ui/select.js";
import {
  isUrlPaginator,
  usePaginationController,
} from "#hooks/pagination/index.ts";
import { cn } from "#lib/utils.ts";

import { PaginationCtx, usePaginationContext } from "./context";
import type { PaginationProps } from "./types";

export const Root = memo(
  ({ metadata, paginator, children }: PaginationProps) => {
    const controller = usePaginationController(metadata, paginator);

    return (
      <PaginationCtx.Provider value={{ controller, paginator }}>
        {children}
      </PaginationCtx.Provider>
    );
  },
);

type RootProps = React.HTMLAttributes<HTMLDivElement>;

export function RootLayout({ className, ...props }: RootProps) {
  return (
    <div
      className={cn("flex items-center justify-between", className)}
      {...props}
    />
  );
}

export function Metadata() {
  const {
    controller: { model },
  } = usePaginationContext();

  if (model.totalItems <= 0) {
    return null;
  }

  return (
    <p className="text-sm">
      Viewing {model.currentPageStart()} - {model.currentPageEnd()} of{" "}
      {model.totalItems} results
    </p>
  );
}

export function RightArea({ children }: { children: React.ReactNode }) {
  return <div className="ml-auto flex gap-8">{children}</div>;
}

export type PerPageSelectProps = { perPageOptions?: readonly number[] };

export function PerPageSelect({
  perPageOptions = DEFAULT_PER_PAGE_OPTIONS,
}: PerPageSelectProps) {
  const { controller } = usePaginationContext();
  const uuid = useRef(uuidv4());
  const id = `perPage-${uuid}`;

  return (
    <FormControl className="flex items-center gap-8">
      <FormLabel htmlFor={id} className="m-0 text-sm">
        Results per page:
      </FormLabel>

      <Select
        value={String(controller.model.perPage)}
        onValueChange={(v) => controller.setPerPage(Number.parseInt(v, 10))}
      >
        <SelectTrigger className="min-w-192" id={id}>
          {controller.model.perPage}
        </SelectTrigger>

        <SelectContent>
          {perPageOptions.map((option) => (
            <SelectItem key={option} value={String(option)}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormControl>
  );
}

export function PrevPageButton({ children }: { children?: React.ReactNode }) {
  const { controller } = usePaginationContext();

  return (
    <Button
      onClick={controller.onPrev}
      disabled={!controller.hasPrevPage()}
      className="flex gap-8"
    >
      {children || (
        <>
          <GoChevronLeft /> Previous Page
        </>
      )}
    </Button>
  );
}

export function NextPageButton({ children }: { children?: React.ReactNode }) {
  const { controller } = usePaginationContext();

  return (
    <Button
      onClick={controller.onNext}
      disabled={!controller.hasNextPage()}
      className="flex gap-8"
    >
      {children || (
        <>
          Next Page <GoChevronRight />
        </>
      )}
    </Button>
  );
}

export function PrevPageLink({
  children,
  className,
  ...props
}: { children?: React.ReactNode } & ButtonProps) {
  const { controller, paginator } = usePaginationContext();
  const disabled = !controller.hasPrevPage();

  if (!isUrlPaginator(paginator)) {
    throw new Error("PrevPageLink can only be used with URLPaginator");
  }

  return (
    <Button asChild={!disabled} {...props} disabled={disabled}>
      <Link
        className={cn("flex items-center gap-8 transition-colors", className)}
        to={{
          search: paginator.getSearchParams(controller.prevPage()).toString(),
        }}
      >
        {children || (
          <>
            <GoChevronLeft /> Previous Page
          </>
        )}
      </Link>
    </Button>
  );
}

export function NextPageLink({
  children,
  className,
  ...props
}: { children?: React.ReactNode } & ButtonProps) {
  const { controller, paginator } = usePaginationContext();
  const disabled = !controller.hasNextPage();

  if (!isUrlPaginator(paginator)) {
    throw new Error("PrevPageLink can only be used with URLPaginator");
  }

  return (
    <Button asChild={!disabled} {...props} disabled={disabled}>
      <Link
        className={cn("flex items-center gap-8 transition-colors", className)}
        to={{
          search: paginator.getSearchParams(controller.nextPage()).toString(),
        }}
      >
        {children || (
          <>
            Next Page <GoChevronRight />
          </>
        )}
      </Link>
    </Button>
  );
}

export const Pagination = {
  Root,
  RootLayout,
  Metadata,
  RightArea,
  PerPageSelect,
  PrevPageButton,
  NextPageButton,
  PrevPageLink,
  NextPageLink,
};
