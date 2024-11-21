import type { Meta, StoryObj } from "@storybook/react";
import {
  GoGitCompare,
  GoGitPullRequest,
  GoGitPullRequestDraft,
} from "react-icons/go";

import { SegmentedControl, SegmentedControlItem } from "./segmented-control";

const meta = {
  title: "UI/Core/SegmentedControl",
  component: SegmentedControl,
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
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: "middle",
    children: [
      <SegmentedControlItem key="left" value="left">
        Left
      </SegmentedControlItem>,
      <SegmentedControlItem key="middle" value="middle">
        Middle
      </SegmentedControlItem>,
      <SegmentedControlItem key="right" value="right">
        Right
      </SegmentedControlItem>,
    ],
  },
};
export const Vertical: Story = {
  args: {
    defaultValue: "middle",
    orientation: "vertical",
    children: [
      <SegmentedControlItem key="top" value="top">
        Top
      </SegmentedControlItem>,
      <SegmentedControlItem key="middle" value="middle">
        Middle
      </SegmentedControlItem>,
      <SegmentedControlItem key="bottom" value="bottom">
        Bottom
      </SegmentedControlItem>,
    ],
  },
};

export const OutlineSmall: Story = {
  args: {
    defaultValue: "middle",
    variant: "outline",
    size: "sm",
    children: [
      <SegmentedControlItem key="left" value="left">
        Left
      </SegmentedControlItem>,
      <SegmentedControlItem key="middle" value="middle">
        Middle
      </SegmentedControlItem>,
      <SegmentedControlItem key="right" value="right">
        Right
      </SegmentedControlItem>,
    ],
  },
};

export const Icon: Story = {
  args: {
    defaultValue: "middle",
    variant: "secondary",
    size: "icon",
    children: [
      <SegmentedControlItem key="left" value="left">
        <GoGitCompare />
      </SegmentedControlItem>,
      <SegmentedControlItem key="middle" value="middle">
        <GoGitPullRequest />
      </SegmentedControlItem>,
      <SegmentedControlItem key="right" value="right">
        <GoGitPullRequestDraft />
      </SegmentedControlItem>,
    ],
  },
};
