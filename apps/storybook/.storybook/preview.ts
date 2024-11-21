import "@manifold/ui/fonts.css";
import "@manifold/ui/globals.css";

import type { Preview } from "@storybook/react";

import { withDarkMode } from "./decorators/with-dark-mode";
import { theme } from "./theme";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      theme,
    },
  },
  decorators: [withDarkMode],
  initialGlobals: {
    "tw-dark-mode": true,
  },
};

export default preview;
