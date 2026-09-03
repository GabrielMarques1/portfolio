#!/bin/bash
# ═══════════════════════════════════════════════════════
#  MÓDULO 02 — Port Scan & Serviços
#  Uso standalone: ./02_ports.sh <alvo> <output_dir>
# ═══════════════════════════════════════════════════════

set -uo pipefail

RED='\033[0;31m'; GRN='\033[0;32m'; YLW='\033[1;33m'
BLU='\033[0;34m'; CYN='\033[0;36m'; RST='\033[0m'; BOLD='\033[1m'

info()  { echo -e "${BLU}[*]${RST} $1"; }
ok()    { echo -e "${GRN}[+]${RST} $1"; }
warn()  { echo -e "${YLW}[!]${RST} $1"; }
fail()  { echo -e "${RED}[-]${RST} $1"; }
has()   { command -v "$1" &>/dev/null; }

TARGET="${1:?Uso: $0 <alvo> <output_dir>}"
OUTDIR="${2:?Uso: $0 <alvo> <output_dir>}/ports"
mkdir -p "$OUTDIR"
CLEAN=$(echo "$TARGET" | sed 's|https\?://||;s|/.*||;s|:.*||')

echo -e "\n${CYN}━━━ 🔌 MÓDULO 02 — Port Scan & Serviços ━━━${RST}\n"

if ! has nmap; then fail "nmap não instalado!"; exit 1; fi

# Detectar se é root para escolher tipo de scan
if [[ $EUID -eq 0 ]]; then
    SCAN_TYPE=""       # root: nmap usa SYN scan por padrão
    info "Rodando como root — SYN scan."
else
    SCAN_TYPE="-sT"    # sem root: TCP connect scan (não pede sudo)
    info "Sem root — usando TCP connect scan (-sT)."
fi

# Quick scan — top 1000
info "Quick scan — top 1000 portas..."
nmap $SCAN_TYPE -T4 --open -Pn -oN "${OUTDIR}/quick_scan.txt" -oG "${OUTDIR}/quick_scan.gnmap" "$CLEAN" 2>/dev/null

open_ports=$(grep -oP '\d+/open' "${OUTDIR}/quick_scan.gnmap" 2>/dev/null | cut -d/ -f1 | tr '\n' ',' | sed 's/,$//')

# Se nada, scan completo
if [[ -z "$open_ports" ]]; then
    warn "Nada no top 1000. Scan completo (-p-)..."
    nmap $SCAN_TYPE -T4 -p- --open -Pn -oN "${OUTDIR}/full_scan.txt" -oG "${OUTDIR}/full_scan.gnmap" "$CLEAN" 2>/dev/null
    open_ports=$(grep -oP '\d+/open' "${OUTDIR}/full_scan.gnmap" 2>/dev/null | cut -d/ -f1 | tr '\n' ',' | sed 's/,$//')
fi

if [[ -z "$open_ports" ]]; then fail "Nenhuma porta aberta."; exit 0; fi

ok "Portas abertas: ${open_ports}"
echo "$open_ports" > "${OUTDIR}/open_ports.txt"

# Service & Version
info "Detectando serviços (-sV -sC)..."
nmap $SCAN_TYPE -sV -sC -T4 -Pn -p "$open_ports" -oN "${OUTDIR}/services.txt" -oX "${OUTDIR}/services.xml" "$CLEAN" 2>/dev/null
ok "→ services.txt"

echo -e "\n${BOLD}  Serviços:${RST}"
grep -E '^[0-9]+/' "${OUTDIR}/services.txt" 2>/dev/null | while read -r line; do
    echo -e "    ${GRN}→${RST} $line"
done

# OS Detection (root only)
if [[ $EUID -eq 0 ]]; then
    info "OS Detection..."
    nmap -O -p "$open_ports" -oN "${OUTDIR}/os_detect.txt" "$CLEAN" 2>/dev/null
    ok "→ os_detect.txt"

    info "UDP top 20..."
    nmap -sU --top-ports 20 -T4 --open -oN "${OUTDIR}/udp_scan.txt" "$CLEAN" 2>/dev/null
    ok "→ udp_scan.txt"
else
    warn "Rode como root para OS detection e UDP scan."
fi

# Nmap vuln scripts
info "Nmap vuln scripts..."
nmap $SCAN_TYPE --script vuln -Pn -p "$open_ports" -oN "${OUTDIR}/nmap_vulns.txt" "$CLEAN" 2>/dev/null || true
ok "→ nmap_vulns.txt"

# ── HTML Report ──
HELPERS="$(dirname "$0")/_html_helpers.sh"
if [[ -f "$HELPERS" ]]; then
    source "$HELPERS"
    HTML="${OUTDIR}/report.html"

    html_head "🔌 Port Scan — ${CLEAN}" > "$HTML"

    # Contar portas
    port_count=$(echo "$open_ports" | tr ',' '\n' | wc -l)

    cat >> "$HTML" <<EOF
<h1>🔌 Port Scan & Serviços</h1>
<p class="meta">Alvo: <strong>${CLEAN}</strong> — $(date '+%Y-%m-%d %H:%M:%S')</p>

<div class="stats">
$(html_stat "$port_count" "Portas abertas" "green")
$(html_stat "$(echo "$open_ports" | tr ',' '\n' | head -1)" "Primeira porta" "blue")
EOF
    [[ $EUID -eq 0 ]] && echo "$(html_stat "SYN" "Tipo de scan" "purple")" >> "$HTML" || echo "$(html_stat "TCP" "Tipo de scan" "yellow")" >> "$HTML"
    echo '</div>' >> "$HTML"

    # Tabela de portas/serviços
    html_section_start "🔓 Portas & Serviços" >> "$HTML"
    echo '<table><tr><th>Porta</th><th>Estado</th><th>Serviço</th><th>Versão</th></tr>' >> "$HTML"
    if [[ -f "${OUTDIR}/services.txt" ]]; then
        grep -E '^[0-9]+/' "${OUTDIR}/services.txt" 2>/dev/null | while IFS= read -r line; do
            local port state svc version
            port=$(echo "$line" | awk -F/ '{print $1}')
            state=$(echo "$line" | awk '{print $2}')
            svc=$(echo "$line" | awk '{print $3}')
            version=$(echo "$line" | awk '{for(i=4;i<=NF;i++) printf "%s ",$i; print ""}' | sed 's/ *$//')
            echo "<tr><td><strong>${port}</strong></td><td>$(html_badge "$state" "green")</td><td>${svc}</td><td>$(echo "$version" | _esc)</td></tr>" >> "$HTML"
        done
    fi
    echo '</table>' >> "$HTML"
    html_section_end >> "$HTML"

    # Service details
    html_section_start "📋 Scan Detalhado (nmap -sV -sC)" >> "$HTML"
    html_file_pre "${OUTDIR}/services.txt" 150 >> "$HTML"
    html_section_end >> "$HTML"

    # OS Detection
    if [[ -f "${OUTDIR}/os_detect.txt" ]]; then
        html_section_start "🖥️ OS Detection" >> "$HTML"
        html_file_pre "${OUTDIR}/os_detect.txt" 40 >> "$HTML"
        html_section_end >> "$HTML"
    fi

    # UDP
    if [[ -f "${OUTDIR}/udp_scan.txt" ]]; then
        html_section_start "📡 UDP Scan" >> "$HTML"
        html_file_pre "${OUTDIR}/udp_scan.txt" 40 >> "$HTML"
        html_section_end >> "$HTML"
    fi

    # Vuln scripts
    if [[ -s "${OUTDIR}/nmap_vulns.txt" ]]; then
        html_section_start "⚠️ Nmap Vuln Scripts" >> "$HTML"
        html_file_pre "${OUTDIR}/nmap_vulns.txt" 100 >> "$HTML"
        html_section_end >> "$HTML"
    fi

    html_foot >> "$HTML"
    ok "→ report.html"
fi

echo -e "\n${GRN}━━━ Módulo 02 concluído ━━━${RST}"

