import { getRandomElement } from "@manifold/lib";
import { useState } from "react";

const SOURCES = {
  dashboard: [
    "Do you feel lucky?",
    "You're in the right place.",
    "What chance will fate decide today?",
  ] as const satisfies string[],
} as const;

export function Aphorism({
  source,
  className,
}: {
  source: keyof typeof SOURCES;
  className?: string;
}) {
  const [aphorism] = useState(() => getRandomElement(SOURCES[source]));

  return <span className={className}>{aphorism}</span>;
}
