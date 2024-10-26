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

function Landing() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  return (
    <FlexCol className="items-center justify-center">
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="text-2xl">Hail, and well met!</span>
          </CardTitle>

          <CardDescription>
            &lt; insert something interesting here &gt;
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
