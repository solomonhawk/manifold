import { pluralize } from "@manifold/lib/utils/string";
import { TableIdentifier } from "@manifold/ui/components/table-identifier";
import { Button } from "@manifold/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@manifold/ui/components/ui/card";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@manifold/ui/components/ui/dialog";
import {
  Form,
  FormControl,
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
import { useStateGuard } from "@manifold/ui/hooks/use-state-guard";
import { useZodForm } from "@manifold/ui/hooks/use-zod-form";
import { z } from "@manifold/validators";
import { type SubmitHandler } from "react-hook-form";
import { GoInfo, GoLinkExternal, GoPackageDependents } from "react-icons/go";
import { Link } from "react-router-dom";

import type { WithDialog } from "~features/dialog-manager/types";
import { useRequiredUserProfile } from "~features/onboarding/hooks/use-required-user-profile";
import { usePublishTable } from "~features/table/api/publish";
import type { TablePublishDialogProps } from "~features/table/components/table-publish-dialog/types";
import { log } from "~utils/logger";

const schema = z.object({ releaseNotes: z.string().optional() });

type FormData = z.infer<typeof schema>;

export function TablePublishDialog({
  dialog,
  tableId,
  tableIdentifier,
  tableSlug,
  recentVersions,
  totalVersionCount,
  dependencies,
}: WithDialog<TablePublishDialogProps>) {
  const userProfile = useRequiredUserProfile();
  const publishTableMutation = usePublishTable({
    slug: tableSlug,
    onSuccess: () => {
      form.reset({ releaseNotes: "" });
      publishTableMutation.reset();
      dialog.hide();
    },
  });

  const isPending = useStateGuard(publishTableMutation.isLoading, { min: 250 });

  const form = useZodForm({
    schema,
    defaultValues: { releaseNotes: "" },
  });

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    await publishTableMutation
      // @TODO: dependencies
      .mutateAsync({
        tableId,
        tableSlug,
        tableIdentifier,
        releaseNotes: data.releaseNotes,
        dependencies,
      })
      .catch((e) => {
        log.error(e);
      });
  };

  return (
    <div className="space-y-20 sm:w-dialog-base">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-8">
          <GoPackageDependents />
          <span>
            Publish {recentVersions.length > 0 ? "a new version of " : null}
            <TableIdentifier username={userProfile.username} slug={tableSlug} />
          </span>
        </DialogTitle>

        <DialogDescription>
          Are you sure you want to publish{" "}
          {recentVersions.length > 0 ? "a new version of " : null}this table?
        </DialogDescription>
      </DialogHeader>

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
                    <Link
                      to={`/t/${userProfile.username}/${tableSlug}`}
                      target="_blank"
                    >
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
                      <span className="font-mono font-bold">
                        v{version.version}
                      </span>
                      <span className="text-muted-foreground">
                        was published on
                      </span>
                      {new Date(version.createdAt).toLocaleDateString()}
                    </div>

                    {version.releaseNotes && (
                      <pre
                        className="mt-4 line-clamp-2 text-ellipsis whitespace-break-spaces border-l-2 border-muted pl-8 font-sans text-xs text-muted-foreground/70"
                        title={version.releaseNotes}
                      >
                        {version.releaseNotes}
                      </pre>
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
              name="releaseNotes"
              render={({ field }) => (
                <FormItem className="mb-24">
                  <FormLabel>Release Notes</FormLabel>

                  <FormControl>
                    <Textarea autoSize rows={1} {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Nevermind</Button>
              </DialogClose>

              <FormSubmitButton disabled={isPending} requireDirty={false}>
                Publish Table
              </FormSubmitButton>
            </DialogFooter>
          </fieldset>
        </form>
      </Form>
    </div>
  );
}

export default TablePublishDialog;
