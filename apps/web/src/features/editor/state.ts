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
};

export const tableError = atom<string | null>(null);

export const currentTableHash = atom<string | null>(null);

export const currentTableMetadata = atom<TableMetadata[]>([]);

export const rollHistory = atom<RollResult[]>([]);
