import { useId } from "react";
import Svg, { Defs, Line, LinearGradient, Path, Stop } from "react-native-svg";

/**
 * Símbolo Modolume: arco com raios. Também é o "guia" das missões:
 *  - normal: instruções
 *  - pensando: raios recolhidos (resposta ainda não está certa)
 *  - aceso: raios estendidos (acerto)
 */
export type Estado = "normal" | "pensando" | "aceso";

const RAIOS = [
  { angulo: 180, cor: "#7B61FF" },
  { angulo: 225, cor: "#7E8CFF" },
  { angulo: 270, cor: "#F28AA5" },
  { angulo: 315, cor: "#FF9F7A" },
  { angulo: 360, cor: "#FFAC7A" },
];

export function Simbolo({ estado = "normal", tamanho = 48 }: { estado?: Estado; tamanho?: number }) {
  const id = useId().replace(/:/g, "");
  const cx = 50;
  const cy = 64;
  const [r0, r1] = estado === "aceso" ? [32, 46] : estado === "pensando" ? [33, 38] : [33, 42];
  return (
    <Svg viewBox="0 0 100 80" width={tamanho} height={(tamanho * 80) / 100}>
      <Defs>
        <LinearGradient id={`arco${id}`} x1="0" y1="0" x2="1" y2="0.4">
          <Stop offset="0" stopColor="#7B61FF" />
          <Stop offset="1" stopColor="#C9B4FF" />
        </LinearGradient>
      </Defs>
      {RAIOS.map((r) => {
        const a = (r.angulo * Math.PI) / 180;
        return (
          <Line
            key={r.angulo}
            x1={cx + r0 * Math.cos(a)}
            y1={cy + r0 * Math.sin(a)}
            x2={cx + r1 * Math.cos(a)}
            y2={cy + r1 * Math.sin(a)}
            stroke={estado === "pensando" ? "#D6CFF0" : r.cor}
            strokeWidth={8}
            strokeLinecap="round"
          />
        );
      })}
      <Path
        d={`M ${cx - 19} 76 V ${cy} A 19 19 0 0 1 ${cx + 19} ${cy} V 76`}
        fill="none"
        stroke={estado === "pensando" ? "#C9B4FF" : `url(#arco${id})`}
        strokeWidth={15}
      />
    </Svg>
  );
}
