import { useEffect, useRef, useState } from "react";

type UseStateGuardOptions = {
  min?: number;
};

export function useStateGuard<T>(value: T, options?: UseStateGuardOptions) {
  const latestValueRef = useRef(value);
  const cooldownRef = useRef<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [guardedValue, setGuardedValue] = useState(value);

  const { min } = { min: 1000, ...options };

  useEffect(() => {
    if (value === latestValueRef.current) {
      return;
    }

    latestValueRef.current = value;

    if (!cooldownRef.current) {
      setGuardedValue(value);
    }

    cooldownRef.current = true;

    // cancel the existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // after the duration elapses, reset the cooldown and synchronize the guarded value
    timerRef.current = setTimeout(() => {
      cooldownRef.current = false;
      setGuardedValue(latestValueRef.current);
    }, min);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [min, value]);

  return guardedValue;
}
