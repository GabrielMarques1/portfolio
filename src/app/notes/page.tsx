import Link from "next/link";
import { BookOpen, ExternalLink, ArrowRight, FileText, Layers, ShieldCheck } from "lucide-react";
import { getAllNotes } from "@/lib/notes";
import { GithubSvg } from "@/components/SocialIcons";

export default function NotesPage() {
  const notes = getAllNotes();
  const categories = Array.from(new Set(notes.map((n) => n.category)));

  return (
    <div className="relative min-h-dvh bg-grid pt-24 pb-24">
      {/* Luz ambiente de fundo */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/3 left-[-6%] w-[450px] h-[450px] rounded-full bg-[var(--accent-primary)] opacity-[0.05] blur-[130px]" />
        <div className="absolute bottom-1/4 right-[-6%] w-[400px] h-[400px] rounded-full bg-[var(--accent-secondary)] opacity-[0.03] blur-[110px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Cabeçalho */}
        <div className="mb-12 animate-fade-in">
          <p className="font-mono text-xs text-[var(--accent-primary)] mb-2">~$ cat ~/Cyber-security/INDEX.md</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
            Base de Conhecimento & <span className="text-gradient">Cyber-sec Notes</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed max-w-2xl mb-5">
            Vault técnico persistente com anotações de estudo, metodologias ofensivas, cheatsheets de injeção, escalação de privilégios Linux e evasão de defesas. Cada tópico possui sua documentação integral aberta para consulta.
          </p>

          <div>
            <Link
              href="https://github.com/GabrielMarques1/Cyber-security"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--accent-secondary)] hover:border-[var(--border-hover)] transition-all shadow-md"
            >
              <GithubSvg size={14} />
              github.com/GabrielMarques1/Cyber-security
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>

        {/* Métricas do Vault */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-10 animate-fade-in delay-100">
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-gradient font-mono">{notes.length}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">Guias Técnicos</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center border-purple-500/20">
            <p className="text-2xl sm:text-3xl font-extrabold text-[var(--accent-secondary)] font-mono">{categories.length}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">Domínios de Estudo</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center border-emerald-500/20">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">Live</p>
            <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">Sincronizado c/ Vault</p>
          </div>
        </div>

        {/* Listagem Categorizada de Guias */}
        <div className="space-y-10 animate-fade-in delay-200">
          {categories.map((category) => {
            const categoryNotes = notes.filter((n) => n.category === category);

            return (
              <section key={category} className="space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border-color)]">
                  <BookOpen size={16} className="text-[var(--accent-secondary)]" />
                  <h2 className="text-lg font-bold font-mono text-[var(--text-primary)]">
                    {category}
                  </h2>
                  <span className="text-[0.65rem] font-mono px-2 py-0.5 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-secondary)] border border-[var(--accent-primary)]/20">
                    {categoryNotes.length} {categoryNotes.length === 1 ? "documento" : "documentos"}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {categoryNotes.map((note) => (
                    <article
                      key={note.slug}
                      className="glass-card rounded-2xl p-5 sm:p-6 group transition-all duration-300 hover:border-[var(--border-hover)] hover:shadow-[0_0_24px_var(--accent-glow)] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-[var(--accent-primary)]/15 text-[var(--accent-secondary)] border border-[var(--accent-primary)]/30 font-semibold">
                              {note.category}
                            </span>
                          </div>

                          <span className="font-mono text-xs text-[var(--text-muted)]">
                            {note.filename}
                          </span>
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-secondary)] transition-colors mb-2">
                          <Link href={`/notes/${note.slug}`} className="hover:no-underline">
                            {note.title}
                          </Link>
                        </h3>

                        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                          {note.summary}
                        </p>

                        <div className="space-y-1 mb-5 pl-1">
                          {note.topics.slice(0, 3).map((topic, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono">
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] shrink-0" />
                              <span className="truncate">{topic}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[var(--border-color)]">
                        <div className="flex items-center gap-1.5 flex-wrap max-w-md">
                          {note.tags.map((t) => (
                            <span key={t} className="tag-badge text-[0.68rem]">
                              #{t}
                            </span>
                          ))}
                        </div>

                        <Link
                          href={`/notes/${note.slug}`}
                          className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[var(--accent-secondary)] group-hover:translate-x-1 transition-transform"
                        >
                          Abrir Documentação
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
