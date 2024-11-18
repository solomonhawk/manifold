import { isEmpty } from "@manifold/lib";
import type { RouterOutput } from "@manifold/router";
import { FlexCol } from "@manifold/ui/components/ui/flex";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@manifold/ui/components/ui/form";
import { useZodForm } from "@manifold/ui/hooks/use-zod-form";
import { tableUpdateInput, z } from "@manifold/validators";
import { useAtomValue } from "jotai";
import { type KeyboardEvent, useCallback, useEffect, useRef } from "react";
import { type SubmitHandler } from "react-hook-form";
import { useBlocker, useNavigate } from "react-router-dom";

import { DialogManager, DIALOGS } from "~features/dialog-manager";
import { Editor } from "~features/engine";
import { directDependencyVersionsAtom } from "~features/engine/components/editor/state";
import { useUpdateTable } from "~features/table/api/update";
import { log } from "~utils/logger";

import {
  Header,
  TABLE_UPDATE_HEADER_DROPDOWN_PORTAL_ID,
  TABLE_UPDATE_HEADER_PORTAL_ID,
} from "../header";

export type FormData = z.infer<typeof tableUpdateInput>;

export function TableUpdateForm({
  table,
  isDisabled = false,
}: {
  table: RouterOutput["table"]["get"];
  isDisabled?: boolean;
}) {
  const navigate = useNavigate();

  const form = useZodForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      id: table.id,
      definition: table.definition,
      availableTables: table.availableTables,
      dependencies: table.dependencies.map((d) => ({
        dependencyIdentifier: d.tableIdentifier,
        dependencyVersion: d.version,
      })),
    },
    schema: tableUpdateInput.extend({
      definition: z.string().superRefine((_value, ctx) => {
        /**
         * @NOTE: RHF always uses the validator result even when a field error
         * has been set manually. We can't easily statically determine if the
         * definition is valid within the schema, so we use a workaround here
         * which uses the existing field error if present to decide if the field
         * is valid.
         *
         * This kind of sucks.
         */
        const error = form.formState.errors.definition;

        if (error) {
          ctx.addIssue({
            message: error.message,
            code: "custom",
            fatal: true,
          });
        }
      }),
    }),
  });

  const isDirty = !isEmpty(form.formState.dirtyFields);
  const isSubmitting = form.formState.isSubmitting;
  const isNavigatingDestructively = useRef(false);

  useBlocker(({ nextLocation }) => {
    // the user opted to navigate despite a dirty form, so let them
    if (isNavigatingDestructively.current) {
      return false;
    }

    // block if the form is in the process of saving
    if (isSubmitting) {
      return true;
    }

    // if dirty, prompt the user to confirm they want to discard changes
    if (isDirty) {
      DialogManager.show(DIALOGS.CONFIRMATION.ID, {
        title: "Are you sure?",
        description:
          "You have unsaved changes. If you leave they will be discarded.",
        confirmText: "Discard Changes",
        cancelText: "I want to save my changes",
        onConfirm: () => {
          isNavigatingDestructively.current = true;
          navigate(nextLocation);
        },
      });

      return true;
    }

    // allow navigation otherwise
    return false;
  });

  // @TODO: naughty cross-feature dependency
  const directDependencyVersions = useAtomValue(directDependencyVersionsAtom);

  const updateTableMutation = useUpdateTable({
    onSuccess: (data) => {
      // ensure form touched/dirty state is accurate after a successful save.
      form.reset({
        id: data.id,
        definition: data.definition,
        availableTables: data.availableTables,
        dependencies: directDependencyVersions.map((d) => ({
          dependencyIdentifier: d.tableIdentifier,
          dependencyVersion: d.version,
        })),
      });
    },
  });

  /**
   * Reset the form when the table default values change.
   */
  useEffect(() => {
    form.reset({
      id: table.id,
      definition: table.definition,
      availableTables: table.availableTables,
      dependencies: table.dependencies.map((d) => ({
        dependencyIdentifier: d.tableIdentifier,
        dependencyVersion: d.version,
      })),
    });
  }, [form, table]);

  useEffect(() => {
    form.setValue(
      "dependencies",
      directDependencyVersions.map((d) => ({
        dependencyIdentifier: d.tableIdentifier,
        dependencyVersion: d.version,
      })),
    );
  }, [form, directDependencyVersions]);

  const handleSubmit: SubmitHandler<FormData> = useCallback(
    async (data) => {
      await updateTableMutation.mutateAsync(data).catch((e) => {
        log.error(e);
      });
    },
    [updateTableMutation],
  );

  const handleParseError = useCallback(
    (error: string) => {
      form.setError("definition", { message: error, type: "manual" });
    },
    [form],
  );

  const handleParseSuccess = useCallback(
    (availableTables: string[]) => {
      form.setValue("availableTables", availableTables);
      form.clearErrors("definition");
    },
    [form],
  );

  /**
   * Handle submitting the form with `Cmd + Enter`. Requires that the user's
   * focus is within the <form /> element.
   *
   * It might be nice to attach this to the `document`, but we would need to
   * be careful to avoid stealing key presses that originate from other
   * focusable/"enter"-able elements.
   */
  const handleKeyDown = useCallback(
    async (e: KeyboardEvent) => {
      if ((e.key === "s" || e.key === "Enter") && (e.metaKey || e.ctrlKey)) {
        // Make sure the form state is up-to-date - ensures `isValid` is true
        // when there are no fields with errors.
        await form.trigger(undefined, { shouldFocus: false });

        if (isEmpty(form.formState.dirtyFields) || !form.formState.isValid) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();

        const focusedElement = document.activeElement as HTMLElement;

        await form.handleSubmit(handleSubmit)();

        requestAnimationFrame(() => {
          focusedElement.focus();
        });
      }
    },
    [form, handleSubmit],
  );

  const headerNavBarPortalRef = useRef<HTMLElement | null>(null);
  const headerDropdownPortalRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!headerNavBarPortalRef.current) {
      headerNavBarPortalRef.current = document.getElementById(
        TABLE_UPDATE_HEADER_PORTAL_ID,
      );
    }

    if (!headerDropdownPortalRef.current) {
      headerDropdownPortalRef.current = document.getElementById(
        TABLE_UPDATE_HEADER_DROPDOWN_PORTAL_ID,
      );
    }
  }, []);

  return (
    <Form {...form}>
      <Header table={table} />

      <FlexCol asChild>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FlexCol asChild role="presentation" onKeyDown={handleKeyDown}>
            <fieldset
              disabled={form.formState.isSubmitting || isDisabled}
              className="space-y-12 sm:space-y-16"
            >
              <FormField
                control={form.control}
                name="definition"
                render={({ field: { ref, ...props } }) => {
                  return (
                    <FlexCol asChild>
                      <FormItem>
                        <FormControl>
                          <Editor
                            tableIdentifier={table.tableIdentifier}
                            refCallback={ref}
                            onParseError={handleParseError}
                            onParseSuccess={handleParseSuccess}
                            isDisabled={table.deletedAt !== null}
                            resolvedDependencies={table.dependencies}
                            {...props}
                          />
                        </FormControl>

                        <FormMessage className="max-h-128 overflow-auto" />
                      </FormItem>
                    </FlexCol>
                  );
                }}
              />
            </fieldset>
          </FlexCol>
        </form>
      </FlexCol>
    </Form>
  );
}
