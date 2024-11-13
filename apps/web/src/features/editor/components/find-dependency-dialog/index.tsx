import { useModal } from "@ebay/nice-modal-react";
import { pluralize } from "@manifold/lib";
import type { RouterOutput } from "@manifold/router";
import { LoadingIndicator } from "@manifold/ui/components/loading-indicator";
import { TableIdentifier } from "@manifold/ui/components/table-identifier";
import { Button } from "@manifold/ui/components/ui/button";
import { CommandShortcut } from "@manifold/ui/components/ui/command";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@manifold/ui/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormSubmitButton,
} from "@manifold/ui/components/ui/form";
import { Input, InputAdornment } from "@manifold/ui/components/ui/input";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from "@manifold/ui/components/ui/tooltip";
import { useReturnFocus } from "@manifold/ui/hooks/use-return-focus";
import { useZodForm } from "@manifold/ui/hooks/use-zod-form";
import { cn } from "@manifold/ui/lib/utils";
import {
  type TableFindDependenciesInput,
  tableFindDependenciesInput,
} from "@manifold/validators";
import { useAtomValue } from "jotai";
import { type MouseEvent, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { GoEye, GoPackageDependencies, GoPlus } from "react-icons/go";

import { DialogManager, DIALOGS } from "~features/dialog-manager";
import { currentAllResolvedDependenciesAtom } from "~features/editor/components/editor/state";
import { useFindDependencies } from "~features/table/api/find-dependencies";

type Props = {
  tableIdentifier: string;
  onAddDependency: (
    dependency: RouterOutput["table"]["findDependencies"][number],
  ) => void;
};

type FormData = TableFindDependenciesInput;

export function FindDependencyDialog({
  tableIdentifier,
  onAddDependency,
}: Props) {
  const modal = useModal();
  const returnFocus = useReturnFocus(modal.visible);
  const [searchQuery, setSearchQuery] = useState("");
  const findDependenciesQuery = useFindDependencies({
    tableIdentifier,
    searchQuery,
  });
  const currentAllResolvedDependencies = useAtomValue(
    currentAllResolvedDependenciesAtom,
  );
  const isPending = findDependenciesQuery.isFetching;

  const form = useZodForm({
    schema: tableFindDependenciesInput,
    defaultValues: {
      searchQuery: "",
    },
  });

  const handleSubmit: SubmitHandler<FormData> = (data) => {
    setSearchQuery(data.searchQuery);
  };

  return (
    <Dialog
      open={modal.visible}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          modal.hide();
          returnFocus();
        }
      }}
    >
      <DialogContent
        className="gap-24"
        onAnimationEnd={() => {
          if (!modal.visible) {
            modal.remove();
          }
        }}
        onEscapeKeyDown={(e) => {
          e.stopPropagation();
          modal.hide();
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-8">
            <GoPackageDependencies />
            Find a dependency
          </DialogTitle>

          <DialogDescription className="sr-only">
            Enter a search term to find dependencies. The text you enter will be
            checked against table titles, slugs, and the tables they contain.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="searchQuery"
              render={({ field }) => (
                <FormItem className="mb-6">
                  <FormLabel isRequired>Search Query</FormLabel>

                  <FormControl>
                    <Input
                      inputProps={{
                        ...field,
                        placeholder: "Search for a table by name or keyword",
                      }}
                      endAdornment={
                        <InputAdornment>
                          <LoadingIndicator
                            size="sm"
                            className={cn("opacity-0 transition-opacity", {
                              "opacity-100": isPending,
                            })}
                          />
                        </InputAdornment>
                      }
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {findDependenciesQuery.isSuccess ? (
              <div
                className={cn("space-y-8 transition-opacity", {
                  "opacity-50": findDependenciesQuery.isFetching,
                })}
              >
                <span className="text-sm text-muted-foreground">
                  {findDependenciesQuery.data?.length}{" "}
                  {pluralize("result", findDependenciesQuery.data.length)} for{" "}
                  <span className="text-foreground">“{searchQuery}”</span>
                </span>

                <ul className="max-h-396 space-y-4 overflow-auto">
                  {findDependenciesQuery.data?.map((version) => (
                    <li
                      key={version.id}
                      className="group flex items-center justify-between rounded border p-4 pl-8"
                    >
                      <div className="flex items-center gap-6 text-sm">
                        <TableIdentifier
                          tableIdentifier={version.tableIdentifier}
                        />
                        <CommandShortcut>v{version.version}</CommandShortcut>
                      </div>

                      <div className="flex shrink-0 gap-6">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              type="button"
                              className="text-muted-foreground group-hover:text-foreground"
                              onClick={() =>
                                DialogManager.show(
                                  DIALOGS.PREVIEW_DEPENDENCY.ID,
                                  {
                                    dependency: version,
                                    onAddDependency: () =>
                                      onAddDependency(version),
                                    canAddDependency:
                                      !currentAllResolvedDependencies.find(
                                        (d) =>
                                          d.tableIdentifier ===
                                          version.tableIdentifier,
                                      ),
                                  },
                                )
                              }
                            >
                              <span className="sr-only">View details</span>
                              <GoEye />
                            </Button>
                          </TooltipTrigger>

                          <TooltipContent>
                            Preview table
                            <TooltipArrow />
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              type="button"
                              className="text-muted-foreground group-hover:text-foreground"
                              onClick={(e: MouseEvent) => {
                                e.preventDefault();
                                onAddDependency(version);
                              }}
                              disabled={
                                !!currentAllResolvedDependencies.find(
                                  (d) =>
                                    d.tableIdentifier ===
                                    version.tableIdentifier,
                                )
                              }
                            >
                              <span className="sr-only">Add dependency</span>
                              <GoPlus />
                            </Button>
                          </TooltipTrigger>

                          <TooltipContent>
                            Add dependency
                            <TooltipArrow />
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <DialogFooter className="mt-24">
              <DialogClose asChild>
                <Button variant="outline">Done</Button>
              </DialogClose>

              <FormSubmitButton minDuration={0} isPending={isPending}>
                Find Dependency
              </FormSubmitButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
