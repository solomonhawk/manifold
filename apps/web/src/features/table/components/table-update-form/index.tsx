import type { TableModel } from "@manifold/db/schema/table";
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
import { toast } from "@manifold/ui/components/ui/toaster";
import { useZodForm } from "@manifold/ui/hooks/use-zod-form";
import { tableUpdateInput, z } from "@manifold/validators";
import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { type SubmitHandler } from "react-hook-form";

import { Editor } from "~features/editor";
import { toastError } from "~utils/toast";
import { trpc } from "~utils/trpc";

import { TABLE_UPDATE_HEADER_PORTAL_ID } from "./header";

type FormData = z.infer<typeof tableUpdateInput>;

const TABLE_UPDATE_FORM_ID = "table-update-form";

export function TableUpdateForm({
  table,
  isDisabled = false,
}: {
  table: TableModel;
  isDisabled?: boolean;
}) {
  const trpcUtils = trpc.useUtils();

  const form = useZodForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      id: table.id,
      definition: table.definition,
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

  const updateTableMutation = trpc.table.update.useMutation({
    onSuccess: async (data) => {
      toast.success("Table updated");

      // ensure form touched/dirty state is accurate after a successful save.
      form.reset({
        id: data.id,
        definition: data.definition,
      });

      // update query cache with the updated data
      trpcUtils.table.list.setData(undefined, (list) => {
        return list?.map((t) => (t.id === data.id ? data : t)) ?? [data];
      });

      // invalidate table list query to ensure order is accurate (based on `updatedAt`)
      trpcUtils.table.list.invalidate(undefined, { type: "inactive" });

      // invalidate get query, but don't bother refetching until the next time it becomes active
      trpcUtils.table.get.invalidate(table.id, { refetchType: "inactive" });
    },
    onError: (e) => {
      console.error(e);

      toastError("Table failed to save", {
        description: e.message,
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
    });
  }, [form, table.id, table.definition]);

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    await updateTableMutation.mutateAsync(data);
  };

  const handleParseError = useCallback(
    (error: string) => {
      form.setError("definition", { message: error, type: "manual" });
    },
    [form],
  );

  const handleParseSuccess = useCallback(() => {
    form.clearErrors("definition");
  }, [form]);

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
          onSubmit={form.handleSubmit(handleSubmit)}
          id={TABLE_UPDATE_FORM_ID}
        >
          <FlexCol asChild>
            <fieldset
              disabled={form.formState.isSubmitting || isDisabled}
              className="space-y-12 sm:space-y-16"
            >
              {portalRef.current &&
                createPortal(
                  <>
                    <FormSubmitStatus className="text-muted-foreground mr-8 text-sm" />
                    <FormSubmitButton form={TABLE_UPDATE_FORM_ID}>
                      Save Changes
                    </FormSubmitButton>
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
