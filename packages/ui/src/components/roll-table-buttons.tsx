import type { RollResult, TableMetadata } from "@manifold/lib/models/roll";
import { AnimatedList } from "@manifold/ui/components/animated-list";
import { ClipboardCopy } from "@manifold/ui/components/clipboard-copy";
import { Button } from "@manifold/ui/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@manifold/ui/components/ui/tooltip";
import { transitionAlpha } from "@manifold/ui/lib/animation";
import { motion } from "motion/react";
import { memo, useCallback } from "react";
import {
  GoCheck,
  GoCopy,
  GoLinkExternal,
  GoListUnordered,
} from "react-icons/go";

import { cn } from "#lib/utils.js";

type Props = {
  className?: string;
  isEnabled?: boolean;
  onRoll: (table: TableMetadata) => void;
  rollResults: RollResult[];
  tableMetadata: TableMetadata[];
  showExportedOnly: boolean;
  setShowExportedOnly: (show: boolean) => void;
};

function RollableTableButtonsComponent({
  className,
  isEnabled = true,
  onRoll,
  rollResults,
  tableMetadata,
  showExportedOnly,
  setShowExportedOnly,
}: Props) {
  const handleRoll = useCallback(
    async function handleRoll(e: React.MouseEvent, table: TableMetadata) {
      e.preventDefault();
      onRoll(table);
    },
    [onRoll],
  );

  return (
    <div className={cn("flex flex-col gap-16", className)}>
      <div className="flex items-center justify-between gap-8 divide-x">
        <AnimatedList
          className="flex flex-wrap gap-8"
          transition={transitionAlpha}
        >
          {tableMetadata.length > 0
            ? tableMetadata.map((table) => {
                return (
                  <motion.li
                    key={table.id}
                    layout="position"
                    transition={transitionAlpha}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => handleRoll(e, table)}
                      className={table.export ? "font-semibold" : undefined}
                      disabled={!isEnabled}
                    >
                      {table.title}
                    </Button>
                  </motion.li>
                );
              })
            : null}
        </AnimatedList>

        <div className="flex gap-8 pl-8">
          <ClipboardCopy>
            {({ copied, onCopy }) => {
              return (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        onCopy(rollResults.map((r) => r.text).join("\n\n"))
                      }
                      disabled={rollResults.length === 0}
                    >
                      <span className="sr-only">Copy all</span>

                      {copied ? <GoCheck /> : <GoCopy size={12} />}
                    </Button>
                  </TooltipTrigger>

                  <TooltipContent>Copy all rolls</TooltipContent>
                </Tooltip>
              );
            }}
          </ClipboardCopy>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowExportedOnly(!showExportedOnly)}
              >
                <span className="sr-only">
                  {showExportedOnly ? "Show all tables" : "Show exported only"}
                </span>

                {showExportedOnly ? <GoListUnordered /> : <GoLinkExternal />}
              </Button>
            </TooltipTrigger>

            <TooltipContent>
              {showExportedOnly ? "Show all tables" : "Show exported only"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

export const RollTableButtons = memo(RollableTableButtonsComponent);
