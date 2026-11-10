import { useId } from "react";

/**
 * Símbolo Modolume: um arco que se ilumina, com raios ao redor.
 * Também é o "guia" das missões — em vez de um mascote, o símbolo muda de estado:
 *  - normal: instruções
 *  - pensando: raios recolhidos e suaves (resposta ainda não está certa)
 *  - aceso: raios estendidos (acerto, missão concluída)
 */

export type Estado = "normal" | "pensando" | "aceso";

const RAIOS = [
  { angulo: 180, cor: "#7B61FF" },
  { angulo: 225, cor: "#7E8CFF" },
  { angulo: 270, cor: "#F28AA5" },
  { angulo: 315, cor: "#FF9F7A" },
  { angulo: 360, cor: "#FFAC7A" },
];

export function Simbolo({
  estado = "normal",
  tamanho = 48,
  className = "",
  rotulo = "Modolume",
  cor,
}: {
  estado?: Estado;
  tamanho?: number;
  className?: string;
  rotulo?: string;
  /** Desenha o símbolo inteiro numa cor só (por exemplo, branco sobre o roxo). */
  cor?: string;
}) {
  const id = useId();
  const cx = 50;
  const cy = 64;
  const [r0, r1] = estado === "aceso" ? [32, 46] : estado === "pensando" ? [33, 38] : [33, 42];

  return (
    <svg
      viewBox="0 0 100 80"
      width={tamanho}
      height={(tamanho * 80) / 100}
      role="img"
      aria-label={rotulo}
      className={className}
    >
      <defs>
        <linearGradient id={`arco-${id}`} x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0" stopColor="#7B61FF" />
          <stop offset="1" stopColor="#C9B4FF" />
        </linearGradient>
      </defs>
      {RAIOS.map((r) => {
        const a = (r.angulo * Math.PI) / 180;
        return (
          <line
            key={r.angulo}
            x1={cx + r0 * Math.cos(a)}
            y1={cy + r0 * Math.sin(a)}
            x2={cx + r1 * Math.cos(a)}
            y2={cy + r1 * Math.sin(a)}
            stroke={cor ?? (estado === "pensando" ? "#D6CFF0" : r.cor)}
            strokeWidth={8}
            strokeLinecap="round"
            style={{ transition: "all 0.3s ease" }}
          />
        );
      })}
      <path
        d={`M ${cx - 19} 76 V ${cy} A 19 19 0 0 1 ${cx + 19} ${cy} V 76`}
        fill="none"
        stroke={cor ?? (estado === "pensando" ? "#C9B4FF" : `url(#arco-${id})`)}
        strokeWidth={15}
      />
    </svg>
  );
}
