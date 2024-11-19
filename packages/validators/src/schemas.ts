import { slugify } from "@manifold/lib/utils/string";
import { z } from "zod";

export function slug({ message }: { message: string }) {
  return z
    .string()
    .min(1, { message: "Can’t be blank" })
    .max(64, { message: "Must be 64 characters or less" })
    .refine((slug) => slug === slugify(slug), {
      message,
    });
}

export function optionalSlug({ message }: { message: string }) {
  return z
    .string()
    .max(64, { message: "Must be 64 characters or less" })
    .optional()
    .transform((x) => (x === "" ? undefined : x))
    .refine(
      (slug) => {
        if (slug === undefined) {
          return true;
        }

        return slug === slugify(slug);
      },
      { message },
    );
}
