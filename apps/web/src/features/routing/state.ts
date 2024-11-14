import { atom } from "jotai";
import { createBrowserRouter, RouteObject } from "react-router-dom";

export const routesAtom = atom<RouteObject[]>([]);
export const routerAtom = atom<ReturnType<typeof createBrowserRouter> | null>(
  null,
);
