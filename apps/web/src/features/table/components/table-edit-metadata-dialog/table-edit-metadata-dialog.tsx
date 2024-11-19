import { TableIdentifier } from "@manifold/ui/components/table-identifier";
import { Button } from "@manifold/ui/components/ui/button";
import {
  DialogClose,
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
import { Input } from "@manifold/ui/components/ui/input";
import { Textarea } from "@manifold/ui/components/ui/textarea";
import { useStateGuard } from "@manifold/ui/hooks/use-state-guard";
import { useZodForm } from "@manifold/ui/hooks/use-zod-form";
import { type TableUpdateInput, tableUpdateInput } from "@manifold/validators";
import { type SubmitHandler } from "react-hook-form";
import { GoPencil } from "react-icons/go";

import type { WithDialog } from "~features/dialog-manager/types";
import { useZodFormMutationErrors } from "~features/forms/hooks/use-zod-form-mutation-error";
import { useUpdateTable } from "~features/table/api/update";
import type { TableEditMetadataDialogProps } from "~features/table/components/table-edit-metadata-dialog/types";
import { log } from "~utils/logger";

type FormData = TableUpdateInput;

export function TableEditMetadataDialog({
  dialog,
  tableId,
  tableIdentifier,
  title,
  description,
}: WithDialog<TableEditMetadataDialogProps>) {
  const updateTableMutation = useUpdateTable({
    onSuccess: () => {
      form.reset({});
      updateTableMutation.reset();
      dialog.hide();
    },
  });

  const isPending = useStateGuard(updateTableMutation.isLoading, { min: 250 });

  const form = useZodForm({
    schema: tableUpdateInput,
    defaultValues: {
      id: tableId,
      title,
      description: description ?? "",
    },
  });

  useZodFormMutationErrors(form, updateTableMutation.error);

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    await updateTableMutation.mutateAsync(data).catch((e) => {
      log.error(e);
    });
  };

  return (
    <div className="w-dialog-base space-y-20">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-8">
          <GoPencil />
          <span>
            Edit Metadata for{" "}
            <TableIdentifier tableIdentifier={tableIdentifier} />
          </span>
        </DialogTitle>

        <DialogDescription>
          Update the title or description for this table. Table identifiers are
          immutable and cannot be changed.
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <fieldset disabled={form.formState.isSubmitting}>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="mb-24">
                  <FormLabel isRequired>Title</FormLabel>

                  <FormControl>
                    <Input inputProps={field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="mb-24">
                  <FormLabel>Description</FormLabel>

                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Nevermind</Button>
              </DialogClose>

              <FormSubmitButton disabled={isPending} requireDirty={false}>
                Update Metadata
              </FormSubmitButton>
            </DialogFooter>
          </fieldset>
        </form>
      </Form>
    </div>
  );
}

export default TableEditMetadataDialog;
