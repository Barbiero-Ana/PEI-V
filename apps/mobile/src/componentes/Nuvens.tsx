import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Animated, Easing, Platform, StyleSheet, View, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import Svg, { Circle, Ellipse, Rect } from "react-native-svg";
import { missaoPorId } from "@modolume/core";
import { useAcessibilidade } from "@/estado/acessibilidade";
import { IconeMissao } from "./Icones";
import { Titulo } from "./ui";

/**
 * Abertura de missão com névoa: uma névoa de nuvens sobe devagar do rodapé
 * até cobrir a tela, a missão abre por baixo e a névoa segue subindo e se
 * desfaz, revelando o jogo. Usada ao sair do mapa ou do início. Da tela
 * final de uma missão para a próxima, a mesma névoa cruza de lado, da
 * esquerda para a direita.
 */

const NATIVO = Platform.OS !== "web";
const NEVOA = "#F4F2FC";
const NEVOA_FUNDO = "#E4DEF8";

/** Nuvem fofa desenhada com círculos (sem degradê). */
export function Nuvem({
  largura,
  cor: tom = "#FFFFFF",
  sombra = "#E3DCFA",
}: {
  largura: number;
  cor?: string;
  sombra?: string;
}) {
  const altura = largura * 0.48;
  return (
    <Svg width={largura} height={altura} viewBox="0 0 200 96">
      <Ellipse cx={100} cy={84} rx={92} ry={10} fill={sombra} />
      <Rect x={12} y={52} width={176} height={32} rx={16} fill={tom} />
      <Circle cx={48} cy={56} r={28} fill={tom} />
      <Circle cx={88} cy={42} r={38} fill={tom} />
      <Circle cx={132} cy={48} r={32} fill={tom} />
      <Circle cx={166} cy={62} r={22} fill={tom} />
    </Svg>
  );
}

interface Opcoes {
  /** Névoa cruzando da esquerda para a direita e trocando a missão atual pela nova. */
  lateral?: boolean;
}

const Contexto = createContext<(id: string, opcoes?: Opcoes) => void>(() => {});

/** Abre uma missão com a transição de nuvens (ou direto, com menos animações). */
export function useAbrirMissao() {
  return useContext(Contexto);
}

/**
 * Faixa de névoa: um bloco sólido com bordas fofas em cima e embaixo.
 * Subindo pela tela, a borda de cima chega primeiro e a de baixo vai embora por último.
 */
function Nevoa({ largura, altura, tom }: { largura: number; altura: number; tom: string }) {
  const borda = 70;
  const passo = largura / 6;
  const bolhas = Array.from({ length: 8 }, (_, i) => ({ x: -passo / 2 + i * passo, r: 46 + ((i * 37) % 30) }));
  return (
    <Svg width={largura} height={altura}>
      <Rect x={0} y={borda} width={largura} height={altura - borda * 2} fill={tom} />
      {bolhas.map((b, i) => (
        <Circle key={`t${i}`} cx={b.x} cy={borda + 10} r={b.r} fill={tom} />
      ))}
      {bolhas.map((b, i) => (
        <Circle key={`b${i}`} cx={b.x + passo / 2} cy={altura - borda - 10} r={b.r} fill={tom} />
      ))}
    </Svg>
  );
}

/** A mesma névoa deitada: bordas fofas à esquerda e à direita. */
function NevoaLateral({ largura, altura, tom }: { largura: number; altura: number; tom: string }) {
  const borda = 70;
  const passo = altura / 9;
  const bolhas = Array.from({ length: 11 }, (_, i) => ({ y: -passo / 2 + i * passo, r: 46 + ((i * 37) % 30) }));
  return (
    <Svg width={largura} height={altura}>
      <Rect x={borda} y={0} width={largura - borda * 2} height={altura} fill={tom} />
      {bolhas.map((b, i) => (
        <Circle key={`e${i}`} cx={borda + 10} cy={b.y} r={b.r} fill={tom} />
      ))}
      {bolhas.map((b, i) => (
        <Circle key={`d${i}`} cx={largura - borda - 10} cy={b.y + passo / 2} r={b.r} fill={tom} />
      ))}
    </Svg>
  );
}

export function TransicaoNuvens({ children }: { children: ReactNode }) {
  const { animacoesReduzidas } = useAcessibilidade();
  const { width, height } = useWindowDimensions();
  const [missaoId, setMissaoId] = useState<string | null>(null);
  const [lateral, setLateral] = useState(false);
  // 0: nuvens fora da tela · 1: tela coberta · 2: nuvens afastadas de novo
  const [v] = useState(() => new Animated.Value(0));
  const ocupado = useRef(false);

  const abrir = useCallback(
    (id: string, opcoes?: Opcoes) => {
      if (ocupado.current) return;
      const ir = (destino: Parameters<typeof router.push>[0]) =>
        opcoes?.lateral ? router.replace(destino) : router.push(destino);
      if (animacoesReduzidas) {
        ir({ pathname: "/jogar/[id]", params: { id } });
        return;
      }
      ocupado.current = true;
      setLateral(Boolean(opcoes?.lateral));
      setMissaoId(id);
      v.setValue(0);
      Animated.timing(v, {
        toValue: 1,
        duration: 900,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: NATIVO,
      }).start(() => {
        ir({ pathname: "/jogar/[id]", params: { id, nuvens: "1" } });
        setTimeout(() => {
          Animated.timing(v, {
            toValue: 2,
            duration: 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: NATIVO,
          }).start(() => {
            ocupado.current = false;
            setMissaoId(null);
            v.setValue(0);
          });
        }, 350);
      });
    },
    [animacoesReduzidas, v],
  );

  const missao = missaoId ? missaoPorId(missaoId) : undefined;
  const alturaNevoa = height * 1.6;
  const larguraNevoa = width * 1.8;
  // posição da névoa: vertical sobe do rodapé; lateral cruza da esquerda para a direita
  const mover = (fora: number, centro: number, saida: number) =>
    lateral
      ? {
          translateX: v.interpolate({
            inputRange: [0, 1, 2],
            outputRange: [-larguraNevoa - fora, -larguraNevoa / 2 + width / 2 + centro, width + saida],
          }),
        }
      : {
          translateY: v.interpolate({
            inputRange: [0, 1, 2],
            outputRange: [height + fora, -alturaNevoa / 2 + height / 2 + centro, -alturaNevoa - saida],
          }),
        };
  const Faixa = lateral ? NevoaLateral : Nevoa;
  // a faixa lateral passa um pouco das bordas de cima e de baixo para cobrir a tela toda
  const faixa = lateral ? { largura: larguraNevoa, altura: height + 240 } : { largura: width, altura: alturaNevoa };

  return (
    <Contexto.Provider value={abrir}>
      <View style={{ flex: 1 }}>
        {children}
        {missaoId ? (
          <View style={[StyleSheet.absoluteFill, { zIndex: 1000, elevation: 1000 }]} pointerEvents="auto">
            {/* duas camadas de névoa sobem do rodapé; a de trás vai um pouco à frente (profundidade) */}
            <Animated.View
              style={{
                position: "absolute",
                left: 0,
                top: lateral ? -120 : 0,
                opacity: v.interpolate({ inputRange: [0, 1, 1.6, 2], outputRange: [0.75, 0.75, 0.4, 0] }),
                transform: [mover(40, lateral ? 70 : -70, 120)],
              }}
            >
              <Faixa {...faixa} tom={NEVOA_FUNDO} />
            </Animated.View>
            <Animated.View
              style={{
                position: "absolute",
                left: 0,
                top: lateral ? -120 : 0,
                opacity: v.interpolate({ inputRange: [0, 0.3, 1, 1.5, 2], outputRange: [0, 0.97, 0.97, 0.7, 0] }),
                transform: [mover(120, 0, 0)],
              }}
            >
              <Faixa {...faixa} tom={NEVOA} />
            </Animated.View>
            {missao ? (
              <Animated.View
                pointerEvents="none"
                style={[
                  StyleSheet.absoluteFill,
                  {
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    opacity: v.interpolate({ inputRange: [0, 0.7, 1, 1.2, 2], outputRange: [0, 0, 1, 0, 0] }),
                    transform: [
                      lateral
                        ? { translateX: v.interpolate({ inputRange: [0, 1, 2], outputRange: [-16, 0, 16] }) }
                        : { translateY: v.interpolate({ inputRange: [0, 1, 2], outputRange: [16, 0, -16] }) },
                    ],
                  },
                ]}
              >
                <IconeMissao jogo={missao.jogo} tamanho={40} />
                <Titulo tamanho={20}>{missao.titulo}</Titulo>
              </Animated.View>
            ) : null}
          </View>
        ) : null}
      </View>
    </Contexto.Provider>
  );
}
