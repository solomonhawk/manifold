import { useCallback, useEffect, useRef } from "react";

export function useReturnFocus(isActive: boolean) {
  const target = useRef<HTMLElement | null>(null);

  const returnFocus = useCallback(() => {
    const elementToFocus = target.current;

    if (elementToFocus) {
      requestAnimationFrame(() => {
        elementToFocus.focus();
      });
    }

    target.current = null;
  }, []);

  useEffect(() => {
    if (isActive && !target.current) {
      target.current = document.activeElement as HTMLElement;
    }

    return () => {
      target.current = null;
    };
  }, [isActive]);

  return returnFocus;
}
