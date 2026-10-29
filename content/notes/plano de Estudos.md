# Plano de Estudos — CWES + PortSwigger

> **Objetivo:** Avançar com consistência na trilha **CWES**, complementar com os labs cirúrgicos da **PortSwigger Academy** e focar totalmente nas certificações antes de entrar em uma fase separada de programação. Acesso ao **Hacking Club encerrado** — o plano abaixo trabalha só com as duas plataformas restantes. As duas se complementam: a CWES traz a trilha e o rigor formal de certificação, e a PortSwigger traz fixação isolada por vulnerabilidade com teoria web de referência.

---

## Cenário atual

| Item | Detalhe |
|---|---|
| Horário na Semana (Tarde) | 14:00–18:00 (Bloco nobre: energia alta para CWES e labs) |
| Pausa / Descompressão | 18:00–19:30 (Jantar, descanso físico e reset cognitivo) |
| Horário na Semana (Noite) | 19:30–22:00 (Bloco de fixação: PortSwigger, labs da CWES, writeups e Obsidian) |
| Horário no Fim de Semana | 2 horas pontuais no Sábado (Revisão, destravar pendências e planejamento) |
| Domingo | **OFF Total** (Descanso indispensável para evitar saturação e manter o ritmo) |
| CWES (HTB Academy) | Trilha de certificação — módulos estruturados e labs práticos |
| PortSwigger Academy | Labs cirúrgicos por vulnerabilidade — teoria web de referência |
| Python | Adiado para depois das certificações |

---

## Prioridades

1. 🔴 **CWES** — trilha de certificação, conteúdo estruturado e teoria sólida
2. 🟠 **PortSwigger Academy** — labs cirúrgicos por vulnerabilidade, teoria web de referência
3. 🟡 **Obsidian / Revisão** — notas em `[[Essential Web Hacking.md]]`, `[[Payloads - Web Hacking.md]]`, writeups e templates

> ⚠️ A CWES é a **base**. A PortSwigger **complementa** — ela aprofunda a vulnerabilidade específica que você está estudando na semana.

---

## Distribuição do esforço

| Área | % do tempo | Carga Semanal Estimada (~32h) |
|---|---|---|
| CWES (HTB Academy) | 60% | ~19h |
| PortSwigger Academy | 30% | ~9h30 |
| Revisão + Obsidian | 10% | ~3h30 |

---

## Agenda semanal

| Dia | Tarde (14:00–18:00) | Noite (19:30–22:00) | Meta do Dia |
|---|---|---|---|
| **Segunda** | **CWES:** Módulo e teoria profunda da trilha | **PortSwigger:** Labs práticos do mesmo tema + Obsidian | Teoria estruturada + lab focado |
| **Terça** | **CWES:** Continuação do módulo + labs guiados | **PortSwigger:** Fixação do tema + anotações conceituais | Absorção e replicação de técnica nova |
| **Quarta** | **CWES:** Exercícios avaliados e labs práticos | **PortSwigger:** Labs avançados/bypasses + Obsidian | Fixação cirúrgica e rigor técnico |
| **Quinta** | **CWES (Aplicação prática):** Lab/máquina completa do tema da semana | **Fechamento:** Pós-exploração, flags + Writeup no Obsidian | Aplicação autônoma ponta a ponta |
| **Sexta** | **PortSwigger:** Maratona de labs práticos do tema da semana | **Revisão e Vault:** Fechamento de notas, links `[[...]]` e pendências | Síntese semanal e organização limpa |
| **Sábado (2h)** | **Bloco Cirúrgico (ex: 10:00–12:00):** Destravar 1 pendência da semana + preencher Revisão Semanal | Livre | Fechar a semana sem desgaste |
| **Domingo** | **OFF Total** | **OFF Total** | Reset mental para a próxima semana |

> **Resultado:** ~30 horas líquidas absorvidas com energia alta de segunda a sexta, com as noites consolidando os aprendizados da tarde. Fim de semana leve com apenas 2h no sábado e domingo 100% livre.

---

## Bloco diário detalhado

### Segunda e Quarta — CWES + PortSwigger

| Horário | Atividade |
|---|---|
| 14:00–14:15 | Revisar notas da sessão anterior e definir meta clara |
| 14:15–16:00 | **CWES** — Leitura técnica aprofundada, conceitos arquiteturais e teoria |
| 16:00–16:20 | Pausa / café |
| 16:20–18:00 | **CWES** — Laboratórios da plataforma, execução dos exercícios do módulo |
| *18:00–19:30* | *Intervalo de descompressão (Jantar, treino, descanso visual)* |
| 19:30–21:00 | **PortSwigger** — 2 a 3 labs específicos do mesmo tema visto na CWES (ex: SQLi Blind, SSRF) |
| 21:00–22:00 | **Obsidian** — Documentação em `[[Essential Web Hacking.md]]` e `[[Payloads - Web Hacking.md]]` |

---

### Terça — CWES (Aprofundamento + Replicação)

| Horário | Atividade |
|---|---|
| 14:00–14:15 | Revisar o objetivo do módulo atual da CWES |
| 14:15–16:00 | **CWES (Teoria):** Avançar no módulo, anotando pontos-chave e arquitetura da falha |
| 16:00–16:20 | Pausa / café |
| 16:20–18:00 | **CWES (Lab):** Reproduzir no lab exatamente a técnica estudada na teoria |
| *18:00–19:30* | *Intervalo de descompressão* |
| 19:30–21:00 | **PortSwigger (Fixação):** Praticar variações da técnica em labs cirúrgicos |
| 21:00–22:00 | **Obsidian:** Registrar comandos novos, ferramentas e conceitos em notas de cheatsheet/teoria |

---

### Quinta — CWES (Aplicação Prática em Lab/Máquina)

| Horário | Atividade |
|---|---|
| 14:00–14:15 | Selecionar o lab/máquina alvo da CWES (preferencialmente alinhado com o tema da semana) |
| 14:15–16:00 | **CWES (Máquina):** Reconhecimento ativo, enumeração de serviços e exploração do Foothold |
| 16:00–16:20 | Pausa / café |
| 16:20–18:00 | **CWES (Máquina):** Enumeração interna para escalada de privilégios (`root`/`SYSTEM`) |
| *18:00–19:30* | *Intervalo de descompressão* |
| 19:30–21:00 | **CWES (Fechamento):** Pós-exploração, captura de flags e revalidação do vetor de ataque |
| 21:00–22:00 | **Obsidian:** Writeup técnico completo, destacando falhas, comandos e payloads |

---

### Sexta — PortSwigger + Consolidação do Vault

| Horário | Atividade |
|---|---|
| 14:00–14:15 | Mapear os labs do PortSwigger que faltaram durante a semana |
| 14:15–16:00 | **PortSwigger:** Resolução focada de labs de nível Practitioner / Mystery |
| 16:00–16:20 | Pausa |
| 16:20–18:00 | **PortSwigger:** Continuação ou exploração de cenários avançados de bypass |
| *18:00–19:30* | *Intervalo de descompressão* |
| 19:30–21:00 | **Revisão Técnica:** Revisar pontos onde travou durante a semana e dúvidas pendentes |
| 21:00–22:00 | **Obsidian:** Organização geral do Vault, conexões de links `[[...]]` e estruturação de notas |

---

## Fim de semana (2 horas totais)

### Sábado — Bloco Cirúrgico de Consolidação (2 horas)

> Janela sugerida: **10:00–12:00** (ou à tarde, conforme sua preferência)

| Tempo | Atividade |
|---|---|
| 00:00–01:15 (75 min) | Destravar uma pendência pontual da semana (ex: lab específico travado ou reprodução de payload) |
| 01:15–02:00 (45 min) | Preenchimento do template de **Revisão Semanal** + definição das metas e módulos de segunda-feira |

### Domingo — OFF Total

* **Descanso total e descompressão:** Essencial para regeneração física e mental, assegurando que você comece a segunda-feira com foco afiado para encarar 6 horas de estudo de alta intensidade.

---

## Sinergia CWES ↔ PortSwigger

> As duas plataformas se complementam diretamente. O fluxo ideal é: **CWES ensina a base metódica $\leftrightarrow$ PortSwigger treina o olho cirúrgico para a vulnerabilidade isolada**.

| Papel | Plataforma | Exemplo |
|---|---|---|
| **Trilha e Rigor Metódico** | CWES (HTB Academy) | Módulo estruturado de SQLi com leitura aprofundada |
| **Lab Cirúrgico Isolado** | PortSwigger Academy | Laboratórios de SQLi Blind/UNION com filtros e WAF bypass |
| **Prática Aplicada** | CWES (Labs/Máquinas) | Lab completo onde SQLi é a porta de entrada para o Foothold |

**Fluxo da semana:**
```
Segunda (CWES) → Estuda o módulo teórico de SQLi
      ↓
Segunda à Noite (PortSwigger) → Executa 2-3 labs cirúrgicos de SQLi
      ↓
Terça (CWES) → Aprofunda o módulo + replica a técnica em lab
      ↓
Quarta (CWES) → Executa laboratórios avançados e exercícios avaliados do módulo
      ↓
Quinta (CWES - Prática) → Lab/máquina com esse vetor, faz Foothold, PrivEsc e Writeup
      ↓
Obsidian → Conecta tudo no vault com [[Essential Web Hacking.md]] e [[Payloads - Web Hacking.md]]
```

---

## Regras da rotina

- Respeitar a pausa entre a tarde e a noite (18:00 às 19:30): não pule o descanso
- Fechar toda noite com anotações e writeups no Obsidian
- Em dias de cansaço pontual, reduza a noite e preserve a tarde (o bloco nobre)
- Priorizar **constância** e retenção sobre velocidade cega
- Toda dúvida que não puder ser resolvida em 30 minutos vira nota para o sábado
- Em Seg/Qua, **sempre** fazer o lab do PortSwigger correspondente ao tema da CWES
- Na Terça-feira, **sempre** replicar no lab o que foi estudado na teoria do módulo

---

## Checklists

### Antes de estudar (Início da tarde — 14h)

- [ ] Abrir a meta do dia no Obsidian
- [ ] Revisar a nota da sessão anterior
- [ ] Separar links ou módulo da plataforma
- [ ] Definir 1 objetivo claro e inegociável para a sessão

### Ao terminar (Fim da noite — 22h)

- [ ] Registrar o que foi executado na nota diária
- [ ] Documentar comandos novos e payloads funcionais
- [ ] Catalogar dúvidas pendentes para o sábado
- [ ] Definir o primeiro passo da tarde seguinte

---

## Templates

### Nota diária

```md
# Estudo — {{date}}

## Plataforma
- [ ] CWES
- [ ] PortSwigger

## Objetivo do dia
-

## O que foi estudado
-

## Comandos / trechos importantes
​```bash

​```

## Dúvidas
-

## Próximo passo
-
```

### Revisão semanal

```md
# Revisão semanal — {{date}}

## O que avançou
- CWES:
- PortSwigger:

## Sinergia da semana
- Assunto que conectou teoria e lab:

## Onde travou
-

## O que precisa repetir / revisar
-

## Foco da próxima semana
- CWES:
- PortSwigger:
```
