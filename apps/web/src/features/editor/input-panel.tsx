import { useAtomValue } from "jotai";
import type { ChangeEvent, Ref } from "react";
import { tableError } from "./state";

type Props = {
  textAreaRef: Ref<HTMLTextAreaElement>;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
};

export function InputPanel({ textAreaRef, onChange }: Props) {
  const error = useAtomValue(tableError);

  return (
    <>
      <textarea
        ref={textAreaRef}
        name="tabol-definition"
        className="w-full flex-1 p-4"
        rows={20}
        cols={48}
        onChange={onChange}
      ></textarea>
      {error && <span className="p-2 line-clamp-5 overflow-auto">{error}</span>}
    </>
  );
}
