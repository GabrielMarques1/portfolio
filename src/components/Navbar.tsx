"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Terminal } from "lucide-react";
import { NAV_LINKS } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-color)]" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" onClick={() => setOpen(false)}>
            <Terminal size={16} className="text-[var(--accent-secondary)] group-hover:animate-pulse" />
            <span className="font-mono text-sm font-semibold text-[var(--text-primary)]">
              gabriel<span className="text-[var(--accent-secondary)]">@sec</span>
              <span className="animate-blink">█</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`nav-link text-sm font-mono tracking-wide ${
                    pathname === link.href ? "active text-[var(--accent-secondary)]" : ""
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden relative border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/95 backdrop-blur-xl transition-all duration-300 overflow-hidden ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="flex flex-col px-4 py-3 gap-1">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block py-2.5 px-3 rounded-lg text-sm font-mono transition-colors ${
                  pathname === link.href
                    ? "text-[var(--accent-secondary)] bg-[var(--accent-glow)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
                }`}
              >
                <span className="text-[var(--accent-primary)] mr-2">~$</span>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
