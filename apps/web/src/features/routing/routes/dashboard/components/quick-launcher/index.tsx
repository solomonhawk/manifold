import { Button } from "@manifold/ui/components/ui/button";
import { Card, CardContent } from "@manifold/ui/components/ui/card";

const ITEMS = [
  {
    title: "Cryptids",
  },
  {
    title: "UFOs",
  },
  {
    title: "Ghosts",
  },
  {
    title: "Deities",
  },
  {
    title: "Potions",
  },
];

export function QuickLauncher() {
  return (
    <section className="flex gap-12 sm:gap-16">
      {ITEMS.map((item) => {
        return <QuickLaunchTile key={item.title} item={item} />;
      })}
    </section>
  );
}

function QuickLaunchTile({ item }: { item: { title: string } }) {
  return (
    <Card>
      <CardContent className="!p-0 flex items-center h-full">
        <Button className="w-full h-full p-24" variant="link">
          <h3>{item.title}</h3>
        </Button>
      </CardContent>
    </Card>
  );
}
