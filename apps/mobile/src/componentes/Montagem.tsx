import { useEffect, useState } from "react";
import { Animated, Easing, Platform, View } from "react-native";
import type { Constelacao } from "@modolume/core";
import { Ceu } from "./Ceu";
import { Texto } from "./ui";
import { cor, criarEstilos, fonte } from "@/tema";

/**
 * A constelação sendo montada depois de uma missão: a câmera viaja até cada
 * estrela nova, ela acende com uma onda de luz, as linhas se ligam e a
 * câmera se afasta para mostrar o desenho crescendo.
 */

const NATIVO = Platform.OS !== "web";
const esperar = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const rodar = (a: Animated.CompositeAnimation) => new Promise<void>((r) => a.start(() => r()));

export function Montagem({
  constelacao: c,
  antes,
  depois,
  largura,
  altura,
}: {
  constelacao: Constelacao;
  antes: number;
  depois: number;
  largura: number;
  altura: number;
}) {
  const [mostradas, setMostradas] = useState(antes);
  const [nome, setNome] = useState<string | null>(null);
  const [x] = useState(() => new Animated.Value(0));
  const [y] = useState(() => new Animated.Value(0));
  const [zoom] = useState(() => new Animated.Value(1));
  const [onda] = useState(() => new Animated.Value(0));
  const [etiqueta] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const run = { parar: false };
    const m = Math.min(largura, altura) * 0.1;
    const ease = Easing.inOut(Easing.cubic);
    (async () => {
      await esperar(700);
      for (let i = antes; i < depois; i += 1) {
        if (run.parar) return;
        const e = c.estrelas[i]!;
        const dx = m + (e.x / 100) * (largura - 2 * m) - largura / 2;
        const dy = m + (e.y / 100) * (altura - 2 * m) - altura / 2;
        const z = 2;
        await rodar(
          Animated.parallel([
            Animated.timing(zoom, { toValue: z, duration: 800, easing: ease, useNativeDriver: NATIVO }),
            Animated.timing(x, { toValue: -dx * z, duration: 800, easing: ease, useNativeDriver: NATIVO }),
            Animated.timing(y, { toValue: -dy * z, duration: 800, easing: ease, useNativeDriver: NATIVO }),
          ]),
        );
        if (run.parar) return;
        setMostradas(i + 1);
        setNome(e.nome ?? "Nova estrela");
        onda.setValue(0);
        etiqueta.setValue(0);
        Animated.parallel([
          Animated.timing(onda, {
            toValue: 1,
            duration: 750,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: NATIVO,
          }),
          Animated.timing(etiqueta, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: NATIVO,
          }),
        ]).start();
        await esperar(1100);
      }
      if (run.parar) return;
      Animated.timing(etiqueta, { toValue: 0, duration: 250, useNativeDriver: NATIVO }).start();
      Animated.parallel([
        Animated.spring(zoom, { toValue: 1, friction: 6, tension: 30, useNativeDriver: NATIVO }),
        Animated.spring(x, { toValue: 0, friction: 7, tension: 30, useNativeDriver: NATIVO }),
        Animated.spring(y, { toValue: 0, friction: 7, tension: 30, useNativeDriver: NATIVO }),
      ]).start();
    })();
    return () => {
      run.parar = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={[m.moldura, { width: largura, height: altura }]}>
      <Animated.View style={{ transform: [{ translateX: x }, { translateY: y }, { scale: zoom }] }}>
        <Ceu constelacao={c} acesas={mostradas} largura={largura} altura={altura} modo="vivo" raio={0} />
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[
          m.onda,
          {
            left: largura / 2 - 40,
            top: altura / 2 - 40,
            opacity: onda.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.85, 0] }),
            transform: [{ scale: onda.interpolate({ inputRange: [0, 1], outputRange: [0.3, 2.8] }) }],
          },
        ]}
      />
      {nome ? (
        <Animated.View
          pointerEvents="none"
          style={[
            m.etiqueta,
            {
              top: altura / 2 + 30,
              opacity: etiqueta,
              transform: [{ translateY: etiqueta.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
            },
          ]}
        >
          <Texto style={{ color: "#FFF6E8", fontFamily: fonte.titulo, fontSize: 14 }}>{nome}</Texto>
        </Animated.View>
      ) : null}
    </View>
  );
}

const m = criarEstilos(() => ({
  moldura: { borderRadius: 20, overflow: "hidden", backgroundColor: "#141B57" },
  onda: { position: "absolute", width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: cor.pessego },
  etiqueta: {
    position: "absolute",
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(13,18,64,0.7)",
  },
}));
