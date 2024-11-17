import { signIn } from "@manifold/auth/client";
import { getRandomElement } from "@manifold/lib";
import {
  AnimatedList,
  AnimatedListItem,
} from "@manifold/ui/components/animated-list";
import { LoadingIndicator } from "@manifold/ui/components/loading-indicator";
import { ReactiveButton } from "@manifold/ui/components/reactive-button";
import { Button } from "@manifold/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@manifold/ui/components/ui/card";
import { FlexCol } from "@manifold/ui/components/ui/flex";
import { transitionAlpha, transitionBeta } from "@manifold/ui/lib/animation";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { GiHobbitDoor } from "react-icons/gi";
import { useSearchParams } from "react-router-dom";

const HEADLINE_INTERVAL = 3500;

// @NOTE: generated with /t/dyr/manifold-hooks/v/2
const HEADLINES = [
  "A tool for making random lists for your D&D games, made with code.",
  "A tool for making random tables for joy and entertainment, made with code.",
  "A tool for making random outcomes for your TTRPG needs, made with the dreams of children.",
  "A tool for making random tables for fun and profit, made with the dreams of children.",
  "A tool for making stochastic tables for joy and entertainment, made with love.",
  "A tool for making stochastic tables for your TTRPG needs, made with code.",
  "A tool for making stochastic lists for fun and profit, made with love.",
  "A tool for making stochastic outcomes for fun and profit, made with code.",
  "A tool for making unpredictable tables for your Pathfinder games, made with the dreams of children.",
  "A tool for making unpredictable outcomes for joy and entertainment, made with care and thoughtfulness.",
  "A tool for making unpredictable suggestions for your D&D games, made with the dreams of children.",
  "A tool for making unpredictable suggestions for joy and entertainment, made with code.",
];

const variants = {
  initial: {
    opacity: 0,
    y: 12,
    transition: transitionBeta,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.3, ...transitionAlpha },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: transitionBeta,
  },
};

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

function Landing() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [searchParams] = useSearchParams();
  const callbackUrl = searchParams.get("from") || "/";

  return (
    <FlexCol className="container max-w-screen-xl">
      <section className="pb-24 sm:pb-32">
        <Headline />

        <section className="mx-auto max-w-sm">
          <Card className="text-center">
            <CardHeader>
              <GiHobbitDoor className="mx-auto size-32 sm:size-48 md:size-64" />

              <CardTitle asChild>
                <h3 className="text-2xl">Hail, and well met!</h3>
              </CardTitle>

              <CardDescription>
                We have a fine selection of Random Tables for you to peruse.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <ReactiveButton
                size="lg"
                className="flex w-full gap-8"
                reactive={!isLoggingIn}
                disabled={isLoggingIn}
                onClick={() => {
                  setIsLoggingIn(true);
                  signIn("google", { callbackUrl });
                }}
              >
                {isLoggingIn ? (
                  <>
                    <LoadingIndicator size="sm" />
                    Signing In…
                  </>
                ) : (
                  <>Sign In</>
                )}
              </ReactiveButton>
            </CardContent>
          </Card>
        </section>
      </section>
    </FlexCol>
  );
}

function Headline() {
  const [headline, setHeadline] = useState(getRandomElement(HEADLINES));
  const shouldReduceMotion = useReducedMotion();
  const [isAnimating, setIsAnimating] = useState(!shouldReduceMotion);

  const words = headline.split(" ");
  const wordKeys = computeKeys(words);

  const cycleHeadline = useCallback(() => {
    const nextHook = getRandomElement(HEADLINES);

    if (nextHook === headline) {
      cycleHeadline();
    } else {
      setHeadline(nextHook);
    }
  }, [headline]);

  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(cycleHeadline, HEADLINE_INTERVAL);

      return () => {
        clearInterval(interval);
      };
    }

    return;
  }, [cycleHeadline, isAnimating]);

  return (
    <LayoutGroup>
      <header className="flex min-h-screen flex-col items-center justify-center gap-16 sm:gap-24 md:gap-32">
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

        <motion.div layout>
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
        </motion.div>
      </header>
    </LayoutGroup>
  );
}

export const Component = Landing;
