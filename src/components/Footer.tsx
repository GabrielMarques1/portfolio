import { Terminal } from "lucide-react";
import Link from "next/link";
import { SOCIAL_LINKS } from "@/lib/utils";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/60 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-[var(--accent-primary)]" />
          <span className="font-mono text-xs text-[var(--text-muted)]">
            © {year} <span className="text-[var(--accent-secondary)]">Edimar Gabriel</span> · built with Next.js
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer"
            className="font-mono text-xs text-[var(--text-muted)] hover:text-[var(--accent-secondary)] transition-colors">
            github
          </Link>
          <Link href={SOCIAL_LINKS.hackthebox} target="_blank" rel="noopener noreferrer"
            className="font-mono text-xs text-[var(--text-muted)] hover:text-[var(--accent-secondary)] transition-colors">
            hackthebox
          </Link>
          <Link href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer"
            className="font-mono text-xs text-[var(--text-muted)] hover:text-[var(--accent-secondary)] transition-colors">
            linkedin
          </Link>
        </div>
      </div>
    </footer>
  );
}
