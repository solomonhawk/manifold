import type { RouterOutput } from "@manifold/router";

export type TableViewDependenciesDialogProps = {
  tableTitle: string;
  tableIdentifier: string;
  dependencies: RouterOutput["table"]["get"]["dependencies"];
};
