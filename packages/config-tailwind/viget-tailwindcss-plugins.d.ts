declare module "@viget/tailwindcss-plugins/utilities/fns" {
  function rem(px: number): string;
  function remPair(px: number): Record<number, string>;
  function em(px: number): string;
  function pxPair(px: number): Record<number, string>;
}
