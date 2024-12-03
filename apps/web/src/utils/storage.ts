import type { SetStateAction } from "jotai";
import { useCallback, useEffect, useState } from "react";
import { createStorage, type StorageValue } from "unstorage";
import localStorageDriver from "unstorage/drivers/localstorage";

export const storage = createStorage({
  driver: localStorageDriver({ base: "manifold:" }),
});

export function useManifoldStorage<T extends StorageValue>(
  key: string,
  initialValue: T,
): [T, (value: (prevState: T) => T) => void] {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    async function initialize() {
      const existingValue = await storage.getItem(key);

      if (existingValue === null && typeof initialValue !== "undefined") {
        await storage.setItem(key, initialValue);
      }
    }

    initialize();
  }, [key, initialValue]);

  const set = useCallback(
    (updater: SetStateAction<T>) => {
      const newValue = typeof updater === "function" ? updater(value) : updater;
      storage.setItem(key, newValue);
      setValue(newValue);
    },
    [value, key],
  );

  return [value, set];
}
