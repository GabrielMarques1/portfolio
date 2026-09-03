import Image from "next/image";
import { MapPin, GraduationCap, Terminal, Shield } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="relative min-h-dvh bg-grid pt-24 pb-20">
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/3 right-[-5%] w-[400px] h-[400px] rounded-full bg-[var(--accent-primary)] opacity-[0.04] blur-[100px]" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <p className="font-mono text-xs text-[var(--accent-primary)] mb-2">~$ cat about.md</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">
            Sobre <span className="text-gradient">mim</span>
          </h1>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Comecei na tecnologia por curiosidade, fui ficando por obsessão.
          </p>
        </div>

        {/* Bio card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 mb-6 animate-fade-in delay-100">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar placeholder */}
            <div className="shrink-0 w-20 h-20 rounded-xl border border-[var(--border-color)] overflow-hidden animate-pulse-glow">
              <Image
                src="/img/avatar.png"
                alt="Edimar Gabriel"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Edimar Gabriel</h2>
              <div className="flex flex-wrap items-center gap-3 mb-4 text-xs font-mono text-[var(--text-muted)]">
                <span className="flex items-center gap-1"><MapPin size={12} /> Juazeiro do Norte, CE</span>
                <span className="flex items-center gap-1"><GraduationCap size={12} /> Uninassau — SI 2023–2026</span>
              </div>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                Estudante de Sistemas de Informação com foco em segurança ofensiva e desenvolvimento back-end seguro.
                Pratico CTF no HackTheBox, desenvolvo sistemas reais com PHP/CodeIgniter e aplico a OWASP Top 10
                desde a concepção dos projetos. Apaixonado por Arch Linux, automação Shell e explorar os limites
                de sistemas.
              </p>
            </div>
          </div>
        </div>

        {/* Grid info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 animate-fade-in delay-200">
          {/* Segurança */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={16} className="text-[var(--accent-secondary)]" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Segurança</h3>
            </div>
            <ul className="space-y-2">
              {["Pentest Web (OWASP Top 10)", "CTF — HackTheBox", "Cloud Security", "Desenvolvimento Seguro", "Análise de vulnerabilidades"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <span className="w-1 h-1 rounded-full bg-[var(--accent-primary)] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Dev */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Terminal size={16} className="text-[var(--accent-secondary)]" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Desenvolvimento</h3>
            </div>
            <ul className="space-y-2">
              {["PHP — CodeIgniter 4", "Python", "Shell Script (Bash)", "Git & GitHub", "MySQL / MariaDB", "Cypress · PHPUnit"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <span className="w-1 h-1 rounded-full bg-[var(--accent-primary)] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Education */}
        <div className="glass-card rounded-xl p-5 mb-6 animate-fade-in delay-300">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap size={16} className="text-[var(--accent-secondary)]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Educação</h3>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center shrink-0">
              <span className="font-mono text-xs font-bold text-[var(--accent-secondary)]">U</span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">Uninassau</h4>
              <p className="text-xs text-[var(--text-muted)] mb-1">Bacharelado em Sistemas de Informação · Jan 2023 – Dez 2026</p>
              <p className="text-xs text-[var(--text-secondary)]">
                Principais disciplinas: Cibersegurança, Redes, Back-end, Frameworks (front e back), Sistemas Operacionais.
              </p>
            </div>
          </div>
        </div>

        {/* Idiomas */}
        <div className="glass-card rounded-xl p-5 animate-fade-in delay-400">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Idiomas</h3>
          <div className="space-y-3">
            {[
              { lang: "Português", level: "Nativo", pct: 100 },
              { lang: "Inglês", level: "Intermediário", pct: 60 },
            ].map(({ lang, level, pct }) => (
              <div key={lang}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-secondary)] font-mono">{lang}</span>
                  <span className="text-[var(--text-muted)]">{level}</span>
                </div>
                <div className="h-1 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
