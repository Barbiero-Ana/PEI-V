import { memo } from "react";
import Svg, { Circle, Ellipse, G, Path, Rect, Text as SvgText } from "react-native-svg";
import { cor } from "@/tema";

/** Objetos pequenos do dia a dia, para contar (feira, ninho, estacionamento). */

export type Objeto = "laranja" | "ovo" | "carro";

// cores vivas: os carros ficam sobre o asfalto escuro do estacionamento
const CORES_CARRO = ["#FFAC7A", "#8FD3FF", "#C9B4FF", "#FF7CA7", "#F6C344"];

/** Formas dos objetos (em 20 × 20), para desenhar vários num único SVG. */
function Forma({ objeto, i }: { objeto: Objeto; i: number }) {
  if (objeto === "laranja")
    return (
      <G>
        <Circle cx={10} cy={11} r={8} fill={cor.pessego} stroke={cor.pessegoEscuro} strokeWidth={1} />
        <Circle cx={7.5} cy={8.5} r={1.8} fill="#FFFFFF" opacity={0.5} />
        <Path d="M 10 3.5 C 11 1.5 13.5 1 15 2 C 14 4 12 4.5 10 3.5 Z" fill="#7FBF8E" />
      </G>
    );
  if (objeto === "ovo")
    return (
      <G>
        <Path
          d="M 10 1.5 C 15 1.5 17 9 17 12.5 C 17 16.5 14 19 10 19 C 6 19 3 16.5 3 12.5 C 3 9 5 1.5 10 1.5 Z"
          fill="#FFFDF7"
          stroke="#A97E4B"
          strokeWidth={1.3}
        />
        <Ellipse cx={7.4} cy={8} rx={1.7} ry={2.8} fill="#FFFFFF" />
        <Path d="M 6 15.5 Q 10 17.8 14 15.5" stroke="#E9D8BE" strokeWidth={1.2} fill="none" strokeLinecap="round" />
      </G>
    );
  const c = CORES_CARRO[i % CORES_CARRO.length]!;
  return (
    <G>
      <Path d="M 3 12 L 5 7 C 5.5 6 6.5 5.5 7.5 5.5 L 12.5 5.5 C 13.5 5.5 14.5 6 15 7 L 17 12 Z" fill={c} />
      <Rect x={1.5} y={11} width={17} height={4.5} rx={1.5} fill={c} />
      <Path d="M 6.2 7 L 9.4 7 L 9.4 10.6 L 5 10.6 Z M 10.6 7 L 13.8 7 L 15 10.6 L 10.6 10.6 Z" fill="#EAF7FF" />
      <Circle cx={5.5} cy={15.5} r={2.5} fill="#16182A" />
      <Circle cx={14.5} cy={15.5} r={2.5} fill="#16182A" />
      <Circle cx={5.5} cy={15.5} r={0.9} fill="#D9DCEB" />
      <Circle cx={14.5} cy={15.5} r={0.9} fill="#D9DCEB" />
    </G>
  );
}

/**
 * Desenha n objetos em fileiras de até 5 (facilita contar de 5 em 5),
 * todos num único SVG (bem mais leve no celular).
 */
export const Grupo = memo(function Grupo({
  n,
  objeto,
  t = 24,
  numerar = false,
}: {
  n: number;
  objeto: Objeto;
  t?: number;
  /** Dica: um numerinho em cada objeto, para contar sem se perder. */
  numerar?: boolean;
}) {
  const porLinha = Math.min(5, n);
  const linhas = Math.ceil(n / 5);
  const passo = t + 3;
  const largura = porLinha * passo - 3;
  return (
    <Svg width={largura} height={linhas * passo - 3} viewBox={`0 0 ${largura} ${linhas * passo - 3}`}>
      {Array.from({ length: n }, (_, k) => {
        const linha = Math.floor(k / 5);
        const naLinha = Math.min(5, n - linha * 5);
        const deslocamento = ((porLinha - naLinha) * passo) / 2;
        return (
          <G key={k} transform={`translate(${deslocamento + (k % 5) * passo} ${linha * passo}) scale(${t / 20})`}>
            <Forma objeto={objeto} i={k} />
            {numerar ? (
              <G>
                <Circle cx={15} cy={5} r={5.2} fill="#1E2A78" stroke="#FFFFFF" strokeWidth={1} />
                <SvgText x={15} y={7.6} fontSize={7} fontWeight="700" fill="#FFFFFF" textAnchor="middle">
                  {k + 1}
                </SvgText>
              </G>
            ) : null}
          </G>
        );
      })}
    </Svg>
  );
});

/** Recipiente onde o grupo fica: caixote de feira, ninho ou estacionamento. */
export const RECIPIENTE: Record<Objeto, { rotulo: string; fundo: string; borda: string; um: string }> = {
  laranja: { rotulo: "Caixotes", fundo: "#F3D3A6", borda: "#C99A62", um: "caixote" },
  ovo: { rotulo: "Cartelas", fundo: "#F6EBDD", borda: "#E2C9A6", um: "cartela" },
  carro: { rotulo: "Filas", fundo: "#ECEDF5", borda: "#C9CBDD", um: "fila" },
};
