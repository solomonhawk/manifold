import { signIn, useSession } from "@manifold/auth/client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@manifold/ui/components/ui/resizable";
import { useRef } from "react";

import { trpc } from "~/utils/trpc";

import { InputPanel } from "./input-panel";
import { AvailableTables, RollResults } from "./results-panel";

export function Editor() {
  const { data: session, status } = useSession();
  console.log(session, status);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const query = trpc.hello.useQuery();

  console.log(query.status, query.isLoading, query.data);

  async function handleSignIn() {
    const result = await signIn("google");
    console.log(result);
  }

  if (status === "loading") {
    return null;
  }

  if (status === "unauthenticated") {
    return <button onClick={handleSignIn}>Sign in</button>;
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="flex min-h-full">
      <ResizablePanel
        minSize={20}
        defaultSize={30}
        className="flex flex-col flex-1 lg:flex-initial"
      >
        <InputPanel textAreaRef={textAreaRef} />
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel minSize={50} className="flex flex-col flex-1">
        <div className="flex flex-1 flex-col min-h-0">
          <AvailableTables textAreaRef={textAreaRef} />
          <RollResults />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
