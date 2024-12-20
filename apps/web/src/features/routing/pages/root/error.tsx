import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@manifold/ui/components/core/accordion";
import { Button } from "@manifold/ui/components/core/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@manifold/ui/components/core/card";
import { FlexCol } from "@manifold/ui/components/core/flex";
import { isError } from "@tanstack/react-query";
import { GiDiceTwentyFacesOne } from "react-icons/gi";
import { GoChevronRight } from "react-icons/go";
import { Link, useRouteError } from "react-router-dom";

import { NotFound } from "~features/routing/pages/root/not-found";
import { isNotFoundError } from "~utils/errors";

const FALLBACK_ERROR_MESSAGE =
  "The details remain elusive, but our quest to understand their true nature is just beginning…" as const;

export function RootError() {
  const error = useRouteError();

  const errorText = isError(error)
    ? error.message || FALLBACK_ERROR_MESSAGE
    : FALLBACK_ERROR_MESSAGE;

  if (isNotFoundError(error)) {
    return (
      <NotFound
        title={error.message}
        subtitle="Despite our best efforts, we couldn’t find the McGuffin this time around…"
        actionText="Retreat and regroup"
      />
    );
  }

  return (
    <FlexCol className="bg-architect bg-local">
      <div className="flex grow flex-col items-center justify-center p-12 sm:p-16">
        <Card className="w-full max-w-384 text-center sm:max-w-sm">
          <CardHeader>
            <GiDiceTwentyFacesOne className="mx-auto mb-8 size-64 text-green-300" />

            <CardTitle className="text-xl">Unlucky!</CardTitle>
            <CardDescription>We rolled a natural 1…</CardDescription>
          </CardHeader>

          <CardContent className="space-y-16 sm:space-y-20 md:space-y-24">
            <Accordion type="single" collapsible className="-mt-12 w-full">
              <AccordionItem value="error">
                <AccordionTrigger>
                  What happened?{" "}
                  <span className="text-sm text-muted-foreground">
                    (here be dragons…)
                  </span>
                </AccordionTrigger>

                <AccordionContent>
                  <code
                    className="block overflow-hidden text-ellipsis rounded border bg-primary-foreground p-12 text-left text-xs"
                    title={errorText}
                  >
                    {errorText}
                  </code>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Button asChild variant="outline">
              <Link to="/" className="group flex items-center gap-8">
                Take me back to safety
                <GoChevronRight className="transition-transform group-hover:translate-x-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </FlexCol>
  );
}
