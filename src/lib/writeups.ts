import fs from "fs";
import path from "path";

export interface WriteupMetadata {
  slug: string;
  filename: string;
  machine: string;
  difficulty: "Fácil" | "Médio" | "Difícil" | "Insano";
  os: string;
  tags: string[];
  summary: string;
  rooted: boolean;
  platform: string;
  content: string;
}

const WRITEUPS_DIR = path.join(process.cwd(), "content/writeups");

const MACHINE_CONFIGS: Record<string, {
  slug: string;
  machine: string;
  difficulty: "Fácil" | "Médio" | "Difícil" | "Insano";
  platform: string;
  os: string;
}> = {
  "Writeup — Máquina Cyber-News.md": {
    slug: "cyber-news",
    machine: "Cyber-News",
    difficulty: "Difícil",
    platform: "Hacking Club",
    os: "Linux",
  },
  "Writeup — Máquina Retro.md": {
    slug: "retro",
    machine: "Retro",
    difficulty: "Médio",
    platform: "Hacking Club",
    os: "Linux",
  },
  "Writeup — Máquina Poisoning.md": {
    slug: "poisoning",
    machine: "Poisoning",
    difficulty: "Médio",
    platform: "Hacking Club",
    os: "Linux",
  },
  "Writeup — Máquina Lion.md": {
    slug: "lion",
    machine: "Lion",
    difficulty: "Médio",
    platform: "Hacking Club",
    os: "Linux",
  },
  "Writeup — Máquina Calc.md": {
    slug: "calc",
    machine: "Calc",
    difficulty: "Médio",
    platform: "Hacking Club",
    os: "Linux",
  },
  "Writeup — Máquina Laravel-Time.md": {
    slug: "laravel-time",
    machine: "Laravel-Time",
    difficulty: "Médio",
    platform: "Hacking Club",
    os: "Linux",
  },
};

export function getAllWriteups(): WriteupMetadata[] {
  if (!fs.existsSync(WRITEUPS_DIR)) {
    return [];
  }

  const files = fs.readdirSync(WRITEUPS_DIR).filter((f) => f.endsWith(".md"));

  const writeups = files.map((filename) => {
    const filePath = path.join(WRITEUPS_DIR, filename);
    const rawContent = fs.readFileSync(filePath, "utf-8");

    const conf = MACHINE_CONFIGS[filename] || {
      slug: filename.replace(/Writeup\s*—\s*Máquina\s*/i, "").replace(/\.md$/, "").trim().toLowerCase().replace(/\s+/g, "-"),
      machine: filename.replace(/Writeup\s*—\s*Máquina\s*/i, "").replace(/\.md$/, "").trim(),
      difficulty: "Médio" as const,
      platform: "CTF / Lab",
      os: "Linux",
    };

    // Extrair tags
    const tagsMatch = rawContent.match(/>\s*\*\*Dificuldade:\*\*.*?Tags:\*\*\s*(.+)/i);
    let tags: string[] = [];
    if (tagsMatch && tagsMatch[1]) {
      tags = tagsMatch[1]
        .split(/·|,/)
        .map((t) => t.replace(/[`*]/g, "").trim())
        .filter(Boolean);
    }

    // Extrair Sumário Executivo
    const summaryMatch = rawContent.match(/##\s*1\.\s*Sumário Executivo\s*\n\n([\s\S]*?)(?=\n\n---\n\n##|\n\n## 2)/i);
    const summary = summaryMatch ? summaryMatch[1].trim() : "Documentação de exploração completa da máquina com mapeamento PTES e MITRE ATT&CK.";

    return {
      slug: conf.slug,
      filename,
      machine: conf.machine,
      difficulty: conf.difficulty,
      os: conf.os,
      tags,
      summary,
      rooted: true,
      platform: conf.platform,
      content: rawContent,
    };
  });

  // Ordenar Cyber-News e Retro no topo
  const order = ["cyber-news", "retro", "poisoning", "lion", "calc", "laravel-time"];
  return writeups.sort((a, b) => {
    const idxA = order.indexOf(a.slug);
    const idxB = order.indexOf(b.slug);
    return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
  });
}

export function getWriteupBySlug(slug: string): WriteupMetadata | null {
  const all = getAllWriteups();
  return all.find((w) => w.slug === slug) || null;
}
