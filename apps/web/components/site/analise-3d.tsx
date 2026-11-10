"use client";

import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";

/**
 * Card de demonstração do pentagrama de habilidades e da análise que o
 * professor recebe. Efeito quase 3D: o card inclina com a rolagem
 * (data-rolagem="inclinar", no CSS) e acompanha o cursor; as etiquetas ficam
 * em camadas mais à frente (translateZ), o que dá profundidade.
 * Dados fictícios, só para ilustrar.
 */

const PONTAS = ["Visual", "Mãos na massa", "Lógico", "Simbólico", "Espacial"];
const ALUNO = [78, 88, 62, 46, 70];
const TURMA = [70, 72, 66, 61, 64];
const C = 160;
const R = 108;

const ponto = (i: number, v: number) => {
  const ang = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
  const r = (v / 100) * R;
  return [C + r * Math.cos(ang), C + r * Math.sin(ang)] as const;
};
const poligono = (vs: number[]) => vs.map((v, i) => ponto(i, v).join(",")).join(" ");

export function Analise3D() {
  const cartao = useRef<HTMLDivElement>(null);

  const mover = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !cartao.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    cartao.current.style.setProperty("--ry", `${(x * 14).toFixed(2)}deg`);
    cartao.current.style.setProperty("--rx", `${(-y * 12).toFixed(2)}deg`);
    cartao.current.style.setProperty("--brilho-x", `${((x + 0.5) * 100).toFixed(0)}%`);
    cartao.current.style.setProperty("--brilho-y", `${((y + 0.5) * 100).toFixed(0)}%`);
  };
  const soltar = () => {
    cartao.current?.style.setProperty("--ry", "0deg");
    cartao.current?.style.setProperty("--rx", "0deg");
  };

  return (
    <div data-rolagem="inclinar" className="relative mx-auto w-full max-w-[520px] [transform-style:preserve-3d]">
      <div
        onPointerMove={mover}
        onPointerLeave={soltar}
        data-revelar="crescer"
        className="py-10 [perspective:1200px] [transform-style:preserve-3d]"
      >
        <div
          ref={cartao}
          className="cartao-3d relative rounded-[2rem] border border-white/70 bg-superficie p-6 pb-14 shadow-[0_50px_90px_-45px_rgb(30_42_120/0.65)] sm:p-7 sm:pb-16"
        >
          {/* reflexo suave que acompanha o cursor */}
          <div aria-hidden className="brilho-3d pointer-events-none absolute inset-0 rounded-[2rem]" />

          <div className="camada-z1 flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full bg-roxo-claro font-display font-semibold text-roxo">
              BS
            </span>
            <div className="min-w-0">
              <p className="font-display font-semibold text-tinta">Bernardo Souza</p>
              <p className="text-sm text-texto-suave">6º Ano A · 32 atividades</p>
            </div>
          </div>

          <svg
            viewBox="-70 0 460 320"
            className="camada-z2 mx-auto mt-2 h-auto w-full max-w-[380px]"
            role="img"
            aria-label="Exemplo de pentagrama: Visual 78%, Mãos na massa 88%, Lógico 62%, Simbólico 46%, Espacial 70%. Média da turma em tracejado."
          >
            <defs>
              <linearGradient id="pentagrama-site" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#7B61FF" stopOpacity="0.35" />
                <stop offset="1" stopColor="#8FD3FF" stopOpacity="0.35" />
              </linearGradient>
            </defs>
            {[25, 50, 75, 100].map((n) => (
              <polygon key={n} points={poligono([n, n, n, n, n])} fill="none" stroke="#E7E3F6" strokeWidth={1} />
            ))}
            {PONTAS.map((_, i) => {
              const [x, y] = ponto(i, 100);
              return <line key={i} x1={C} y1={C} x2={x} y2={y} stroke="#E7E3F6" strokeWidth={1} />;
            })}
            <polygon
              className="radar-turma"
              points={poligono(TURMA)}
              fill="none"
              stroke="#E98A52"
              strokeWidth={2}
              strokeDasharray="5 4"
              strokeLinejoin="round"
            />
            <g className="radar-aluno">
              <polygon
                points={poligono(ALUNO)}
                fill="url(#pentagrama-site)"
                stroke="#7B61FF"
                strokeWidth={2.5}
                strokeLinejoin="round"
              />
              {ALUNO.map((v, i) => {
                const [x, y] = ponto(i, v);
                return <circle key={i} cx={x} cy={y} r={5} fill="#7B61FF" stroke="#fff" strokeWidth={2} />;
              })}
            </g>
            {PONTAS.map((p, i) => {
              const [x, y] = ponto(i, 126);
              const ancora = Math.abs(x - C) < 8 ? "middle" : x > C ? "start" : "end";
              return (
                <text
                  key={p}
                  x={x}
                  y={y + (y > C ? 12 : 0)}
                  textAnchor={ancora}
                  className="fill-tinta text-[12px] font-semibold"
                >
                  {p}
                </text>
              );
            })}
          </svg>

          <div className="camada-z1 mt-1 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-texto-suave">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-5 rounded-full bg-roxo" /> Aluno
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="w-5 border-t-2 border-dashed border-pessego-escuro" /> Média da turma
            </span>
          </div>

          {/* etiquetas em camadas à frente do card */}
          <Etiqueta className="-right-3 top-24 sm:-right-8" atraso={350}>
            <span className="block text-xs text-texto-suave">Aprende melhor</span>
            <span className="block font-display text-sm font-semibold text-tinta">
              Mãos na massa <span className="text-roxo">88%</span>
            </span>
          </Etiqueta>
          <Etiqueta className="-left-3 bottom-32 sm:-left-6" atraso={500}>
            <span className="block text-xs text-texto-suave">Precisa de apoio</span>
            <span className="block font-display text-sm font-semibold text-tinta">
              Simbólico <span className="text-pessego-escuro">46%</span>
            </span>
          </Etiqueta>
          <Etiqueta className="-bottom-12 right-4 max-w-[250px] bg-tinta sm:-right-6" atraso={650}>
            <span className="block text-xs text-lilas">Sugestão para a próxima aula</span>
            <span className="block text-sm font-medium text-white">
              Comece com a balança e os blocos, depois passe para a conta no papel.
            </span>
          </Etiqueta>
        </div>
      </div>
    </div>
  );
}

function Etiqueta({ className, atraso, children }: { className: string; atraso: number; children: ReactNode }) {
  // a camada (translateZ) fica no elemento de fora; a entrada animada, no de dentro
  const [posicao, fundo] = separar(className);
  return (
    <div aria-hidden className={`camada-z3 absolute ${posicao}`}>
      <div
        data-revelar
        style={{ "--atraso": `${atraso}ms` } as CSSProperties}
        className={`rounded-2xl px-4 py-3 shadow-[0_24px_50px_-24px_rgb(30_42_120/0.55)] ${fundo || "bg-superficie"}`}
      >
        {children}
      </div>
    </div>
  );
}

/** Separa as classes de posição (fora) das de fundo (dentro). */
function separar(classes: string): [string, string] {
  const dentro = classes.split(" ").filter((c) => c.startsWith("bg-"));
  const fora = classes.split(" ").filter((c) => !c.startsWith("bg-"));
  return [fora.join(" "), dentro.join(" ")];
}
