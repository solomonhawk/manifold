import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@manifold/ui/components/ui/card";
import { FlexCol } from "@manifold/ui/components/ui/flex";
import {
  Notice,
  NoticeContent,
  NoticeIcon,
} from "@manifold/ui/components/ui/notice";
import { GoQuestion } from "react-icons/go";

import { UserProfileCreateForm } from "~features/onboarding/components/user-profile-create-form";

export function CreateProfile() {
  return (
    <FlexCol className="justify-center p-12 sm:p-16">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl sm:mb-12">
            Complete your profile
          </CardTitle>

          <div className="space-y-16">
            <CardDescription>
              We need just few details to get you started.
            </CardDescription>

            <Notice variant="loud">
              <NoticeIcon>
                <GoQuestion className="size-18" />
              </NoticeIcon>

              <NoticeContent className="space-y-12 leading-snug">
                <p>
                  Your username is the namespace your public tables are
                  available under.
                </p>

                <p>You can’t easily change this later, so choose wisely.</p>
              </NoticeContent>
            </Notice>
          </div>
        </CardHeader>

        <CardContent>
          <UserProfileCreateForm />
        </CardContent>
      </Card>
    </FlexCol>
  );
}

export const Component = CreateProfile;
