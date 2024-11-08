import { useModal } from "@ebay/nice-modal-react";
import { pluralize } from "@manifold/lib/utils/string";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@manifold/ui/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@manifold/ui/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormSubmitButton,
} from "@manifold/ui/components/ui/form";
import {
  Notice,
  NoticeContent,
  NoticeIcon,
} from "@manifold/ui/components/ui/notice";
import { Textarea } from "@manifold/ui/components/ui/textarea";
import { useReturnFocus } from "@manifold/ui/hooks/use-return-focus";
import { useStateGuard } from "@manifold/ui/hooks/use-state-guard";
import { useZodForm } from "@manifold/ui/hooks/use-zod-form";
import { type TablePublishVersionInput, z } from "@manifold/validators";
import { type SubmitHandler } from "react-hook-form";
import { GoInfo, GoPackageDependents } from "react-icons/go";

import { useRequiredUserProfile } from "~features/onboarding/hooks/use-required-user-profile";
import type { TableVersionSummary } from "~features/table/api/get";
import { usePublishTable } from "~features/table/api/publish";
import { log } from "~utils/logger";

type Props = TablePublishVersionInput & {
  // @TODO: fix this type
  recentVersions: TableVersionSummary[];
  totalVersionCount: number;
};

const schema = z.object({ description: z.string().optional() });
type FormData = z.infer<typeof schema>;

export const TablePublishDialog = ({
  recentVersions,
  totalVersionCount,
  tableSlug,
  description,
}: Props) => {
  const modal = useModal();
  const returnFocus = useReturnFocus(modal.visible);
  const userProfile = useRequiredUserProfile();
  const publishTableMutation = usePublishTable({
    slug: tableSlug,
    onSuccess: () => {
      publishTableMutation.reset();
      modal.hide();
    },
  });

  const isPending = useStateGuard(publishTableMutation.isLoading, { min: 250 });

  const form = useZodForm({
    schema,
    defaultValues: { description },
  });

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    await publishTableMutation
      .mutateAsync({ tableSlug, description: data.description })
      .catch((e) => {
        log.error(e);
      });
  };

  return (
    <AlertDialog
      open={modal.visible}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          modal.hide();
          returnFocus();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-8">
            <GoPackageDependents />
            <span>
              Publish {recentVersions.length > 0 ? "a new version of " : null}
              <code className="rounded bg-secondary p-3 px-6 leading-none text-accent-foreground">
                @{userProfile.username}/{tableSlug}
              </code>
            </span>
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to publish{" "}
            {recentVersions.length > 0 ? "a new version of " : null}this table?
          </AlertDialogDescription>
        </AlertDialogHeader>

        {recentVersions.length === 0 && (
          <Notice>
            <NoticeIcon>
              <GoInfo className="size-16" />
            </NoticeIcon>
            <NoticeContent>
              This table hasn’t been published before. Releasing a new version
              will make it publicly available.
            </NoticeContent>
          </Notice>
        )}

        {recentVersions.length > 0 && (
          <Card>
            <CardHeader className="!p-16">
              <CardTitle asChild>
                <h4 className="flex items-center justify-between font-semibold">
                  Recent Versions:
                  <CardDescription className="inline-block font-normal">
                    {totalVersionCount}{" "}
                    {pluralize("version", totalVersionCount)} published total
                  </CardDescription>
                </h4>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-8 !p-16 !pt-0">
              {recentVersions.map((version) => {
                return (
                  <div
                    key={version.id}
                    className="flex items-center gap-4 text-sm"
                  >
                    <span className="font-mono">v{version.version}</span>
                    <span className="text-muted-foreground">
                      was published on
                    </span>
                    {new Date(version.createdAt).toLocaleDateString()}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <fieldset disabled={form.formState.isSubmitting}>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="mb-24">
                    <FormLabel>Description</FormLabel>

                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>

                    <FormMessage />

                    <FormDescription>
                      This description will be visible to anyone who views this
                      table.
                    </FormDescription>
                  </FormItem>
                )}
              />

              <AlertDialogFooter>
                <AlertDialogCancel>Nevermind</AlertDialogCancel>

                <FormSubmitButton disabled={isPending}>
                  Publish Table
                </FormSubmitButton>
              </AlertDialogFooter>
            </fieldset>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
};
