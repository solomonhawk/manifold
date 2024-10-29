import "@manifold/types";
import "@manifold/ui/globals.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "~app";
import { log } from "~utils/logger";

if (import.meta.env.DEV) {
  log.setLevel("debug");
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
