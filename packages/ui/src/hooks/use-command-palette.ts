import { useCallback, useEffect, useState } from "react";

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);

    return new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  }, []);

  return [isOpen, close] as const;
}
