import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "@manifold/validators";
import { useForm, type UseFormProps } from "react-hook-form";

type UseZodFormProps<S extends z.ZodSchema> = {
  schema: S;
} & Exclude<UseFormProps<z.infer<S>>, "resolver">;

export function useZodForm<S extends z.ZodSchema>({
  schema,
  ...formProps
}: Omit<UseZodFormProps<S>, "resolver">) {
  return useForm({
    resolver: zodResolver(schema),
    ...formProps,
  });
}
