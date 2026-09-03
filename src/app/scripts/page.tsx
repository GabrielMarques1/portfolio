import Link from "next/link";
import { Terminal, ExternalLink, Code2, ArrowRight, FileCode, CheckCircle2, Shield } from "lucide-react";
import { getAllScripts } from "@/lib/scripts";
import { GithubSvg } from "@/components/SocialIcons";

export default function ScriptsPage() {
  const scripts = getAllScripts();

  // Agrupar por categoria
  const categories = Array.from(new Set(scripts.map((s) => s.category)));

  return (
    <div className="relative min-h-dvh bg-grid pt-24 pb-24">
      {/* Luz ambiente de fundo */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 left-[-5%] w-[450px] h-[450px] rounded-full bg-[var(--accent-primary)] opacity-[0.05] blur-[120px]" />
        <div className="absolute bottom-1/3 right-[-5%] w-[400px] h-[400px] rounded-full bg-[var(--accent-secondary)] opacity-[0.03] blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Cabeçalho */}
        <div className="mb-12 animate-fade-in">
          <p className="font-mono text-xs text-[var(--accent-primary)] mb-2">~$ find ~/Scripts/ -type f \( -name "*.py" -o -name "*.sh" \)</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
            Arsenal & <span className="text-gradient">Scripts de Automação</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed max-w-2xl mb-5">
            Ferramentas personalizadas desenvolvidas em Python e Shell Script para automatizar etapas críticas de recon, exploração de banco de dados e testes de intrusão. Cada script possui documentação e código integral disponível para consulta.
          </p>

          <div>
            <Link
              href="https://github.com/GabrielMarques1/Scripts"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--accent-secondary)] hover:border-[var(--border-hover)] transition-all shadow-md"
            >
              <GithubSvg size={14} />
              github.com/GabrielMarques1/Scripts
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>

        {/* Métricas rápidas */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-10 animate-fade-in delay-100">
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-gradient font-mono">{scripts.length}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">Scripts Documentados</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center border-[var(--accent-primary)]/20">
            <p className="text-2xl sm:text-3xl font-extrabold text-[var(--accent-secondary)] font-mono">Python & Bash</p>
            <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">Stack de Weaponization</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">100%</p>
            <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">Código Aberto & Exibível</p>
          </div>
        </div>

        {/* Listagem Categorizada de Scripts */}
        <div className="space-y-10 animate-fade-in delay-200">
          {categories.map((category) => {
            const categoryScripts = scripts.filter((s) => s.category === category);

            return (
              <section key={category} className="space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border-color)]">
                  <Terminal size={15} className="text-[var(--accent-secondary)]" />
                  <h2 className="text-lg font-bold font-mono text-[var(--text-primary)]">
                    {category}
                  </h2>
                  <span className="text-[0.65rem] font-mono px-2 py-0.5 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-secondary)] border border-[var(--accent-primary)]/20">
                    {categoryScripts.length} {categoryScripts.length === 1 ? "script" : "scripts"}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {categoryScripts.map((script) => (
                    <article
                      key={script.slug}
                      className="glass-card rounded-2xl p-5 sm:p-6 group transition-all duration-300 hover:border-[var(--border-hover)] hover:shadow-[0_0_24px_var(--accent-glow)] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded uppercase bg-violet-950/60 text-violet-300 border border-violet-500/30">
                              {script.language}
                            </span>
                            <span className="tag-badge text-[0.68rem]">
                              #{script.tag}
                            </span>
                          </div>

                          <span className="font-mono text-xs text-[var(--text-muted)]">
                            {script.filename}
                          </span>
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-secondary)] transition-colors mb-2">
                          <Link href={`/scripts/${script.slug}`} className="hover:no-underline">
                            {script.name}
                          </Link>
                        </h3>

                        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                          {script.summary}
                        </p>

                        <div className="space-y-1.5 mb-5 pl-1">
                          {script.features.slice(0, 2).map((feat, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono">
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] shrink-0" />
                              <span className="truncate">{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
                        <span className="text-xs font-mono text-[var(--text-muted)] flex items-center gap-1">
                          <FileCode size={13} />
                          {script.code.split("\n").length} linhas de código
                        </span>

                        <Link
                          href={`/scripts/${script.slug}`}
                          className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[var(--accent-secondary)] group-hover:translate-x-1 transition-transform"
                        >
                          Ver Código & Docs
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
