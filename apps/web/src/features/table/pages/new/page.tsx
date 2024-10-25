import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@manifold/ui/components/ui/card";
import { useNavigate } from "react-router-dom";

import { TableCreateForm } from "~features/table/components/table-create-form";

export function TableNew() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col grow items-center justify-center p-12 sm:p-16">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>New Table</CardTitle>
        </CardHeader>

        <CardContent>
          <TableCreateForm
            onCreate={(table) =>
              navigate(`/table/${table.id}/edit`, { state: { table } })
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

export const Component = TableNew;
