/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useGlobals } from "@storybook/preview-api";
import type { ReactRenderer } from "@storybook/react";
import type {
  PartialStoryFn as StoryFunction,
  StoryContext,
} from "@storybook/types";

/**
 * Storybook decorator that adds the tailwindcss dark mode class/attributes
 * to the document element. This allows the tailwind styles to be properly
 * applied assuming tailwind is configured with `darkMode: ['class']`.
 */
export const withDarkMode = (
  StoryFn: StoryFunction<ReactRenderer>,
  context: StoryContext,
) => {
  const [globals] = useGlobals();
  const darkMode = globals["tw-dark-mode"];
  const { theme } = context.globals;

  useEffect(() => {
    toggleDarkModeState({ darkMode });
  }, [darkMode, theme]);

  return StoryFn();
};

function toggleDarkModeState(state: { darkMode: boolean }) {
  const rootElement = document.documentElement;

  if (state.darkMode) {
    rootElement.classList.add("dark");
    rootElement.setAttribute("data-theme", "dark");
  } else {
    rootElement.classList.remove("dark");
    rootElement.removeAttribute("data-theme");
  }
}
