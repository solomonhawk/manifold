import { isEmpty } from "@manifold/lib";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form";

import { LoadingIndicator } from "#components/loading-indicator.tsx";
import { Button } from "#components/ui/button.tsx";
import { Label } from "#components/ui/label.tsx";
import { useStateGuard } from "#hooks/use-state-guard.ts";
import { cn } from "#lib/utils.ts";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-8", className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
    isRequired?: boolean;
  }
>(({ className, isRequired, children, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    >
      {children}
      {isRequired && (
        <span aria-hidden="true" className="text-accent-foreground">
          {" "}
          *
        </span>
      )}
    </Label>
  );
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-[0.8rem] text-muted-foreground", className)}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-[0.8rem] font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

const FormSubmitStatus = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => {
  const { formState } = useFormContext();

  const isDirty = !isEmpty(formState.dirtyFields);
  const message = isDirty
    ? "You have unsaved changes"
    : "Everything is up to date";

  return (
    <div ref={ref} {...props}>
      {message}
    </div>
  );
});

FormSubmitStatus.displayName = "FormSubmitStatus";

const FormSubmitButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    form?: string;
    savingText?: string;
    requireDirty?: boolean;
    disabled?: boolean;
    isPending?: boolean;
  }
>(
  (
    {
      children,
      form,
      savingText,
      requireDirty = true,
      disabled = false,
      isPending = false,
      ...props
    },
    ref,
  ) => {
    const { formState } = useFormContext();

    const guardedIsSubmitting = useStateGuard(formState.isSubmitting, {
      min: 250,
    });

    const isDirty = !isEmpty(formState.dirtyFields);
    const showPendingState = isPending || guardedIsSubmitting;
    const isDisabled =
      disabled || showPendingState || (requireDirty && !isDirty);

    const defaultChildren = children || "Save";

    return (
      <Button
        ref={ref}
        form={form}
        type="submit"
        {...props}
        disabled={isDisabled}
      >
        {showPendingState ? (
          <span className="flex items-center gap-6">
            <LoadingIndicator size="sm" className="-ml-4" />
            {savingText || defaultChildren}
          </span>
        ) : (
          <>{defaultChildren}</>
        )}
      </Button>
    );
  },
);

FormSubmitButton.displayName = "FormSubmitButton";

function FormDebug() {
  const { formState, getValues } = useFormContext();
  const { errors } = formState;

  React.useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("<Form /> errors:", errors);
    }
  }, [errors]);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="flex gap-8">
      <button type="button" onClick={() => console.log("values", getValues())}>
        Log Form Values
      </button>

      <button type="button" onClick={() => console.log("errors", errors)}>
        Log Form Errors
      </button>

      <button
        type="button"
        onClick={() => console.log("formState", formState.dirtyFields)}
      >
        Log Dirty Fields
      </button>

      <button type="button" onClick={() => console.log("formState", formState)}>
        Log Form State
      </button>
    </div>
  );
}

export {
  Form,
  FormControl,
  FormDebug,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormSubmitButton,
  FormSubmitStatus,
  useFormField,
};
