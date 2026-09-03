#!/bin/bash
# ═══════════════════════════════════════════════════════
#  MÓDULO 03 — Web Fingerprint (Tech, WAF, Headers)
#  Uso standalone: ./03_webinfo.sh <alvo> <output_dir>
# ═══════════════════════════════════════════════════════

set -uo pipefail

RED='\033[0;31m'; GRN='\033[0;32m'; YLW='\033[1;33m'
BLU='\033[0;34m'; CYN='\033[0;36m'; RST='\033[0m'; BOLD='\033[1m'

info()  { echo -e "${BLU}[*]${RST} $1"; }
ok()    { echo -e "${GRN}[+]${RST} $1"; }
warn()  { echo -e "${YLW}[!]${RST} $1"; }
has()   { command -v "$1" &>/dev/null; }

TARGET="${1:?Uso: $0 <alvo> <output_dir>}"
OUTDIR="${2:?Uso: $0 <alvo> <output_dir>}/webinfo"
mkdir -p "$OUTDIR"
CLEAN=$(echo "$TARGET" | sed 's|https\?://||;s|/.*||;s|:.*||')

# Detectar URL base
if curl -sk --connect-timeout 3 "https://${CLEAN}" -o /dev/null 2>/dev/null; then
    BASE_URL="https://${CLEAN}"
elif curl -sk --connect-timeout 3 "http://${CLEAN}" -o /dev/null 2>/dev/null; then
    BASE_URL="http://${CLEAN}"
else
    BASE_URL="http://${CLEAN}"
fi

echo -e "\n${CYN}━━━ 🌐 MÓDULO 03 — Web Fingerprint ━━━${RST}"
echo -e "${BLU}    URL: ${BASE_URL}${RST}\n"

# ── Headers HTTP ──
info "Headers HTTP..."
{
    echo "═══ Response Headers ═══"
    curl -skI --connect-timeout 5 "$BASE_URL" 2>/dev/null
    echo ""
    echo "═══ Security Headers Check ═══"
    headers=$(curl -skI --connect-timeout 5 "$BASE_URL" 2>/dev/null)
    for h in "Strict-Transport-Security" "Content-Security-Policy" "X-Frame-Options" \
             "X-Content-Type-Options" "X-XSS-Protection" "Referrer-Policy" \
             "Permissions-Policy" "Access-Control-Allow-Origin"; do
        if echo "$headers" | grep -qi "$h"; then
            echo "  ✔ $h: $(echo "$headers" | grep -i "$h" | head -1 | cut -d: -f2-)"
        else
            echo "  ✘ $h: AUSENTE"
        fi
    done
} > "${OUTDIR}/headers.txt" 2>/dev/null
ok "→ headers.txt"

# Mostrar headers de segurança faltando
echo -e "\n${BOLD}  Security Headers:${RST}"
grep '✘' "${OUTDIR}/headers.txt" 2>/dev/null | while read -r line; do
    echo -e "    ${RED}${line}${RST}"
done
grep '✔' "${OUTDIR}/headers.txt" 2>/dev/null | while read -r line; do
    echo -e "    ${GRN}${line}${RST}"
done

# ── Cookies ──
info "Cookies..."
curl -sk --connect-timeout 5 -c - "$BASE_URL" 2>/dev/null > "${OUTDIR}/cookies.txt"
ok "→ cookies.txt"

# ── WhatWeb ──
if has whatweb; then
    info "whatweb (tecnologias)..."
    whatweb -a 3 "$BASE_URL" > "${OUTDIR}/whatweb.txt" 2>/dev/null
    ok "→ whatweb.txt"
    echo -e "\n${BOLD}  Tecnologias:${RST}"
    cat "${OUTDIR}/whatweb.txt" | tr ',' '\n' | head -20 | while read -r line; do
        echo -e "    ${GRN}→${RST} $line"
    done
else
    # Fallback: extrair do HTML
    info "whatweb indisponível, extraindo do HTML..."
    {
        echo "═══ Meta tags ═══"
        curl -sk "$BASE_URL" 2>/dev/null | grep -ioP '<meta[^>]+>' | head -20
        echo ""
        echo "═══ Scripts ═══"
        curl -sk "$BASE_URL" 2>/dev/null | grep -ioP 'src="[^"]+"' | head -20
        echo ""
        echo "═══ Server header ═══"
        curl -skI "$BASE_URL" 2>/dev/null | grep -i "^server:" | head -1
        echo ""
        echo "═══ X-Powered-By ═══"
        curl -skI "$BASE_URL" 2>/dev/null | grep -i "^x-powered-by:" | head -1
    } > "${OUTDIR}/tech_manual.txt"
    ok "→ tech_manual.txt"
fi

# ── WAF Detection ──
if has wafw00f; then
    info "wafw00f (WAF detection)..."
    wafw00f "$BASE_URL" > "${OUTDIR}/waf.txt" 2>/dev/null
    ok "→ waf.txt"
    # Mostrar resultado
    waf_result=$(grep -i "is behind" "${OUTDIR}/waf.txt" 2>/dev/null || grep -i "no waf" "${OUTDIR}/waf.txt" 2>/dev/null || echo "Inconclusivo")
    echo -e "    ${YLW}🛡️  ${waf_result}${RST}"
else
    warn "wafw00f não instalado."
fi

# ── Robots.txt ──
info "robots.txt..."
robots=$(curl -sk --connect-timeout 5 "${BASE_URL}/robots.txt" 2>/dev/null)
if [[ -n "$robots" ]] && ! echo "$robots" | grep -qi "404\|not found"; then
    echo "$robots" > "${OUTDIR}/robots.txt"
    ok "→ robots.txt"
    disallow=$(echo "$robots" | grep -i "disallow" | head -10)
    if [[ -n "$disallow" ]]; then
        echo -e "\n${BOLD}  Disallow entries:${RST}"
        echo "$disallow" | while read -r line; do echo -e "    ${YLW}→${RST} $line"; done
    fi
else
    warn "robots.txt não encontrado."
fi

# ── Sitemap ──
info "sitemap.xml..."
sitemap=$(curl -sk --connect-timeout 5 "${BASE_URL}/sitemap.xml" 2>/dev/null)
if [[ -n "$sitemap" ]] && echo "$sitemap" | grep -qi "urlset\|sitemapindex"; then
    echo "$sitemap" > "${OUTDIR}/sitemap.xml"
    urls_count=$(echo "$sitemap" | grep -coP '<loc>' 2>/dev/null || echo 0)
    ok "→ sitemap.xml (${urls_count} URLs)"
else
    warn "sitemap.xml não encontrado."
fi

# ── .well-known paths ──
info "Caminhos comuns..."
{
    for path in "/.well-known/security.txt" "/.env" "/wp-login.php" "/admin" \
                "/login" "/.git/HEAD" "/.svn/entries" "/phpinfo.php" \
                "/server-status" "/server-info" "/.htaccess" "/crossdomain.xml"; do
        code=$(curl -sk -o /dev/null -w "%{http_code}" --connect-timeout 3 "${BASE_URL}${path}" 2>/dev/null || echo "000")
        if [[ "$code" =~ ^(200|301|302|403)$ ]]; then
            echo "[${code}] ${path}"
        fi
    done
} > "${OUTDIR}/interesting_paths.txt"
ok "→ interesting_paths.txt"

if [[ -s "${OUTDIR}/interesting_paths.txt" ]]; then
    echo -e "\n${BOLD}  Paths interessantes:${RST}"
    cat "${OUTDIR}/interesting_paths.txt" | while read -r line; do
        echo -e "    ${YLW}→${RST} $line"
    done
fi

# ── HTML Report ──
HELPERS="$(dirname "$0")/_html_helpers.sh"
if [[ -f "$HELPERS" ]]; then
    source "$HELPERS"
    HTML="${OUTDIR}/report.html"

    html_head "🌐 Web Fingerprint — ${CLEAN}" > "$HTML"

    # Stats
    local sec_ok=0 sec_fail=0 paths_count=0
    [[ -f "${OUTDIR}/headers.txt" ]] && sec_ok=$(grep -c '✔' "${OUTDIR}/headers.txt" 2>/dev/null || echo 0)
    [[ -f "${OUTDIR}/headers.txt" ]] && sec_fail=$(grep -c '✘' "${OUTDIR}/headers.txt" 2>/dev/null || echo 0)
    [[ -f "${OUTDIR}/interesting_paths.txt" ]] && paths_count=$(wc -l < "${OUTDIR}/interesting_paths.txt" 2>/dev/null || echo 0)

    cat >> "$HTML" <<EOF
<h1>🌐 Web Fingerprint</h1>
<p class="meta">URL: <strong>${BASE_URL}</strong> — $(date '+%Y-%m-%d %H:%M:%S')</p>

<div class="stats">
$(html_stat "$sec_ok" "Headers OK" "green")
$(html_stat "$sec_fail" "Headers faltando" "red")
$(html_stat "$paths_count" "Paths sensíveis" "yellow")
</div>
EOF

    # Security Headers
    html_section_start "🛡️ Security Headers" >> "$HTML"
    echo '<table><tr><th>Header</th><th>Status</th><th>Valor</th></tr>' >> "$HTML"
    if [[ -f "${OUTDIR}/headers.txt" ]]; then
        grep -E '^\s*(✔|✘)' "${OUTDIR}/headers.txt" 2>/dev/null | while IFS= read -r line; do
            local hname hval
            if echo "$line" | grep -q '✔'; then
                hname=$(echo "$line" | sed 's/.*✔ //;s/:.*//') 
                hval=$(echo "$line" | sed 's/[^:]*://' | _esc)
                echo "<tr><td>${hname}</td><td>$(html_badge "✔ OK" "green")</td><td>${hval}</td></tr>" >> "$HTML"
            else
                hname=$(echo "$line" | sed 's/.*✘ //;s/:.*//') 
                echo "<tr><td>${hname}</td><td>$(html_badge "✘ AUSENTE" "red")</td><td>—</td></tr>" >> "$HTML"
            fi
        done
    fi
    echo '</table>' >> "$HTML"
    html_section_end >> "$HTML"

    # Response headers
    html_section_start "📋 Response Headers" >> "$HTML"
    html_file_pre "${OUTDIR}/headers.txt" 50 >> "$HTML"
    html_section_end >> "$HTML"

    # Tecnologias
    if [[ -f "${OUTDIR}/whatweb.txt" ]]; then
        html_section_start "🔧 Tecnologias (whatweb)" >> "$HTML"
        echo '<div style="padding:10px">' >> "$HTML"
        cat "${OUTDIR}/whatweb.txt" 2>/dev/null | tr ',' '\n' | while IFS= read -r tech; do
            tech=$(echo "$tech" | sed 's/^ *//' | _esc)
            [[ -n "$tech" ]] && echo "<span class=\"tag\">${tech}</span>" >> "$HTML"
        done
        echo '</div>' >> "$HTML"
        html_section_end >> "$HTML"
    fi

    # WAF
    if [[ -f "${OUTDIR}/waf.txt" ]]; then
        html_section_start "🛡️ WAF Detection" >> "$HTML"
        html_file_pre "${OUTDIR}/waf.txt" 20 >> "$HTML"
        html_section_end >> "$HTML"
    fi

    # Paths sensíveis
    if [[ -s "${OUTDIR}/interesting_paths.txt" ]]; then
        html_section_start "🔍 Paths Sensíveis (${paths_count})" >> "$HTML"
        echo '<table><tr><th>Status</th><th>Path</th></tr>' >> "$HTML"
        while IFS= read -r line; do
            local code path
            code=$(echo "$line" | grep -oP '^\[\K\d+')
            path=$(echo "$line" | grep -oP '\] \K.*')
            echo "<tr><td>$(html_status_badge "${code:-?}")</td><td><a href=\"${BASE_URL}${path}\" target=\"_blank\">${path}</a></td></tr>" >> "$HTML"
        done < "${OUTDIR}/interesting_paths.txt"
        echo '</table>' >> "$HTML"
        html_section_end >> "$HTML"
    fi

    # Robots.txt
    if [[ -f "${OUTDIR}/robots.txt" ]]; then
        html_section_start "🤖 robots.txt" >> "$HTML"
        html_file_pre "${OUTDIR}/robots.txt" 50 >> "$HTML"
        html_section_end >> "$HTML"
    fi

    # Cookies
    if [[ -s "${OUTDIR}/cookies.txt" ]]; then
        html_section_start "🍪 Cookies" >> "$HTML"
        html_file_pre "${OUTDIR}/cookies.txt" 30 >> "$HTML"
        html_section_end >> "$HTML"
    fi

    html_foot >> "$HTML"
    ok "→ report.html"
fi

echo -e "\n${GRN}━━━ Módulo 03 concluído ━━━${RST}"

