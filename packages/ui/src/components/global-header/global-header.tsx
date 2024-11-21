import { GiPlatform, GiSecretDoor } from "react-icons/gi";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "#components/core/avatar/avatar.js";
import { Button } from "#components/core/button/button.js";
import { ReactiveButton } from "#components/reactive-button/reactive-button.js";
import { cn, initials } from "#lib/utils.ts";

type Props = {
  children?: React.ReactNode;
};

function Root({ children }: Props) {
  return (
    <header className="flex items-center justify-between bg-primary-foreground p-8">
      {children}
    </header>
  );
}

function LogoMark() {
  return (
    <div className="flex items-center gap-10 p-4 group-hover:text-green-300">
      <GiPlatform className="size-16 text-green-300 sm:size-20" />
      <h1 className="text-sm font-bold transition-colors sm:text-base">
        Manifold
      </h1>
    </div>
  );
}

function Authed({
  name,
  image,
  onSignOut,
}: {
  name: string;
  image: string;
  onSignOut: () => void;
}) {
  return (
    <div className="flex items-center gap-10">
      <Button
        type="button"
        onClick={onSignOut}
        variant="ghost"
        size="sm"
        className="flex items-center gap-8"
      >
        <span>Safe travels…</span>
        <GiSecretDoor className="size-18 text-green-300 sm:size-20" />
      </Button>

      <Avatar>
        <AvatarImage src={image} alt="" />
        <AvatarFallback delayMs={200}>{initials(name)}</AvatarFallback>
      </Avatar>
    </div>
  );
}

function Unauthed({ onSignIn }: { onSignIn: () => void }) {
  return (
    <ReactiveButton onClick={onSignIn} size="sm">
      Sign In
    </ReactiveButton>
  );
}

function Center({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("flex items-center gap-12", className)}>
      {children}
    </section>
  );
}

export const GlobalHeader = {
  Root,
  LogoMark,
  Authed,
  Unauthed,
  Center,
};
