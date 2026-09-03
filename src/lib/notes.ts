import fs from "fs";
import path from "path";

export interface NoteDoc {
  slug: string;
  filename: string;
  title: string;
  category: "Web Security" | "Privilege Escalation" | "Offensive Methodologies" | "Evasion & Payloads";
  tags: string[];
  summary: string;
  topics: string[];
  githubUrl: string;
  content: string;
}

const NOTES_DIR = path.join(process.cwd(), "content/notes");

const NOTES_METADATA: Omit<NoteDoc, "content">[] = [
  {
    slug: "essential-web-hacking",
    filename: "Essential Web Hacking.md",
    title: "Essential Web Hacking — Guia Definitivo de Recon e Exploração",
    category: "Web Security",
    tags: ["recon", "xss", "sqli", "cmdi", "csrf", "lfi", "rce"],
    summary: "Base de conhecimento exaustiva cobrindo reconhecimento moderno (subdomínios, probes, crawlers, JS analysis), fuzzing anti-FP, port scan e exploração aprofundada de vulnerabilidades web.",
    topics: [
      "Recon ativo e passivo: subfinder, httpx, katana, gau, nuclei",
      "Fuzzing avançado de diretórios, Vhosts e parâmetros com ffuf",
      "SQL Injection completo: UNION-based, Blind, Time-Based e RCE via INTO OUTFILE",
      "Command Injection, LFI/RFI, CSRF e XSS (Reflected, Stored, DOM)",
      "Upgrade de shells reversas para TTY sanitizado completo"
    ],
    githubUrl: "https://github.com/GabrielMarques1/Cyber-security/blob/main/Essential%20Web%20Hacking.md"
  },
  {
    slug: "owasp-api-top-10",
    filename: "OWASP API Top 10.md",
    title: "OWASP API Security Top 10 — Arquitetura e Exploração",
    category: "Web Security",
    tags: ["api", "bola", "bopla", "jwt", "ssrf", "idor", "rate-limit"],
    summary: "Guia prático e analítico das 10 principais falhas em APIs REST e GraphQL (BOLA, Broken Authentication, BOPLA, SSRF, Mass Assignment e Consumption of Resources).",
    topics: [
      "API1 (BOLA / IDOR): Vetores de rota, body JSON e manipulação de permissões",
      "API2 (Broken Auth): Vetores em JWTs (alg:none, secret fraco) e ataques de chave",
      "API3 (BOPLA / Mass Assignment): Manipulação de propriedades de objetos internos",
      "API7 (SSRF via API): Webhooks e SSRF interno atingindo docker.sock e metadados de nuvem",
      "Checklists de mitigação defensiva e arquitetural para cada risco"
    ],
    githubUrl: "https://github.com/GabrielMarques1/Cyber-security/blob/main/OWASP%20API%20Top%2010.md"
  },
  {
    slug: "linux-privilege-escalation",
    filename: "Linux Privilege Escalation.md",
    title: "Linux Privilege Escalation — Cheatsheet e Metodologias",
    category: "Privilege Escalation",
    tags: ["privesc", "linux", "suid", "sudo", "capabilities", "cron", "kernel"],
    summary: "Roteiro metodológico completo para escalação de privilégios de usuário comum (ex: www-data) para root em ambientes GNU/Linux.",
    topics: [
      "Enumeração inicial automatizada e manual (LinPEAS, pspy, linpeas.sh)",
      "Sudo Rights & Misconfigurations: bypass de sudoers e GTFOBins",
      "Binários SUID/SGID vulneráveis e exploração de PATH hijacking",
      "Linux Capabilities perigosas (cap_setuid, cap_dac_read_search)",
      "Tarefas agendadas (Cron jobs) com scripts e caminhos graváveis",
      "Kernel exploits clássicos e boas práticas de estabilização de shell"
    ],
    githubUrl: "https://github.com/GabrielMarques1/Cyber-security/blob/main/Linux%20Privilege%20Escalation.md"
  },
  {
    slug: "waf-bypass",
    filename: "WAF Bypass.md",
    title: "WAF Bypass — Evasão de Filtros e Assinaturas",
    category: "Evasion & Payloads",
    tags: ["waf", "bypass", "encoding", "obfuscation", "evasion"],
    summary: "Técnicas consolidadas de evasão de Web Application Firewalls (Cloudflare, ModSecurity, AWS WAF, Imperva) para entrega de payloads de SQLi, XSS e CMDI.",
    topics: [
      "Transformações de encoding: URL, Double URL, Unicode e Base64",
      "Comentários inline e quebra de tokens SQL (ex: /*!50000SELECT*/)",
      "Evasão de filtros em Command Injection com $IFS, variáveis de ambiente e wildcards",
      "HTTP Request Smuggling e desvio de regras de proxy reverso"
    ],
    githubUrl: "https://github.com/GabrielMarques1/Cyber-security/blob/main/WAF%20Bypass.md"
  },
  {
    slug: "payloads-web-hacking",
    filename: "Payloads - Web Hacking.md",
    title: "Payloads Vault — Coleção Tática de Injeções Web",
    category: "Evasion & Payloads",
    tags: ["payloads", "cheatsheet", "sqli", "xss", "lfi", "ssti"],
    summary: "Dicionário de payloads prontos para uso em CTFs e auditorias de segurança ofensiva, organizados por contexto de vulnerabilidade e tecnologia.",
    topics: [
      "Payloads Polyglot para XSS e SQL Injection",
      "Wrappers PHP para LFI (php://filter, php://input, data://)",
      "Payloads de Server-Side Template Injection (SSTI) em Jinja2, Twig e Smarty",
      "One-liners de Reverse Shell em Python, Bash, PHP, Perl e Socat"
    ],
    githubUrl: "https://github.com/GabrielMarques1/Cyber-security/blob/main/Payloads%20-%20Web%20Hacking.md"
  },
  {
    slug: "process-of-hacking",
    filename: "Process of Hacking.md",
    title: "Process of Hacking — Metodologia Estruturada de Pentest",
    category: "Offensive Methodologies",
    tags: ["ptes", "mitre", "methodology", "mindset", "recon"],
    summary: "Framework mental e passos sequenciais alinhados ao PTES (Penetration Testing Execution Standard) para abordagem sistemática de alvos.",
    topics: [
      "Fase 1: Intelligence Gathering & OSINT",
      "Fase 2: Threat Modeling e mapeamento de vetores prioritários",
      "Fase 3: Análise de vulnerabilidades ativa e correlação",
      "Fase 4: Exploitation com agressividade cirúrgica",
      "Fase 5: Post-Exploitation, movimentação lateral e persistência"
    ],
    githubUrl: "https://github.com/GabrielMarques1/Cyber-security/blob/main/Process%20of%20Hacking.md"
  },
  {
    slug: "kali-arch-notas-basicas",
    filename: "Kali linux & Arch e minhas anotações basicas.md",
    title: "Ambiente Linux — Setup, Comandos e Dotfiles para Pentest",
    category: "Offensive Methodologies",
    tags: ["arch-linux", "kali", "environment", "setup", "bash"],
    summary: "Configuração do ambiente de ataque no Arch Linux e Kali: ferramentas essenciais, aliases úteis, gerenciamento de rede e tunelamento com Chisel/SSH.",
    topics: [
      "Comandos essenciais de terminal e pipelines úteis",
      "Pivoting e port forwarding com SSH, Chisel e Socat",
      "Configuração de proxies locais e interceptação com Burp Suite",
      "Estruturação de notas e gerenciamento de evidências"
    ],
    githubUrl: "https://github.com/GabrielMarques1/Cyber-security/blob/main/Kali%20linux%20%26%20Arch%20e%20minhas%20anota%C3%A7%C3%B5es%20basicas.md"
  }
];

export function getAllNotes(): NoteDoc[] {
  return NOTES_METADATA.map((meta) => {
    const filePath = path.join(NOTES_DIR, meta.filename);
    let content = "# Conteúdo não encontrado no vault.";
    if (fs.existsSync(filePath)) {
      content = fs.readFileSync(filePath, "utf-8");
    }
    return {
      ...meta,
      content,
    };
  });
}

export function getNoteBySlug(slug: string): NoteDoc | null {
  const all = getAllNotes();
  return all.find((n) => n.slug === slug) || null;
}
