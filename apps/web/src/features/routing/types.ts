import type { Params } from "react-router-dom";

export type Handle<Data = unknown> = {
  title?: (args: { params: Params; data: Data }) => string;
  description?: (args: { params: Params; data: Data }) => string;
};
