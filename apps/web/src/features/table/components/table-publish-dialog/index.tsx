import { useModal } from "@ebay/nice-modal-react";
import type { TableVersionSummary } from "@manifold/db";
import { pluralize } from "@manifold/lib/utils/string";
import { TableIdentifier } from "@manifold/ui/components/table-identifier";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@manifold/ui/components/ui/alert-dialog";
import { Button } from "@manifold/ui/components/ui/button";
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
import { Separator } from "@manifold/ui/components/ui/separator";
import { Textarea } from "@manifold/ui/components/ui/textarea";
import { useReturnFocus } from "@manifold/ui/hooks/use-return-focus";
import { useStateGuard } from "@manifold/ui/hooks/use-state-guard";
import { useZodForm } from "@manifold/ui/hooks/use-zod-form";
import { type TablePublishVersionInput, z } from "@manifold/validators";
import { type SubmitHandler } from "react-hook-form";
import { GoInfo, GoLinkExternal, GoPackageDependents } from "react-icons/go";
import { Link } from "react-router-dom";

import { useRequiredUserProfile } from "~features/onboarding/hooks/use-required-user-profile";
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
    defaultValues: { description: "" },
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
              <TableIdentifier
                username={userProfile.username}
                slug={tableSlug}
              />
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
            <CardHeader className="!p-4">
              <CardTitle asChild>
                <h4 className="-mt-2 flex items-center justify-between font-semibold">
                  <span className="p-12">Recent Versions:</span>
                  <CardDescription>
                    <Button
                      size="sm"
                      variant="ghost"
                      asChild
                      className="flex items-center gap-8 font-normal"
                    >
                      {/* @TODO: link to versions page */}
                      <Link to="#" target="_blank">
                        {`${totalVersionCount} ${pluralize("version", totalVersionCount)} published`}
                        <span className="sr-only">View all versions</span>
                        <GoLinkExternal />
                      </Link>
                    </Button>
                  </CardDescription>
                </h4>
              </CardTitle>
            </CardHeader>

            <Separator />

            <CardContent className="!p-16">
              <ul className="space-y-12">
                {recentVersions.map((version) => {
                  return (
                    <li key={version.id}>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-mono">v{version.version}</span>
                        <span className="text-muted-foreground">
                          was published on
                        </span>
                        {new Date(version.createdAt).toLocaleDateString()}
                      </div>

                      {version.description && (
                        <div className="mt-4 line-clamp-2 text-ellipsis border-l-2 border-muted pl-8 text-xs text-muted-foreground/70">
                          {version.description}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
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
                    <FormLabel>Release Notes</FormLabel>

                    <FormControl>
                      <Textarea rows={1} {...field} />
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

                <FormSubmitButton disabled={isPending} requireDirty={false}>
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
