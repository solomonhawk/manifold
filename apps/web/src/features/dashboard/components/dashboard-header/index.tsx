import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@manifold/ui/components/ui/card";
import { cn } from "@manifold/ui/lib/utils";

import { useRequiredAuth } from "~features/auth/context/use-auth";

import { QuickLauncher } from "../quick-launcher";
import { Aphorism } from "./aphorism";

function getGreeting(name: string) {
  return `Hello, ${name.split(" ")[0]} ✌️`;
}

export function DashboardHeader({ className }: { className?: string }) {
  const { session } = useRequiredAuth();

  return (
    <Card className={cn("flex flex-col sm:flex-row sm:gap-16", className)}>
      <CardHeader>
        <CardTitle>{getGreeting(session.data.user.name)}</CardTitle>

        <CardDescription>
          <Aphorism source="dashboard" />
        </CardDescription>
      </CardHeader>

      <CardContent
        flush={false}
        className="-mt-16 grow overflow-auto p-16 sm:m-0"
      >
        <QuickLauncher />
      </CardContent>
    </Card>
  );
}
