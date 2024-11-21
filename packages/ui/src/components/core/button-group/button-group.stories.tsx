import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "#components/core/button/button.js";

import { ButtonGroup } from "./button-group";

const meta = {
  title: "UI/Core/ButtonGroup",
  component: ButtonGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: [
      <Button key="1">Left</Button>,
      <Button key="1">Center</Button>,
      <Button key="1">Right</Button>,
    ],
  },
};
