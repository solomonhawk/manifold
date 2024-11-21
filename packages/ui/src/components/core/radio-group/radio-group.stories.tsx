import type { Meta, StoryObj } from "@storybook/react";

import { Label } from "#components/core/label/label.js";

import { RadioGroup, RadioGroupItem } from "./radio-group";

const meta = {
  title: "UI/Core/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: "comfortable",
    children: [
      <div className="flex items-center space-x-8" key="default">
        <RadioGroupItem value="default" id="r1" />
        <Label htmlFor="r1">Default</Label>
      </div>,
      <div className="flex items-center space-x-8" key="comfortable">
        <RadioGroupItem value="comfortable" id="r2" />
        <Label htmlFor="r2">Comfortable</Label>
      </div>,
      <div className="flex items-center space-x-8" key="compact">
        <RadioGroupItem value="compact" id="r3" />
        <Label htmlFor="r3">Compact</Label>
      </div>,
    ],
  },
};
