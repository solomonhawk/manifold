import { cn } from "#lib/utils.ts";

type Props = {
  username: string;
  slug: string;
  className?: string;
};

export function TableIdentifier({ username, slug, className }: Props) {
  return (
    <code
      className={cn(
        "rounded bg-secondary p-3 px-6 leading-none text-accent-foreground",
        className,
      )}
    >
      @{username}/{slug}
    </code>
  );
}
