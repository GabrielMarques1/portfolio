import Link from "next/link";
import { FileText, Clock, Tag, ArrowRight, BookOpen } from "lucide-react";
import { POSTS } from "@/data/posts";

export default function BlogPage() {
  return (
    <div className="relative min-h-dvh bg-grid pt-24 pb-20">
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/3 right-[-5%] w-[450px] h-[450px] rounded-full bg-[var(--accent-primary)] opacity-[0.05] blur-[110px]" />
        <div className="absolute bottom-1/4 left-[-5%] w-[350px] h-[350px] rounded-full bg-[var(--accent-secondary)] opacity-[0.03] blur-[90px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-12 animate-fade-in">
          <p className="font-mono text-xs text-[var(--accent-primary)] mb-2">~$ find posts/ -name "*.md" -type f</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
            Artigos & <span className="text-gradient">Publicações Técnicas</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed max-w-2xl">
            Estudos aprofundados, metodologias ofensivas, dissecação de vulnerabilidades e lições de segurança prática retiradas de CTFs e labs.
          </p>
        </div>

        {/* Indicador de Status */}
        <div className="glass-card rounded-xl p-4 mb-8 animate-fade-in delay-100 flex items-center justify-between gap-3 border-[var(--accent-primary)]/30">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <p className="text-xs font-mono text-[var(--text-primary)]">
              {POSTS.length} artigos publicados com exemplos de código, comandos e vetores de mitigação.
            </p>
          </div>
          <span className="hidden sm:inline-block font-mono text-xs text-[var(--accent-secondary)]">
            [category: sec-research]
          </span>
        </div>

        {/* Lista de Artigos */}
        <div className="space-y-6 animate-fade-in delay-200">
          {POSTS.map((post) => (
            <article
              key={post.slug}
              className="glass-card rounded-2xl p-6 sm:p-7 group transition-all duration-300 hover:border-[var(--border-hover)] hover:shadow-[0_0_30px_var(--accent-glow)] flex flex-col justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-[var(--accent-primary)]/15 text-[var(--accent-secondary)] border border-[var(--accent-primary)]/30 font-semibold">
                      {post.category}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] font-mono flex items-center gap-1">
                      <Clock size={12} />
                      {post.readTime}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-[var(--text-muted)]">
                    {post.date}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-secondary)] transition-colors leading-tight mb-3">
                  <Link href={`/blog/${post.slug}`} className="hover:no-underline">
                    {post.title}
                  </Link>
                </h2>

                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5">
                  {post.excerpt}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[var(--border-color)]">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag size={12} className="text-[var(--text-muted)]" />
                  {post.tags.map((t) => (
                    <span key={t} className="tag-badge text-[0.7rem]">
                      #{t}
                    </span>
                  ))}
                </div>

                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[var(--accent-secondary)] group-hover:translate-x-1 transition-transform"
                >
                  Ler artigo completo
                  <ArrowRight size={13} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
