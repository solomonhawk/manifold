import type { AppRouter } from "@manifold/router";
import type { TRPCClientErrorLike } from "@trpc/client";
import { useEffect } from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

/**
 * This hook is used to handle errors from a Zod schema attached to a server
 * response that contains a validation error.
 *
 * Because we disable inputs while submitting, react-hook-form's default
 * focus management doesn't work.
 *
 * @ref https://github.com/orgs/react-hook-form/discussions/3024
 *
 * This hook will set form errors based on the response data and focus the
 * first invalid input (once `isSubmitting` is false).
 */
export function useZodFormMutationErrors<T extends FieldValues>(
  form: UseFormReturn<T>,
  error: TRPCClientErrorLike<AppRouter> | null,
) {
  const {
    formState: { errors, isSubmitting },
    setFocus,
  } = form;

  useEffect(() => {
    if (error) {
      const { formErrors, fieldErrors } = error.data?.zodError ?? {};

      for (const rootError of formErrors ?? []) {
        form.setError("root", { message: rootError });
      }

      for (const [key, value] of Object.entries(fieldErrors ?? {})) {
        if (value) {
          for (const error of value) {
            form.setError(key as Path<T>, {
              type: "manual",
              message: error,
            });
          }
        }
      }
    }
  }, [form, error]);

  useEffect(() => {
    if (isSubmitting) {
      return;
    }

    // find the first error in the `errors` object
    const firstError = Object.keys(errors).find(
      (key) => errors[key as Path<T>],
    );

    if (firstError) {
      setFocus(firstError as Path<T>);
    }
  }, [errors, isSubmitting, setFocus]);
}
