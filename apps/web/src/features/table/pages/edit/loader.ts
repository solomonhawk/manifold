import { z } from "@manifold/validators";
import { type LoaderFunctionArgs } from "react-router-dom";

import type { TrpcUtils } from "~utils/trpc";

export function loaderBuilder(trpcUtils: TrpcUtils) {
  return async ({ params }: LoaderFunctionArgs) => {
    const id = z.string().safeParse(params.id);

    if (id.success) {
      await trpcUtils.table.get.prefetch(id.data);
      return null;
    }

    throw new Error("Invalid Table ID");
  };
}
