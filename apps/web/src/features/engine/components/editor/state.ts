import type { RollResult, TableMetadata } from "@manifold/lib/models/roll";
import type { RouterOutput } from "@manifold/router";
import { atom } from "jotai";

export type EditorStatus =
  | "initial"
  | "parsing"
  | "valid"
  | "parse_error"
  | "validation_error"
  | "fetching_dependencies";

export const editorStatusAtom = atom<EditorStatus>("initial");

export const currentTableHashAtom = atom<string | null>(null);

export const currentTableDependenciesAtom = atom<string[]>([]);

export const currentAllResolvedDependenciesAtom = atom<
  RouterOutput["table"]["resolveDependencies"]
>([]);

export const directDependencyVersionsAtom = atom<
  RouterOutput["table"]["resolveDependencies"]
>((get) => {
  const wantedDependencies = get(currentTableDependenciesAtom);
  const dependencies = get(currentAllResolvedDependenciesAtom);

  return dependencies.filter((d) =>
    wantedDependencies.includes(d.tableIdentifier),
  );
});

export const currentTableMetadataAtom = atom<TableMetadata[]>([]);

export const exportedOnlyAtom = atom(true);

export const visibleTableMetadataAtom = atom((get) => {
  const metadata = get(currentTableMetadataAtom).filter(
    (m) => m.namespace === undefined,
  );
  const exported = get(exportedOnlyAtom);

  if (exported) {
    return metadata.filter((m) => m.export);
  }

  return metadata;
});

export const canRollResultAtom = atom((get) => {
  const hasTables = get(visibleTableMetadataAtom).length > 0;
  const status = get(editorStatusAtom);

  return hasTables && status === "valid";
});

export const rollHistoryAtom = atom<RollResult[]>([]);
