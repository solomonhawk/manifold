import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@manifold/ui/components/ui/card";
import { FlexCol } from "@manifold/ui/components/ui/flex";
import { useNavigate } from "react-router-dom";

import { useRequiredUserProfile } from "~features/onboarding/hooks/use-required-user-profile";
import { TableCreateForm } from "~features/table/components/table-create-form";

export function TableNew() {
  const userProfile = useRequiredUserProfile();
  const navigate = useNavigate();

  return (
    <FlexCol className="items-center justify-center p-12 sm:p-16">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>New Table</CardTitle>
        </CardHeader>

        <CardContent>
          <TableCreateForm
            onCreate={(table) =>
              navigate(`/table/${userProfile.username}/${table.slug}/edit`, {
                state: { table },
              })
            }
          />
        </CardContent>
      </Card>
    </FlexCol>
  );
}

export const Component = TableNew;
