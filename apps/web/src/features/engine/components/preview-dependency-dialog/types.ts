import type { RouterOutput } from "@manifold/router";

export type PreviewDependencyDialogProps = {
  dependency: RouterOutput["table"]["findDependencies"][number];
  onAddDependency: () => void;
  canAddDependency: boolean;
};
