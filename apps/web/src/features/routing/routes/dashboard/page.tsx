import { useSession } from "@manifold/auth/client";

export function Component() {
  const auth = useSession();

  let greeting = "Hello";
  if (auth.status === "authenticated") {
    greeting = `Hello, ${auth.data?.user?.name.split(" ")[0]} ✌️`;
  }

  return <div className="p-12 sm:p-16">{greeting}</div>;
}
