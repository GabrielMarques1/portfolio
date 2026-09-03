import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Shield, Code2, Terminal, ChevronRight, FileDown } from "lucide-react";
import { GithubSvg, LinkedinSvg, XSvg, HtbSvg } from "@/components/SocialIcons";
import { SOCIAL_LINKS } from "@/lib/utils";

const skills = [
  { label: "Pentest Web", color: "text-violet-400" },
  { label: "OWASP Top 10", color: "text-purple-400" },
  { label: "Shell Script", color: "text-violet-400" },
  { label: "PHP / CodeIgniter", color: "text-purple-400" },
  { label: "Python", color: "text-violet-400" },
  { label: "HackTheBox", color: "text-purple-400" },
  { label: "Arch Linux", color: "text-violet-400" },
  { label: "Cloud Security", color: "text-purple-400" },
];

const highlights = [
  {
    icon: <Shield size={18} />,
    title: "Segurança Ofensiva",
    desc: "Pentest Web, CTF, OWASP Top 10 e desenvolvimento seguro aplicados em projetos reais.",
  },
  {
    icon: <Code2 size={18} />,
    title: "Desenvolvimento Back-end",
    desc: "Sistemas SaaS e ERPs em PHP (CodeIgniter 4) com foco em segurança desde a arquitetura.",
  },
  {
    icon: <Terminal size={18} />,
    title: "Automação & Linux",
    desc: "Scripts Shell para automação em ambientes GNU/Linux. Arch Linux como sistema principal.",
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-dvh bg-grid">
      {/* Glow orb */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[var(--accent-primary)] opacity-[0.04] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[var(--accent-secondary)] opacity-[0.03] blur-[100px]" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-32 pb-20">

        {/* Hero */}
        <section className="flex flex-col items-start gap-6 mb-20">
          {/* Badge */}
          <div className="animate-fade-in flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-mono text-xs text-[var(--text-muted)]">disponível para oportunidades</span>
          </div>

          {/* Name + Avatar */}
          <div className="animate-fade-in delay-100 flex items-center gap-6">
            <div className="group relative shrink-0">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[var(--accent-primary)]/30 to-[var(--accent-secondary)]/10 opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100" />
              <Image
                src="/img/avatar.png"
                alt="Edimar Gabriel"
                width={100}
                height={100}
                className="relative rounded-full border-2 border-[var(--accent-primary)]/30 group-hover:border-[var(--accent-secondary)]/60 transition-all duration-500"
                priority
              />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-none">
                <span className="text-[var(--text-primary)]">Edimar</span>{" "}
                <span className="text-gradient">Gabriel</span>
              </h1>
              <p className="mt-3 font-mono text-base sm:text-lg text-[var(--text-secondary)]">
                <span className="text-[var(--accent-primary)]">~$</span>{" "}
                Sistemas de Informação · Segurança Ofensiva · Dev Back-end
              </p>
            </div>
          </div>

          {/* Bio */}
          <p className="animate-fade-in delay-200 max-w-2xl text-[var(--text-secondary)] text-base sm:text-lg leading-relaxed">
            Estudante de <span className="text-[var(--text-primary)] font-medium">Sistemas de Informação</span> na Uninassau,
            Juazeiro do Norte — CE. Apaixonado por segurança ofensiva, CTF e desenvolvimento back-end seguro.
            Construo sistemas reais e queimo máquinas no{" "}
            <span className="text-[var(--accent-secondary)] font-mono text-sm">HackTheBox</span>.
          </p>

          {/* Social links */}
          <div className="animate-fade-in delay-300 flex items-center gap-3 flex-wrap">
            {[
              { href: SOCIAL_LINKS.github, icon: <GithubSvg size={18} />, label: "GitHub" },
              { href: SOCIAL_LINKS.hackthebox, icon: <HtbSvg size={18} />, label: "HackTheBox" },
              { href: SOCIAL_LINKS.linkedin, icon: <LinkedinSvg size={18} />, label: "LinkedIn" },
              { href: SOCIAL_LINKS.twitter, icon: <XSvg size={18} />, label: "Twitter" },
            ].map((s) => (
              <Link
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-[var(--border-hover)] hover:shadow-[0_0_16px_var(--accent-glow)] text-[var(--text-muted)] hover:text-[var(--accent-secondary)]"
              >
                {s.icon}
                <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-md border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2 py-1 text-xs font-mono text-[var(--text-primary)] opacity-0 shadow-lg transition-all duration-200 group-hover:-top-11 group-hover:opacity-100 whitespace-nowrap">
                  {s.label}
                </span>
              </Link>
            ))}

            <Link
              href="/Curriculo-Edimar-Gabriel.pdf"
              target="_blank"
              download="Curriculo-Edimar-Gabriel.pdf"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)] text-[var(--accent-secondary)] text-sm font-semibold font-mono transition-all duration-300 hover:shadow-[0_0_16px_var(--accent-glow)]"
            >
              <FileDown size={14} />
              Download CV
            </Link>

            <Link
              href="/contact"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-primary)] hover:bg-violet-600 text-white text-sm font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:scale-105"
            >
              Contato
              <ChevronRight size={14} />
            </Link>
          </div>

          {/* Skills */}
          <div className="animate-fade-in delay-400 flex flex-wrap gap-2">
            {skills.map((s) => (
              <span key={s.label} className="tag-badge">
                {s.label}
              </span>
            ))}
          </div>
        </section>

        {/* Highlights */}
        <section className="animate-fade-in-slow delay-300 mb-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {highlights.map((h, i) => (
              <div key={i} className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[var(--accent-secondary)]">{h.icon}</span>
                  <h3 className="font-semibold text-sm text-[var(--text-primary)]">{h.title}</h3>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{h.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Recent sections */}
        <section className="animate-fade-in-slow delay-400">
          <div className="flex items-center gap-3 mb-6">
            <span className="font-mono text-xs text-[var(--accent-primary)]">~$</span>
            <h2 className="section-title text-lg">explore</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { href: "/writeups", label: "CTF Writeups", desc: "Máquinas comprometidas com cadeia de ataque detalhada.", tag: "pentest" },
              { href: "/blog", label: "Blog", desc: "Reflexões técnicas sobre segurança, desenvolvimento e carreira.", tag: "posts" },
              { href: "/scripts", label: "Scripts Vault", desc: "Automações Shell e ferramentas para ambientes Linux.", tag: "shell" },
              { href: "/notes", label: "Cyber-sec Notes", desc: "Base de conhecimento: web hacking, escalação, payloads.", tag: "recon" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="glass-card group rounded-xl p-4 flex items-start justify-between gap-4 hover:no-underline"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-secondary)] transition-colors">
                      {item.label}
                    </h3>
                    <span className="tag-badge text-[0.65rem]">{item.tag}</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
                </div>
                <ExternalLink size={14} className="shrink-0 text-[var(--text-muted)] group-hover:text-[var(--accent-secondary)] transition-colors mt-0.5" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
