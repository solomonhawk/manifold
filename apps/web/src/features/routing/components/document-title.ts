import { useEffect } from "react";
import { type UIMatch, useMatches, useParams } from "react-router-dom";

import type { Handle } from "~features/routing/types";

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
export function DocumentTitle() {
  const params = useParams();
  const matches = useMatches() as UIMatch<unknown, Handle<unknown>>[];

  const { handle, data } = matches[matches.length - 1];
  const title = handle && handle.title?.({ params, data });

  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);

  return null;
}
