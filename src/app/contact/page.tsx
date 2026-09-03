import Link from "next/link";
import { Mail, MessageSquare } from "lucide-react";
import { GithubSvg, LinkedinSvg, InstagramSvg, HtbSvg } from "@/components/SocialIcons";
import { SOCIAL_LINKS } from "@/lib/utils";

const contacts = [
  {
    label: "E-mail",
    value: "edimargabriel7@gmail.com",
    href: "mailto:edimargabriel7@gmail.com",
    icon: <Mail size={16} />,
    desc: "Para oportunidades e projetos",
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/edimargabriel",
    href: SOCIAL_LINKS.linkedin,
    icon: <LinkedinSvg size={16} />,
    desc: "Perfil profissional",
  },
  {
    label: "GitHub",
    value: "github.com/GabrielMarques1",
    href: SOCIAL_LINKS.github,
    icon: <GithubSvg size={16} />,
    desc: "Projetos e código",
  },
  {
    label: "HackTheBox",
    value: "Perfil HTB",
    href: SOCIAL_LINKS.hackthebox,
    icon: <HtbSvg size={16} />,
    desc: "Máquinas e CTF",
  },
  {
    label: "Instagram",
    value: "@gabriell._marques",
    href: SOCIAL_LINKS.instagram,
    icon: <InstagramSvg size={16} />,
    desc: "Perfil & Direct",
  },
];

export default function ContactPage() {
  return (
    <div className="relative min-h-dvh bg-grid pt-24 pb-20">
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/3 left-[-5%] w-[400px] h-[400px] rounded-full bg-[var(--accent-primary)] opacity-[0.04] blur-[100px]" />
        <div className="absolute bottom-1/4 right-[-5%] w-[300px] h-[300px] rounded-full bg-[var(--accent-secondary)] opacity-[0.03] blur-[80px]" />
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="mb-12 animate-fade-in">
          <p className="font-mono text-xs text-[var(--accent-primary)] mb-2">~$ ping edimargabriel</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
            Entre em <span className="text-gradient">contato</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
            Aberto a oportunidades em segurança ofensiva, desenvolvimento back-end e projetos de pentest.
            Pode mandar um e-mail ou dm no LinkedIn.
          </p>
        </div>

        {/* Status */}
        <div className="glass-card rounded-xl p-4 mb-8 animate-fade-in delay-100 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shrink-0" />
          <div>
            <p className="text-xs font-mono text-[var(--text-primary)]">Disponível para oportunidades</p>
            <p className="text-xs text-[var(--text-muted)]">Juazeiro do Norte, CE · Remoto preferencial</p>
          </div>
        </div>

        {/* Contact cards */}
        <div className="space-y-3 animate-fade-in delay-200">
          {contacts.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              target={c.href.startsWith("mailto") ? undefined : "_blank"}
              rel={c.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
              className="glass-card flex items-center gap-4 rounded-xl p-4 group hover:no-underline"
            >
              <div className="shrink-0 w-9 h-9 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--accent-secondary)] group-hover:border-[var(--border-hover)] transition-all">
                {c.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[var(--text-muted)] font-mono">{c.label}</p>
                <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-secondary)] transition-colors truncate">
                  {c.value}
                </p>
              </div>
              <p className="text-xs text-[var(--text-muted)] shrink-0 hidden sm:block">{c.desc}</p>
            </Link>
          ))}
        </div>

        {/* Quick note */}
        <div className="mt-10 text-center animate-fade-in delay-300">
          <div className="glass-card rounded-xl p-6 inline-block">
            <MessageSquare size={20} className="text-[var(--accent-secondary)] mx-auto mb-2" />
            <p className="text-xs text-[var(--text-muted)] font-mono">
              Tempo médio de resposta:{" "}
              <span className="text-[var(--accent-secondary)]">&lt; 24h</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
