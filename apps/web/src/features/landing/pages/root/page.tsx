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
import { useLocation } from "react-router-dom";

function Landing() {
  const location = useLocation();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const params = new URLSearchParams(location.search);
  const callbackUrl = params.get("from") || "/";

  return (
    <FlexCol className="items-center justify-center">
      <Card className="text-center">
        <CardHeader>
          <GiHobbitDoor className="mx-auto size-32 sm:size-48 md:size-64" />

          <CardTitle>
            <span className="text-2xl">Hail, and well met!</span>
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
