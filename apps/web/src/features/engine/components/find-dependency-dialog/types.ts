import type { RouterOutput } from "@manifold/router";

export type FindDependencyDialogProps = {
  tableIdentifier: string;
  onAddDependency: (
    dependency: RouterOutput["table"]["findDependencies"][number],
  ) => void;
};
