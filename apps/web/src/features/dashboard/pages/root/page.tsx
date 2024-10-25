import { DashboardHeader } from "~features/dashboard/components/dashboard-header";
import { TableList } from "~features/dashboard/components/table-list";

export function DashboardRoot() {
  return (
    <div className="flex flex-col grow p-12 sm:p-16 min-h-0 space-y-12 sm:space-y-16">
      <DashboardHeader />
      <TableList />
    </div>
  );
}

export const Component = DashboardRoot;