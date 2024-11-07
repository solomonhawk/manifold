import { getRandomElement } from "@manifold/lib/utils/array";
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
import { useZodForm } from "@manifold/ui/hooks/use-zod-form";
import { userProfileCreateInput, type z } from "@manifold/validators";
import { useMemo } from "react";
import { type SubmitHandler, useFormContext, useWatch } from "react-hook-form";

import { useZodFormMutationErrors } from "~features/forms/hooks/use-zod-form-mutation-error";
import { useCreateUserProfile } from "~features/onboarding/api/create-user-profile";
import { log } from "~utils/logger";

type FormData = z.infer<typeof userProfileCreateInput>;

export function UserProfileCreateForm() {
  const form = useZodForm({
    mode: "onChange",
    reValidateMode: "onChange",
    schema: userProfileCreateInput,
    defaultValues: {
      description: "",
      username: "",
    },
    shouldFocusError: false,
  });

  const createUserProfileMutation = useCreateUserProfile();

  useZodFormMutationErrors<FormData>(form, createUserProfileMutation.error);

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    await createUserProfileMutation.mutateAsync(data).catch((e) => {
      log.error(e);
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <fieldset disabled={form.formState.isSubmitting} className="space-y-12">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel isRequired>Username</FormLabel>

                <FormControl>
                  <Input {...field} autoComplete="off" autoCorrect="false" />
                </FormControl>

                <div>
                  <UsernameExample />

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

                <FormDescription>
                  This will be displayed on your public profile.
                </FormDescription>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormSubmitButton className="!mt-20 w-full" savingText="Updating…">
            Update Profile
          </FormSubmitButton>
        </fieldset>
      </form>
    </Form>
  );
}

function UsernameExample() {
  const { control, getFieldState } = useFormContext<FormData>();
  const username = useWatch({ control, name: "username" });
  const usernameFieldState = getFieldState("username");

  const exampleTableName = useMemo(
    () => `@${username}/${generateExampleTableName()}`,
    [username],
  );

  if (username && !usernameFieldState.invalid) {
    return (
      <FormDescription>
        Your public tables will be imported with e.g.:
        <span className="block">
          <code className="rounded bg-secondary p-3 px-6 leading-none text-accent-foreground">
            {exampleTableName}
          </code>
        </span>
      </FormDescription>
    );
  }
  return (
    <FormDescription>
      Can only contain only lowercase letters, numbers, and hyphens.
    </FormDescription>
  );
}

function generateExampleTableName() {
  return getRandomElement([
    "animal-frens",
    "strange-beasts",
    "legendary-artifacts",
    "mystical-creatures",
  ]);
}
