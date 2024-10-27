import { atom } from "jotai";
import { RouteObject } from "react-router-dom";

export const routesAtom = atom<RouteObject[]>([]);
