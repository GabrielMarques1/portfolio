import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllNotes, getNoteBySlug } from "@/lib/notes";
import { ArrowLeft, BookOpen, ExternalLink, Tag, Terminal } from "lucide-react";
import { marked } from "marked";
import { GithubSvg } from "@/components/SocialIcons";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const notes = getAllNotes();
  return notes.map((n) => ({
    slug: n.slug,
  }));
}

export default async function NoteDetailPage({ params }: Props) {
  const { slug } = await params;
  const note = getNoteBySlug(slug);

  if (!note) {
    notFound();
  }

  // Parsear markdown com suporte GFM completo
  const htmlContent = marked.parse(note.content, {
    gfm: true,
    breaks: true,
  }) as string;

  return (
    <div className="relative min-h-dvh bg-grid pt-24 pb-24">
      {/* Ambient Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 right-[-10%] w-[500px] h-[500px] rounded-full bg-[var(--accent-primary)] opacity-[0.05] blur-[140px]" />
        <div className="absolute bottom-1/3 left-[-10%] w-[450px] h-[450px] rounded-full bg-[var(--accent-secondary)] opacity-[0.04] blur-[120px]" />
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Navegação de retorno */}
        <div className="mb-8 animate-fade-in flex items-center justify-between">
          <Link
            href="/notes"
            className="inline-flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--accent-secondary)] transition-colors"
          >
            <ArrowLeft size={14} />
            cd ../notes
          </Link>

          <Link
            href={note.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--accent-secondary)] hover:underline"
          >
            <GithubSvg size={13} />
            Ver no GitHub Vault
            <ExternalLink size={12} />
          </Link>
        </div>

        {/* Top Header Card */}
        <header className="glass-card rounded-2xl p-6 sm:p-8 mb-10 animate-fade-in delay-100 border-[var(--border-color)]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-[var(--accent-primary)]/15 text-[var(--accent-secondary)] border border-[var(--accent-primary)]/30 font-semibold">
                {note.category}
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                {note.filename}
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight leading-tight mb-4">
            {note.title}
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed mb-6">
            {note.summary}
          </p>

          <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-[var(--border-color)]">
            <Tag size={13} className="text-[var(--text-muted)] shrink-0" />
            {note.tags.map((t) => (
              <span key={t} className="tag-badge text-[0.7rem]">
                #{t}
              </span>
            ))}
          </div>
        </header>

        {/* Conteúdo Renderizado da Nota */}
        <div className="glass-card rounded-2xl p-6 sm:p-10 animate-fade-in delay-200 border-[var(--border-color)]">
          <div
            className="writeup-prose text-[var(--text-secondary)] leading-relaxed space-y-6"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* Rodapé da página */}
          <div className="mt-12 pt-8 border-t border-[var(--border-color)] flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/notes"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--accent-secondary)] hover:border-[var(--border-hover)] transition-all"
            >
              <ArrowLeft size={13} />
              Voltar ao Vault de Notes
            </Link>

            <Link
              href={note.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-primary)] hover:bg-violet-600 text-white text-xs font-semibold font-mono transition-all shadow-[0_0_15px_var(--accent-glow)]"
            >
              <GithubSvg size={13} />
              Acessar no GitHub
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
