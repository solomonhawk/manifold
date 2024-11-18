import type { RollResult, TableMetadata } from "@manifold/lib/models/roll";
import { RollResultsList } from "@manifold/ui/components/roll-results-list";
import { RollTableButtons } from "@manifold/ui/components/roll-table-buttons";
import { Button } from "@manifold/ui/components/ui/button";
import {
  Notice,
  NoticeContent,
  NoticeIcon,
} from "@manifold/ui/components/ui/notice";
import { transitionAlpha } from "@manifold/ui/lib/animation";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GoAlert } from "react-icons/go";
import { v4 as uuid } from "uuid";

import { workerInstance } from "~features/engine/components/editor/worker";
import { log } from "~utils/logger";

function RollPreview({ definition }: { definition: string }) {
  const [error, setError] = useState<string | null>(null);
  const [tableHash, setTableHash] = useState<string | null>(null);
  const [results, setResults] = useState<RollResult[]>([]);
  const [metadata, setMetadata] = useState<TableMetadata[]>([]);
  const [showExportedOnly, setShowExportedOnly] = useState(true);

  const handleRemoveResult = useCallback((timestamp: number) => {
    setResults((results) => results.filter((r) => r.timestamp !== timestamp));
  }, []);

  const handleClearResults = useCallback(() => {
    setResults([]);
  }, []);

  const handleRoll = useCallback(
    async (table: TableMetadata) => {
      if (!tableHash) {
        throw new Error("Missing table hash!");
      }

      try {
        const result = await workerInstance.gen(
          tableHash,
          definition,
          table.id,
        );

        setResults((current) => {
          return [
            {
              id: uuid(),
              tableName: table.title,
              tableId: table.id,
              timestamp: Date.now(),
              text: result,
            },
          ].concat(current);
        });
      } catch (e) {
        log.error(e);
        setError("Whoops! Couldn’t generate a result.");
      }
    },
    [definition, tableHash],
  );

  const visibleTableMetadata = useMemo(() => {
    if (showExportedOnly) {
      return metadata.filter((m) => m.export);
    }
    return metadata;
  }, [metadata, showExportedOnly]);

  useEffect(() => {
    async function prepareTableCollection() {
      try {
        const { hash, metadata } = await workerInstance.parse(definition);

        setTableHash(hash);
        setMetadata(metadata);
      } catch (e) {
        log.error(e);
        setError(
          "Something went wrong unexpectedly while parsing the table definition.",
        );
      }
    }

    prepareTableCollection();
  }, [definition]);

  if (error) {
    return (
      <Notice variant="error" className="mb-16 !py-6 !pr-6">
        <NoticeIcon className="flex items-center">
          <GoAlert className="size-16" />
        </NoticeIcon>

        <NoticeContent className="mt-0 flex items-center justify-between">
          {error}
          <Button
            className="ml-auto"
            size="sm"
            onClick={() => setError(null)}
            variant="outline"
          >
            Try again
          </Button>
        </NoticeContent>
      </Notice>
    );
  }

  return (
    <motion.section
      layout="preserve-aspect"
      className="flex flex-col gap-16"
      transition={transitionAlpha}
    >
      <RollTableButtons
        label="Try it out:"
        isEnabled
        onRoll={handleRoll}
        rollResults={results}
        showExportedOnly={showExportedOnly}
        setShowExportedOnly={setShowExportedOnly}
        tableMetadata={visibleTableMetadata}
      />
      <RollResultsList
        className="max-h-512"
        rollResults={results}
        onRemove={handleRemoveResult}
        onClear={handleClearResults}
      />
    </motion.section>
  );
}

export default RollPreview;
