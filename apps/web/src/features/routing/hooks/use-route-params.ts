import { z, type ZodObject, type ZodRawShape } from "@manifold/validators";
import { useLocation, useParams } from "react-router-dom";

import { RoutingError } from "~utils/errors";

export function useRouteParams<Schema extends ZodRawShape>(
  schema: Schema,
): z.infer<ZodObject<Schema>> {
  const location = useLocation();
  const params = useParams();

  try {
    return z.object(schema).parse(params);
  } catch (e) {
    throw new RoutingError(`Invalid route params for '${location.pathname}'`, {
      cause: e,
    });
  }
}
