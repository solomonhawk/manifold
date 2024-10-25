import type { TableModel } from "@manifold/db/schema/table";
import { FlexCol } from "@manifold/ui/components/ui/flex";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormSubmitButton,
} from "@manifold/ui/components/ui/form";
import { useZodForm } from "@manifold/ui/hooks/use-zod-form";
import { tableUpdateInput, z } from "@manifold/validators";
import { useCallback, useEffect } from "react";
import { type SubmitHandler } from "react-hook-form";

import { Editor } from "~features/editor";
import { trpc } from "~utils/trpc";

import { Header } from "./header";

type FormData = z.infer<typeof tableUpdateInput>;

export function TableUpdateForm({
  table,
  onUpdate,
  isDisabled = false,
}: {
  table: TableModel;
  onUpdate?: (id: string) => void | Promise<unknown>;
  isDisabled?: boolean;
}) {
  const form = useZodForm({
    mode: "onChange",
    reValidateMode: "onChange",
    schema: tableUpdateInput.extend({
      definition: z.string().superRefine((_value, ctx) => {
        /**
         * @NOTE: RHF always uses the validator result even when a field error
         * has been set manually. We can't easily statically determine if the
         * field is valid within the schema, so we use a workaround here which
         * uses the existing field error if present to decide if the field
         * is valid.
         *
         * This sucks.
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
    defaultValues: {
      id: table.id,
      definition: table.definition,
    },
  });

  const updateTableMutation = trpc.table.update.useMutation();

  useEffect(() => {
    form.reset({
      id: table.id,
      definition: table.definition,
    });
  }, [form, table.id, table.definition]);

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const table = await updateTableMutation.mutateAsync(data);
      await onUpdate?.(table.id);
    } catch (e) {
      // @TODO: handle server errors
    }
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
              <Header title={table.title}>
                <FormSubmitButton>Save Changes</FormSubmitButton>
              </Header>

              <FormField
                control={form.control}
                name="definition"
                render={({ field }) => {
                  const { ref, ...props } = field;

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
