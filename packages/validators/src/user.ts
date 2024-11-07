import { z } from "zod";

import { slug } from "./schemas";

export const userProfileCreateInput = z.object({
  description: z.string().optional(),
  username: slug({ message: "Username is invalid" }),
});

export type UserProfileCreateInput = z.infer<typeof userProfileCreateInput>;
