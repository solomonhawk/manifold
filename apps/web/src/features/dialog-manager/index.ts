import NiceModal, { type NiceModalHocProps } from "@ebay/nice-modal-react";
import type { ComponentProps } from "react";

import { TableDeleteDialog } from "~features/table/components/table-delete-dialog";

/**
 * @NOTE: Workaround for TypeScript not being able to infer the correct type of
 * the component props when using `NiceModal.show` directly.
 *
 * @ref https://github.com/eBay/nice-modal-react/issues/134
 */
type IdToComponent<Id extends string> = Id extends keyof typeof DIALOGS
  ? (typeof DIALOGS)[Id]["component"]
  : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Props<C extends React.FC<any>> = Omit<
  ComponentProps<C>,
  keyof NiceModalHocProps
> &
  Partial<NiceModalHocProps>;

// export function showModal<
//   Id extends string,
//   C extends IdToComponent<Id> = IdToComponent<Id>,
// >(id: Id, props: Props<C>) {
//   return NiceModal.show(id, props);
// }

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
    component: NiceModal.create(TableDeleteDialog),
  },
} as const;

DialogManager.register(DIALOGS.DELETE_TABLE.ID, DIALOGS.DELETE_TABLE.component);
