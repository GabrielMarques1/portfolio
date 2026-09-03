import Link from "next/link";
import { Shield, ExternalLink, ArrowRight, Tag, Terminal, Cpu } from "lucide-react";
import { getAllWriteups } from "@/lib/writeups";

const difficultyColor: Record<string, string> = {
  "Fácil": "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  "Médio": "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  "Difícil": "text-rose-400 border-rose-400/30 bg-rose-400/10",
  "Insano": "text-purple-400 border-purple-400/30 bg-purple-400/10",
};

export default function WriteupsPage() {
  const writeups = getAllWriteups();
  const rootedCount = writeups.filter((w) => w.rooted).length;
  const platforms = [...new Set(writeups.map((w) => w.platform))];

  return (
    <div className="relative min-h-dvh bg-grid pt-24 pb-24">
      {/* Orbs de fundo */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/3 right-[-5%] w-[450px] h-[450px] rounded-full bg-[var(--accent-primary)] opacity-[0.05] blur-[120px]" />
        <div className="absolute bottom-1/4 left-[-5%] w-[400px] h-[400px] rounded-full bg-[var(--accent-secondary)] opacity-[0.03] blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-12 animate-fade-in">
          <p className="font-mono text-xs text-[var(--accent-primary)] mb-2">~$ ls -la ~/WriteUps/machines/</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
            CTF & Lab <span className="text-gradient">Writeups</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed max-w-2xl">
            Documentações exaustivas de comprometimento de máquinas (root/system). Cadeia completa de ataque, enumeração, weaponization, exploração e escalação de privilégios.
          </p>
        </div>

        {/* Métricas e Estatísticas */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-10 animate-fade-in delay-100">
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-gradient font-mono">{writeups.length}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">Máquinas Documentadas</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center border-emerald-500/20">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">{rootedCount}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">100% Pwned / Rooted</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-[var(--accent-secondary)] font-mono">{platforms.length}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">Plataformas</p>
          </div>
        </div>

        {/* Lista de Writeups */}
        <div className="space-y-6 animate-fade-in delay-200">
          {writeups.map((w) => (
            <article
              key={w.slug}
              className="glass-card rounded-2xl p-6 sm:p-7 group transition-all duration-300 hover:border-[var(--border-hover)] hover:shadow-[0_0_30px_var(--accent-glow)] flex flex-col justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <Shield size={18} className="text-[var(--accent-secondary)]" />
                    <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-secondary)] transition-colors">
                      <Link href={`/writeups/${w.slug}`} className="hover:no-underline">
                        {w.machine}
                      </Link>
                    </h2>
                    <span className="text-[0.68rem] font-mono px-2 py-0.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 font-semibold">
                      PWNED
                    </span>
                    <span className={`text-[0.68rem] font-mono px-2 py-0.5 rounded-full border font-semibold ${difficultyColor[w.difficulty] || ""}`}>
                      {w.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
                    <Cpu size={12} />
                    <span>{w.os}</span>
                    <span>•</span>
                    <span className="text-[var(--accent-secondary)]">{w.platform}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-5 line-clamp-3">
                  {w.summary}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[var(--border-color)]">
                <div className="flex items-center gap-1.5 flex-wrap max-w-xl">
                  <Tag size={12} className="text-[var(--text-muted)] shrink-0" />
                  {w.tags.slice(0, 5).map((t) => (
                    <span key={t} className="tag-badge text-[0.68rem]">
                      {t}
                    </span>
                  ))}
                  {w.tags.length > 5 && (
                    <span className="text-[0.65rem] font-mono text-[var(--text-muted)]">
                      +{w.tags.length - 5}
                    </span>
                  )}
                </div>

                <Link
                  href={`/writeups/${w.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[var(--accent-secondary)] group-hover:translate-x-1 transition-transform"
                >
                  Abrir Relatório Completo
                  <ArrowRight size={13} />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Link para o GitHub do repositório */}
        <div className="mt-12 text-center animate-fade-in delay-300">
          <Link
            href="https://github.com/GabrielMarques1/WriteUps"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs sm:text-sm font-mono text-[var(--text-secondary)] hover:text-[var(--accent-secondary)] hover:border-[var(--border-hover)] transition-all shadow-lg"
          >
            <Terminal size={14} />
            Ver repositório WriteUps no GitHub
            <ExternalLink size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
