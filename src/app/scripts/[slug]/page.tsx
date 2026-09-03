import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllScripts, getScriptBySlug } from "@/lib/scripts";
import { ArrowLeft, Terminal, FileCode, CheckCircle2, Play, ExternalLink, Copy } from "lucide-react";
import { GithubSvg } from "@/components/SocialIcons";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const scripts = getAllScripts();
  return scripts.map((s) => ({
    slug: s.slug,
  }));
}

export default async function ScriptDetailPage({ params }: Props) {
  const { slug } = await params;
  const script = getScriptBySlug(slug);

  if (!script) {
    notFound();
  }

  const lineCount = script.code.split("\n").length;

  return (
    <div className="relative min-h-dvh bg-grid pt-24 pb-24">
      {/* Luz ambiente de fundo */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 right-[-10%] w-[500px] h-[500px] rounded-full bg-[var(--accent-primary)] opacity-[0.05] blur-[140px]" />
        <div className="absolute bottom-1/3 left-[-10%] w-[450px] h-[450px] rounded-full bg-[var(--accent-secondary)] opacity-[0.04] blur-[120px]" />
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Navegação de retorno */}
        <div className="mb-8 animate-fade-in flex items-center justify-between">
          <Link
            href="/scripts"
            className="inline-flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--accent-secondary)] transition-colors"
          >
            <ArrowLeft size={14} />
            cd ../scripts
          </Link>

          <Link
            href={script.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--accent-secondary)] hover:underline"
          >
            <GithubSvg size={13} />
            Ver no GitHub
            <ExternalLink size={12} />
          </Link>
        </div>

        {/* Header do Script */}
        <header className="glass-card rounded-2xl p-6 sm:p-8 mb-8 animate-fade-in delay-100 border-[var(--border-color)]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md uppercase bg-violet-950/60 text-violet-300 border border-violet-500/30">
                {script.language}
              </span>
              <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-[var(--accent-primary)]/15 text-[var(--accent-secondary)] border border-[var(--accent-primary)]/30 font-semibold">
                {script.category}
              </span>
              <span className="tag-badge text-[0.72rem]">
                #{script.tag}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <FileCode size={13} />
                {lineCount} linhas
              </span>
              <span>•</span>
              <span className="text-[var(--text-primary)] font-semibold">{script.filename}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight leading-tight mb-4">
            {script.name}
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            {script.summary}
          </p>
        </header>

        {/* Recursos & Modo de Uso */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fade-in delay-200">
          {/* Funcionalidades */}
          <div className="glass-card rounded-2xl p-6 border-[var(--border-color)] flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold font-mono text-[var(--text-primary)] flex items-center gap-2 mb-4">
                <CheckCircle2 size={16} className="text-emerald-400" />
                Destaques Operacionais
              </h2>
              <ul className="space-y-2.5">
                {script.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)] leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] mt-1.5 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Guia de Execução */}
          <div className="glass-card rounded-2xl p-6 border-[var(--border-color)] flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold font-mono text-[var(--text-primary)] flex items-center gap-2 mb-4">
                <Play size={16} className="text-[var(--accent-secondary)]" />
                Como Executar
              </h2>
              <div className="rounded-xl overflow-hidden border border-[var(--border-color)] bg-[#0a0a16] p-4 font-mono text-xs text-violet-200 leading-relaxed overflow-x-auto">
                <pre>{script.usage}</pre>
              </div>
            </div>
            <p className="text-[0.72rem] font-mono text-[var(--text-muted)] mt-4">
              * Ajuste as permissões de execução com chmod +x {script.filename} se necessário.
            </p>
          </div>
        </div>

        {/* Bloco de Código Fonte Completo */}
        <section className="glass-card rounded-2xl overflow-hidden border-[var(--border-color)] mb-10 animate-fade-in delay-300">
          <div className="px-5 py-3.5 bg-[var(--bg-card)] border-b border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Terminal size={14} className="text-[var(--accent-secondary)]" />
              <span className="font-mono text-xs font-semibold text-[var(--text-primary)]">
                Código Fonte — {script.filename}
              </span>
            </div>
            <span className="text-[0.68rem] font-mono text-[var(--accent-secondary)] bg-[var(--accent-primary)]/10 px-2 py-0.5 rounded border border-[var(--accent-primary)]/20 uppercase">
              {script.language}
            </span>
          </div>

          <div className="p-4 sm:p-6 bg-[#080814] overflow-x-auto max-h-[650px] overflow-y-auto">
            <pre className="font-mono text-xs sm:text-sm text-violet-100 leading-relaxed selection:bg-[var(--accent-primary)] selection:text-white">
              <code>{script.code}</code>
            </pre>
          </div>
        </section>

        {/* Rodapé */}
        <footer className="pt-6 border-t border-[var(--border-color)] flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/scripts"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--accent-secondary)] hover:border-[var(--border-hover)] transition-all"
          >
            <ArrowLeft size={13} />
            Voltar para o Arsenal de Scripts
          </Link>

          <Link
            href={script.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-primary)] hover:bg-violet-600 text-white text-xs font-semibold font-mono transition-all shadow-[0_0_15px_var(--accent-glow)]"
          >
            <GithubSvg size={13} />
            Fork / Clonar no GitHub
          </Link>
        </footer>
      </article>
    </div>
  );
}
