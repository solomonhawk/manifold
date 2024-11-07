import { isError } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  type UIMatch,
  useMatches,
  useParams,
  useRouteError,
} from "react-router-dom";

import type { Handle } from "~features/routing/types";

const META_DESCRIPTION_ID = "meta-description";
const META_DESCRIPTION = document.getElementById(
  META_DESCRIPTION_ID,
) as HTMLMetaElement;

const DEFAULT_TITLE = "Manifold | Embrace the chaos";
const DEFAULT_DESCRIPTION =
  "A tool for curating your collection of random tables.";

/**
 * When the route changes, updates the document title.
 *
 * Uses the matched routes `handle` to determine the title based on the route
 * params and loader data.
 *
 * Typing this is hard with async loaders, so we rely on the route definition
 * to specify the data type:
 *
 *   ```ts
 *   {
 *     handle: ({ params, data }) => `Table ${data.title}`
 *   } satisfies Handle<Data>
 *   ```
 */
export function RouteMeta() {
  const params = useParams();
  const matches = useMatches() as UIMatch<unknown, Handle<unknown>>[];
  const error = useRouteError();

  const { handle, data } = matches[matches.length - 1];

  let title = DEFAULT_TITLE;
  let description = DEFAULT_DESCRIPTION;

  if (error) {
    title = isError(error) ? error.message : "Something went wrong";
    description = "We're not sure what happened, but we're looking into it.";
  } else if (handle && data) {
    title = handle.title?.({ params, data }) ?? DEFAULT_TITLE;
    description = handle.description?.({ params, data }) ?? DEFAULT_DESCRIPTION;
  }

  useEffect(() => {
    if (title) {
      document.title = title;
    }

    if (description && META_DESCRIPTION) {
      META_DESCRIPTION.content = description;
    }
  }, [description, title]);

  return null;
}
