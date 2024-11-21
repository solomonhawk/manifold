import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./button";

const meta = {
  title: "UI/Core/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    variant: "default",
    size: "default",
  },
  argTypes: {
    variant: {
      options: [
        "default",
        "destructive",
        "destructive-outline",
        "outline",
        "secondary",
        "ghost",
        "link",
      ],
      control: { type: "select" },
    },
    size: {
      options: ["sm", "default", "lg", "icon", "icon-sm"],
      control: { type: "select" },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "default",
    children: "Sign in",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Delete Table",
  },
};

export const DestructiveOutline: Story = {
  args: {
    variant: "destructive-outline",
    children: "Delete Table",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "View Table",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "View Details",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Spooky Action",
  },
};

export const Link: Story = {
  args: {
    variant: "link",
    children: "Nothing to see here",
  },
};
