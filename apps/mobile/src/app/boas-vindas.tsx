import { useState, type ReactNode } from "react";
import { Animated, Easing, Platform, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { constelacaoPorId } from "@modolume/core";
import { useAcessibilidade, useFalarAoAbrir } from "@/estado/acessibilidade";
import { marcarBoasVindas } from "@/lib/boasVindas";
import { Capa } from "@/componentes/Capa";
import { Ceu } from "@/componentes/Ceu";
import { IconeMissao, Lampada } from "@/componentes/Icones";
import { Lilo } from "@/componentes/Lilo";
import { Botao, Texto, Titulo } from "@/componentes/ui";
import { cor, criarEstilos, fonte } from "@/tema";

/**
 * Boas-vindas (só na primeira vez): o Lilo se apresenta, mostra que as
 * missões acendem estrelas e explica os mapas. Pode pular a qualquer hora.
 */

const NATIVO = Platform.OS !== "web";
/** Rio que passa pelos centros das três paradas da ilustração. */
const RIO = "M 61 -10 C 61 80 141 40 141 131 C 141 222 61 182 61 272";

interface Passo {
  titulo: string;
  texto: string;
  arte: ReactNode;
}

export default function BoasVindas() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { animacoesReduzidas } = useAcessibilidade();
  const [passo, setPasso] = useState(0);
  const [v] = useState(() => new Animated.Value(1));
  const orion = constelacaoPorId("orion")!;
  const lado = Math.min(width - 64, 320);

  const passos: Passo[] = [
    {
      titulo: "Oi! Eu sou o Lilo",
      texto: "Sou um axolote curioso e vou te acompanhar nas missões de matemática.",
      arte: (
        <View style={b.palco}>
          <View style={b.halo} />
          <Lilo tamanho={230} humor="normal" />
        </View>
      ),
    },
    {
      titulo: "Cada missão acende estrelas",
      texto: "Jogando, você ganha pontos de luz. A cada 5 pontos, uma estrela do céu se acende.",
      arte: (
        <View style={{ width: lado, height: lado * 0.85 }}>
          <View style={{ borderRadius: 28, overflow: "hidden" }}>
            <Ceu constelacao={orion} acesas={4} largura={lado} altura={lado * 0.85} modo="vivo" raio={28} />
          </View>
          {/* o Lilo espiando o céu, no canto */}
          <View style={{ position: "absolute", right: -18, bottom: -30 }}>
            <Lilo tamanho={120} humor="surpreso" />
          </View>
        </View>
      ),
    },
    {
      titulo: "Siga o rio dos mapas",
      texto:
        "Cada mapa tem suas missões e termina numa constelação nova. Se ficar difícil, toque na lâmpada e eu dou uma dica.",
      arte: (
        <View style={b.arteMapa}>
          <Svg width={240} height={262} style={StyleSheet.absoluteFill}>
            <Path d={RIO} stroke="#F2E3C2" strokeWidth={46} fill="none" strokeLinecap="round" />
            <Path d={RIO} stroke="#86C8EC" strokeWidth={30} fill="none" strokeLinecap="round" />
            <Path d={RIO} stroke="#FFFFFF" strokeWidth={2} strokeDasharray="6 14" fill="none" strokeLinecap="round" />
          </Svg>
          {(["pares", "trilha", "torre"] as const).map((jogo, i) => (
            <View key={jogo} style={[b.parada, { marginLeft: i % 2 ? 80 : 0 }]}>
              <IconeMissao jogo={jogo} tamanho={36} />
            </View>
          ))}
          <View style={b.lampada}>
            <Lampada acesa tamanho={30} />
          </View>
          <View style={{ position: "absolute", right: -6, bottom: -6 }}>
            <Lilo tamanho={116} humor="ideia" />
          </View>
        </View>
      ),
    },
  ];
  const atual = passos[passo]!;
  const ultimo = passo === passos.length - 1;
  useFalarAoAbrir(`${atual.titulo}. ${atual.texto}`);

  function terminar() {
    marcarBoasVindas();
    router.replace("/");
  }

  function avancar() {
    if (ultimo) return terminar();
    if (animacoesReduzidas) return setPasso((p) => p + 1);
    Animated.timing(v, { toValue: 0, duration: 180, useNativeDriver: NATIVO }).start(() => {
      setPasso((p) => p + 1);
      Animated.timing(v, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: NATIVO,
      }).start();
    });
  }

  return (
    <View style={b.tela}>
      <StatusBar style="light" />
      <Capa indice={1} />
      <View style={[b.topo, { paddingTop: insets.top + 12 }]}>
        <View style={{ flexDirection: "row", gap: 6 }}>
          {passos.map((_, i) => (
            <View key={i} style={[b.ponto, i === passo && b.pontoAtivo]} />
          ))}
        </View>
        {!ultimo ? (
          <Pressable onPress={terminar} hitSlop={12} accessibilityRole="button">
            <Texto style={{ color: cor.lilasNoEscuro, fontFamily: fonte.textoForte, fontSize: 15 }}>Pular</Texto>
          </Pressable>
        ) : null}
      </View>

      <Animated.View
        style={[
          b.conteudo,
          {
            opacity: v,
            transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
          },
        ]}
      >
        <View key={passo} style={b.arte}>
          {atual.arte}
        </View>
        <Titulo tamanho={28} style={{ color: "#FFFFFF", textAlign: "center" }}>
          {atual.titulo}
        </Titulo>
        <Texto style={{ color: "rgba(255,255,255,0.85)", fontSize: 17, lineHeight: 25, textAlign: "center" }}>
          {atual.texto}
        </Texto>
      </Animated.View>

      <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 20 }}>
        <Botao titulo={ultimo ? "Começar a jornada" : "Continuar"} variante="destaque" onPress={avancar} />
      </View>
    </View>
  );
}

const b = criarEstilos(() => ({
  tela: { flex: 1, backgroundColor: "#1E2A78" },
  palco: { width: 260, height: 260, alignItems: "center", justifyContent: "center" },
  halo: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(201,180,255,0.18)",
    borderWidth: 2,
    borderColor: "rgba(201,180,255,0.28)",
  },
  topo: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24 },
  ponto: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.3)" },
  pontoAtivo: { width: 24, backgroundColor: cor.pessego },
  conteudo: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, paddingHorizontal: 28 },
  arte: { minHeight: 240, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  arteMapa: {
    width: 240,
    height: 262,
    overflow: "hidden",
    paddingVertical: 18,
    paddingHorizontal: 28,
    gap: 14,
    borderRadius: 28,
    backgroundColor: "#DDEFD5",
  },
  parada: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 4,
    borderColor: cor.lilas,
  },
  lampada: {
    position: "absolute",
    right: 18,
    top: 18,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: cor.pessegoClaro,
  },
}));
