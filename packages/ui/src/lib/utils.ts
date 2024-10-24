import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name: string) {
  const nameParts = name.split(" ");
  const initials = nameParts.map((part) => part[0]).join("");

  return initials.toUpperCase();
}
