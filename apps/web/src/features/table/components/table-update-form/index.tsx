import { isEmpty } from "@manifold/lib";
import type { RouterOutput } from "@manifold/router";
import { FlexCol } from "@manifold/ui/components/ui/flex";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormSubmitButton,
  FormSubmitStatus,
} from "@manifold/ui/components/ui/form";
import { useZodForm } from "@manifold/ui/hooks/use-zod-form";
import { tableUpdateInput, z } from "@manifold/validators";
import { type KeyboardEvent, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { type SubmitHandler, useFormContext, useWatch } from "react-hook-form";

import { Editor } from "~features/editor";
import { useUpdateTable } from "~features/table/api/update";
import {
  PublishButton,
  type PublishButtonProps,
} from "~features/table/components/table-update-form/publish-button";
import { log } from "~utils/logger";

import { TABLE_UPDATE_HEADER_PORTAL_ID } from "../header";
import { DownloadButton } from "./download-button";

type FormData = z.infer<typeof tableUpdateInput>;

const TABLE_UPDATE_FORM_ID = "table-update-form";

export function TableUpdateForm({
  table,
  isDisabled = false,
}: {
  table: RouterOutput["table"]["get"];
  isDisabled?: boolean;
}) {
  const form = useZodForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      id: table.id,
      definition: table.definition,
      availableTables: table.availableTables,
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

  const updateTableMutation = useUpdateTable({
    slug: table.slug,
    onSuccess: (data) => {
      // ensure form touched/dirty state is accurate after a successful save.
      form.reset({
        id: data.id,
        definition: data.definition,
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
    });
  }, [form, table.id, table.definition, table.availableTables]);

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

  const portalRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!portalRef.current) {
      portalRef.current = document.getElementById(
        TABLE_UPDATE_HEADER_PORTAL_ID,
      );
    }
  });

  return (
    <Form {...form}>
      <FlexCol asChild>
        <form
          id={TABLE_UPDATE_FORM_ID}
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <FlexCol asChild role="presentation" onKeyDown={handleKeyDown}>
            <fieldset
              disabled={form.formState.isSubmitting || isDisabled}
              className="space-y-12 sm:space-y-16"
            >
              {portalRef.current &&
                createPortal(
                  <>
                    <FormSubmitStatus className="mr-8 text-xs text-muted-foreground/80" />

                    <FormSubmitButton form={TABLE_UPDATE_FORM_ID}>
                      Save Changes
                    </FormSubmitButton>

                    <FormPublishButton
                      slug={table.slug}
                      isEnabled={
                        !form.formState.isDirty &&
                        form.formState.isValid &&
                        !form.formState.isSubmitting
                      }
                      recentVersions={table.recentVersions}
                      totalVersionCount={table.totalVersionCount}
                    />
                    <DownloadButton tableId={table.id} />
                  </>,
                  portalRef.current,
                )}

              <FormField
                control={form.control}
                name="definition"
                render={({ field: { ref, ...props } }) => {
                  return (
                    <FlexCol asChild>
                      <FormItem>
                        <FormControl>
                          <Editor
                            onParseError={handleParseError}
                            onParseSuccess={handleParseSuccess}
                            refCallback={ref}
                            isDisabled={table.deletedAt !== null}
                            {...props}
                          />
                        </FormControl>

                        <FormMessage />
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

function FormPublishButton(props: PublishButtonProps) {
  const { isEnabled, recentVersions } = props;
  const { control } = useFormContext<FormData>();

  const definition = useWatch({ control, name: "definition" });

  const isEmptyDefinition = definition?.trim() === "";
  const noPreviousVersions = recentVersions.length === 0;
  const isDifferentFromLastVersion =
    recentVersions[0]?.definition.trim() !== definition?.trim();

  return (
    <PublishButton
      {...props}
      isEnabled={
        isEnabled &&
        !isEmptyDefinition &&
        (noPreviousVersions || isDifferentFromLastVersion)
      }
    />
  );
}
