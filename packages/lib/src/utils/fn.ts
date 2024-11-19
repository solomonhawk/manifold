/**
 * Compose a series of functions. Each will be called with the original arguments.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function compose(...fns: (undefined | ((...args: any[]) => any))[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (...args: any[]) => {
    for (const fn of fns) {
      fn?.(...args);
    }
  };
}
