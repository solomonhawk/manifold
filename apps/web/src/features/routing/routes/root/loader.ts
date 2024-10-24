import type { LoaderFunction } from "react-router-dom";

export const rootLoader: LoaderFunction = async () => {
  return {
    title: "Welcome to Hono",
  };
};
