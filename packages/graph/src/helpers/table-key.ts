import { slugify } from "@manifold/lib/utils/string";

export function tablePackagesTableKey(
  tableIdentifier: string,
  version: number | "latest",
) {
  return slugify(`${tableIdentifier}-${version}`);
}
