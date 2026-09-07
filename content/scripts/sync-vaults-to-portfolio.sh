#!/bin/bash
# ==============================================================================
# Sync Vaults (WriteUps & Cyber-security & Scripts) -> Portfolio & Push
# ==============================================================================

PORTFOLIO_DIR="/home/gbmel/portfolio"

if [ ! -d "$PORTFOLIO_DIR" ]; then
    exit 0
fi

echo -e "\033[1;35m[⚡] Sincronizando conteúdo dos Vaults com o Portfolio...\033[0m"

# 1. Sincronizar Writeups (*.md)
if [ -d "/home/gbmel/WriteUps" ]; then
    rsync -av --include="Writeup*.md" --include="writeup*.md" --exclude="*" \
        /home/gbmel/WriteUps/ "$PORTFOLIO_DIR/content/writeups/" >/dev/null 2>&1
fi

# 2. Sincronizar Cyber-security Notes (*.md)
if [ -d "/home/gbmel/Cyber-security" ]; then
    rsync -av --include="*.md" --exclude=".obsidian" --exclude=".git" --exclude="*" \
        /home/gbmel/Cyber-security/ "$PORTFOLIO_DIR/content/notes/" >/dev/null 2>&1
fi

# 3. Sincronizar Scripts ofensivos (*.py e *.sh)
if [ -d "/home/gbmel/Scripts" ]; then
    # Buscar recursivamente todos os .py e .sh úteis em Scripts (ignorando a pasta .git)
    find /home/gbmel/Scripts -not -path '*/.*' \( -name "*.py" -o -name "*.sh" \) -type f -exec cp -u {} "$PORTFOLIO_DIR/content/scripts/" \; 2>/dev/null
fi

# 4. Verificar se há alterações e fazer commit/push automático
cd "$PORTFOLIO_DIR" || exit 0

if [ -n "$(git status --porcelain)" ]; then
    echo -e "\033[1;32m[✓] Novas alterações detectadas nos Vaults. Atualizando repositório portfolio...\033[0m"
    git add content/
    DATE=$(date "+%Y-%m-%d %H:%M")
    git commit -m "docs: auto-sync vaults update ($DATE)" >/dev/null 2>&1
    git push origin main >/dev/null 2>&1 &
    echo -e "\033[1;34m[🚀] Push disparado em background para o GitHub!\033[0m"
else
    echo -e "\033[1;30m[•] Nenhuma alteração nos Vaults para sincronizar.\033[0m"
fi
