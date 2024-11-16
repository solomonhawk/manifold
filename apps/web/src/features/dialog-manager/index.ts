import NiceModal, { type NiceModalHocProps } from "@ebay/nice-modal-react";
import type { ComponentProps } from "react";

import { FindDependencyDialog } from "~features/editor/components/find-dependency-dialog";
import { PreviewDependencyDialog } from "~features/editor/components/preview-dependency-dialog";
import { CopyTableDialog } from "~features/table/components/table-copy-dialog";
import { TableDeleteDialog } from "~features/table/components/table-delete-dialog";
import { TablePublishDialog } from "~features/table/components/table-publish-dialog";
import { TableViewDependenciesDialog } from "~features/table/components/table-view-dependencies-dialog";
import { CompareVersionsDialog } from "~features/table-version/components/compare-versions-dialog";

/**
 * @NOTE: Workaround for TypeScript not being able to infer the correct type of
 * the component props when using `NiceModal.show` directly.
 *
 * @ref https://github.com/eBay/nice-modal-react/issues/134
 */
type IdToComponent<Id extends string> = Id extends keyof typeof DIALOGS
  ? (typeof DIALOGS)[Id]["COMPONENT"]
  : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Props<C extends React.FC<any>> = Omit<
  ComponentProps<C>,
  keyof NiceModalHocProps
> &
  Partial<NiceModalHocProps>;

export const DialogManager = {
  ...NiceModal,

  show<Id extends string, C extends IdToComponent<Id> = IdToComponent<Id>>(
    id: Id,
    props: Props<C>,
  ) {
    return NiceModal.show(id, props);
  },
};

export const DIALOGS = {
  DELETE_TABLE: {
    ID: "DELETE_TABLE",
    COMPONENT: NiceModal.create(TableDeleteDialog),
  },
  PUBLISH_TABLE: {
    ID: "PUBLISH_TABLE",
    COMPONENT: NiceModal.create(TablePublishDialog),
  },
  FIND_DEPENDENCY: {
    ID: "FIND_DEPENDENCY",
    COMPONENT: NiceModal.create(FindDependencyDialog),
  },
  PREVIEW_DEPENDENCY: {
    ID: "PREVIEW_DEPENDENCY",
    COMPONENT: NiceModal.create(PreviewDependencyDialog),
  },
  COMPARE_VERSIONS: {
    ID: "COMPARE_VERSIONS",
    COMPONENT: NiceModal.create(CompareVersionsDialog),
  },
  COPY_TABLE: {
    ID: "COPY_TABLE",
    COMPONENT: NiceModal.create(CopyTableDialog),
  },
  VIEW_TABLE_DEPENDENCIES: {
    ID: "VIEW_TABLE_DEPENDENCIES",
    COMPONENT: NiceModal.create(TableViewDependenciesDialog),
  },
} as const;

for (const dialog of Object.values(DIALOGS)) {
  DialogManager.register(dialog.ID, dialog.COMPONENT);
}
