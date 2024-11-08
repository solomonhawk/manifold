import { relations } from "drizzle-orm";
import { index, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { accounts } from "#schema/auth.ts";
import { createTable } from "#schema/helpers/create-table.ts";
import { timestamps } from "#schema/helpers/timestamps.ts";
import { tables } from "#schema/table.ts";

export const users = createTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
});

export const userProfiles = createTable(
  "user_profile",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    description: text("description"),
    username: text("username").notNull().unique(),
    ...timestamps,
  },
  (userProfile) => [
    primaryKey({
      columns: [userProfile.userId, userProfile.username],
    }),
    index("user_profiles_user_id_idx").on(userProfile.userId),
  ],
);

export const usersRelations = relations(users, ({ one, many }) => ({
  accounts: many(accounts),
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  tables: many(tables, {
    relationName: "tables",
  }),
}));
