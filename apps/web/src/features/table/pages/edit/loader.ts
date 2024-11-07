import { z } from "@manifold/validators";
import { type LoaderFunctionArgs } from "react-router-dom";

import { RoutingError } from "~utils/errors";
import type { TrpcUtils } from "~utils/trpc";

export function loaderBuilder(trpcUtils: TrpcUtils) {
  return async ({ params }: LoaderFunctionArgs) => {
    const id = z.string().safeParse(params.id);

    if (id.success) {
      return await trpcUtils.table.get.fetch({ id: id.data });
    }

    throw new RoutingError("Invalid Table ID");
  };
}

export type TableEditLoaderData = Awaited<
  ReturnType<ReturnType<typeof loaderBuilder>>
>;
