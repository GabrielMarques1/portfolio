import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllWriteups, getWriteupBySlug } from "@/lib/writeups";
import { ArrowLeft, Shield, Cpu, Tag, Terminal, ExternalLink } from "lucide-react";
import { marked } from "marked";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const writeups = getAllWriteups();
  return writeups.map((w) => ({
    slug: w.slug,
  }));
}

const difficultyColor: Record<string, string> = {
  "Fácil": "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  "Médio": "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  "Difícil": "text-rose-400 border-rose-400/30 bg-rose-400/10",
  "Insano": "text-purple-400 border-purple-400/30 bg-purple-400/10",
};

export default async function WriteupDetailPage({ params }: Props) {
  const { slug } = await params;
  const writeup = getWriteupBySlug(slug);

  if (!writeup) {
    notFound();
  }

  // Configurar renderizador HTML do markdown
  const htmlContent = marked.parse(writeup.content, {
    gfm: true,
    breaks: true,
  }) as string;

  return (
    <div className="relative min-h-dvh bg-grid pt-24 pb-24">
      {/* Luzes de ambientação */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 right-[-10%] w-[500px] h-[500px] rounded-full bg-[var(--accent-primary)] opacity-[0.05] blur-[140px]" />
        <div className="absolute bottom-1/3 left-[-10%] w-[450px] h-[450px] rounded-full bg-[var(--accent-secondary)] opacity-[0.04] blur-[120px]" />
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Navegação de retorno */}
        <div className="mb-8 animate-fade-in flex items-center justify-between">
          <Link
            href="/writeups"
            className="inline-flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--accent-secondary)] transition-colors"
          >
            <ArrowLeft size={14} />
            cd ../writeups
          </Link>

          <Link
            href={`https://github.com/GabrielMarques1/WriteUps/blob/main/${encodeURIComponent(writeup.filename)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--accent-secondary)] hover:underline"
          >
            <Terminal size={12} />
            Ver Markdown no GitHub
            <ExternalLink size={12} />
          </Link>
        </div>

        {/* Top Header Card */}
        <header className="glass-card rounded-2xl p-6 sm:p-8 mb-10 animate-fade-in delay-100 border-[var(--border-color)]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-[var(--accent-primary)]/15 text-[var(--accent-secondary)] border border-[var(--accent-primary)]/30 font-semibold">
                {writeup.platform}
              </span>
              <span className="text-xs font-mono px-2.5 py-1 rounded-md border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 font-bold">
                ROOT PWNED
              </span>
              <span className={`text-xs font-mono px-2.5 py-1 rounded-md border font-semibold ${difficultyColor[writeup.difficulty] || ""}`}>
                {writeup.difficulty}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
              <Cpu size={13} />
              <span>SO: {writeup.os}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight leading-tight mb-4">
            Máquina: {writeup.machine}
          </h1>

          <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-[var(--border-color)]">
            <Tag size={13} className="text-[var(--text-muted)] shrink-0" />
            {writeup.tags.map((t) => (
              <span key={t} className="tag-badge text-[0.7rem]">
                #{t}
              </span>
            ))}
          </div>
        </header>

        {/* Conteúdo Renderizado do Writeup */}
        <div className="glass-card rounded-2xl p-6 sm:p-10 animate-fade-in delay-200 border-[var(--border-color)]">
          <div
            className="writeup-prose text-[var(--text-secondary)] leading-relaxed space-y-6"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* Rodapé da página */}
          <div className="mt-12 pt-8 border-t border-[var(--border-color)] flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/writeups"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--accent-secondary)] hover:border-[var(--border-hover)] transition-all"
            >
              <ArrowLeft size={13} />
              Voltar para todos os writeups
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-primary)] hover:bg-violet-600 text-white text-xs font-semibold font-mono transition-all shadow-[0_0_15px_var(--accent-glow)]"
            >
              Falar sobre esta máquina
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
