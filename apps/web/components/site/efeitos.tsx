"use client";

import { useEffect } from "react";

/**
 * Efeitos de rolagem da página inicial (no estilo das páginas de produto):
 * - [data-revelar]: o elemento entra subindo e aparecendo quando chega à tela
 *   (atraso opcional por --atraso);
 * - [data-rolagem]: recebe --p (0 a 1), o quanto ele já atravessou a tela, usado
 *   no CSS para paralaxe ("parallax") e aproximação ("zoom");
 * - [data-contar]: o número conta de 0 até o valor quando aparece;
 * - html.rolou: a barra do topo ganha borda e sombra depois de rolar.
 * Com "reduzir movimento" ligado no sistema, nada disso roda e a página fica estática.
 * O estado escondido só existe com a classe html.efeitos, posta aqui: sem JavaScript,
 * o conteúdo aparece normalmente.
 */
export function EfeitosRolagem() {
  useEffect(() => {
    const raiz = document.documentElement;
    const marcarTopo = () => raiz.classList.toggle("rolou", window.scrollY > 8);
    marcarTopo();
    window.addEventListener("scroll", marcarTopo, { passive: true });

    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduzir) return () => window.removeEventListener("scroll", marcarTopo);

    raiz.classList.add("efeitos");

    const contar = (el: HTMLElement) => {
      const alvo = Number(el.dataset.contar);
      const inicio = performance.now();
      const duracao = 1100;
      const passo = (agora: number) => {
        const t = Math.min(1, (agora - inicio) / duracao);
        el.textContent = String(Math.round(alvo * (1 - Math.pow(1 - t, 3))));
        if (t < 1) requestAnimationFrame(passo);
      };
      requestAnimationFrame(passo);
      // garante o número final mesmo se a aba ficar em segundo plano no meio da contagem
      window.setTimeout(() => (el.textContent = String(alvo)), duracao + 150);
    };

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          el.classList.add("visivel");
          if (el.dataset.contar) contar(el);
          observador.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    document.querySelectorAll<HTMLElement>("[data-revelar], [data-contar]").forEach((el) => observador.observe(el));

    const rolaveis = Array.from(document.querySelectorAll<HTMLElement>("[data-rolagem]"));
    let pedido = 0;
    const atualizar = () => {
      pedido = 0;
      const alturaTela = window.innerHeight;
      for (const el of rolaveis) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > alturaTela + 200) continue;
        const p = Math.min(1, Math.max(0, (alturaTela - r.top) / (alturaTela + r.height)));
        el.style.setProperty("--p", p.toFixed(3));
      }
    };
    const agendar = () => {
      if (!pedido) pedido = requestAnimationFrame(atualizar);
    };
    atualizar();
    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", agendar);

    return () => {
      window.removeEventListener("scroll", marcarTopo);
      window.removeEventListener("scroll", agendar);
      window.removeEventListener("resize", agendar);
      observador.disconnect();
      if (pedido) cancelAnimationFrame(pedido);
      raiz.classList.remove("efeitos", "rolou");
    };
  }, []);

  return null;
}
