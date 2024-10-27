import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@manifold/ui/components/ui/card";
import { isError } from "@tanstack/react-query";
import { GiDiceTwentyFacesOne } from "react-icons/gi";
import { useRouteError } from "react-router-dom";

const FALLBACK_ERROR_MESSAGE =
  "The details remain elusive, but our quest to understand their true nature is just beginning…" as const;

export function RootError() {
  const error = useRouteError();

  return (
    <div className="flex grow flex-col items-center justify-center">
      <Card className="min-w-256 max-w-sm text-center">
        <CardHeader>
          <GiDiceTwentyFacesOne className="mx-auto mb-8 size-40 text-green-300" />

          <CardTitle>Unlucky!</CardTitle>
          <CardDescription>We rolled a natural 1…</CardDescription>
        </CardHeader>

        <CardContent>
          <p>
            {isError(error)
              ? error.message || FALLBACK_ERROR_MESSAGE
              : FALLBACK_ERROR_MESSAGE}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
