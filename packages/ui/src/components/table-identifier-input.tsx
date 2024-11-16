import { slugify } from "@manifold/lib";
import { type Ref } from "react";
import {
  type Control,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
  useWatch,
} from "react-hook-form";

import { Input } from "#components/ui/input.tsx";

interface RequiredFieldValues extends FieldValues {
  title: string;
  slug?: string | undefined;
}

interface Props<T extends FieldValues = RequiredFieldValues>
  extends ControllerRenderProps<T> {
  control: Control<T, unknown>;
  inputRef: Ref<HTMLInputElement>;
}

export function TableIdentifierInput<
  T extends FieldValues = RequiredFieldValues,
>({ control, inputRef, ...field }: Props<T>) {
  const title = useWatch({ control, name: "title" as FieldPath<T> });
  const slug = slugify(title);

  return (
    <Input
      ref={inputRef}
      inputProps={{ ...field, placeholder: slug ?? "dragons" }}
    />
  );
}
