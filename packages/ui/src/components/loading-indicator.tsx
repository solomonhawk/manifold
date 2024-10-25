import { RiLoader3Line } from "react-icons/ri";

type Props = {
  className?: string;
  children?: string;
};

export function LoadingIndicator({ className, children }: Props) {
  return (
    <div className={className}>
      <RiLoader3Line className="animate-spin size-24" />
      <span className="sr-only">{children || "Loading"}</span>
    </div>
  );
}
