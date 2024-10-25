import { FlexCol } from "@manifold/ui/components/ui/flex";

import { DashboardHeader } from "~features/dashboard/components/dashboard-header";
import { TableList } from "~features/dashboard/components/table-list";

export function DashboardRoot() {
  return (
    <FlexCol className="p-12 sm:p-16 space-y-12 sm:space-y-16">
      <DashboardHeader />
      <TableList />
    </FlexCol>
  );
}

export const Component = DashboardRoot;
