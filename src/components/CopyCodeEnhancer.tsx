"use client";

import { useEffect } from "react";

export default function CopyCodeEnhancer() {
  useEffect(() => {
    const preBlocks = document.querySelectorAll<HTMLPreElement>("pre");

    preBlocks.forEach((pre) => {
      // Evitar múltiplos botões no mesmo bloco
      if (pre.parentElement?.classList.contains("code-block-wrapper")) {
        return;
      }

      // Criar container wrapper
      const wrapper = document.createElement("div");
      wrapper.className = "relative group code-block-wrapper my-4";

      // Criar botão de cópia
      const button = document.createElement("button");
      button.className =
        "absolute top-3 right-3 z-10 px-2.5 py-1 rounded-md text-[0.7rem] font-mono font-medium transition-all duration-200 opacity-0 group-hover:opacity-100 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-[var(--accent-secondary)] border border-[var(--border-color)] shadow-sm flex items-center gap-1 cursor-pointer";
      button.innerHTML = "<span>Copiar</span>";

      button.addEventListener("click", async () => {
        const codeText = pre.querySelector("code")?.innerText || pre.innerText;
        try {
          await navigator.clipboard.writeText(codeText);
          button.innerHTML = "<span style='color: #4ade80;'>Copiado! ✓</span>";
          button.style.borderColor = "rgba(74, 222, 128, 0.4)";
          setTimeout(() => {
            button.innerHTML = "<span>Copiar</span>";
            button.style.borderColor = "var(--border-color)";
          }, 2000);
        } catch (err) {
          console.error("Falha ao copiar:", err);
        }
      });

      // Inserir wrapper no DOM
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
      wrapper.appendChild(button);
    });
  }, []);

  return null;
}
