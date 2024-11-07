import { eq } from "drizzle-orm";

import { db } from "#db.ts";
import * as schema from "#schema/index.ts";
import type { UserProfileInsert } from "#types.ts";

export async function getProfile(userId: string) {
  const profile = await db.query.userProfiles.findFirst({
    where: eq(schema.userProfiles.userId, userId),
  });

  return profile || null;
}

export async function createProfile(
  userId: string,
  input: Omit<UserProfileInsert, "userId">,
) {
  const [table] = await db
    .insert(schema.userProfiles)
    .values({ ...input, userId })
    .returning()
    .execute();

  return table;
}
