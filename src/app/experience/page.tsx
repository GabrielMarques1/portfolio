import { Briefcase, BookOpen, ExternalLink } from "lucide-react";
import Link from "next/link";

const jobs = [
  {
    company: "A&C Centro de Contatos",
    role: "Auxiliar Administrativo",
    period: "Abr 2025 – Atual",
    location: "Juazeiro do Norte, CE",
    bullets: [
      "Averiguo e corrijo ocorrências indevidas no ponto de colaboradores via ForPonto, ForAcesso e GestãoX — zero descontos incorretos.",
      "Resolvo chamados de ocorrências em escala nacional com agilidade, cumprindo metas de resolução a nível Brasil.",
      "Lidero o time de Juazeiro do Norte, coordenando processos e qualidade das tratativas administrativas.",
    ],
  },
  {
    company: "A&C Centro de Contatos",
    role: "Jovem Aprendiz Administrativo",
    period: "Dez 2023 – Fev 2025",
    location: "Juazeiro do Norte, CE",
    bullets: [
      "Averiguei e corrigi ocorrências de ponto com alto nível de foco via ForPonto e GestãoX.",
      "Validei a legitimidade de cada ocorrência protegendo colaborador e empresa de registros incorretos.",
    ],
  },
  {
    company: "Cariri Ferragens",
    role: "Jovem Aprendiz — Estoquista",
    period: "Mai 2022 – Out 2022",
    location: "Juazeiro do Norte, CE",
    bullets: [
      "Conferi, organizei e dei entrada em notas fiscais com zero margem de erro.",
      "Liderei time de jovens aprendizes nas rotinas de estoque.",
    ],
  },
  {
    company: "Farmácia Feitosa",
    role: "Jovem Aprendiz — Estoquista",
    period: "Set 2020 – Fev 2021",
    location: "Juazeiro do Norte, CE",
    bullets: [
      "Recebi, conferi e organizei estoque de medicamentos, auxiliando nas vendas e entregas em alta demanda.",
    ],
  },
];

const projects = [
  {
    name: "FOOD — Sistema para Restaurantes",
    role: "Programador Back-end | Pentester",
    period: "2025",
    href: "https://github.com/GabrielMarques1/FOOD",
    bullets: [
      "Back-end em PHP (CodeIgniter 4): projeção de tela, mesas, estoque, colaboradores. OWASP Top 10 desde a concepção.",
      "Banco de dados relacional completo e arquitetura MVC escalável.",
      "Pentest pré-lançamento: zero vulnerabilidades críticas confirmadas.",
    ],
  },
  {
    name: "Emissor de Notas Fiscais — SaaS",
    role: "Programador Back-end | Pentester",
    period: "2025",
    href: "https://github.com/GabrielMarques1/Emissor-de-notas-fiscais",
    bullets: [
      "SaaS B2B em PHP (CodeIgniter 4) com automação comercial e integração TEF.",
      "Testes e2e com Cypress e unitários com PHPUnit.",
      "OWASP Top 10 aplicado. Sistema em produção em Juazeiro do Norte.",
    ],
  },
  {
    name: "WriteUps — CTF/Pentest",
    role: "Autor",
    period: "2026 – presente",
    href: "https://github.com/GabrielMarques1/WriteUps",
    bullets: [
      "Writeups completos de máquinas comprometidas: enumeração, exploração e escalação de privilégios.",
      "Metodologia estruturada: reconhecimento → exploração de vulnerabilidades web → pós-exploração Linux.",
    ],
  },
  {
    name: "Cyber-security — Base de Conhecimento",
    role: "Autor",
    period: "2026 – presente",
    href: "https://github.com/GabrielMarques1/Cyber-security",
    bullets: [
      "Repositório com estudos sobre Web Hacking, Escalação de Privilégios Linux, Payloads e Kali/Arch.",
    ],
  },
  {
    name: "Scripts — Automação Shell",
    role: "Autor",
    period: "2026 – presente",
    href: "https://github.com/GabrielMarques1/Scripts",
    bullets: [
      "Scripts Bash para automação de tarefas em ambientes Linux — habilidades GNU/Linux aplicadas na prática.",
    ],
  },
];

const courses = [
  { name: "Web Hacking na Prática 3.0", org: "HackingClub / CrowSec", hours: "65h" },
  { name: "Hack The Box", org: "HackTheBox", hours: "ongoing" },
  { name: "Cloud Security", org: "–", hours: "–" },
  { name: "Sistemas GNU/Linux", org: "–", hours: "–" },
  { name: "Desenvolvimento Seguro", org: "–", hours: "–" },
  { name: "Python Completo", org: "–", hours: "–" },
];

export default function ExperiencePage() {
  return (
    <div className="relative min-h-dvh bg-grid pt-24 pb-20">
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 left-[-8%] w-[400px] h-[400px] rounded-full bg-[var(--accent-primary)] opacity-[0.04] blur-[100px]" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <p className="font-mono text-xs text-[var(--accent-primary)] mb-2">~$ cat experience.json</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
            Experiência & <span className="text-gradient">Projetos</span>
          </h1>
        </div>

        {/* Professional */}
        <section className="mb-12 animate-fade-in delay-100">
          <div className="flex items-center gap-2 mb-6">
            <Briefcase size={16} className="text-[var(--accent-secondary)]" />
            <h2 className="text-base font-semibold text-[var(--text-primary)] font-mono">Experiência Profissional</h2>
          </div>
          <div className="relative pl-6 border-l border-[var(--border-color)] space-y-8">
            {jobs.map((job, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full border-2 border-[var(--accent-primary)] bg-[var(--bg-primary)]" />
                <div className="glass-card rounded-xl p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">{job.role}</h3>
                      <p className="text-xs text-[var(--accent-secondary)] font-mono">{job.company}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xs text-[var(--text-muted)]">{job.period}</p>
                      <p className="font-mono text-xs text-[var(--text-muted)]">{job.location}</p>
                    </div>
                  </div>
                  <ul className="space-y-1.5">
                    {job.bullets.map((b, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                        <span className="text-[var(--accent-primary)] shrink-0 mt-0.5">›</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section className="mb-12 animate-fade-in delay-200">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen size={16} className="text-[var(--accent-secondary)]" />
            <h2 className="text-base font-semibold text-[var(--text-primary)] font-mono">Projetos Técnicos</h2>
          </div>
          <div className="space-y-4">
            {projects.map((p, i) => (
              <div key={i} className="glass-card rounded-xl p-5 group">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">{p.name}</h3>
                      {p.href && (
                        <Link href={p.href} target="_blank" rel="noopener noreferrer"
                          className="text-[var(--text-muted)] hover:text-[var(--accent-secondary)] transition-colors">
                          <ExternalLink size={12} />
                        </Link>
                      )}
                    </div>
                    <p className="text-xs text-[var(--accent-secondary)] font-mono">{p.role}</p>
                  </div>
                  <span className="font-mono text-xs text-[var(--text-muted)] shrink-0">{p.period}</span>
                </div>
                <ul className="space-y-1.5">
                  {p.bullets.map((b, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                      <span className="text-[var(--accent-primary)] shrink-0 mt-0.5">›</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Courses */}
        <section className="animate-fade-in delay-300">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen size={16} className="text-[var(--accent-secondary)]" />
            <h2 className="text-base font-semibold text-[var(--text-primary)] font-mono">Cursos Relevantes</h2>
          </div>
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  <th className="text-left px-4 py-3 text-[var(--text-muted)] font-mono font-normal">Curso</th>
                  <th className="text-left px-4 py-3 text-[var(--text-muted)] font-mono font-normal">Org.</th>
                  <th className="text-right px-4 py-3 text-[var(--text-muted)] font-mono font-normal">Carga</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c, i) => (
                  <tr key={i} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-card-hover)] transition-colors">
                    <td className="px-4 py-3 text-[var(--text-primary)]">{c.name}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)] font-mono">{c.org}</td>
                    <td className="px-4 py-3 text-right text-[var(--accent-secondary)] font-mono">{c.hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
