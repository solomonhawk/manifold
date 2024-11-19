import { isEmpty } from "@manifold/lib/utils/object";
import { capitalize } from "@manifold/lib/utils/string";
import type { RouterOutput } from "@manifold/router";
import { Button } from "@manifold/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItemNaked,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@manifold/ui/components/ui/dropdown-menu";
import {
  FormSubmitButton,
  FormSubmitStatus,
} from "@manifold/ui/components/ui/form";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from "@manifold/ui/components/ui/tooltip";
import { transitionAlpha } from "@manifold/ui/lib/animation";
import { formatRelative } from "date-fns";
import { useAtomValue } from "jotai";
import { motion } from "motion/react";
import { useFormContext, useWatch } from "react-hook-form";
import { GoArrowLeft, GoEye, GoGear } from "react-icons/go";

import {
  currentTableDependenciesAtom,
  editorStatusAtom,
} from "~features/engine/components/editor/state";
import { PrefetchableLink } from "~features/routing/components/prefetchable-link";
import { useResolveDependencies } from "~features/table/api/resolve-dependencies";
import type { FormData } from "~features/table/components/table-update-form";
import { DeleteButton } from "~features/table/components/table-update-form/delete-button";
import { DownloadButton } from "~features/table/components/table-update-form/download-button";
import { EditButton } from "~features/table/components/table-update-form/edit-button";
import { FavoriteButton } from "~features/table/components/table-update-form/favorite-button";
import {
  PublishButton,
  type PublishButtonProps,
} from "~features/table/components/table-update-form/publish-button";
import { RestoreButton } from "~features/table/components/table-update-form/restore-button";
import { ViewDependenciesButton } from "~features/table/components/table-update-form/view-dependencies-button";

export const TABLE_UPDATE_HEADER_PORTAL_ID = "table-update-header-portal";
export const TABLE_UPDATE_HEADER_DROPDOWN_PORTAL_ID =
  "table-update-header-dropdown-portal";

export function Header({ table }: { table: RouterOutput["table"]["get"] }) {
  const NOW = new Date();

  return (
    <header className="flex items-center justify-between">
      <motion.div
        className="flex items-center gap-12"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={transitionAlpha}
      >
        <Button asChild size="icon" variant="ghost">
          <PrefetchableLink to="/dashboard">
            <span className="sr-only">Go back to dashboard</span>
            <GoArrowLeft />
          </PrefetchableLink>
        </Button>

        <div className="flex flex-col justify-center">
          <h2 className="text-lg font-bold leading-tight">{table.title}</h2>

          {table.deletedAt ? (
            <span className="text-xs text-destructive">
              Deleted {formatRelative(new Date(table.deletedAt), NOW)}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/80">
              {capitalize(formatRelative(new Date(table.updatedAt), NOW))}
            </span>
          )}
        </div>
      </motion.div>

      <div className="flex items-center gap-8">
        {table.deletedAt ? (
          <RestoreButton
            title={table.title}
            tableId={table.id}
            tableIdentifier={table.tableIdentifier}
          />
        ) : (
          <>
            <FormSubmitStatus className="mr-8 text-xs text-muted-foreground/80" />

            <FormPrimaryActionButton />

            <FormPublishButton
              tableId={table.id}
              tableSlug={table.slug}
              tableIdentifier={table.tableIdentifier}
              recentVersions={table.recentVersions}
              totalVersionCount={table.totalVersionCount}
            />

            {table.dependencies.length > 0 ? (
              <ViewDependenciesButton
                tableTitle={table.title}
                tableIdentifier={table.tableIdentifier}
                dependencies={table.dependencies}
              />
            ) : null}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild size="icon" variant="outline">
                  <PrefetchableLink
                    to={`/t/${table.ownerUsername}/${table.slug}`}
                  >
                    <span className="sr-only">View public table page</span>
                    <GoEye />
                  </PrefetchableLink>
                </Button>
              </TooltipTrigger>

              <TooltipContent>
                View public table page
                <TooltipArrow />
              </TooltipContent>
            </Tooltip>

            <FavoriteButton
              tableId={table.id}
              tableIdentifier={table.tableIdentifier}
              isFavorite={table.favorited ?? false}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <GoGear />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="flex flex-col">
                <DropdownMenuItemNaked asChild>
                  <EditButton
                    tableId={table.id}
                    tableIdentifier={table.tableIdentifier}
                    title={table.title}
                    description={table.description}
                  />
                </DropdownMenuItemNaked>

                <DropdownMenuItemNaked asChild>
                  <DownloadButton tableId={table.id} />
                </DropdownMenuItemNaked>

                <DropdownMenuSeparator />

                <DropdownMenuItemNaked asChild>
                  <DeleteButton
                    title={table.title}
                    tableId={table.id}
                    tableIdentifier={table.tableIdentifier}
                  />
                </DropdownMenuItemNaked>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </header>
  );
}

function FormPrimaryActionButton() {
  // @TODO: naughty cross-feature dependency
  const status = useAtomValue(editorStatusAtom);
  const dependencies = useAtomValue(currentTableDependenciesAtom);

  const resolveDependenciesQuery = useResolveDependencies({
    dependencies,
  });

  function handleResolveDependencies() {
    resolveDependenciesQuery.refetch();
  }

  if (status === "validation_error") {
    return (
      <FormSubmitButton
        type="button"
        isPending={resolveDependenciesQuery.isInitialLoading}
        onClick={handleResolveDependencies}
      >
        Resolve Dependencies
      </FormSubmitButton>
    );
  }

  return (
    <FormSubmitButton disabled={status !== "valid"}>
      Save Changes
    </FormSubmitButton>
  );
}

function FormPublishButton(props: PublishButtonProps) {
  const { recentVersions } = props;
  const { control, formState } = useFormContext<FormData>();

  const definition = useWatch({ control, name: "definition" });

  const isEmptyDefinition = definition?.trim() === "";
  const noPreviousVersions = recentVersions.length === 0;
  const isDifferentFromLastVersion =
    recentVersions[0]?.definition.trim() !== definition?.trim();

  /**
   * The publish button is enabled when:
   * - The form is clean (no dirty fields)
   * - The form is valid
   * - The form is not submitting
   * - The definition is not empty
   * - There are no previous versions or the definition is different from the last version
   */
  const isEnabled =
    isEmpty(formState.dirtyFields) &&
    formState.isValid &&
    !formState.isSubmitting &&
    !isEmptyDefinition &&
    (noPreviousVersions || isDifferentFromLastVersion);

  return <PublishButton {...props} isEnabled={isEnabled} />;
}
