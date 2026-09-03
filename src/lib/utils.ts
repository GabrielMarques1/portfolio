import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SOCIAL_LINKS = {
  github: "https://github.com/GabrielMarques1",
  hackthebox: "https://profile.hackthebox.com/profile/019cd544-04b7-73ec-a555-a558f43d5ede",
  linkedin: "https://linkedin.com/in/edimargabriel",
  twitter: "https://x.com/Bielzin_088",
} as const;

export const NAV_LINKS = [
  { href: "/", label: "home" },
  { href: "/about", label: "about" },
  { href: "/experience", label: "experience" },
  { href: "/blog", label: "blog" },
  { href: "/writeups", label: "writeups" },
  { href: "/scripts", label: "scripts" },
  { href: "/notes", label: "notes" },
  { href: "/contact", label: "contact" },
] as const;
