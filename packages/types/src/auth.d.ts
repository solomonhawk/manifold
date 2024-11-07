import type { DefaultSession } from "@auth/core/types";
import type { UserProfileModel } from "@manifold/db";

declare module "@auth/core/types" {
  interface Session {
    userProfile?: UserProfileModel;
    user: {
      id: string;
      name: string;
      email: string;
      image: string;
    } & DefaultSession["user"];
  }
}
