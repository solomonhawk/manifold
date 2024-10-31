import { signIn } from "@manifold/auth/client";
import { LoadingIndicator } from "@manifold/ui/components/loading-indicator";
import { Button } from "@manifold/ui/components/ui/button";
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

function Landing() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [searchParams] = useSearchParams();

  const callbackUrl = searchParams.get("from") || "/";

  return (
    <FlexCol className="items-center justify-center">
      <Card className="text-center">
        <CardHeader>
          <GiHobbitDoor className="mx-auto size-32 sm:size-48 md:size-64" />

          <CardTitle asChild>
            <h2 className="text-2xl">Hail, and well met!</h2>
          </CardTitle>

          <CardDescription>
            We have a fine selection of Random Tables for you to peruse.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button
            className="flex w-full gap-8"
            disabled={isLoggingIn}
            onClick={() => {
              setIsLoggingIn(true);
              signIn("google", { callbackUrl });
            }}
          >
            {isLoggingIn ? (
              <>
                <LoadingIndicator />
                Signing In…
              </>
            ) : (
              <>Sign In</>
            )}
          </Button>
        </CardContent>
      </Card>
    </FlexCol>
  );
}

export const Component = Landing;
