import Svg, { Circle, Path, Rect } from "react-native-svg";
import type { TipoJogo } from "@modolume/core";
import { cor } from "@/tema";

/** Ícones de traço limpo nas cores da marca (sem emojis). */

type P = { tamanho?: number; cor?: string };

const traco = (c: string, w = 2) => ({
  stroke: c,
  strokeWidth: w,
  fill: "none",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export function Estrela({ cheia = true, tamanho = 18 }: { cheia?: boolean; tamanho?: number }) {
  return (
    <Svg viewBox="0 0 24 24" width={tamanho} height={tamanho}>
      <Path
        d="M12 2.8l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6L3.2 9.2l6.1-.8z"
        fill={cheia ? cor.pessego : cor.inativo}
      />
    </Svg>
  );
}

export const Seta = ({
  tamanho = 20,
  cor: c = cor.tinta,
  direcao = "esquerda",
}: P & { direcao?: "esquerda" | "direita" }) => (
  <Svg
    viewBox="0 0 24 24"
    width={tamanho}
    height={tamanho}
    style={direcao === "direita" ? { transform: [{ rotate: "180deg" }] } : undefined}
  >
    <Path d="M14.5 5 L7.5 12 L14.5 19" {...traco(c, 2.4)} />
  </Svg>
);

export const Fechar = ({ tamanho = 20, cor: c = cor.tinta }: P) => (
  <Svg viewBox="0 0 24 24" width={tamanho} height={tamanho}>
    <Path d="M6 6 L18 18 M18 6 L6 18" {...traco(c, 2.4)} />
  </Svg>
);

export const Check = ({ tamanho = 16, cor: c = "#fff" }: P) => (
  <Svg viewBox="0 0 24 24" width={tamanho} height={tamanho}>
    <Path d="M5 12.5 L10 17 L19 7.5" {...traco(c, 3)} />
  </Svg>
);

export const Cadeado = ({ tamanho = 18, cor: c = cor.textoFraco }: P) => (
  <Svg viewBox="0 0 24 24" width={tamanho} height={tamanho}>
    <Rect x={5} y={10.5} width={14} height={10} rx={2.5} fill={c} />
    <Path d="M8 10.5 V8 a4 4 0 0 1 8 0 V10.5" {...traco(c, 2.2)} />
  </Svg>
);

export const Relogio = ({ tamanho = 18, cor: c = cor.roxo }: P) => (
  <Svg viewBox="0 0 24 24" width={tamanho} height={tamanho}>
    <Circle cx={12} cy={12} r={8.5} {...traco(c)} />
    <Path d="M12 7.5 V12 L15 14" {...traco(c)} />
  </Svg>
);

export const Alvo = ({ tamanho = 18, cor: c = cor.roxo }: P) => (
  <Svg viewBox="0 0 24 24" width={tamanho} height={tamanho}>
    <Circle cx={12} cy={12} r={8.5} {...traco(c)} />
    <Circle cx={12} cy={12} r={4} {...traco(c)} />
  </Svg>
);

export const Tentativa = ({ tamanho = 18, cor: c = cor.roxo }: P) => (
  <Svg viewBox="0 0 24 24" width={tamanho} height={tamanho}>
    <Path d="M19 12 A7 7 0 1 1 16.5 6.6" {...traco(c)} />
    <Path d="M17 3 V7 H13" {...traco(c)} />
  </Svg>
);

export const IconeInicio = ({ tamanho = 24, cor: c = cor.textoSuave }: P) => (
  <Svg viewBox="0 0 24 24" width={tamanho} height={tamanho}>
    <Path
      d="M4 10.5 L12 4 L20 10.5 V19 a1.5 1.5 0 0 1 -1.5 1.5 H15 V14.5 H9 V20.5 H5.5 A1.5 1.5 0 0 1 4 19 Z"
      {...traco(c, 2)}
    />
  </Svg>
);
export const IconeNiveis = ({ tamanho = 24, cor: c = cor.textoSuave }: P) => (
  <Svg viewBox="0 0 24 24" width={tamanho} height={tamanho}>
    <Path d="M12 3.5 L21 8 L12 12.5 L3 8 Z" {...traco(c, 2)} />
    <Path d="M3 12 L12 16.5 L21 12 M3 16 L12 20.5 L21 16" {...traco(c, 2)} />
  </Svg>
);
/** Prancheta: atividades enviadas pelo professor. */
export const IconeProfessor = ({ tamanho = 24, cor: c = cor.textoSuave }: P) => (
  <Svg viewBox="0 0 24 24" width={tamanho} height={tamanho}>
    <Path
      d="M8 4.5 H6.5 A1.5 1.5 0 0 0 5 6 V19.5 A1.5 1.5 0 0 0 6.5 21 H17.5 A1.5 1.5 0 0 0 19 19.5 V6 A1.5 1.5 0 0 0 17.5 4.5 H16"
      {...traco(c, 2)}
    />
    <Path d="M9 3 H15 V6 H9 Z M8.5 12 L10.5 14 L15.5 9.5 M8.5 17.5 H15.5" {...traco(c, 2)} />
  </Svg>
);
export const IconeTrofeu = ({ tamanho = 24, cor: c = cor.textoSuave }: P) => (
  <Svg viewBox="0 0 24 24" width={tamanho} height={tamanho}>
    <Path d="M7 4 H17 V9 a5 5 0 0 1 -10 0 Z" {...traco(c, 2)} />
    <Path
      d="M7 6 H4 V7.5 a3 3 0 0 0 3 3 M17 6 H20 V7.5 a3 3 0 0 1 -3 3 M12 14 V17 M8.5 20 H15.5 M9.5 20 L10 17 H14 L14.5 20"
      {...traco(c, 2)}
    />
  </Svg>
);
export const IconePerfil = ({ tamanho = 24, cor: c = cor.textoSuave }: P) => (
  <Svg viewBox="0 0 24 24" width={tamanho} height={tamanho}>
    <Circle cx={12} cy={8.5} r={4} {...traco(c, 2)} />
    <Path d="M4.5 20 a7.5 7.5 0 0 1 15 0" {...traco(c, 2)} />
  </Svg>
);

export const IconeLapis = ({ tamanho = 20, cor: c = cor.roxo }: P) => (
  <Svg viewBox="0 0 24 24" width={tamanho} height={tamanho}>
    <Path
      d="M4 20 L5 15.5 L15.5 5 a2.1 2.1 0 0 1 3 0 l0.5 0.5 a2.1 2.1 0 0 1 0 3 L8.5 19 Z M13.5 7 L17 10.5"
      {...traco(c, 2)}
    />
  </Svg>
);
export const IconeVibrar = ({ tamanho = 20, cor: c = cor.roxo }: P) => (
  <Svg viewBox="0 0 24 24" width={tamanho} height={tamanho}>
    <Rect x={8} y={4} width={8} height={16} rx={2} {...traco(c, 2)} />
    <Path d="M4 9 V15 M20 9 V15" {...traco(c, 2)} />
  </Svg>
);
export const IconeChave = ({ tamanho = 20, cor: c = cor.roxo }: P) => (
  <Svg viewBox="0 0 24 24" width={tamanho} height={tamanho}>
    <Rect x={5} y={11} width={14} height={9.5} rx={2.5} {...traco(c, 2)} />
    <Path d="M8 11 V8 a4 4 0 0 1 7.6 -1.7" {...traco(c, 2)} />
  </Svg>
);
export const IconeAcessibilidade = ({ tamanho = 20, cor: c = cor.roxo }: P) => (
  <Svg viewBox="0 0 24 24" width={tamanho} height={tamanho}>
    <Circle cx={12} cy={4.8} r={1.9} fill={c} />
    <Path d="M5 8.5 L12 10 L19 8.5 M12 10 V14.5 M12 14.5 L9 20.5 M12 14.5 L15 20.5" {...traco(c, 2)} />
  </Svg>
);
export const IconeSom = ({ tamanho = 20, cor: c = cor.roxo }: P) => (
  <Svg viewBox="0 0 24 24" width={tamanho} height={tamanho}>
    <Path d="M4 9.5 H7.5 L12 5.5 V18.5 L7.5 14.5 H4 Z" {...traco(c, 2)} />
    <Path d="M15.5 9 a4 4 0 0 1 0 6 M18 6.5 a7.5 7.5 0 0 1 0 11" {...traco(c, 2)} />
  </Svg>
);
export const IconeLixeira = ({ tamanho = 20, cor: c = cor.pessegoEscuro }: P) => (
  <Svg viewBox="0 0 24 24" width={tamanho} height={tamanho}>
    <Path d="M4.5 7 H19.5 M9.5 7 V4.5 H14.5 V7 M6.5 7 L7.5 20 H16.5 L17.5 7 M10 11 V16 M14 11 V16" {...traco(c, 2)} />
  </Svg>
);
export const IconeSair = ({ tamanho = 20, cor: c = cor.roxo }: P) => (
  <Svg viewBox="0 0 24 24" width={tamanho} height={tamanho}>
    <Path d="M10 4.5 H6 A1.5 1.5 0 0 0 4.5 6 V18 A1.5 1.5 0 0 0 6 19.5 H10" {...traco(c, 2)} />
    <Path d="M14.5 8 L19 12 L14.5 16 M19 12 H9.5" {...traco(c, 2)} />
  </Svg>
);
export const IconeInfo = ({ tamanho = 20, cor: c = cor.roxo }: P) => (
  <Svg viewBox="0 0 24 24" width={tamanho} height={tamanho}>
    <Circle cx={12} cy={12} r={8.5} {...traco(c, 2)} />
    <Path d="M12 11 V16" {...traco(c, 2.2)} />
    <Circle cx={12} cy={7.8} r={1.2} fill={c} />
  </Svg>
);

export const Lampada = ({ tamanho = 22, cor: c = cor.pessegoEscuro, acesa = false }: P & { acesa?: boolean }) => (
  <Svg viewBox="0 0 24 24" width={tamanho} height={tamanho}>
    {acesa ? <Circle cx={12} cy={9.5} r={8.5} fill="#FFE7D4" /> : null}
    <Path d="M9 17.5 h6 M10 20.5 h4" {...traco(c, 2)} />
    <Path
      d="M8.6 14.5 A6 6 0 1 1 15.4 14.5 C14.6 15.2 14.5 16 14.5 17 H9.5 C9.5 16 9.4 15.2 8.6 14.5 Z"
      fill={acesa ? "#FFAC7A" : "none"}
      {...{ stroke: c, strokeWidth: 2, strokeLinejoin: "round" as const }}
    />
  </Svg>
);

export const IconeRaio = ({ tamanho = 18, cor: c = cor.pessegoEscuro }: P) => (
  <Svg viewBox="0 0 24 24" width={tamanho} height={tamanho}>
    <Path d="M13.5 2.5 L5 13.5 H11 L10 21.5 L19 9.5 H13 Z" fill={c} />
  </Svg>
);

export const IconeCalendario = ({ tamanho = 18, cor: c = cor.roxo }: P) => (
  <Svg viewBox="0 0 24 24" width={tamanho} height={tamanho}>
    <Rect x={3.5} y={5} width={17} height={15.5} rx={3} {...traco(c, 2)} />
    <Path d="M3.5 10 H20.5 M8 3 V7 M16 3 V7" {...traco(c, 2)} />
  </Svg>
);

/**
 * Ícone de cada missão, no estilo "figurinha": objetos simples do tema da
 * atividade, contorno azul-marinho arredondado e cores chapadas da marca.
 */
const T = "#1E2A78"; // contorno
const ROXO = "#7B61FF";
const LILAS = "#C9B4FF";
const PESSEGO = "#FFAC7A";
const AZUL = "#8FD3FF";
const CREME = "#FFF6E8";
const VERDE = "#7DBE7A";
const BRANCO = "#FFFFFF";

const contorno = { stroke: T, strokeWidth: 2.2, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export function IconeMissao({ jogo, tamanho = 36 }: { jogo: TipoJogo; tamanho?: number }) {
  const s = { viewBox: "0 0 48 48", width: tamanho, height: tamanho };
  switch (jogo) {
    case "pares":
      // dois grupos ligados por uma linha
      return (
        <Svg {...s}>
          <Path d="M15 17 C24 17 24 31 33 31" fill="none" stroke={ROXO} strokeWidth={3} strokeLinecap="round" />
          <Circle cx={11} cy={17} r={7} fill={PESSEGO} {...contorno} />
          <Rect x={30} y={24} width={13} height={14} rx={3.5} fill={AZUL} {...contorno} />
          <Path d="M36.5 28 V34" stroke={T} strokeWidth={2.4} strokeLinecap="round" />
        </Svg>
      );
    case "trilha":
      // três casas numeradas em degraus
      return (
        <Svg {...s}>
          <Rect x={5} y={28} width={12} height={12} rx={3} fill={LILAS} {...contorno} />
          <Rect x={18} y={20} width={12} height={20} rx={3} fill={AZUL} {...contorno} />
          <Rect x={31} y={11} width={12} height={29} rx={3} fill={ROXO} {...contorno} />
          <Circle cx={37} cy={17} r={2.2} fill={BRANCO} />
        </Svg>
      );
    case "torre":
      // pilha de caixas até a marca
      return (
        <Svg {...s}>
          <Path d="M6 9 H42" stroke={PESSEGO} strokeWidth={2.4} strokeDasharray="3 3" strokeLinecap="round" />
          <Rect x={12} y={30} width={24} height={11} rx={2.5} fill={PESSEGO} {...contorno} />
          <Rect x={15} y={20} width={18} height={10} rx={2.5} fill={LILAS} {...contorno} />
          <Rect x={18} y={12} width={12} height={8} rx={2.5} fill={AZUL} {...contorno} />
        </Svg>
      );
    case "dinheiro":
      // nota e moeda
      return (
        <Svg {...s}>
          <Rect x={4} y={12} width={30} height={19} rx={3.5} fill={VERDE} {...contorno} />
          <Circle cx={19} cy={21.5} r={4.5} fill={CREME} {...contorno} />
          <Circle cx={35} cy={32} r={9} fill={PESSEGO} {...contorno} />
          <Circle cx={35} cy={32} r={4.5} fill="none" stroke={T} strokeWidth={1.6} />
        </Svg>
      );
    case "relogio":
      return (
        <Svg {...s}>
          <Circle cx={24} cy={25} r={17} fill={CREME} {...contorno} />
          <Path d="M24 25 V14 M24 25 L31 29" stroke={T} strokeWidth={2.6} strokeLinecap="round" />
          <Circle cx={24} cy={25} r={2.4} fill={PESSEGO} />
          <Path d="M17 7 L13 4 M31 7 L35 4" stroke={T} strokeWidth={2.2} strokeLinecap="round" />
        </Svg>
      );
    case "jarra":
      return (
        <Svg {...s}>
          <Path d="M12 9 H34 L32 41 H14 Z" fill={BRANCO} {...contorno} />
          <Path d="M13.4 26 H32.6 L32 41 H14 Z" fill={AZUL} />
          <Path d="M12 9 H34 L32 41 H14 Z" fill="none" {...contorno} />
          <Path d="M34 15 H39 V26 H33" fill="none" {...contorno} />
          <Path d="M15 17 H19 M15 22 H19 M15 31 H19" stroke={T} strokeWidth={1.8} strokeLinecap="round" />
        </Svg>
      );
    case "pizza":
      return (
        <Svg {...s}>
          <Circle cx={24} cy={24} r={18} fill={CREME} {...contorno} />
          <Path d="M24 24 L24 6 A18 18 0 0 1 41.1 29.6 Z" fill={PESSEGO} {...contorno} />
          <Circle cx={30} cy={15} r={2.4} fill="#C8553D" />
          <Circle cx={35} cy={23} r={2.4} fill="#C8553D" />
          <Path d="M24 24 L6.9 29.6 M24 24 L13.4 9.4" stroke={T} strokeWidth={1.6} strokeLinecap="round" />
        </Svg>
      );
    case "grafico":
      return (
        <Svg {...s}>
          <Rect x={8} y={24} width={9} height={16} rx={2.5} fill={LILAS} {...contorno} />
          <Rect x={20} y={12} width={9} height={28} rx={2.5} fill={ROXO} {...contorno} />
          <Rect x={32} y={19} width={9} height={21} rx={2.5} fill={PESSEGO} {...contorno} />
          <Path d="M5 41 H43" stroke={T} strokeWidth={2.4} strokeLinecap="round" />
        </Svg>
      );
    case "reta":
      return (
        <Svg {...s}>
          <Path d="M5 32 H43" stroke={T} strokeWidth={2.6} strokeLinecap="round" />
          {[8, 16, 24, 32, 40].map((x) => (
            <Path key={x} d={`M${x} 28 V36`} stroke={T} strokeWidth={2.2} strokeLinecap="round" />
          ))}
          <Path d="M32 25 C26 18 26 11 32 8 C38 11 38 18 32 25 Z" fill={PESSEGO} {...contorno} />
          <Circle cx={32} cy={14} r={2.6} fill={BRANCO} />
        </Svg>
      );
    case "balanca":
      return (
        <Svg {...s}>
          <Path d="M24 9 V40 M15 42 H33" stroke={T} strokeWidth={2.4} strokeLinecap="round" />
          <Path d="M8 15 H40" stroke={T} strokeWidth={2.4} strokeLinecap="round" />
          <Path d="M4 27 Q10 34 16 27 Z" fill={AZUL} {...contorno} />
          <Path d="M32 27 Q38 34 44 27 Z" fill={PESSEGO} {...contorno} />
          <Path d="M10 15 L4 27 M10 15 L16 27 M38 15 L32 27 M38 15 L44 27" stroke={T} strokeWidth={1.6} />
          <Circle cx={24} cy={9} r={3} fill={ROXO} {...contorno} />
        </Svg>
      );
    case "simetria":
      // borboleta com eixo
      return (
        <Svg {...s}>
          <Path d="M24 14 C16 4 4 8 7 20 C9 26 18 25 24 24 Z" fill={ROXO} {...contorno} />
          <Path d="M24 14 C32 4 44 8 41 20 C39 26 30 25 24 24 Z" fill={LILAS} {...contorno} />
          <Path d="M24 24 C18 26 11 33 16 38 C20 41 24 34 24 30 Z" fill={LILAS} {...contorno} />
          <Path d="M24 24 C30 26 37 33 32 38 C28 41 24 34 24 30 Z" fill={ROXO} {...contorno} />
          <Path d="M24 6 V43" stroke={PESSEGO} strokeWidth={2.4} strokeDasharray="3 3" strokeLinecap="round" />
        </Svg>
      );
    case "caminho":
      return (
        <Svg {...s}>
          <Rect x={5} y={5} width={38} height={38} rx={9} fill="#E3F3E1" {...contorno} />
          <Path
            d="M12 36 V24 H24 V13 H35"
            fill="none"
            stroke={ROXO}
            strokeWidth={3}
            strokeDasharray="1 6"
            strokeLinecap="round"
          />
          <Circle cx={12} cy={36} r={4} fill={PESSEGO} {...contorno} />
          <Path d="M30 16 V10 L35 6 L40 10 V16 Z" fill={ROXO} {...contorno} />
        </Svg>
      );
    case "cubos":
      return (
        <Svg {...s}>
          <Path d="M24 6 L39 14 L24 22 L9 14 Z" fill={LILAS} {...contorno} />
          <Path d="M9 14 L24 22 V40 L9 32 Z" fill={ROXO} {...contorno} />
          <Path d="M39 14 L24 22 V40 L39 32 Z" fill="#5A43D6" {...contorno} />
          <Path d="M16.5 18 V36 M31.5 18 V36" stroke={BRANCO} strokeOpacity={0.45} strokeWidth={1.4} />
        </Svg>
      );
    case "solidos":
      // pirâmide com vértice marcado
      return (
        <Svg {...s}>
          <Path d="M24 6 L41 36 L24 42 Z" fill={ROXO} {...contorno} />
          <Path d="M24 6 L24 42 L7 36 Z" fill={LILAS} {...contorno} />
          <Circle cx={24} cy={6} r={4} fill={PESSEGO} {...contorno} />
          <Circle cx={41} cy={36} r={3} fill={PESSEGO} {...contorno} />
        </Svg>
      );
    case "planificacao":
      // molde do cubo em cruz
      return (
        <Svg {...s}>
          {[
            [18, 4],
            [6, 16],
            [18, 16],
            [30, 16],
            [18, 28],
          ].map(([x, y], i) => (
            <Rect
              key={i}
              x={x}
              y={y}
              width={12}
              height={12}
              rx={2}
              fill={i === 2 ? ROXO : i % 2 ? AZUL : LILAS}
              {...contorno}
            />
          ))}
          <Path d="M18 40 L22 45 H34 L30 40 Z" fill={PESSEGO} {...contorno} />
        </Svg>
      );
    case "volume":
      // pilha de cubinhos em degrau
      return (
        <Svg {...s}>
          {[
            [8, 30, LILAS],
            [20, 30, ROXO],
            [32, 30, LILAS],
            [14, 19, AZUL],
            [26, 19, AZUL],
            [20, 8, PESSEGO],
          ].map(([x, y, c], i) => (
            <Rect
              key={i}
              x={x as number}
              y={y as number}
              width={11}
              height={11}
              rx={2.5}
              fill={c as string}
              {...contorno}
            />
          ))}
        </Svg>
      );
    case "repartir":
      // um prato dividido para três
      return (
        <Svg {...s}>
          <Circle cx={24} cy={11} r={6} fill={PESSEGO} {...contorno} />
          <Path
            d="M24 17 V24 M24 24 L11 33 M24 24 V35 M24 24 L37 33"
            stroke={T}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <Circle cx={10} cy={37} r={5} fill={LILAS} {...contorno} />
          <Circle cx={24} cy={39} r={5} fill={LILAS} {...contorno} />
          <Circle cx={38} cy={37} r={5} fill={LILAS} {...contorno} />
        </Svg>
      );
    case "area":
      // canteiro cercado
      return (
        <Svg {...s}>
          <Rect x={7} y={10} width={34} height={28} rx={3} fill="#E6C9A3" {...contorno} />
          <Path d="M7 24 H41 M18 10 V38 M30 10 V38" stroke="#C9A67C" strokeWidth={1.6} />
          <Path
            d="M12 20 C11 15 15 14 15 14 C15 18 13 19 12 20 Z M24 32 C23 27 27 26 27 26 C27 30 25 31 24 32 Z"
            fill={VERDE}
            stroke={T}
            strokeWidth={1.4}
          />
          <Rect x={7} y={10} width={34} height={28} rx={3} fill="none" stroke="#B07A4A" strokeWidth={3} />
        </Svg>
      );
    case "angulo":
      return (
        <Svg {...s}>
          <Path d="M8 38 H42" stroke={T} strokeWidth={2.6} strokeLinecap="round" />
          <Path d="M8 38 L32 12" stroke={T} strokeWidth={2.6} strokeLinecap="round" />
          <Path
            d="M22 38 A14 14 0 0 0 17.5 27.7"
            fill="none"
            stroke={PESSEGO}
            strokeWidth={3.4}
            strokeLinecap="round"
          />
          <Path d="M8 38 L22 38 A14 14 0 0 0 17.5 27.7 Z" fill={PESSEGO} opacity={0.3} />
          <Circle cx={8} cy={38} r={3.4} fill={ROXO} {...contorno} />
        </Svg>
      );
    case "porcento":
      return (
        <Svg {...s}>
          <Rect x={6} y={6} width={36} height={36} rx={8} fill="#EFEBFF" {...contorno} />
          <Path d="M7.1 26 H40.9 V34 A8 8 0 0 1 32.9 42 H15.1 A8 8 0 0 1 7.1 34 Z" fill={ROXO} />
          <Rect x={6} y={6} width={36} height={36} rx={8} fill="none" {...contorno} />
          <Circle cx={17} cy={15} r={3.4} fill="none" stroke={T} strokeWidth={2.4} />
          <Circle cx={31} cy={21} r={3.4} fill="none" stroke={T} strokeWidth={2.4} />
          <Path d="M32 12 L16 24" stroke={T} strokeWidth={2.4} strokeLinecap="round" />
        </Svg>
      );
    case "maquina":
      return (
        <Svg {...s}>
          <Rect x={8} y={12} width={32} height={28} rx={6} fill={LILAS} {...contorno} />
          <Rect x={14} y={18} width={20} height={9} rx={2} fill={T} />
          <Circle cx={18} cy={33} r={2.6} fill={PESSEGO} />
          <Circle cx={26} cy={33} r={2.6} fill={AZUL} />
          <Path d="M20 5 V12 M28 5 V12" stroke={T} strokeWidth={2.4} strokeLinecap="round" />
          <Path d="M2 26 H8 M40 26 H46" stroke={ROXO} strokeWidth={3} strokeLinecap="round" />
        </Svg>
      );
    case "sorteio":
      return (
        <Svg {...s}>
          <Path d="M16 12 Q24 4 32 12" stroke="#B07A4A" strokeWidth={2.6} fill="none" strokeLinecap="round" />
          <Path d="M10 14 H38 L42 36 Q42 43 34 43 H14 Q6 43 6 36 Z" fill="#E9C9A0" {...contorno} />
          <Circle cx={17} cy={30} r={5} fill={ROXO} {...contorno} />
          <Circle cx={28} cy={26} r={5} fill={PESSEGO} {...contorno} />
          <Circle cx={30} cy={36} r={4} fill={AZUL} {...contorno} />
        </Svg>
      );
    case "media":
      return (
        <Svg {...s}>
          {(
            [
              [8, 30, ROXO],
              [20, 18, PESSEGO],
              [32, 26, AZUL],
            ] as const
          ).map(([x, y, c]) => (
            <Rect key={x} x={x} y={y} width={9} height={42 - y} rx={2} fill={c} {...contorno} />
          ))}
          <Path d="M4 25 H44" stroke={T} strokeWidth={2} strokeDasharray="3 3" strokeLinecap="round" />
          <Path d="M4 42 H44" stroke={T} strokeWidth={2.4} strokeLinecap="round" />
        </Svg>
      );
    case "expressao":
      return (
        <Svg {...s}>
          <Rect x={8} y={4} width={32} height={40} rx={6} fill={CREME} {...contorno} />
          <Rect x={13} y={9} width={22} height={9} rx={2} fill="#1F3B2C" />
          <Rect x={13} y={23} width={9} height={7} rx={2} fill={ROXO} />
          <Rect x={26} y={23} width={9} height={7} rx={2} fill={PESSEGO} />
          <Rect x={13} y={33} width={9} height={7} rx={2} fill={PESSEGO} />
          <Rect x={26} y={33} width={9} height={7} rx={2} fill={ROXO} />
        </Svg>
      );
    case "plano":
      // mapa do tesouro com X
      return (
        <Svg {...s}>
          <Path d="M6 10 L17 6 L31 10 L42 6 V38 L31 42 L17 38 L6 42 Z" fill={CREME} {...contorno} />
          <Path d="M17 6 V38 M31 10 V42" stroke="#E2C9A6" strokeWidth={1.8} />
          <Path
            d="M10 34 C16 30 18 22 26 22"
            fill="none"
            stroke={ROXO}
            strokeWidth={2.2}
            strokeDasharray="2 4"
            strokeLinecap="round"
          />
          <Path d="M28 14 L36 22 M36 14 L28 22" stroke="#E05A3C" strokeWidth={3.2} strokeLinecap="round" />
        </Svg>
      );
  }
}
