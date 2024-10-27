import { useSession } from "@manifold/auth/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@manifold/ui/components/ui/card";
import { cn } from "@manifold/ui/lib/utils";

import { QuickLauncher } from "../quick-launcher";
import { Aphorism } from "./aphorism";

function getGreeting(isAuthenticated: boolean, name?: string) {
  if (isAuthenticated && name) {
    return `Hello, ${name.split(" ")[0]} ✌️`;
  }

  return "Hello, stranger! 👋";
}

export function DashboardHeader({ className }: { className?: string }) {
  const auth = useSession();

  return (
    <Card className={cn("flex flex-col sm:flex-row sm:gap-16", className)}>
      <CardHeader>
        <CardTitle>
          {getGreeting(auth.status === "authenticated", auth.data?.user?.name)}
        </CardTitle>

        <CardDescription>
          <Aphorism source="dashboard" />
        </CardDescription>
      </CardHeader>

      <CardContent
        flush={false}
        className="-mt-16 flex-grow overflow-auto p-16 sm:m-0"
      >
        <QuickLauncher />
      </CardContent>
    </Card>
  );
}
