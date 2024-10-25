import { Button } from "@manifold/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@manifold/ui/components/ui/card";

const TABLES = [
  {
    id: 1,
    title: "Cryptids",
  },
  {
    id: 2,
    title: "UFOs",
  },
  {
    id: 3,
    title: "Ghosts",
  },
  {
    id: 4,
    title: "Deities",
  },
  {
    id: 5,
    title: "Potions",
  },
];

export function TableList() {
  return (
    <Card>
      <CardHeader>
        {/* @TODO: Maybe this is a dropdown - recent/created at/used */}
        <CardTitle>Recently Edited:</CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-12 sm:gap-16">
        {TABLES.map((table) => {
          return (
            <div key={table.id} className="border rounded-sm">
              <div className="w-full aspect-square">
                <Button
                  className="group w-full h-full flex flex-col items-center justify-center p-16 gap-6 !no-underline"
                  variant="link"
                >
                  <h3 className="text-lg sm:text-xl group-hover:underline decoration-from-font underline-offset-2">
                    {table.title}
                  </h3>
                  <span className="text-gray-500 text-sm text-balance text-center">
                    Last edited 2 days ago
                  </span>
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
