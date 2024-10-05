import { atom } from "jotai";

export type RollResult = {
  tableName: string;
  tableId: string;
  timestamp: number;
  text: string;
};

export type TableMetadata = {
  id: string;
  title: string;
  export: boolean;
};

export const tableError = atom<string | null>(null);

export const currentTableHash = atom<string | null>(null);

export const currentTableMetadata = atom<TableMetadata[]>([]);

export const exportedOnly = atom(true);

export const visibleTableMetadata = atom((get) => {
  const metadata = get(currentTableMetadata);
  const exported = get(exportedOnly);

  if (exported) {
    return metadata.filter((m) => m.export);
  }

  return metadata;
});

export const rollHistory = atom<RollResult[]>([]);
