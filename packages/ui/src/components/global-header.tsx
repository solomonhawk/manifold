import { GiPlatform, GiSecretDoor } from "react-icons/gi";

import { Avatar, AvatarFallback, AvatarImage } from "#components/ui/avatar.tsx";
import { Button } from "#components/ui/button.tsx";
import { initials } from "#lib/utils.ts";

type Props = {
  children?: React.ReactNode;
};

function Root({ children }: Props) {
  return (
    <header className="flex justify-between items-center p-8 bg-primary-foreground">
      {children}
    </header>
  );
}

function LogoMark() {
  return (
    <div className="flex items-center gap-10 p-4 group-hover:text-green-300">
      <GiPlatform className="text-green-300 size-16 sm:size-20" />
      <h1 className="font-bold text-sm sm:text-base transition-colors">
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
        <GiSecretDoor className="text-green-300 size-18 sm:size-20" />
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
    <Button type="button" onClick={onSignIn} size="sm">
      Sign In
    </Button>
  );
}

export const GlobalHeader = {
  Root,
  LogoMark,
  Authed,
  Unauthed,
};
