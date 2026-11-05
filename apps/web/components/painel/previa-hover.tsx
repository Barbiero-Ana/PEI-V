"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

const LARGURA = 320;

/**
 * Mostra um cartão de resumo quando o mouse fica parado por 1 s sobre o aluno
 * (nome, avatar ou a linha inteira, conforme o que for envolvido), para não
 * atrapalhar quem só está passando o mouse pela lista. Mexer o mouse recomeça a
 * contagem. O cartão flutua sobre a página (posição fixa, fora da
 * lista), então abrir ou fechar não muda o tamanho de nada nem a rolagem. Some
 * ao tirar o mouse do nome e do cartão, ao rolar a página ou com Esc.
 */
export function PreviaAoParar({
  cartao,
  atraso = 1000,
  como: Elemento = "span",
  className = "min-w-0",
  children,
}: {
  cartao: ReactNode;
  atraso?: number;
  /** "div" para envolver uma linha inteira (com blocos dentro). */
  como?: "span" | "div";
  className?: string;
  children: ReactNode;
}) {
  const [posicao, setPosicao] = useState<{ top: number; left: number } | null>(null);
  const alvo = useRef<HTMLElement>(null);
  const caixa = useRef<HTMLDivElement>(null);
  const relogio = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saida = useRef<ReturnType<typeof setTimeout> | null>(null);

  const limpar = (r: typeof relogio) => {
    if (r.current) clearTimeout(r.current);
    r.current = null;
  };
  const abrir = () => {
    const ret = alvo.current?.getBoundingClientRect();
    if (!ret) return;
    // primeiro abaixo do nome; depois de medir o cartão, sobe se não couber
    setPosicao({ top: ret.bottom + 8, left: Math.min(ret.left, window.innerWidth - LARGURA - 16) });
  };

  // ajusta antes de pintar, com a altura real do cartão: nunca cobre o nome
  useLayoutEffect(() => {
    const ret = alvo.current?.getBoundingClientRect();
    const altura = caixa.current?.offsetHeight;
    if (!posicao || !ret || !altura) return;
    const embaixo = ret.bottom + 8;
    const top = embaixo + altura <= window.innerHeight - 8 ? embaixo : Math.max(8, ret.top - 8 - altura);
    if (top !== posicao.top) setPosicao({ ...posicao, top });
  }, [posicao]);
  const esperar = () => {
    limpar(relogio);
    relogio.current = setTimeout(abrir, atraso);
  };
  const fechar = () => {
    limpar(relogio);
    limpar(saida);
    setPosicao(null);
  };
  // pequena folga para o mouse ir do nome até o cartão sem ele sumir
  const sairDepois = () => {
    limpar(relogio);
    limpar(saida);
    saida.current = setTimeout(() => setPosicao(null), 150);
  };

  useEffect(() => {
    if (!posicao) return;
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && fechar();
    document.addEventListener("keydown", tecla);
    window.addEventListener("scroll", fechar, true);
    window.addEventListener("resize", fechar);
    return () => {
      document.removeEventListener("keydown", tecla);
      window.removeEventListener("scroll", fechar, true);
      window.removeEventListener("resize", fechar);
    };
  }, [posicao]);
  useEffect(
    () => () => {
      limpar(relogio);
      limpar(saida);
    },
    [],
  );

  return (
    <>
      <Elemento
        ref={alvo as React.RefObject<HTMLDivElement & HTMLSpanElement>}
        className={className}
        onMouseEnter={esperar}
        onMouseMove={posicao ? undefined : esperar}
        onMouseLeave={sairDepois}
      >
        {children}
      </Elemento>
      {posicao
        ? createPortal(
            <div
              ref={caixa}
              role="tooltip"
              onMouseEnter={() => limpar(saida)}
              onMouseLeave={sairDepois}
              style={{ top: posicao.top, left: posicao.left, width: LARGURA }}
              className="fixed z-50 rounded-2xl border border-[#E2DEF0] bg-superficie p-4 text-left shadow-[0_20px_50px_-24px_rgb(30_42_120/0.55)]"
            >
              {cartao}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
