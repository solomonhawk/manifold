import { useSetAtom } from "jotai";
import {
  type ChangeEvent,
  type MutableRefObject,
  useCallback,
  useEffect,
} from "react";
import type { RefCallBack } from "react-hook-form";

import { currentTableHash, currentTableMetadata } from "./state";
import { workerInstance } from "./worker";

type Props = {
  inputRef: MutableRefObject<HTMLTextAreaElement>;
  refCallback: RefCallBack;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  onParseError: (error: string) => void;
  onParseSuccess: () => void;
};

export function InputPanel({
  inputRef,
  refCallback,
  name,
  value,
  onChange,
  onBlur,
  onParseError,
  onParseSuccess,
}: Props) {
  const setTableHash = useSetAtom(currentTableHash);

  const setTableMetadata = useSetAtom(currentTableMetadata);

  const parseAndValidate = useCallback(
    async function parseAndValidate(value: string) {
      try {
        if (value) {
          const { hash, metadata } = await workerInstance.parse(value);

          setTableHash(hash);
          setTableMetadata(metadata);
          onParseSuccess();
        } else {
          setTableHash(null);
          setTableMetadata([]);
        }
      } catch (e: unknown) {
        console.error(e);

        onParseError(String(e));
      }
    },
    [onParseSuccess, onParseError, setTableHash, setTableMetadata],
  );

  const handleChange = useCallback(
    function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
      const currentValue = e.target.value;
      parseAndValidate(currentValue.trim());
      onChange(currentValue);
    },
    [onChange, parseAndValidate],
  );

  useEffect(() => {
    if (value) {
      parseAndValidate(value);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <textarea
        className="w-full flex-1 p-16 font-mono text-sm resize-none bg-background/60"
        ref={(node) => {
          // @NOTE: kind of annoying, RHF wants to use a ref callback, but we also want to use a ref object
          refCallback(node);

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          inputRef.current = node!;
        }}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      ></textarea>
    </>
  );
}
