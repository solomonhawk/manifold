import slugify from "@sindresorhus/slugify";

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function pluralize(str: string, count: number) {
  return count === 1 ? str : `${str}s`;
}

export { slugify };
