import { FlexCol } from "@manifold/ui/components/ui/flex";
import { useLoaderData } from "react-router-dom";

import { DashboardHeader } from "~features/dashboard/components/dashboard-header";
import { TableList } from "~features/dashboard/components/table-list";
import type { DashboardLoaderData } from "~features/dashboard/pages/root/loader";

export function DashboardRoot() {
  const { orderBy } = useLoaderData() as DashboardLoaderData;

  return (
    <FlexCol className="space-y-12 p-12 sm:space-y-16 sm:p-16">
      <DashboardHeader />
      <TableList orderBy={orderBy} />
    </FlexCol>
  );
}
