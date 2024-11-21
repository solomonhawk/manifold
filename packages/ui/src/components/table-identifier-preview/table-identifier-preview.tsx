import { slugify } from "@manifold/lib/utils/string";
import { buildTableIdentifier } from "@manifold/lib/utils/table-identifier";
import {
  type Control,
  type FieldValues,
  type Path,
  type UseFormGetFieldState,
  useWatch,
} from "react-hook-form";

import { FormDescription } from "#components/core/form/form.js";
import { TableIdentifier } from "#components/table-identifier/table-identifier.js";

interface RequiredFieldValues extends FieldValues {
  title: string;
  slug?: string | undefined;
}

type Props<T extends FieldValues = RequiredFieldValues> = {
  username: string;
  control: Control<T, unknown>;
  getFieldState: UseFormGetFieldState<T>;
};

export function TableIdentifierPreview<
  T extends RequiredFieldValues = RequiredFieldValues,
>({ control, username, getFieldState }: Props<T>) {
  const title = useWatch<T>({
    control,
    name: "title" as Path<T>,
  });
  const slug = useWatch<T>({ control, name: "slug" as Path<T> });
  const slugFieldState = getFieldState("slug" as Path<T>);

  const tableIdentifier = buildTableIdentifier(
    username,
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
        <em>Leave blank to auto-generate. </em>
        <strong>Cannot be changed later!</strong>
      </FormDescription>
    </>
  );
}
