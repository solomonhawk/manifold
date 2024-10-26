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

function Landing() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  return (
    <FlexCol className="items-center justify-center">
      <Card className="text-center">
        <CardHeader>
          <GiHobbitDoor className="size-32 sm:size-48 md:size-64 mx-auto" />

          <CardTitle>
            <span className="text-2xl">Hail, and well met!</span>
          </CardTitle>

          <CardDescription>
            We have a fine selection of Random Tables for you to peruse.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button
            className="w-full flex gap-8"
            disabled={isLoggingIn}
            onClick={() => {
              setIsLoggingIn(true);
              signIn("google");
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
