import { buildTableIdentifier } from "@manifold/lib";
import { z } from "@manifold/validators";
import { type LoaderFunctionArgs } from "react-router-dom";

import { tableDetailParams } from "~features/table/pages/detail/params";
import { RoutingError } from "~utils/errors";
import type { TrpcUtils } from "~utils/trpc";

export function loaderBuilder(trpcUtils: TrpcUtils) {
  return async ({ params }: LoaderFunctionArgs) => {
    const p = z.object(tableDetailParams).safeParse(params);

    if (p.success) {
      return await trpcUtils.table.get.fetch({
        tableIdentifier: buildTableIdentifier(p.data.username, p.data.slug),
      });
    }

    throw new RoutingError("Invalid params", { cause: p.error });
  };
}

export type TableDetailLoaderData = Awaited<
  ReturnType<ReturnType<typeof loaderBuilder>>
>;
