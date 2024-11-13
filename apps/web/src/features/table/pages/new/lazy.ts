import type { Handle, LazyRoute } from "~features/routing/types";

export function loadTableNewRoute(): LazyRoute {
  return async () => {
    const { TableNew } = await import("~features/table/pages/new/page");

    return {
      Component: TableNew,
      handle: {
        title: () => "Manifold | New Table",
        description: () => "Create a new random table.",
      } satisfies Handle,
    };
  };
}
