import { signIn } from "@manifold/auth/client";
import { LoadingIndicator } from "@manifold/ui/components/loading-indicator";
import { ReactiveButton } from "@manifold/ui/components/reactive-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@manifold/ui/components/ui/card";
import { FlexCol } from "@manifold/ui/components/ui/flex";
import { useState } from "react";
import { GiHobbitDoor } from "react-icons/gi";
import { useSearchParams } from "react-router-dom";

import { Headline } from "~features/landing/pages/root/components/headline";

export function LandingRoot() {
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
