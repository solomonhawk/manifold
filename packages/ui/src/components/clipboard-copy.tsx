import { type ClipboardOptions, useClipboard } from "#hooks/use-clipboard.ts";

type ChildProps = {
  copied: boolean;
  onCopy: (value: string) => void;
};

type Props = {
  children: (state: ChildProps) => React.ReactNode;
} & ClipboardOptions;

export function ClipboardCopy({ children, resetDuration, showToast }: Props) {
  const [copied, copyToClipboard] = useClipboard({
    resetDuration,
    showToast,
  });

  return children({
    copied,
    onCopy: copyToClipboard,
  });
}
