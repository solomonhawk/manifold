import plugin from "tailwindcss/plugin";

export const highlightedPlugin = plugin(({ addVariant }) => {
  addVariant("highlighted", "[data-highlighted]&");
});
