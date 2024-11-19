import type { TableVersionSummary } from "@manifold/db";
import type { TablePublishVersionInput } from "@manifold/validators";

export type TablePublishDialogProps = TablePublishVersionInput & {
  // @TODO: fix this type
  recentVersions: TableVersionSummary[];
  totalVersionCount: number;
};
