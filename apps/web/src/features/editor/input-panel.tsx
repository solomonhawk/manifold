import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, type ChangeEvent, type RefObject } from "react";
import { currentTableHash, currentTableMetadata, tableError } from "./state";
import { workerInstance } from "./worker";

type Props = {
  textAreaRef: RefObject<HTMLTextAreaElement>;
};

export function InputPanel({ textAreaRef }: Props) {
  const error = useAtomValue(tableError);

  const setTableHash = useSetAtom(currentTableHash);
  const setError = useSetAtom(tableError);
  const setTableMetadata = useSetAtom(currentTableMetadata);

  const handleChange = useCallback(
    async function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
      const value = e.target.value.trim();

      try {
        if (value) {
          const { hash, metadata } = await workerInstance.parse(value);

          setTableHash(hash);
          setTableMetadata(metadata);
        } else {
          setTableHash(null);
          setTableMetadata([]);
        }

        setError(null);
      } catch (e: unknown) {
        console.error(e);
        setError(String(e));
      }
    },
    [setError, setTableHash, setTableMetadata]
  );

  return (
    <>
      <textarea
        ref={textAreaRef}
        name="tabol-definition"
        className="w-full flex-1 p-4 font-mono text-sm"
        rows={20}
        cols={48}
        onChange={handleChange}
      ></textarea>

      {error && (
        <span className="p-4 line-clamp-5 overflow-auto text-sm bg-destructive font-semibold">
          {error}
        </span>
      )}
    </>
  );
}
