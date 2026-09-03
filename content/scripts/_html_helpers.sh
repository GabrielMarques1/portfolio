#!/bin/bash
# ═══════════════════════════════════════════════════════
#  HTML Helper — funções compartilhadas de geração HTML
#  Sourced pelos módulos para gerar relatórios visuais
# ═══════════════════════════════════════════════════════

# Escape HTML
_esc() { sed 's/&/\&amp;/g;s/</\&lt;/g;s/>/\&gt;/g;s/"/\&quot;/g'; }

# Head HTML com CSS dark mode profissional
html_head() {
    local title="$1"
    cat <<HTMLHEAD
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — Recon Toolkit</title>
<style>
  :root {
    --bg: #0d1117; --bg2: #161b22; --bg3: #21262d;
    --border: #30363d; --text: #c9d1d9; --text2: #8b949e;
    --green: #3fb950; --red: #f85149; --yellow: #d29922;
    --blue: #58a6ff; --purple: #bc8cff; --cyan: #39d353;
    --orange: #f0883e;
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:var(--bg); color:var(--text); font-family:'Segoe UI',system-ui,-apple-system,sans-serif; line-height:1.6; padding:20px; }
  .container { max-width:1200px; margin:0 auto; }
  h1 { color:var(--blue); font-size:1.8em; margin-bottom:5px; }
  h2 { color:var(--purple); font-size:1.3em; margin:25px 0 10px; border-bottom:1px solid var(--border); padding-bottom:5px; }
  .meta { color:var(--text2); font-size:0.85em; margin-bottom:20px; }
  .stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:12px; margin:15px 0 25px; }
  .stat { background:var(--bg2); border:1px solid var(--border); border-radius:8px; padding:15px; text-align:center; }
  .stat .num { font-size:2em; font-weight:700; }
  .stat .label { color:var(--text2); font-size:0.8em; text-transform:uppercase; }
  .stat.green .num { color:var(--green); }
  .stat.red .num { color:var(--red); }
  .stat.yellow .num { color:var(--yellow); }
  .stat.blue .num { color:var(--blue); }
  .stat.purple .num { color:var(--purple); }
  .stat.cyan .num { color:var(--cyan); }
  table { width:100%; border-collapse:collapse; margin:10px 0; background:var(--bg2); border-radius:8px; overflow:hidden; }
  th { background:var(--bg3); color:var(--blue); text-align:left; padding:10px 12px; font-size:0.85em; text-transform:uppercase; letter-spacing:0.5px; }
  td { padding:8px 12px; border-top:1px solid var(--border); font-size:0.9em; word-break:break-all; }
  tr:hover td { background:var(--bg3); }
  .badge { display:inline-block; padding:2px 8px; border-radius:4px; font-size:0.75em; font-weight:600; }
  .badge-green { background:#1a3a2a; color:var(--green); }
  .badge-red { background:#3a1a1a; color:var(--red); }
  .badge-yellow { background:#3a2e1a; color:var(--yellow); }
  .badge-blue { background:#1a2a3a; color:var(--blue); }
  .badge-purple { background:#2a1a3a; color:var(--purple); }
  .badge-orange { background:#3a2a1a; color:var(--orange); }
  .section { background:var(--bg2); border:1px solid var(--border); border-radius:8px; margin:15px 0; overflow:hidden; }
  .section-header { padding:12px 15px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; }
  .section-header:hover { background:var(--bg3); }
  .section-header::after { content:'▸'; transition:transform 0.2s; color:var(--text2); }
  .section-header.open::after { transform:rotate(90deg); }
  .section-body { display:none; padding:15px; border-top:1px solid var(--border); }
  .section-body.show { display:block; }
  pre { background:var(--bg); border:1px solid var(--border); border-radius:6px; padding:12px; overflow-x:auto; font-family:'Cascadia Code','Fira Code',monospace; font-size:0.85em; color:var(--text2); max-height:400px; }
  .tag { display:inline-block; background:var(--bg3); border:1px solid var(--border); border-radius:4px; padding:2px 6px; margin:2px; font-size:0.75em; }
  footer { margin-top:30px; padding:15px; text-align:center; color:var(--text2); font-size:0.8em; border-top:1px solid var(--border); }
  a { color:var(--blue); text-decoration:none; }
  a:hover { text-decoration:underline; }
  .vuln-critical { border-left:3px solid var(--red); }
  .vuln-high { border-left:3px solid var(--orange); }
  .vuln-medium { border-left:3px solid var(--yellow); }
  .vuln-low { border-left:3px solid var(--blue); }
</style>
</head>
<body>
<div class="container">
HTMLHEAD
}

# Footer HTML com JS
html_foot() {
    cat <<'HTMLFOOT'
</div>
<footer>Gerado por <strong>Recon Automation Toolkit</strong></footer>
<script>
function toggle(el){el.classList.toggle('open');el.nextElementSibling.classList.toggle('show');}
document.querySelectorAll('.section-header').forEach((h,i)=>{if(i<2)h.click();});
</script>
</body>
</html>
HTMLFOOT
}

# Stat card: html_stat "número" "label" "cor"
html_stat() {
    echo "  <div class=\"stat ${3:-blue}\"><div class=\"num\">${1}</div><div class=\"label\">${2}</div></div>"
}

# Badge: html_badge "texto" "cor"
html_badge() {
    echo "<span class=\"badge badge-${2:-blue}\">${1}</span>"
}

# Collapsible section start
html_section_start() {
    local title="$1" extra_class="${2:-}"
    echo "<div class=\"section ${extra_class}\">"
    echo "  <div class=\"section-header\" onclick=\"toggle(this)\">${title}</div>"
    echo "  <div class=\"section-body\">"
}

# Collapsible section end
html_section_end() {
    echo "  </div></div>"
}

# File content as pre block
html_file_pre() {
    local file="$1" max_lines="${2:-100}"
    if [[ -f "$file" && -s "$file" ]]; then
        echo "<pre>"
        head -"$max_lines" "$file" | _esc
        local total=$(wc -l < "$file" 2>/dev/null || echo 0)
        [[ $total -gt $max_lines ]] && echo "... +$((total - max_lines)) linhas"
        echo "</pre>"
    else
        echo "<pre>Arquivo vazio ou não encontrado.</pre>"
    fi
}

# Status code badge
html_status_badge() {
    local code="$1"
    case "$code" in
        2*) html_badge "$code" "green" ;;
        3*) html_badge "$code" "blue" ;;
        4*) html_badge "$code" "yellow" ;;
        5*) html_badge "$code" "red" ;;
        *)  html_badge "$code" "purple" ;;
    esac
}
