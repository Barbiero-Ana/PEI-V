/**
 * Ilustração do topo da turma: blocos de montar e formas planas nas cores da
 * marca (sem fotos de alunos). A composição muda com a turma, para cada uma
 * ter o seu banner.
 */

const FUNDOS = ["#EFEBFF", "#E4F3FC", "#FFF1E7"];

type Peca =
  | { t: "bloco"; x: number; y: number; l: number; a: number; cor: string }
  | { t: "circulo"; x: number; y: number; r: number; cor: string }
  | { t: "triangulo"; x: number; y: number; l: number; cor: string };

// cores da marca: roxo, lilás, pêssego, azul claro
const R = "#7B61FF";
const L = "#C9B4FF";
const P = "#FFAC7A";
const A = "#8FD3FF";

const COMPOSICOES: Peca[][] = [
  [
    { t: "bloco", x: 560, y: 150, l: 150, a: 50, cor: L },
    { t: "bloco", x: 710, y: 150, l: 110, a: 50, cor: A },
    { t: "bloco", x: 820, y: 150, l: 130, a: 50, cor: P },
    { t: "bloco", x: 600, y: 100, l: 200, a: 50, cor: R },
    { t: "bloco", x: 800, y: 100, l: 90, a: 50, cor: L },
    { t: "bloco", x: 660, y: 50, l: 120, a: 50, cor: P },
    { t: "triangulo", x: 780, y: 50, l: 70, cor: A },
    { t: "circulo", x: 470, y: 160, r: 40, cor: A },
    { t: "circulo", x: 920, y: 60, r: 26, cor: L },
  ],
  [
    { t: "bloco", x: 600, y: 150, l: 120, a: 50, cor: A },
    { t: "bloco", x: 720, y: 150, l: 160, a: 50, cor: R },
    { t: "bloco", x: 880, y: 150, l: 100, a: 50, cor: L },
    { t: "bloco", x: 650, y: 100, l: 110, a: 50, cor: P },
    { t: "bloco", x: 760, y: 100, l: 150, a: 50, cor: A },
    { t: "bloco", x: 720, y: 50, l: 100, a: 50, cor: L },
    { t: "circulo", x: 550, y: 160, r: 40, cor: P },
    { t: "triangulo", x: 820, y: 50, l: 70, cor: P },
    { t: "circulo", x: 960, y: 70, r: 22, cor: R },
  ],
];

function desenhar(p: Peca, i: number) {
  if (p.t === "bloco")
    return (
      <g key={i}>
        <rect x={p.x} y={p.y} width={p.l - 4} height={p.a - 4} rx={8} fill={p.cor} />
        {/* encaixes em cima do bloco, como um bloco de montar */}
        <rect x={p.x + 14} y={p.y - 6} width={22} height={8} rx={3} fill={p.cor} />
        {p.l > 110 ? <rect x={p.x + p.l - 44} y={p.y - 6} width={22} height={8} rx={3} fill={p.cor} /> : null}
      </g>
    );
  if (p.t === "circulo") return <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={p.cor} />;
  return (
    <polygon key={i} points={`${p.x},${p.y + 46} ${p.x + p.l / 2},${p.y} ${p.x + p.l},${p.y + 46}`} fill={p.cor} />
  );
}

export function BannerTurma({ indice }: { indice: number }) {
  const i = Math.max(0, indice);
  const pecas = COMPOSICOES[i % COMPOSICOES.length]!;
  return (
    <svg
      viewBox="0 0 1000 160"
      preserveAspectRatio="xMaxYMid slice"
      className="block h-full w-full"
      role="presentation"
      aria-hidden
    >
      <rect width="1000" height="160" fill={FUNDOS[i % FUNDOS.length]} />
      {/* sobe a composição para ela aparecer acima da faixa de baixo */}
      <g transform="translate(0,-42)">{pecas.map(desenhar)}</g>
    </svg>
  );
}
