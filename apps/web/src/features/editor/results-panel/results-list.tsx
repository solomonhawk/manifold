import {
  AnimatedList,
  AnimatedListItem,
} from "@manifold/ui/components/animated-list";
import { ClipboardCopy } from "@manifold/ui/components/clipboard-copy";
import { Typewriter } from "@manifold/ui/components/typewriter";
import { Badge } from "@manifold/ui/components/ui/badge";
import { Button } from "@manifold/ui/components/ui/button";
import { Card, CardContent } from "@manifold/ui/components/ui/card";
import { transitionAlpha } from "@manifold/ui/lib/animation";
import { cn } from "@manifold/ui/lib/utils";
import { CircleBackslashIcon, CubeIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { useAtom } from "jotai";
import { memo, type RefObject, useCallback, useState } from "react";
import { GoCheck, GoPaste, GoX } from "react-icons/go";

import { rollHistory, type RollResult } from "~features/editor/state";

export function RollResults({
  listRef,
}: {
  listRef: RefObject<HTMLUListElement>;
}) {
  const [listOverflowing, setListOverflowing] = useState(false);
  const [rollResults, setRollResults] = useAtom(rollHistory);

  const handleClearResults = useCallback(
    function handleClearResults() {
      setRollResults([]);
    },
    [setRollResults],
  );

  const updateListOverflowing = useCallback(() => {
    if (listRef.current) {
      setListOverflowing(
        listRef.current.scrollHeight > listRef.current.clientHeight,
      );
    }
  }, [listRef]);

  const handleRemoveResult = useCallback(
    (timestamp: number) => {
      setRollResults((results) =>
        results.filter((r) => r.timestamp !== timestamp),
      );
    },
    [setRollResults],
  );

  return (
    <>
      <AnimatedList
        className={cn("flex min-h-0 flex-col gap-8 overflow-auto px-16", {
          "fade-bottom-90 pb-[5%]": listOverflowing,
        })}
        transition={transitionAlpha}
        listRef={listRef}
        onLayoutAnimationStart={updateListOverflowing}
        onLayoutAnimationComplete={updateListOverflowing}
      >
        {rollResults.length === 0 ? (
          <AnimatedListItem
            key="empty"
            initial={{ opacity: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.05 } }}
            transition={transitionAlpha}
            layout="position"
          >
            <Card>
              <CardContent className="!p-16">
                <div className="text-muted-foreground flex items-center justify-center gap-8">
                  <CubeIcon className="size-24" />
                  Your roll results will show up here.
                </div>
              </CardContent>
            </Card>
          </AnimatedListItem>
        ) : null}

        {rollResults.map((result) => (
          <AnimatedListItem key={result.timestamp} transition={transitionAlpha}>
            <ListItem
              text={result.text}
              tableName={result.tableName}
              timestamp={result.timestamp}
              onRemove={handleRemoveResult}
            />
          </AnimatedListItem>
        ))}
      </AnimatedList>

      <motion.div
        layout
        transition={transitionAlpha}
        className="flex justify-end p-16"
      >
        <div
          className={cn("duration-500", {
            "!opacity-0": rollResults.length === 0,
          })}
        >
          <Button
            type="button"
            onClick={handleClearResults}
            variant="destructive-outline"
            className="gap-4"
            disabled={rollResults.length === 0}
          >
            <CircleBackslashIcon />
            Clear Results
          </Button>
        </div>
      </motion.div>
    </>
  );
}

const ListItem = memo(function ({
  text,
  tableName,
  timestamp,
  onRemove,
}: Pick<RollResult, "text" | "tableName" | "timestamp"> & {
  onRemove?: (timestamp: number) => void;
}) {
  return (
    <Card className="group">
      <CardContent className="@md:flex-row flex flex-col items-stretch gap-8 !p-16">
        <span className="grow">
          <Typewriter transition={transitionAlpha}>{text}</Typewriter>
        </span>

        <div className="@md:flex-col @md:w-auto flex w-full grow flex-row items-end justify-between gap-8">
          <span className="flex items-center gap-8">
            <Badge variant="secondary" className="whitespace-nowrap">
              {tableName}
            </Badge>

            <span className="text-nowrap text-sm text-slate-400">
              {new Date(timestamp).toLocaleTimeString()}
            </span>
          </span>

          <div className="@md:m-0 -mb-6 -mr-6 flex items-center gap-8 opacity-0 transition-opacity group-hover:opacity-100">
            <ClipboardCopy>
              {({ copied, onCopy }) => {
                return (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onCopy(text)}
                    disabled={copied}
                  >
                    {copied ? <GoCheck /> : <GoPaste />}
                  </Button>
                );
              }}
            </ClipboardCopy>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onRemove?.(timestamp)}
            >
              <GoX />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
