import { timestamp } from "drizzle-orm/pg-core";

export const timestamps = {
  createdAt: timestamp("updated_at").defaultNow().notNull(),
  updatedAt: timestamp("created_at")
    .$onUpdate(() => new Date())
    .defaultNow()
    .notNull(),
  deletedAt: timestamp("deleted_at"),
};
