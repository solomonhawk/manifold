import type { RouterOutput } from "@manifold/router";

export type CompareVersionsDialogProps = {
  versions: RouterOutput["tableVersion"]["get"]["versions"];
  table: RouterOutput["tableVersion"]["get"]["table"];
  currentVersion?: number;
};
