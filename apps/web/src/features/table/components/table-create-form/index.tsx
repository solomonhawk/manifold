import { buildTableIdentifier, slugify } from "@manifold/lib";
import type { RouterOutput } from "@manifold/router";
import { TableIdentifier } from "@manifold/ui/components/table-identifier";
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
import { Textarea } from "@manifold/ui/components/ui/textarea";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from "@manifold/ui/components/ui/tooltip";
import { useZodForm } from "@manifold/ui/hooks/use-zod-form";
import { tableCreateInput, type z } from "@manifold/validators";
import { forwardRef } from "react";
import {
  type Control,
  type ControllerRenderProps,
  type SubmitHandler,
  useFormContext,
  useWatch,
} from "react-hook-form";

import { useZodFormMutationErrors } from "~features/forms/hooks/use-zod-form-mutation-error";
import { useRequiredUserProfile } from "~features/onboarding/hooks/use-required-user-profile";
import { useCreateTable } from "~features/table/api/create";
import { log } from "~utils/logger";

type FormData = z.infer<typeof tableCreateInput>;

export function TableCreateForm({
  onCreate,
}: {
  onCreate?: (table: RouterOutput["table"]["create"]) => void;
}) {
  const form = useZodForm({
    schema: tableCreateInput,
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      definition: "",
    },
    shouldFocusError: false,
  });

  const createTableMutation = useCreateTable({ onSuccess: onCreate });

  useZodFormMutationErrors<FormData>(form, createTableMutation.error);

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    await createTableMutation.mutateAsync(data).catch((e) => {
      log.error(e);
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <fieldset disabled={form.formState.isSubmitting} className="space-y-12">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel isRequired>Title</FormLabel>

                <FormControl>
                  {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
                  <Input placeholder="Dragons" {...field} autoFocus />
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
                      This is the name you or other people will use to import
                      this table.
                      <TooltipArrow />
                    </TooltipContent>
                  </Tooltip>
                </FormLabel>

                <FormControl>
                  <IdentifierInput control={form.control} {...field} />
                </FormControl>

                <div>
                  <TableIdentifierExample />

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

          <FormDescription>
            You will be taken to the editor after creating the new table.
          </FormDescription>

          <FormSubmitButton className="!mt-20 w-full" savingText="Creating…">
            Create Table
          </FormSubmitButton>
        </fieldset>
      </form>
    </Form>
  );
}

function TableIdentifierExample() {
  const userProfile = useRequiredUserProfile();
  const { control, getFieldState } = useFormContext<FormData>();
  const title = useWatch({ control, name: "title" });
  const slug = useWatch({ control, name: "slug" });
  const slugFieldState = getFieldState("slug");

  const tableIdentifier = buildTableIdentifier(
    userProfile.username,
    slug || slugify(title),
  );

  if ((title || slug) && !slugFieldState.invalid) {
    return (
      <FormDescription>
        Imported as <TableIdentifier tableIdentifier={tableIdentifier} />
      </FormDescription>
    );
  }

  return (
    <>
      <FormDescription>
        Can only contain only lowercase letters, numbers, and hyphens.
      </FormDescription>

      <FormDescription>
        <em>Leave blank to auto-generate.</em>
      </FormDescription>
    </>
  );
}

type IdentifierInputProps = ControllerRenderProps<
  z.infer<typeof tableCreateInput>,
  "slug"
> & {
  control: Control<z.infer<typeof tableCreateInput>, unknown>;
};

const IdentifierInput = forwardRef<HTMLInputElement, IdentifierInputProps>(
  ({ control, ...field }, ref) => {
    const title = useWatch({ control, name: "title" });
    const slug = slugify(title);

    return <Input ref={ref} placeholder={slug ?? "dragons"} {...field} />;
  },
);
IdentifierInput.displayName = "IdentifierInput";
