export function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function flatten<T>(arr: T[][]): T[] {
  return ([] as T[]).concat(...arr);
}
