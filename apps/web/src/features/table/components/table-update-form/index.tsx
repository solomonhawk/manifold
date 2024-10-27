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
import { useCallback, useEffect } from "react";
import { type SubmitHandler } from "react-hook-form";

import { Editor } from "~features/editor";
import { DeleteButton } from "~features/table/components/table-update-form/delete-button";
import { FavoriteButton } from "~features/table/components/table-update-form/favorite-button";
import { toastError } from "~utils/toast";
import { trpc } from "~utils/trpc";

import { Header } from "./header";

type FormData = z.infer<typeof tableUpdateInput>;

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

      // ensure form touched/dirty state is accurate
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

  const handleSubmit: SubmitHandler<FormData> = (data) => {
    updateTableMutation.mutate(data);
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

  return (
    <Form {...form}>
      <FlexCol asChild>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FlexCol asChild>
            <fieldset
              disabled={form.formState.isSubmitting || isDisabled}
              className="space-y-12 sm:space-y-16"
            >
              <Header
                id={table.id}
                title={table.title}
                updatedAt={table.updatedAt}
              >
                <div className="flex items-center gap-8">
                  <FormSubmitStatus className="text-muted-foreground text-sm" />
                  <FormSubmitButton>Save Changes</FormSubmitButton>
                  <FavoriteButton
                    tableId={table.id}
                    isFavorited={table.favorited ?? false}
                  />
                  <DeleteButton title={table.title} tableId={table.id} />
                </div>
              </Header>

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
