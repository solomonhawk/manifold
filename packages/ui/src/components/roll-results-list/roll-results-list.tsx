import type { RollResult } from "@manifold/lib/models/roll";
import { CircleBackslashIcon, CubeIcon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "motion/react";
import { memo, type RefObject, useCallback, useRef, useState } from "react";
import { GoCheck, GoCopy, GoX } from "react-icons/go";

import {
  AnimatedList,
  AnimatedListItem,
} from "#components/animated-list/animated-list.js";
import { ClipboardCopy } from "#components/clipboard-copy/clipboard-copy.js";
import { Badge } from "#components/core/badge/badge.js";
import { Button } from "#components/core/button/button.js";
import { Card, CardContent } from "#components/core/card/card.js";
import { Typewriter } from "#components/typewriter/typewriter.js";
import { transitionAlpha } from "#lib/animation.ts";
import { cn } from "#lib/utils.js";

type Props = {
  className?: string;
  listRef?: RefObject<HTMLUListElement>;
  rollResults: RollResult[];
  onRemove?: (timestamp: number) => void;
  onClear?: () => void;
};

export function RollResultsList({
  className,
  listRef,
  rollResults,
  onRemove,
  onClear,
}: Props) {
  const ref = listRef ?? useRef<HTMLUListElement>(null);
  const [listOverflowing, setListOverflowing] = useState(false);

  const updateListOverflowing = useCallback(() => {
    if (ref.current) {
      setListOverflowing(ref.current.scrollHeight > ref.current.clientHeight);
    }
  }, [ref]);

  const handleRemoveResult = useCallback(
    (timestamp: number) => {
      onRemove?.(timestamp);
    },
    [onRemove],
  );

  return (
    <div className={cn("flex flex-col", className)}>
      <AnimatedList
        listRef={ref}
        className={cn("flex min-h-0 flex-col gap-12 overflow-auto", {
          "fade-list-overflowing": listOverflowing,
        })}
        transition={transitionAlpha}
        onLayoutAnimationStart={updateListOverflowing}
        onLayoutAnimationComplete={updateListOverflowing}
        layout
      >
        {rollResults.length === 0 ? (
          <AnimatedListItem
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            exit={{ opacity: 0, y: 8 }}
            transition={transitionAlpha}
          >
            <Card className="mb-16">
              <CardContent className="!p-12">
                <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
                  <CubeIcon className="size-16" />
                  Roll results will show up here.
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

      {onClear ? (
        <motion.div
          layout="position"
          transition={transitionAlpha}
          className={cn("fade-list-mask relative flex justify-end", {
            "fade-list-mask-visible": listOverflowing,
          })}
        >
          <AnimatePresence>
            {rollResults.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={transitionAlpha}
              >
                <Button
                  type="button"
                  onClick={onClear}
                  variant="destructive-outline"
                  className="my-16 gap-4"
                  disabled={rollResults.length === 0}
                >
                  <CircleBackslashIcon />
                  Clear Results
                </Button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </div>
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
    <Card className="group/list-item">
      <CardContent className="flex flex-col items-stretch gap-8 !p-16 @md:flex-row">
        <span className="grow">
          <Typewriter transition={transitionAlpha}>{text}</Typewriter>
        </span>

        <div className="flex w-full grow flex-row items-end justify-between gap-8 @md:w-auto @md:flex-col">
          <span className="flex items-center gap-8">
            <Badge variant="secondary" className="whitespace-nowrap">
              {tableName}
            </Badge>

            <span className="text-nowrap text-sm text-muted-foreground">
              {new Date(timestamp).toLocaleTimeString()}
            </span>
          </span>

          <div className="-mb-6 -mr-6 flex items-center gap-8 opacity-0 transition-opacity focus-within:opacity-100 group-hover/list-item:opacity-100 @md:m-0">
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
