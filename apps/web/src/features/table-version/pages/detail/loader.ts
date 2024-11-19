import { buildTableIdentifier } from "@manifold/lib/utils/table-identifier";
import { z } from "@manifold/validators";
import { type LoaderFunctionArgs } from "react-router-dom";

import { tableVersionDetailParams } from "~features/table-version/pages/detail/params";
import { RoutingError } from "~utils/errors";
import type { TrpcUtils } from "~utils/trpc";

export function loaderBuilder(trpcUtils: TrpcUtils) {
  return async ({ params }: LoaderFunctionArgs) => {
    const p = z.object(tableVersionDetailParams).safeParse(params);

    if (p.success) {
      return await trpcUtils.tableVersion.get.fetch({
        tableIdentifier: buildTableIdentifier(p.data.username, p.data.slug),
        version: p.data.version,
      });
    }

    throw new RoutingError("Invalid params", { cause: p.error });
  };
}

export type TableVersionDetailLoaderData = Awaited<
  ReturnType<ReturnType<typeof loaderBuilder>>
>;
