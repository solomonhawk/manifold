export type RollResult = {
  id: string;
  tableName: string;
  tableId: string;
  timestamp: number;
  text: string;
};

export type TableMetadata = {
  id: string;
  title: string;
  export: boolean;
  namespace: string | undefined;
};
