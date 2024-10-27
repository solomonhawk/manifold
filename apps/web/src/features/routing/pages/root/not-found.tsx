import { Button } from "@manifold/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@manifold/ui/components/ui/card";
import { GiSuspicious } from "react-icons/gi";
import { GoChevronRight } from "react-icons/go";
import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="flex grow flex-col items-center justify-center">
      <Card className="min-w-256 max-w-sm text-center">
        <CardHeader>
          <GiSuspicious className="mx-auto mb-8 size-40 text-green-300" />

          <CardTitle>An empty room…</CardTitle>
          <CardDescription>…how suspicious!</CardDescription>
        </CardHeader>

        <CardContent>
          <Button asChild variant="outline">
            <Link to="/" className="group flex items-center gap-8">
              Take me back to safety
              <GoChevronRight className="transition-transform group-hover:translate-x-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export const Component = NotFound;