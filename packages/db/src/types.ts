import type { tables, tableVersions } from "#schema/table.ts";
import type { userProfiles } from "#schema/user.ts";

export type TableModel = typeof tables.$inferSelect;
export type TableInsert = typeof tables.$inferInsert;

export type TableVersionModel = typeof tableVersions.$inferSelect;
export type TableVersionInsert = typeof tableVersions.$inferInsert;

export type UserProfileModel = typeof userProfiles.$inferSelect;
export type UserProfileInsert = typeof userProfiles.$inferInsert;

export type TableVersionSummary = {
  id: string;
  version: number;
  tableSlug: string;
  ownerId: string;
  createdAt: string;
  definition: string;
  description: string;
};
