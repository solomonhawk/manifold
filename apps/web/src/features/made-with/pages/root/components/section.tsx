import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@manifold/ui/components/core/card";
import { Separator } from "@manifold/ui/components/core/separator";
import { motion, type Variants } from "motion/react";

import type { MadeWithSection } from "~features/made-with/pages/root/page";

type Props = {
  title: string;
  config: MadeWithSection;
};

const variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
} satisfies Variants;

export function Section({ title, config }: Props) {
  return (
    <motion.div variants={variants}>
      <Card className="-mx-12 border-none bg-transparent sm:-mx-20">
        <CardHeader className="-mt-4 !pb-0">
          <CardTitle className="text-lg font-semibold sm:text-xl">
            {title}
          </CardTitle>
        </CardHeader>

        <div className="my-8 px-16 sm:px-20 md:px-24">
          <Separator />
        </div>

        <CardContent className="space-y-20 sm:space-y-24 lg:space-y-28" flush>
          {config.groups.map((group, i) => {
            return (
              <SectionGroup key={i} title={group.title}>
                {group.items.map((item) => {
                  return <SectionGroupItem key={item.label} {...item} />;
                })}
              </SectionGroup>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}

type GroupProps = {
  title?: string;
  children?: React.ReactNode;
};

export function SectionGroup({ title, children }: GroupProps) {
  return (
    <section>
      {title && (
        <h4 className="mt-16 pb-4 text-sm font-semibold sm:text-base">
          {title}
        </h4>
      )}

      <ul>{children}</ul>
    </section>
  );
}

type ItemProps = {
  label: string;
  url: string;
};

export function SectionGroupItem({ label, url }: ItemProps) {
  return (
    <li
      key={label}
      className="text-muted-foreground before:pointer-events-none before:relative before:top-1 before:mr-8 before:text-2xl before:leading-none before:content-['·']"
    >
      <a
        href={url}
        className="inline-block py-2 text-muted-foreground underline transition-colors hover:text-accent-foreground md:py-4"
        target="_blank"
        rel="noreferrer"
      >
        {label}
      </a>
    </li>
  );
}
