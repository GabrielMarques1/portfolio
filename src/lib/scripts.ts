import fs from "fs";
import path from "path";

export interface ScriptDoc {
  slug: string;
  filename: string;
  name: string;
  language: "python" | "bash";
  category: "Web & SQL Injection" | "Recon & Automation" | "Offensive Tools";
  tag: string;
  summary: string;
  features: string[];
  usage: string;
  githubUrl: string;
  code: string;
}

const SCRIPTS_DIR = path.join(process.cwd(), "content/scripts");

const SCRIPTS_METADATA: Omit<ScriptDoc, "code">[] = [
  {
    slug: "sqli-blind-py",
    filename: "sqli_blind.py",
    name: "sqli_blind.py — Time-Based Blind Dumper ⚡",
    language: "python",
    category: "Web & SQL Injection",
    tag: "sqli",
    summary: "Ferramenta interativa de alta performance para exploração e extração automatizada em SQL Injection Time-Based Blind, Error-Based e INTO OUTFILE.",
    features: [
      "Busca binária otimizada: ~7 requests por caractere em vez de ~70 (10x mais rápido)",
      "Detecção automática do SGBD (MySQL, PostgreSQL, MSSQL) e sintaxe de delay",
      "Múltiplos modos: Time-based, Error-based (extractvalue/updatexml), LOAD_FILE e INTO OUTFILE",
      "Persistência automática do loot em arquivo de texto e SQLite local (loot.db)",
      "Gerenciamento de sessões com token CSRF dinâmico e multithreading por posição"
    ],
    usage: `# Configurar alvo e delay no cabeçalho do script\nTARGET = "http://alvo.com/login"\nDELAY  = 1.5\nTHREADS = 3\n\n# Executar modo interativo com menu numérico\npython3 sqli_blind.py`,
    githubUrl: "https://github.com/GabrielMarques1/Scripts/blob/main/script%20em%20python%20SQL/sqli_blind.py"
  },
  {
    slug: "nosql-py",
    filename: "NoSql.py",
    name: "NoSql.py — NoSQL Injection Extractor",
    language: "python",
    category: "Web & SQL Injection",
    tag: "nosql",
    summary: "Extrator automatizado de credenciais e tokens para aplicações MongoDB/Express vulneráveis a injeção NoSQL usando operadores de expressão regular.",
    features: [
      "Enumeração caractere por caractere via regex com operador $regex",
      "Bypass de autenticação com operadores de negação ($ne)",
      "Análise de resposta HTTP baseada em conteúdo refletido para validação de acerto",
      "Suporte a wordlists de charset estendidas (string.printable)"
    ],
    usage: `# Ajustar a rota e o marcador de sucesso retornado pela aplicação\nurl = "http://alvo.com/login"\n# Executar:\npython3 NoSql.py`,
    githubUrl: "https://github.com/GabrielMarques1/Scripts/blob/main/script%20em%20python%20SQL/NoSql.py"
  },
  {
    slug: "recon-sh",
    filename: "recon.sh",
    name: "recon.sh — Recon Automation Master",
    language: "bash",
    category: "Recon & Automation",
    tag: "recon",
    summary: "Orquestrador mestre em Shell Script com menu interativo e pipeline completo de reconhecimento externo e interno para alvos web.",
    features: [
      "Menu interativo com suporte a execução modular ou suíte completa (FULL RECON)",
      "Separação granular de outputs por pastas (subdomains, ports, webinfo, dirs, vulns)",
      "Geração de relatório consolidado final report.txt",
      "Detecção automática de privilégios de root para calibração de flags do nmap"
    ],
    usage: `# Modo interativo com menu CLI:\n./recon.sh\n\n# Modo direto passando o domínio ou IP alvo:\n./recon.sh exemplo.com`,
    githubUrl: "https://github.com/GabrielMarques1/Scripts/blob/main/recon/recon.sh"
  },
  {
    slug: "04-dirs-sh",
    filename: "04_dirs.sh",
    name: "04_dirs.sh — Advanced Web & Parameter Fuzzing",
    language: "bash",
    category: "Recon & Automation",
    tag: "fuzzing",
    summary: "Módulo de fuzzing de alta precisão com calibração anti-falso positivo, Host header fuzzing (Vhosts), brute-force de extensões e teste automatizado de parâmetros para injeções.",
    features: [
      "Calibração automática inteligente: detecta respostas 404 customizadas e filtra tamanhos de página dinâmicos",
      "Fuzzing de Virtual Hosts (Vhosts) via cabeçalho Host",
      "Parameter discovery com injeção automática de testes para LFI, XSS, SQLi, SSTI, CMDI e SSRF",
      "Higienização de sequências de escape ANSI em todos os relatórios gerados"
    ],
    usage: `# Execução standalone com menu interativo de wordlists:\n./04_dirs.sh 10.10.10.1 ./output/10.10.10.1`,
    githubUrl: "https://github.com/GabrielMarques1/Scripts/blob/main/recon/modules/04_dirs.sh"
  },
  {
    slug: "01-subdomains-sh",
    filename: "01_subdomains.sh",
    name: "01_subdomains.sh — Subdomain & DNS Enumeration",
    language: "bash",
    category: "Recon & Automation",
    tag: "dns",
    summary: "Enumeração exaustiva de subdomínios combinando técnicas passivas (crt.sh, subfinder, amass) e ativas com resolução DNS e validação de hosts ativos.",
    features: [
      "Consultas Certificate Transparency (crt.sh) e DNS Dumpster",
      "Detecção e filtragem automática de DNS Wildcards",
      "Deduplicação de listas e checagem de servidores web ativos via httpx"
    ],
    usage: `./01_subdomains.sh alvo.com ./output/alvo.com`,
    githubUrl: "https://github.com/GabrielMarques1/Scripts/blob/main/recon/modules/01_subdomains.sh"
  },
  {
    slug: "02-ports-sh",
    filename: "02_ports.sh",
    name: "02_ports.sh — Port Scanning & Service Fingerprint",
    language: "bash",
    category: "Recon & Automation",
    tag: "nmap",
    summary: "Mapeamento completo de portas e detecção de serviços via nmap com adaptação dinâmica de privilégios de execução.",
    features: [
      "Detecção inteligente: TCP connect (-sT) sem sudo / SYN stealth (-sS) com root",
      "Escaneamento inicial rápido seguido de varredura completa das 65.535 portas",
      "Execução de scripts NSE padrão para identificação rápida de serviços obsoletos e vulneráveis"
    ],
    usage: `./02_ports.sh 10.10.10.1 ./output/10.10.10.1`,
    githubUrl: "https://github.com/GabrielMarques1/Scripts/blob/main/recon/modules/02_ports.sh"
  },
  {
    slug: "03-webinfo-sh",
    filename: "03_webinfo.sh",
    name: "03_webinfo.sh — Web Fingerprint & Security Headers",
    language: "bash",
    category: "Recon & Automation",
    tag: "webinfo",
    summary: "Análise de cabeçalhos de resposta HTTP, identificação de WAF, tecnologias subjacentes (whatweb) e mapeamento de arquivos sensíveis como robots.txt e sitemap.",
    features: [
      "Auditoria de cabeçalhos de segurança (CSP, HSTS, X-Frame-Options, Cookie flags)",
      "Detecção de Web Application Firewall (WAF) com wafw00f",
      "Verificação de arquivos estáticos e rotas administrativas comuns"
    ],
    usage: `./03_webinfo.sh 10.10.10.1:80 ./output/10.10.10.1`,
    githubUrl: "https://github.com/GabrielMarques1/Scripts/blob/main/recon/modules/03_webinfo.sh"
  },
  {
    slug: "05-vulns-sh",
    filename: "05_vulns.sh",
    name: "05_vulns.sh — Automated Vulnerability Discovery",
    language: "bash",
    category: "Recon & Automation",
    tag: "vulns",
    summary: "Triagem automatizada de vulnerabilidades web conhecidas com nikto, templates nuclei, auditoria de configurações SSL/TLS e misconfigurations de CORS.",
    features: [
      "Scan direcionado por templates de severidade no nuclei",
      "Testes de políticas de CORS permissivas com origens nulas ou arbitrárias",
      "Integração com searchsploit para correlacionar versões descobertas a exploits públicos"
    ],
    usage: `./05_vulns.sh 10.10.10.1:443 ./output/10.10.10.1`,
    githubUrl: "https://github.com/GabrielMarques1/Scripts/blob/main/recon/modules/05_vulns.sh"
  }
];

export function getAllScripts(): ScriptDoc[] {
  return SCRIPTS_METADATA.map((meta) => {
    const filePath = path.join(SCRIPTS_DIR, meta.filename);
    let code = "# Código fonte não disponível no momento.";
    if (fs.existsSync(filePath)) {
      code = fs.readFileSync(filePath, "utf-8");
    }
    return {
      ...meta,
      code,
    };
  });
}

export function getScriptBySlug(slug: string): ScriptDoc | null {
  const all = getAllScripts();
  return all.find((s) => s.slug === slug) || null;
}
