import { useModal } from "@ebay/nice-modal-react";
import type { RouterOutput } from "@manifold/router";
import { TableIdentifierInput } from "@manifold/ui/components/table-identifier-input";
import { TableIdentifierPreview } from "@manifold/ui/components/table-identifier-preview";
import { Button } from "@manifold/ui/components/ui/button";
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
import { Input } from "@manifold/ui/components/ui/input";
import { Textarea } from "@manifold/ui/components/ui/textarea";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from "@manifold/ui/components/ui/tooltip";
import { useReturnFocus } from "@manifold/ui/hooks/use-return-focus";
import { useZodForm } from "@manifold/ui/hooks/use-zod-form";
import { type TableCopyInput, tableCopyInput } from "@manifold/validators";
import type { SubmitHandler } from "react-hook-form";
import { GoCopy } from "react-icons/go";
import { useNavigate } from "react-router-dom";

import { useZodFormMutationErrors } from "~features/forms/hooks/use-zod-form-mutation-error";
import { useRequiredUserProfile } from "~features/onboarding/hooks/use-required-user-profile";
import { useCopyTable } from "~features/table/api/copy";
import { log } from "~utils/logger";

type Props = {
  table: Pick<
    RouterOutput["table"]["get"],
    "id" | "title" | "slug" | "description"
  >;
};

type FormData = TableCopyInput;

export function CopyTableDialog({ table }: Props) {
  const modal = useModal();
  const { username } = useRequiredUserProfile();
  const returnFocus = useReturnFocus(modal.visible);
  const navigate = useNavigate();

  const copyTableMutation = useCopyTable({
    onSuccess: (data) => {
      copyTableMutation.reset();
      navigate(`/t/${username}/${data.slug}/edit`);
      modal.hide();
    },
  });

  const form = useZodForm({
    schema: tableCopyInput,
    defaultValues: {
      title: table.title,
      slug: table.slug,
      tableId: table.id,
      description: table.description ?? "",
    },
  });

  useZodFormMutationErrors(form, copyTableMutation.error);

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    await copyTableMutation.mutateAsync(data).catch((e: unknown) => {
      log.error(e);
    });
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
      >
        <DialogHeader>
          <DialogTitle className="mb-12 flex items-center gap-8 text-xl">
            <GoCopy />
            Copy table “{table.title}”
          </DialogTitle>

          <DialogDescription>
            Create a copy of this table that is owned and editable by you. The
            original table’s title, identifier, and description have been
            pre-filled below.
          </DialogDescription>

          <p className="text-sm text-muted-foreground">
            You may change them or leave them as-is.
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <fieldset
              disabled={form.formState.isSubmitting}
              className="space-y-12"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>Title</FormLabel>

                    <FormControl>
                      {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
                      <Input
                        inputProps={{
                          ...field,
                          placeholder: "Dragons",
                          autoFocus: true,
                        }}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>
                      <Tooltip>
                        <TooltipTrigger
                          className="underline decoration-muted-foreground decoration-dotted"
                          asChild
                        >
                          <button type="button">Identifier</button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          This is the name you or other people will use to
                          import this table.
                          <TooltipArrow />
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>

                    <FormControl>
                      <TableIdentifierInput
                        control={form.control}
                        {...field}
                        inputRef={field.ref}
                      />
                    </FormControl>

                    <div>
                      <TableIdentifierPreview
                        control={form.control}
                        getFieldState={form.getFieldState}
                        username={username}
                      />

                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>

                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="!mt-24">
                <DialogClose asChild>
                  <Button variant="outline">Nevermind</Button>
                </DialogClose>

                <FormSubmitButton savingText="Copying…" requireDirty={false}>
                  Copy table
                </FormSubmitButton>
              </DialogFooter>
            </fieldset>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
