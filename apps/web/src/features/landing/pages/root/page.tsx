import { signIn } from "@manifold/auth/client";
import { Button } from "@manifold/ui/components/ui/button";

function Landing() {
  return (
    <div>
      <h1>Landing Page</h1>
      <Button onClick={() => signIn()}>Sign In</Button>
    </div>
  );
}

export const Component = Landing;
