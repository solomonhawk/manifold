import type { AdapterAccountType } from "@auth/core/adapters";
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { createTable } from "#schema/_table.ts";

export const users = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = createTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // I don't love having to add `@auth/core` as a dependency to the db package just to get this type
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("accounts_userId_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: text("sessionToken").primaryKey(),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("sessions_userId_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  }),
);

export const authenticators = createTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  }),
);
