import { buildTableIdentifier } from "@manifold/lib/utils/table-identifier";
import { z } from "@manifold/validators";
import { type LoaderFunctionArgs } from "react-router-dom";

import { tableEditParams } from "~features/table/pages/edit/params";
import { RoutingError } from "~utils/errors";
import type { TrpcUtils } from "~utils/trpc";

export function loaderBuilder(trpcUtils: TrpcUtils) {
  return async ({ params }: LoaderFunctionArgs) => {
    const p = z.object(tableEditParams).safeParse(params);

    if (p.success) {
      return await trpcUtils.table.get.fetch({
        tableIdentifier: buildTableIdentifier(p.data.username, p.data.slug),
      });
    }

    throw new RoutingError("Invalid params", { cause: p.error });
  };
}

export type TableEditLoaderData = Awaited<
  ReturnType<ReturnType<typeof loaderBuilder>>
>;
