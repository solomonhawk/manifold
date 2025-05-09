import { buildTableIdentifier } from "@manifold/lib/utils/table-identifier";

import { cn } from "#lib/utils.js";

type Props = { className?: string } & (
  | {
      tableIdentifier?: never;
      username: string;
      slug: string;
    }
  | {
      tableIdentifier: string;
      username?: never;
      slug?: never;
    }
);

export function TableIdentifier({
  username,
  slug,
  tableIdentifier,
  className,
}: Props) {
  return (
    <code
      className={cn(
        "rounded bg-secondary p-3 px-6 !leading-tight text-accent-foreground",
        className,
      )}
    >
      {tableIdentifier ?? buildTableIdentifier(username, slug)}
    </code>
  );
}
