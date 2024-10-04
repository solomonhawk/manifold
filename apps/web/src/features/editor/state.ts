import { atom } from "jotai";

type RollResult = {
  tableId: string;
  timestamp: number;
  text: string;
};

export const tableError = atom<string | null>(null);

export const currentTableHash = atom<string | null>(null);

export const currentTableIds = atom<string[]>([]);

export const rollHistory = atom<RollResult[]>([]);
