import { type NiceModalHocProps, type useModal } from "@ebay/nice-modal-react";
import type { ComponentProps } from "react";

import type { DIALOGS } from "~features/dialog-manager";

/**
 * @NOTE: Workaround for TypeScript not being able to infer the correct type of
 * the component props when using `NiceModal.show` directly.
 *
 * @ref https://github.com/eBay/nice-modal-react/issues/134
 */
export type IdToComponent<Id extends string> = Id extends keyof typeof DIALOGS
  ? (typeof DIALOGS)[Id]["COMPONENT"]
  : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DialogProps<C extends React.FC<any>> = Omit<
  ComponentProps<C>,
  keyof NiceModalHocProps
> &
  Partial<NiceModalHocProps>;

export type WithDialog<T> = T & {
  dialog: ReturnType<typeof useModal>;
};
