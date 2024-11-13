import { FlexCol } from "@manifold/ui/components/ui/flex";
import { transitionAlpha } from "@manifold/ui/lib/animation";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { GiPaintRoller } from "react-icons/gi";

import { Section } from "./components/section";

type MadeWithLink = { label: string; url: string };

export type MadeWithGroup = { title?: string; items: MadeWithLink[] };

export type MadeWithSection = {
  groups: MadeWithGroup[];
};

const CORE_TECHNOLOGIES: MadeWithSection = {
  groups: [
    {
      items: [
        {
          label: "React",
          url: "https://react.dev",
        },
        {
          label: "TypeScript",
          url: "https://www.typescriptlang.org/",
        },
        {
          label: "Turborepo",
          url: "https://turbo.build/",
        },
        {
          label: "Vite",
          url: "https://vite.dev",
        },
        {
          label: "Vitest",
          url: "https://vitest.dev/",
        },
        {
          label: "Playwright",
          url: "https://playwright.dev/",
        },
        {
          label: "ESLint",
          url: "https://eslint.org/",
        },
        {
          label: "Prettier",
          url: "https://prettier.io/",
        },
      ],
    },
  ],
} as const;

const SERVER: MadeWithSection = {
  groups: [
    {
      items: [
        {
          label: "Hono",
          url: "https://hono.dev",
        },
        {
          label: "tRPC",
          url: "https://trpc.io",
        },
        {
          label: "Node",
          url: "https://nodejs.org",
        },
        {
          label: "TSX",
          url: "https://tsx.dev",
        },
      ],
    },
    {
      title: "Database",
      items: [
        {
          label: "Drizzle",
          url: "https://orm.drizzle.team/",
        },
        {
          label: "PostgreSQL",
          url: "https://postgresql.org",
        },
      ],
    },
    {
      title: "Authentication",
      items: [
        {
          label: "Auth.js",
          url: "https://authjs.dev/",
        },
      ],
    },
  ],
} as const;

const CLIENT: MadeWithSection = {
  groups: [
    {
      items: [
        {
          label: "shadcn/ui",
          url: "https://ui.shadcn.com/",
        },
        {
          label: "tailwindcss",
          url: "https://tailwindcss.com/",
        },
        {
          label: "Tanstack React Query",
          url: "https://tanstack.com/query/v4",
        },
        {
          label: "comlink",
          url: "https://github.com/GoogleChromeLabs/comlink",
        },
        {
          label: "jotai",
          url: "https://jotai.org/",
        },
        {
          label: "unstorage",
          url: "https://unstorage.unjs.io/",
        },
      ],
    },
    {
      title: "Forms/Validation",
      items: [
        {
          label: "React Hook Form",
          url: "https://react-hook-form.com/",
        },
        {
          label: "Hookform Resolvers",
          url: "https://www.npmjs.com/package/@hookform/resolvers",
        },
        {
          label: "Zod",
          url: "https://zod.dev/",
        },
      ],
    },
    {
      title: "Animation",
      items: [
        {
          label: "Framer Motion",
          url: "https://www.framer.com/motion/",
        },
      ],
    },
  ],
} as const;

const ENGINE: MadeWithSection = {
  groups: [
    {
      items: [
        {
          label: "Rust",
          url: "https://www.rust-lang.org/",
        },
        {
          label: "wasm-pack",
          url: "https://github.com/rustwasm/wasm-pack",
        },
        {
          label: "nom",
          url: "https://docs.rs/nom/latest/nom/",
        },
      ],
    },
  ],
} as const;

const UTILITY: MadeWithSection = {
  groups: [
    {
      items: [
        {
          label: "@t3-oss/env-core",
          url: "https://env.t3.gg/docs/core",
        },
        {
          label: "date-fns",
          url: "https://date-fns.org/",
        },
        {
          label: "superjson",
          url: "https://github.com/flightcontrolhq/superjson",
        },
        {
          label: "ts-pattern",
          url: "https://github.com/gvergnaud/ts-pattern",
        },
        {
          label: "Husky",
          url: "https://typicode.github.io/husky/",
        },
        {
          label: "lint-staged",
          url: "https://github.com/lint-staged/lint-staged",
        },
      ],
    },
  ],
} as const;

const variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      ...transitionAlpha,
    },
  },
} satisfies Variants;

function MadeWith() {
  return (
    <FlexCol className="container max-w-screen-xl">
      <header className="my-12 sm:my-16 md:mb-24 md:mt-36">
        <h2 className="flex items-center gap-10 text-2xl font-bold sm:text-3xl md:mb-8 md:text-4xl">
          Made With <GiPaintRoller className="size-20 sm:size-24 md:size-28" />
        </h2>
        <p className="text-muted-foreground">Tools and technologies we love:</p>
      </header>

      <AnimatePresence>
        <motion.section
          className="grid w-full grid-flow-row-dense grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] gap-12 pb-32 sm:gap-16"
          variants={variants}
          initial="hidden"
          animate="visible"
        >
          <Section title="Core Technologies" config={CORE_TECHNOLOGIES} />
          <Section title="Server" config={SERVER} />
          <Section title="Client" config={CLIENT} />
          <Section title="Engine" config={ENGINE} />
          <Section title="Utilities" config={UTILITY} />
        </motion.section>
      </AnimatePresence>
    </FlexCol>
  );
}

export const Component = MadeWith;
