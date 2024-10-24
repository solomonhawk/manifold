import { useSession } from "@manifold/auth/client";

import { Editor } from "#features/editor/editor.tsx";

export function Component() {
  const auth = useSession();

  let greeting = "Hello";
  if (auth.status === "authenticated") {
    greeting = `Hello, ${auth.data?.user?.name.split(" ")[0]} ✌️`;
  }

  return (
    <div className="flex flex-col grow p-12 sm:p-16 min-h-0">
      <h2 className="mb-16">{greeting}</h2>
      <Editor />
    </div>
  );
}
