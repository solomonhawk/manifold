import NiceModal from "@ebay/nice-modal-react";

import { ConfirmationDialog } from "~features/dialog-manager/components/confirmation-dialog";
import type {
  DialogProps,
  IdToComponent,
} from "~features/dialog-manager/types";
import { FindDependencyDialog } from "~features/engine/components/find-dependency-dialog";
import { PreviewDependencyDialog } from "~features/engine/components/preview-dependency-dialog";
import { CopyTableDialog } from "~features/table/components/table-copy-dialog";
import { TableDeleteDialog } from "~features/table/components/table-delete-dialog";
import { TableEditMetadataDialog } from "~features/table/components/table-edit-metadata-dialog";
import { TablePublishDialog } from "~features/table/components/table-publish-dialog";
import { TableViewDependenciesDialog } from "~features/table/components/table-view-dependencies-dialog";
import { CompareVersionsDialog } from "~features/table-version/components/compare-versions-dialog";

export const DialogManager = {
  ...NiceModal,

  show<Id extends string, C extends IdToComponent<Id> = IdToComponent<Id>>(
    id: Id,
    props: DialogProps<C>,
  ) {
    return NiceModal.show(id, props);
  },
};

export const DIALOGS = {
  CONFIRMATION: {
    ID: "CONFIRMATION",
    COMPONENT: NiceModal.create(ConfirmationDialog),
  },
  EDIT_TABLE_METADATA: {
    ID: "EDIT_TABLE_METADATA",
    COMPONENT: NiceModal.create(TableEditMetadataDialog),
  },
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
