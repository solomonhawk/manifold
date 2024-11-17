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
import { useAtom } from "jotai";
import { motion } from "motion/react";
import { memo, type RefObject, useCallback, useState } from "react";
import { GoCheck, GoCopy, GoX } from "react-icons/go";

import {
  rollHistoryAtom,
  type RollResult,
} from "~features/editor/components/editor/state";

export function RollResults({
  listRef,
}: {
  listRef: RefObject<HTMLUListElement>;
}) {
  const [listOverflowing, setListOverflowing] = useState(false);
  const [rollResults, setRollResults] = useAtom(rollHistoryAtom);

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
          "fade-list-overflowing": listOverflowing,
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
                <div className="flex items-center justify-center gap-8 text-muted-foreground">
                  <CubeIcon className="size-24" />
                  Your roll results will show up here.
                </div>
              </CardContent>
            </Card>
          </AnimatedListItem>
        ) : null}

        {rollResults.map((result) => (
          <AnimatedListItem key={result.id} transition={transitionAlpha}>
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
        className={cn("fade-list-mask relative flex justify-end", {
          "fade-list-mask-visible": listOverflowing,
        })}
      >
        <div
          className={cn("p-16 duration-500", {
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
      <CardContent className="flex flex-col items-stretch gap-8 !p-16 @md:flex-row">
        <span className="grow">
          <Typewriter transition={transitionAlpha}>{text}</Typewriter>
        </span>

        <div className="flex w-full grow flex-row items-end justify-between gap-8 @md:w-auto @md:flex-col">
          <span className="flex items-center gap-8">
            <Badge variant="secondary" className="whitespace-nowrap">
              {tableName}
            </Badge>

            <span className="text-nowrap text-sm text-slate-400">
              {new Date(timestamp).toLocaleTimeString()}
            </span>
          </span>

          <div className="-mb-6 -mr-6 flex items-center gap-8 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 @md:m-0">
            <ClipboardCopy>
              {({ copied, onCopy }) => {
                return (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={copied ? undefined : () => onCopy(text)}
                  >
                    {copied ? <GoCheck /> : <GoCopy size={12} />}
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
              <GoX size={16} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ListItem.displayName = "ListItem";
