import { tableVersionService } from "@manifold/db";
import {
  tableVersionGetInput,
  tableVersionListInput,
} from "@manifold/validators";

import { t } from "#trpc.ts";

export const tableVersionRouter = t.router({
  get: t.procedure.input(tableVersionGetInput).query(async ({ input }) => {
    return await tableVersionService.findTableVersion(input);
  }),

  list: t.procedure.input(tableVersionListInput).query(async ({ input }) => {
    return await tableVersionService.listTableVersions(input);
  }),
});
