import { useEffect, useState } from "react";
import { Animated, Easing, Platform, Pressable, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useAcessibilidade } from "@/estado/acessibilidade";
import { Lilo, type HumorLilo } from "./Lilo";
import { Seta } from "./Icones";
import { Botao, Texto, Titulo } from "./ui";
import { cor, criarEstilos, fonte, porTema } from "@/tema";

/**
 * Painel de retorno da fase: sobe do rodapé com uma mola. No acerto, o Lilo
 * pula e solta estrelinhas e confetes; no erro, aparece calmo com a dica.
 */

const NATIVO = Platform.OS !== "web";
const CORES_CONFETE = porTema(() => [cor.roxo, cor.pessego, cor.azul, cor.lilas, "#FF7CA7", "#F6C344"]);

/** Partículas do confete: ângulo (graus, 0 = para cima), distância, tipo e cor. */
const PARTICULAS = porTema(() =>
  Array.from({ length: 16 }, (_, i) => ({
    angulo: -80 + (i * 160) / 15 + (i % 2 ? 6 : -6),
    distancia: 70 + ((i * 37) % 60),
    estrela: i % 3 === 0,
    cor: CORES_CONFETE[i % CORES_CONFETE.length]!,
    giro: (i % 2 ? 1 : -1) * (180 + ((i * 53) % 180)),
  })),
);

function Particula({ p, v }: { p: (typeof PARTICULAS)[number]; v: Animated.Value }) {
  const a = (p.angulo * Math.PI) / 180;
  const dx = Math.sin(a) * p.distancia;
  const dy = -Math.cos(a) * p.distancia;
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        opacity: v.interpolate({ inputRange: [0, 0.1, 0.7, 1], outputRange: [0, 1, 1, 0] }),
        transform: [
          { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, dx] }) },
          // sobe e depois cai um pouco, como um confete de verdade
          { translateY: v.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, dy, dy + 26] }) },
          { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ["0deg", `${p.giro}deg`] }) },
          { scale: v.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.3, 1, 0.8] }) },
        ],
      }}
    >
      {p.estrela ? (
        <Svg width={16} height={16} viewBox="0 0 24 24">
          <Path d="M12 2.8l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6L3.2 9.2l6.1-.8z" fill={p.cor} />
        </Svg>
      ) : (
        <View style={{ width: 9, height: 14, borderRadius: 3, backgroundColor: p.cor }} />
      )}
    </Animated.View>
  );
}

export function Retorno({
  status,
  titulo,
  mensagem,
  humor,
  ultima,
  onContinuar,
  onFechar,
  insetBaixo,
}: {
  status: "acerto" | "erro";
  titulo: string;
  mensagem: string;
  humor: HumorLilo;
  ultima: boolean;
  onContinuar: () => void;
  /** Fecha o aviso de erro (toque no painel). */
  onFechar?: () => void;
  insetBaixo: number;
}) {
  const { animacoesReduzidas } = useAcessibilidade();
  const acerto = status === "acerto";
  const [entrada] = useState(() => new Animated.Value(animacoesReduzidas ? 1 : 0));
  const [festa] = useState(() => new Animated.Value(0));
  const [brilho] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (animacoesReduzidas) return;
    entrada.setValue(0);
    Animated.spring(entrada, { toValue: 1, friction: 7, tension: 70, useNativeDriver: NATIVO }).start();
    if (!acerto) return;
    festa.setValue(0);
    brilho.setValue(0);
    Animated.parallel([
      Animated.timing(festa, {
        toValue: 1,
        duration: 1100,
        delay: 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: NATIVO,
      }),
      Animated.sequence([
        Animated.timing(brilho, { toValue: 1, duration: 220, useNativeDriver: NATIVO }),
        Animated.timing(brilho, { toValue: 0, duration: 700, useNativeDriver: NATIVO }),
      ]),
    ]).start();
  }, [status, titulo, mensagem, acerto, animacoesReduzidas, entrada, festa, brilho]);

  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      style={[
        acerto ? r.painel : r.aviso,
        acerto && { paddingBottom: Math.max(insetBaixo, 14) },
        acerto ? r.acerto : r.erro,
        {
          opacity: entrada.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 1] }),
          transform: [{ translateY: entrada.interpolate({ inputRange: [0, 1], outputRange: [120, 0] }) }],
        },
      ]}
    >
      <Pressable
        onPress={onFechar}
        disabled={acerto || !onFechar}
        accessibilityRole={acerto ? undefined : "button"}
        accessibilityHint={acerto ? undefined : "Toque para fechar o aviso"}
        style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
      >
        {/* Lilo com um halo que pisca no acerto; o confete sai de trás dele */}
        <View style={{ width: 84, height: 84, alignItems: "center", justifyContent: "center" }}>
          {acerto ? (
            <>
              <Animated.View
                pointerEvents="none"
                style={[
                  r.halo,
                  {
                    opacity: brilho.interpolate({ inputRange: [0, 1], outputRange: [0, 0.7] }),
                    transform: [{ scale: brilho.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.5] }) }],
                  },
                ]}
              />
              <View style={{ position: "absolute", left: 42, top: 42 }}>
                {PARTICULAS.map((p, i) => (
                  <Particula key={i} p={p} v={festa} />
                ))}
              </View>
            </>
          ) : null}
          <Lilo humor={humor} tamanho={84} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Titulo tamanho={22} style={{ color: acerto ? cor.roxo : cor.pessegoEscuro }}>
            {titulo}
          </Titulo>
          {mensagem ? (
            <Texto style={{ fontSize: 15, lineHeight: 21, color: cor.tinta, fontFamily: fonte.textoMedio }}>
              {mensagem}
            </Texto>
          ) : null}
        </View>
        {acerto ? (
          <Svg width={34} height={34} viewBox="0 0 34 34" style={{ alignSelf: "flex-start" }}>
            <Circle cx={17} cy={17} r={16} fill={cor.roxo} />
            <Path
              d="M10 17.5 l4.6 4.6 L24 12.6"
              stroke="#FFFFFF"
              strokeWidth={3.2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        ) : null}
      </Pressable>
      {acerto ? (
        <Botao
          titulo={ultima ? "Ver resultado" : "Continuar"}
          onPress={onContinuar}
          style={{ marginTop: 14 }}
          icone={<Seta direcao="direita" cor="#fff" tamanho={16} />}
        />
      ) : null}
    </Animated.View>
  );
}

const r = criarEstilos(() => ({
  aviso: {
    marginHorizontal: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 2,
    shadowColor: "#1E2A78",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  painel: {
    paddingHorizontal: 18,
    paddingTop: 16,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 2,
    borderBottomWidth: 0,
  },
  acerto: { backgroundColor: cor.roxoClaro, borderColor: cor.lilas },
  erro: { backgroundColor: cor.pessegoClaro, borderColor: cor.pessego },
  halo: { position: "absolute", width: 84, height: 84, borderRadius: 42, backgroundColor: "#FFFFFF" },
}));
