import type { ValorPonta } from "@/lib/painel/pentagrama";

/**
 * Pentagrama de habilidades em SVG: o polígono roxo é o aluno, o contorno
 * tracejado laranja é a média da turma. Anéis a cada 25%. Cada ponto mostra
 * o valor ao passar o cursor; a lista ao lado traz os mesmos números.
 */

const ALUNO = "#7B61FF";
const TURMA = "#D9773E";
const C = 160; // centro
const R = 112; // raio do anel de 100%

const ponto = (i: number, valor: number) => {
  const ang = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
  const r = (Math.max(0, Math.min(100, valor)) / 100) * R;
  return [C + r * Math.cos(ang), C + r * Math.sin(ang)] as const;
};
const poligono = (valores: number[]) => valores.map((v, i) => ponto(i, v).join(",")).join(" ");

export function Pentagrama({
  valores,
  nomeAluno,
  nomes = { principal: "aluno", comparacao: "turma" },
}: {
  valores: ValorPonta[];
  nomeAluno: string;
  /** Como chamar as duas séries na dica do cursor (aluno/turma ou turma/todas as turmas). */
  nomes?: { principal: string; comparacao: string };
}) {
  const aluno = valores.map((v) => v.aluno ?? 0);
  const turma = valores.map((v) => v.turma ?? 0);

  return (
    <svg viewBox="-50 0 420 320" className="h-auto w-full max-w-[400px]" role="img" aria-labelledby="pentagrama-titulo">
      <title id="pentagrama-titulo">
        {`Pentagrama de habilidades de ${nomeAluno}: ${valores.map((v) => `${v.jeito} ${v.aluno ?? "sem dados"}${v.aluno !== null ? "%" : ""}`).join(", ")}`}
      </title>

      {/* anéis de 25% e eixos, discretos */}
      {[25, 50, 75, 100].map((n) => (
        <polygon key={n} points={poligono([n, n, n, n, n])} fill="none" stroke="#E2DEF0" strokeWidth={1} />
      ))}
      {valores.map((_, i) => {
        const [x, y] = ponto(i, 100);
        return <line key={i} x1={C} y1={C} x2={x} y2={y} stroke="#E2DEF0" strokeWidth={1} />;
      })}

      {/* turma: só contorno tracejado */}
      <polygon
        points={poligono(turma)}
        fill="none"
        stroke={TURMA}
        strokeWidth={2}
        strokeDasharray="5 4"
        strokeLinejoin="round"
      />
      {/* aluno: preenchimento leve e contorno */}
      <polygon
        points={poligono(aluno)}
        fill={ALUNO}
        fillOpacity={0.18}
        stroke={ALUNO}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {valores.map((v, i) => {
        if (v.aluno === null) return null;
        const [x, y] = ponto(i, v.aluno);
        return (
          <g key={v.jeito}>
            {/* alvo maior que a marca para o cursor */}
            <circle cx={x} cy={y} r={12} fill="transparent">
              <title>{`${v.jeito}: ${nomes.principal} ${v.aluno}%, ${nomes.comparacao} ${v.turma ?? "—"}% (${v.atividades} resultados)`}</title>
            </circle>
            <circle cx={x} cy={y} r={4.5} fill={ALUNO} stroke="#fff" strokeWidth={2} pointerEvents="none" />
          </g>
        );
      })}

      {/* rótulos das pontas */}
      {valores.map((v, i) => {
        const [x, y] = ponto(i, 128);
        const ancora = Math.abs(x - C) < 8 ? "middle" : x > C ? "start" : "end";
        return (
          <text
            key={v.jeito}
            x={x}
            y={y + (y > C ? 10 : 0)}
            textAnchor={ancora}
            className="fill-tinta text-[11px] font-semibold"
          >
            {v.jeito}
          </text>
        );
      })}
    </svg>
  );
}

export const CORES_PENTAGRAMA = { aluno: ALUNO, turma: TURMA };
