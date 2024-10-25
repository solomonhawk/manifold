import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormSubmitButton,
} from "@manifold/ui/components/ui/form";
import { Input } from "@manifold/ui/components/ui/input";
import { useZodForm } from "@manifold/ui/hooks/use-zod-form";
import { tableCreateInput, type z } from "@manifold/validators";
import { type SubmitHandler } from "react-hook-form";

import { trpc } from "~utils/trpc";

type FormData = z.infer<typeof tableCreateInput>;

export function TableCreateForm({
  onCreate,
}: {
  onCreate: (id: string) => void;
}) {
  const form = useZodForm({
    schema: tableCreateInput,
    defaultValues: {
      title: "",
      definition: "",
    },
  });

  const createTableMutation = trpc.table.create.useMutation();

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const table = await createTableMutation.mutateAsync(data);
    onCreate(table.id);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset disabled={form.formState.isSubmitting} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>

                <FormControl>
                  <Input placeholder="Dragons" {...field} autoFocus />
                </FormControl>

                <div>
                  <FormDescription>
                    You will be taken to the editor after creating the new
                    table.
                  </FormDescription>

                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormSubmitButton className="!mt-20 w-full">
            Create Table
          </FormSubmitButton>
        </fieldset>
      </form>
    </Form>
  );
}
