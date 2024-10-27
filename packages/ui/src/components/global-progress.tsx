import { useNProgress } from "@tanem/react-nprogress";

import { cn } from "#lib/utils.js";

type Props = {
  isAnimating: boolean;
};

export function GlobalProgress({ isAnimating }: Props) {
  const { animationDuration, isFinished, progress } = useNProgress({
    isAnimating,
  });

  return (
    <Container animationDuration={animationDuration} isFinished={isFinished}>
      <Bar animationDuration={animationDuration} progress={progress} />
    </Container>
  );
}

function Container({
  animationDuration,
  isFinished,
  children,
}: {
  animationDuration: number;
  isFinished: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        isFinished ? "opacity-0" : "opacity-1",
        "pointer-events-none transition-opacity",
      )}
      style={{
        transitionDuration: `${animationDuration}ms`,
      }}
    >
      {children}
    </div>
  );
}

function Bar({
  animationDuration,
  progress,
}: {
  animationDuration: number;
  progress: number;
}) {
  return (
    <div
      className={cn(
        "bg-ring fixed left-0 top-0 z-50 h-2 w-full transition-all",
      )}
      style={{
        marginLeft: `${(-1 + progress) * 100}%`,
        transitionDuration: `${animationDuration}ms`,
      }}
    >
      <div
        className="absolute right-0 block h-full w-full opacity-100"
        style={{
          boxShadow: "0 0 10px var(--ring), 0 0 5px var(--ring)",
          transform: "rotate(3deg) translate(0px, -4px)",
        }}
      />
    </div>
  );
}
