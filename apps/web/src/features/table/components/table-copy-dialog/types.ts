import type { RouterOutput } from "@manifold/router";

export type TableCopyDialogProps = {
  table: Pick<
    RouterOutput["table"]["get"],
    "id" | "title" | "slug" | "description"
  >;
};
