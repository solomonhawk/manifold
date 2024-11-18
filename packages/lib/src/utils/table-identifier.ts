// @TODO: verify this
const validTableIdentifierRegex = /^@[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/;

export function buildTableIdentifier(
  username: string,
  tableSlug: string,
): string {
  return `@${username}/${tableSlug}`;
}

export function parseTableIdentifier(identifier: string): {
  username: string;
  tableSlug: string;
} {
  if (!validTableIdentifierRegex.test(identifier)) {
    throw new Error("Invalid table identifier");
  }
  const [namespace, tableSlug] = identifier.split("/");

  return {
    username: namespace.slice(1),
    tableSlug,
  };
}
