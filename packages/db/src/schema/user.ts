import { relations } from "drizzle-orm";
import { index, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { accounts } from "#schema/auth.ts";
import { createTable } from "#schema/helpers/create-table.ts";
import { timestamps } from "#schema/helpers/timestamps.ts";

export const users = createTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));
