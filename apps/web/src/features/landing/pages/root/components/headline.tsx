import { getRandomElement } from "@manifold/lib/utils/array";
import {
  AnimatedList,
  AnimatedListItem,
} from "@manifold/ui/components/animated-list";
import { Typewriter } from "@manifold/ui/components/typewriter";
import { Button } from "@manifold/ui/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@manifold/ui/components/ui/tooltip";
import { transitionAlpha, transitionBeta } from "@manifold/ui/lib/animation";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { GoInfo } from "react-icons/go";

import { PrefetchableLink } from "~features/routing/components/prefetchable-link";
import { trpc } from "~utils/trpc";

/**
 * Compute a unique key for each word in a list, based on the number of
 * occurrences of that word.
 */
const computeKeys = (words: string[]) => {
  const wordCount: Record<string, number> = {};
  return words.map((word) => {
    wordCount[word] = (wordCount[word] || 0) + 1;
    return `${word}-${wordCount[word]}`;
  });
};

const HEADLINE_INTERVAL = 3000;

// @NOTE: generated with /t/dyr/manifold-hooks/v/3
const HEADLINES = [
  "A tool for making random lists for your D&D games, made with childlike wonder.",
  "A tool for making stochastic suggestions for your Pathfinder games, made with science and technology.",
  "A tool for making unpredictable tables for your Pathfinder games, made with love.",
  "A tool for making unpredictable lists for your TTRPG needs, made with code.",
  "A tool for making random outcomes for joy and entertainment, made with love.",
  "A tool for making random suggestions for your D&D games, made with hopes and dreams.",
  "A tool for making random tables for fun and profit, made with science and technology.",
  "A tool for making unpredictable outcomes for fun and profit, made with science and technology.",
  "A tool for making stochastic outcomes for your D&D games, made with love.",
  "A tool for making unpredictable outcomes for your D&D games, made with science and technology.",
  "A tool for making random tables for your D&D games, made with care and thoughtfulness.",
  "A tool for making unpredictable tables for your TTRPG needs, made with care and thoughtfulness.",
  "A tool for making stochastic tables for your D&D games, made with love.",
  "A tool for making stochastic outcomes for your D&D games, made with code.",
  "A tool for making stochastic suggestions for fun and profit, made with hopes and dreams.",
  "A tool for making unpredictable outcomes for your D&D games, made with code.",
  "A tool for making unpredictable suggestions for your worldbuilding needs, made with childlike wonder.",
  "A tool for making stochastic tables for your D&D games, made with code.",
  "A tool for making stochastic lists for your TTRPG needs, made with science and technology.",
  "A tool for making unpredictable outcomes for your D&D games, made with hopes and dreams.",
  "A tool for making stochastic suggestions for your TTRPG needs, made with love.",
  "A tool for making unpredictable outcomes for your TTRPG needs, made with science and technology.",
  "A tool for making stochastic lists for your worldbuilding needs, made with love.",
  "A tool for making unpredictable outcomes for your TTRPG needs, made with hopes and dreams.",
  "A tool for making unpredictable lists for joy and entertainment, made with hopes and dreams.",
  "A tool for making random suggestions for your D&D games, made with hopes and dreams.",
  "A tool for making unpredictable suggestions for your TTRPG needs, made with love.",
  "A tool for making unpredictable lists for your D&D games, made with care and thoughtfulness.",
  "A tool for making random lists for joy and entertainment, made with care and thoughtfulness.",
  "A tool for making random tables for your D&D games, made with science and technology.",
  "A tool for making unpredictable lists for your worldbuilding needs, made with hopes and dreams.",
  "A tool for making unpredictable outcomes for your TTRPG needs, made with childlike wonder.",
  "A tool for making unpredictable tables for fun and profit, made with hopes and dreams.",
  "A tool for making random lists for your D&D games, made with science and technology.",
  "A tool for making random lists for your D&D games, made with science and technology.",
  "A tool for making random suggestions for fun and profit, made with hopes and dreams.",
  "A tool for making random lists for your D&D games, made with love.",
  "A tool for making random tables for your worldbuilding needs, made with code.",
  "A tool for making stochastic tables for fun and profit, made with love.",
  "A tool for making random outcomes for your Pathfinder games, made with hopes and dreams.",
  "A tool for making random tables for fun and profit, made with love.",
  "A tool for making unpredictable lists for your TTRPG needs, made with care and thoughtfulness.",
  "A tool for making stochastic tables for your TTRPG needs, made with love.",
  "A tool for making unpredictable outcomes for your Pathfinder games, made with science and technology.",
  "A tool for making unpredictable tables for your D&D games, made with science and technology.",
  "A tool for making stochastic lists for your TTRPG needs, made with love.",
  "A tool for making stochastic tables for your worldbuilding needs, made with childlike wonder.",
  "A tool for making stochastic outcomes for your Pathfinder games, made with love.",
  "A tool for making unpredictable lists for your Pathfinder games, made with care and thoughtfulness.",
  "A tool for making random tables for your Pathfinder games, made with childlike wonder.",
];

export function Headline() {
  const [rendered, setRendered] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [headline, setHeadline] = useState(getRandomElement(HEADLINES));
  const [isAnimating, setIsAnimating] = useState(!shouldReduceMotion);
  const [{ authorCount, tablesCount, tableVersionsCount }] =
    trpc.tableVersion.summary.useSuspenseQuery();

  const words = headline.split(" ");
  const wordKeys = computeKeys(words);

  const cycleHeadline = useCallback(() => {
    const nextHeadline = getRandomElement(HEADLINES);

    if (nextHeadline === headline) {
      cycleHeadline();
    } else {
      setHeadline(nextHeadline);
    }
  }, [headline]);

  useEffect(() => {
    if (isAnimating && !intervalRef.current) {
      const interval = setInterval(cycleHeadline, HEADLINE_INTERVAL);
      intervalRef.current = interval;

      return () => {
        clearInterval(interval);
        intervalRef.current = null;
      };
    }

    return;
  }, [cycleHeadline, isAnimating]);

  useLayoutEffect(() => {
    setRendered(true);
  }, []);

  useEffect(() => {
    function onVisibilityChange() {
      setIsAnimating(!document.hidden);
    }

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  const variants = {
    initial: {
      opacity: 0,
      y: 12,
      transition: transitionBeta,
      color: "hsl(var(--accent-foreground))",
    },
    enter: {
      opacity: 1,
      y: 0,
      transition: { delay: rendered ? 0.3 : 0, ...transitionAlpha },
      color: "hsl(var(--foreground))",
    },
    exit: {
      opacity: 0,
      y: -12,
      transition: transitionBeta,
      color: "hsl(var(--accent-foreground))",
    },
  };

  return (
    <LayoutGroup>
      <header className="flex min-h-screen flex-col items-center justify-center gap-16 px-16 sm:gap-24 md:gap-32 md:px-20 lg:px-24">
        <h2 className="text-center text-2xl font-bold !leading-[1.1] sm:text-3xl md:text-4xl lg:text-5xl">
          <AnimatedList
            transition={transitionAlpha}
            className="text-balance"
            initial
          >
            {words.map((word, i) => {
              return (
                <AnimatedListItem
                  key={wordKeys[i]}
                  layout="preserve-aspect"
                  className="inline-block whitespace-pre"
                  variants={shouldReduceMotion ? undefined : variants}
                  initial="initial"
                  animate="enter"
                  exit="exit"
                >
                  {word}
                  {i < words.length - 1 ? " " : ""}
                </AnimatedListItem>
              );
            })}
          </AnimatedList>
        </h2>

        <motion.h3
          layout
          className="mb-36 text-balance text-center text-base sm:text-lg md:mb-48 md:text-xl"
        >
          <Typewriter transition={transitionAlpha}>
            Catalogue contains{" "}
            <strong className="text-accent-foreground">
              {tableVersionsCount}
            </strong>{" "}
            published versions of{" "}
            <strong className="text-accent-foreground">{tablesCount}</strong>{" "}
            tables by{" "}
            <strong className="text-accent-foreground">{authorCount}</strong>{" "}
            authors
          </Typewriter>
        </motion.h3>

        <div className="absolute bottom-16 right-16 flex gap-8">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon-sm" variant="outline">
                <span className="sr-only">About the headlines</span>
                <GoInfo />
              </Button>
            </TooltipTrigger>

            <TooltipContent side="left">
              The headlines above were generated by{" "}
              <PrefetchableLink
                to={`/t/dyr/manifold-hooks/v/3`}
                className="font-semibold text-accent-foreground"
              >
                this random table
              </PrefetchableLink>{" "}
              built with Manifold.
            </TooltipContent>
          </Tooltip>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setIsAnimating((a) => !a);
              if (!isAnimating) {
                cycleHeadline();
              }
            }}
          >
            {isAnimating ? "Pause" : "Play"}
          </Button>
        </div>
      </header>
    </LayoutGroup>
  );
}
