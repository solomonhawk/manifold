import { UnreachableCaseError } from "@manifold/lib/utils/enum";
import { useAtomValue } from "jotai";

import {
  type EditorStatus,
  editorStatusAtom,
} from "~features/engine/components/editor/state";

export function EditorStatus() {
  const status = useAtomValue(editorStatusAtom);
  return (
    <div className="mt-16 px-16">
      <span className="text-sm font-semibold">
        <span className="text-muted-foreground">Status:</span>{" "}
        {displayEditorStatus(status)}
      </span>
    </div>
  );
}

function displayEditorStatus(status: EditorStatus) {
  switch (status) {
    case "initial":
      return "Loading...";
    case "parsing":
      return "Parsing...";
    case "parse_error":
      return "Parse Error";
    case "valid":
      return "Valid";
    case "validation_error":
      return "Validation Error";
    case "fetching_dependencies":
      return "Fetching Dependencies...";
    default:
      throw new UnreachableCaseError(status);
  }
}
