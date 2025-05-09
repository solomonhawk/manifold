import containerQueriesPlugin from "@tailwindcss/container-queries";
import { rem, remPair } from "@viget/tailwindcss-plugins/utilities/fns";
import type { Config } from "tailwindcss";
import tailwindcssAnimatePlugin from "tailwindcss-animate";

import { highlightedPlugin } from "./plugins/highlighted";

const config = {
  darkMode: ["class"],
  content: [],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: rem(12),
        sm: rem(16),
      },
      screens: {
        xl: "1200px",
        "2xl": "1400px",
      },
    },
    spacing: {
      0: "0",
      none: "0",
      px: "1px",
      "avatar-sm": rem(20),
      avatar: rem(24),
      "dialog-sm": rem(416),
      "dialog-base": rem(480),
      "dialog-lg": rem(640),
      ...remPair(1),
      ...remPair(2),
      ...remPair(3),
      ...remPair(4),
      ...remPair(6),
      ...remPair(8),
      ...remPair(10),
      ...remPair(12),
      ...remPair(14),
      ...remPair(16),
      ...remPair(18),
      ...remPair(20),
      ...remPair(24),
      ...remPair(28),
      ...remPair(32),
      ...remPair(36),
      ...remPair(40),
      ...remPair(44),
      ...remPair(48),
      ...remPair(56),
      ...remPair(64),
      ...remPair(80),
      ...remPair(96),
      ...remPair(112),
      ...remPair(128),
      ...remPair(144),
      ...remPair(160),
      ...remPair(176),
      ...remPair(192),
      ...remPair(208),
      ...remPair(224),
      ...remPair(240),
      ...remPair(256),
      ...remPair(384),
      ...remPair(396),
      ...remPair(512),
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
          accent: "hsl(var(--destructive-accent))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: [
          "General Sans",
          "Inter",
          "Avenir",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      fontSize: {
        xxs: rem(10),
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "accordion-up": "accordion-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      dropShadow: {
        "tooltip-arrow": "0px 1px 0px hsl(var(--border))",
      },
    },
  },
  plugins: [
    tailwindcssAnimatePlugin,
    containerQueriesPlugin,
    highlightedPlugin,
  ],
} satisfies Config;

export default config;
