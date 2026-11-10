import { Image, View, type ImageSourcePropType } from "react-native";
import Svg, { Path } from "react-native-svg";
import { CONSTELACOES, NIVEIS, estrelasAcesas, mapaConcluido } from "@modolume/core";
import { useJogador } from "@/estado/jogador";

/**
 * Lilo, o axolote curioso: mascote do Modolume. Reage ao jogo com as
 * expressões do guia de marca (feliz, animado, curioso, surpreso, pensativo,
 * concentrado, orgulhoso, triste, rindo, com ideia) e evolui conforme as
 * estrelas acesas: Filhote → Curioso → Explorador → Lilo Estelar.
 */

export type HumorLilo =
  | "normal"
  | "feliz"
  | "animado"
  | "curioso"
  | "surpreso"
  | "pensativo"
  | "concentrado"
  | "orgulhoso"
  | "triste"
  | "rindo"
  | "ideia";

export const ESTAGIOS = [
  { nome: "Filhote", desde: 0, descricao: "Acabou de chegar e quer explorar tudo." },
  { nome: "Curioso", desde: 7, descricao: "As guelras agora brilham de curiosidade." },
  { nome: "Explorador", desde: 14, descricao: "Ganhou uma coroa de estrelas." },
  { nome: "Lilo Estelar", desde: 21, descricao: "Estrelas giram ao redor dele." },
] as const;

/** Total de estrelas acesas em todos os mapas. */
export function useEstrelasAcesas() {
  const { pontosPorNivel, progresso } = useJogador();
  return NIVEIS.reduce((soma, n) => {
    const c = CONSTELACOES.find((x) => x.id === n.constelacao);
    return c ? soma + estrelasAcesas(pontosPorNivel[n.numero] ?? 0, c, mapaConcluido(n.numero, progresso)) : soma;
  }, 0);
}

export function estagioDe(estrelas: number) {
  let i = 0;
  ESTAGIOS.forEach((e, k) => {
    if (estrelas >= e.desde) i = k;
  });
  return i;
}

const PESSEGO = "#FFAC7A";

/** Uma ilustração para cada expressão (assets/lilo). */
const POSES: Record<HumorLilo, ImageSourcePropType> = {
  normal: require("../../assets/lilo/acenando.png"),
  feliz: require("../../assets/lilo/feliz.png"),
  animado: require("../../assets/lilo/comemorando.png"),
  rindo: require("../../assets/lilo/comemorando.png"),
  curioso: require("../../assets/lilo/duvida.png"),
  surpreso: require("../../assets/lilo/surpreso.png"),
  pensativo: require("../../assets/lilo/pensando.png"),
  concentrado: require("../../assets/lilo/concentrado.png"),
  orgulhoso: require("../../assets/lilo/orgulhoso.png"),
  triste: require("../../assets/lilo/triste.png"),
  ideia: require("../../assets/lilo/ideia.png"),
};

const brilho = (x: number, y: number, r: number) =>
  `M${x} ${y - r} L${x + r * 0.3} ${y - r * 0.3} L${x + r} ${y} L${x + r * 0.3} ${y + r * 0.3} L${x} ${y + r} L${x - r * 0.3} ${y + r * 0.3} L${x - r} ${y} L${x - r * 0.3} ${y - r * 0.3} Z`;

/** O Lilo parado, sem animação. */
export function DesenhoLilo({
  humor = "normal",
  estagio = 0,
  tamanho = 64,
}: {
  humor?: HumorLilo;
  estagio?: number;
  tamanho?: number;
}) {
  return (
    <View style={{ width: tamanho, height: tamanho }}>
      {/* a partir do estágio Curioso, um halo suave atrás dele */}
      {estagio >= 1 ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: tamanho * 0.12,
            top: tamanho * 0.12,
            width: tamanho * 0.76,
            height: tamanho * 0.76,
            borderRadius: tamanho,
            backgroundColor: "#C9B4FF",
            opacity: 0.28,
          }}
        />
      ) : null}
      <Image
        source={POSES[humor]}
        style={{ width: tamanho, height: tamanho }}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
      {/* coroa de estrelas (Explorador em diante) */}
      {estagio >= 2 ? (
        <Svg
          width={tamanho}
          height={tamanho}
          viewBox="0 0 100 100"
          style={{ position: "absolute", left: 0, top: 0 }}
          pointerEvents="none"
        >
          <Path d={brilho(40, 9, 4)} fill={PESSEGO} />
          <Path d={brilho(50, 5, 6)} fill="#FFD9A0" />
          <Path d={brilho(60, 9, 4)} fill={PESSEGO} />
        </Svg>
      ) : null}
    </View>
  );
}

/**
 * Lilo na tela: a ilustração da expressão, parada. No estágio Lilo Estelar,
 * três estrelinhas ficam ao redor dele.
 */
export function Lilo({
  humor = "normal",
  tamanho = 64,
  estagio,
}: {
  humor?: HumorLilo;
  tamanho?: number;
  estagio?: number;
}) {
  const acesas = useEstrelasAcesas();
  const nivel = estagio ?? estagioDe(acesas);
  return (
    <View style={{ width: tamanho, height: tamanho }}>
      {nivel >= 3
        ? [200, 320, 80].map((a) => (
            <View
              key={a}
              pointerEvents="none"
              style={{
                position: "absolute",
                left: tamanho / 2 + Math.cos((a * Math.PI) / 180) * tamanho * 0.48 - 3,
                top: tamanho / 2 + Math.sin((a * Math.PI) / 180) * tamanho * 0.48 - 3,
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: PESSEGO,
              }}
            />
          ))
        : null}
      <DesenhoLilo humor={humor} estagio={nivel} tamanho={tamanho} />
    </View>
  );
}
