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
    <div className="flex flex-col grow items-center justify-center">
      <Card className="min-w-256 max-w-sm text-center">
        <CardHeader>
          <GiSuspicious className="text-emerald-100 size-40 mx-auto mb-8" />

          <CardTitle>An empty room…</CardTitle>
          <CardDescription>…how suspicious!</CardDescription>
        </CardHeader>

        <CardContent>
          <Button asChild variant="outline">
            <Link to="/" className="flex gap-8 items-center group">
              Take me back to safety
              <GoChevronRight className="group-hover:translate-x-4 transition-transform" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export const Component = NotFound;
