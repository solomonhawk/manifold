import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@manifold/ui/components/ui/card";
import { FlexCol } from "@manifold/ui/components/ui/flex";
import { GoPackage } from "react-icons/go";
import { useNavigate } from "react-router-dom";

import { useRequiredUserProfile } from "~features/onboarding/hooks/use-required-user-profile";
import { TableCreateForm } from "~features/table/components/table-create-form";

export function TableNew() {
  const userProfile = useRequiredUserProfile();
  const navigate = useNavigate();

  return (
    <FlexCol className="bg-architect items-center justify-around overflow-auto p-12 sm:p-16">
      <Card className="mx-auto w-full max-w-md drop-shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-8 text-xl">
            <GoPackage />
            <span>New Table</span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <TableCreateForm
            onCreate={(table) =>
              navigate(`/t/${userProfile.username}/${table.slug}/edit`, {
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
