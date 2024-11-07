import type { table } from "#schema/table.ts";
import type { userProfiles } from "#schema/user.ts";

export type TableModel = typeof table.$inferSelect;
export type TableInsert = typeof table.$inferInsert;

export type UserProfileModel = typeof userProfiles.$inferSelect;
export type UserProfileInsert = typeof userProfiles.$inferInsert;
