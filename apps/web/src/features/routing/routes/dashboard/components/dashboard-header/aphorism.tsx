import { getRandomElement } from "@manifold/lib/utils/array";

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
  return <span className={className}>{getRandomElement(SOURCES[source])}</span>;
}
