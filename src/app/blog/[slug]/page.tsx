import Link from "next/link";
import { notFound } from "next/navigation";
import { POSTS } from "@/data/posts";
import { ArrowLeft, Clock, Tag, ShieldAlert, CheckCircle2, Terminal, Info, AlertTriangle } from "lucide-react";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="relative min-h-dvh bg-grid pt-24 pb-24">
      {/* Luz ambiente de fundo */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 right-[-10%] w-[500px] h-[500px] rounded-full bg-[var(--accent-primary)] opacity-[0.05] blur-[130px]" />
        <div className="absolute bottom-1/3 left-[-10%] w-[450px] h-[450px] rounded-full bg-[var(--accent-secondary)] opacity-[0.04] blur-[120px]" />
      </div>

      <article className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Voltar para o blog */}
        <div className="mb-8 animate-fade-in">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--accent-secondary)] transition-colors"
          >
            <ArrowLeft size={14} />
            cd ../blog
          </Link>
        </div>

        {/* Cabeçalho do Post */}
        <header className="mb-10 animate-fade-in delay-100">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-[var(--accent-primary)]/15 text-[var(--accent-secondary)] border border-[var(--accent-primary)]/30 font-semibold">
              {post.category}
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono flex items-center gap-1">
              <Clock size={12} />
              {post.readTime} de leitura
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              • Publicado em {post.date}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight leading-tight mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-[var(--border-color)]">
            <Tag size={13} className="text-[var(--text-muted)]" />
            {post.tags.map((t) => (
              <span key={t} className="tag-badge text-[0.72rem]">
                #{t}
              </span>
            ))}
          </div>
        </header>

        {/* Introdução / Contexto */}
        <div className="glass-card rounded-2xl p-6 sm:p-7 mb-10 border-l-4 border-l-[var(--accent-primary)] animate-fade-in delay-200">
          <p className="text-base sm:text-lg text-[var(--text-primary)] leading-relaxed font-normal">
            {post.content.intro}
          </p>
        </div>

        {/* Seções Técnicas */}
        <div className="space-y-12 animate-fade-in delay-300">
          {post.content.sections.map((section, idx) => (
            <section key={idx} className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border-color)]/60 pb-2">
                <span className="text-[var(--accent-primary)] font-mono text-base">§</span>
                {section.title}
              </h2>

              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                {section.description}
              </p>

              {section.bulletPoints && (
                <ul className="space-y-2.5 my-3 pl-2">
                  {section.bulletPoints.map((point, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-3 text-xs sm:text-sm text-[var(--text-secondary)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-secondary)] mt-2 shrink-0" />
                      <span className="leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.codeBlock && (
                <div className="rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-secondary)] my-4 shadow-xl">
                  <div className="px-4 py-2 bg-[var(--bg-card)] border-b border-[var(--border-color)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal size={13} className="text-[var(--accent-secondary)]" />
                      <span className="font-mono text-xs text-[var(--text-muted)]">terminal / payload</span>
                    </div>
                    <span className="text-[0.68rem] font-mono uppercase text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-2 py-0.5 rounded border border-[var(--accent-primary)]/20">
                      {section.codeBlock.language}
                    </span>
                  </div>
                  <pre className="p-4 text-xs sm:text-sm font-mono text-violet-200 overflow-x-auto leading-relaxed bg-[#0b0b18]">
                    <code>{section.codeBlock.code}</code>
                  </pre>
                </div>
              )}

              {section.callout && (
                <div
                  className={`rounded-xl p-4 sm:p-5 flex items-start gap-3.5 my-4 border ${
                    section.callout.type === "warning"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                      : "bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/30 text-violet-200"
                  }`}
                >
                  {section.callout.type === "warning" ? (
                    <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <Info size={18} className="text-[var(--accent-secondary)] shrink-0 mt-0.5" />
                  )}
                  <p className="text-xs sm:text-sm leading-relaxed">
                    {section.callout.text}
                  </p>
                </div>
              )}
            </section>
          ))}

          {/* Medidas de Mitigação / Defesa */}
          <section className="glass-card rounded-2xl p-6 sm:p-7 border border-emerald-500/30 bg-emerald-950/10 space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-emerald-300 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-emerald-400" />
              Prevenção e Mitigação Recomendada
            </h3>
            <ul className="space-y-2.5">
              {post.content.mitigation.map((m, mIdx) => (
                <li key={mIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Conclusão */}
          <footer className="pt-8 border-t border-[var(--border-color)] space-y-4">
            <h4 className="text-base font-bold text-[var(--text-primary)] font-mono flex items-center gap-2">
              <ShieldAlert size={16} className="text-[var(--accent-secondary)]" />
              Conclusão Técnica
            </h4>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {post.content.conclusion}
            </p>

            <div className="mt-8 pt-6 flex items-center justify-between">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--accent-secondary)] hover:border-[var(--border-hover)] transition-all"
              >
                <ArrowLeft size={13} />
                Voltar aos artigos
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-primary)] hover:bg-violet-600 text-white text-xs font-semibold font-mono transition-all shadow-[0_0_15px_var(--accent-glow)]"
              >
                Discutir este tópico
              </Link>
            </div>
          </footer>
        </div>
      </article>
    </div>
  );
}
