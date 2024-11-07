import { z } from "zod";

export const userProfileCreateInput = z.object({
  description: z.string().optional(),
  username: z.string().min(1, { message: "Username can’t be blank" }),
});

export type UserProfileCreateInput = z.infer<typeof userProfileCreateInput>;
