import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Animated, Easing, Platform, ScrollView, View, type DimensionValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAcessibilidade } from "@/estado/acessibilidade";
import { cor, criarEstilos, raio } from "@/tema";

/**
 * Esqueleto de carregamento: blocos com o formato da tela que pulsam de leve
 * enquanto os dados ou o desenho da tela ainda não estão prontos. Assim nunca
 * aparece uma tela em branco.
 */

const NATIVO = Platform.OS !== "web";
const Pulso = createContext<number | Animated.Value | Animated.AnimatedInterpolation<string | number>>(1);

/** Um bloco do esqueleto. */
export function Osso({
  largura = "100%",
  altura,
  raio: r = raio.m,
  escuro = false,
}: {
  largura?: DimensionValue;
  altura: number;
  raio?: number;
  escuro?: boolean;
}) {
  const opacidade = useContext(Pulso);
  return (
    <Animated.View
      style={{
        width: largura,
        height: altura,
        borderRadius: r,
        backgroundColor: escuro ? "#2A3488" : cor.suave,
        opacity: opacidade,
      }}
    />
  );
}

/** Dá o pulso a todos os ossos de dentro (um só valor animado, leve). */
function ComPulso({ children }: { children: ReactNode }) {
  const { animacoesReduzidas } = useAcessibilidade();
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (animacoesReduzidas) return;
    const passo = (para: number) =>
      Animated.timing(v, { toValue: para, duration: 750, easing: Easing.inOut(Easing.sin), useNativeDriver: NATIVO });
    const l = Animated.loop(Animated.sequence([passo(1), passo(0)]));
    l.start();
    return () => l.stop();
  }, [v, animacoesReduzidas]);
  const opacidade = animacoesReduzidas ? 0.8 : v.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });
  return <Pulso.Provider value={opacidade}>{children}</Pulso.Provider>;
}

export type FormatoEsqueleto = "inicio" | "niveis" | "lista" | "perfil" | "jogo";

/** Esqueleto de uma tela inteira, no formato de cada tela. */
export function EsqueletoTela({ formato = "lista" }: { formato?: FormatoEsqueleto }) {
  const insets = useSafeAreaInsets();
  return (
    <ComPulso>
      <ScrollView
        scrollEnabled={false}
        style={{ flex: 1, backgroundColor: cor.fundo }}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 18, gap: 14 }}
        accessibilityLabel="Carregando"
      >
        {formato === "inicio" ? (
          <>
            <View style={e.linha}>
              <Osso largura={52} altura={52} raio={26} />
              <View style={{ flex: 1, gap: 8 }}>
                <Osso largura="45%" altura={12} />
                <Osso largura="60%" altura={22} />
              </View>
              <Osso largura={64} altura={36} raio={18} />
            </View>
            <Osso altura={200} raio={raio.xg} escuro />
            <Osso largura="50%" altura={20} />
            <View style={[e.linha, { justifyContent: "space-between" }]}>
              {[0, 1, 2, 3].map((i) => (
                <Osso key={i} largura={60} altura={60} raio={30} />
              ))}
            </View>
            <Osso altura={150} raio={raio.xg} />
            <Osso altura={110} raio={raio.xg} escuro />
          </>
        ) : formato === "niveis" ? (
          <>
            <Osso largura="40%" altura={30} />
            <Osso altura={110} raio={raio.xg} />
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[e.linha, { flexDirection: i % 2 ? "row-reverse" : "row", marginTop: 10 }]}>
                <Osso largura={78} altura={78} raio={39} />
                <Osso largura="50%" altura={64} raio={raio.g} />
              </View>
            ))}
          </>
        ) : formato === "perfil" ? (
          <>
            <View style={{ marginHorizontal: -18, marginTop: -(insets.top + 16) }}>
              <Osso altura={insets.top + 150} raio={0} escuro />
            </View>
            <View style={{ alignItems: "center", marginTop: -60, gap: 10 }}>
              <Osso largura={110} altura={110} raio={55} />
              <Osso largura="40%" altura={22} />
            </View>
            <View style={[e.linha, { gap: 10 }]}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={{ flex: 1 }}>
                  <Osso altura={84} raio={raio.g} />
                </View>
              ))}
            </View>
            <Osso altura={140} raio={raio.g} />
            <Osso altura={120} raio={raio.g} />
          </>
        ) : formato === "jogo" ? (
          <>
            <View style={e.linha}>
              <Osso largura={42} altura={42} raio={21} />
              <Osso largura="55%" altura={22} />
            </View>
            <Osso altura={8} raio={4} />
            <Osso altura={120} raio={raio.g} />
            <Osso altura={300} raio={raio.g} />
            <View style={[e.linha, { gap: 10 }]}>
              <Osso largura="35%" altura={54} raio={raio.g} />
              <View style={{ flex: 1 }}>
                <Osso altura={54} raio={raio.g} />
              </View>
            </View>
          </>
        ) : (
          <>
            <Osso largura="45%" altura={30} />
            <Osso altura={140} raio={raio.xg} escuro />
            <Osso largura="35%" altura={20} />
            <Osso altura={160} raio={raio.g} />
            <Osso largura="35%" altura={20} />
            <Osso altura={220} raio={raio.g} />
          </>
        )}
      </ScrollView>
    </ComPulso>
  );
}

/**
 * Fica verdadeiro logo depois que a tela aparece. Telas
 * pesadas mostram o esqueleto nesse instante, e a troca de tela não engasga.
 */
export function useMontagemAdiada() {
  const [pronto, setPronto] = useState(false);
  useEffect(() => {
    // espera a transição de tela começar (dois quadros) e um instante a mais
    let t: ReturnType<typeof setTimeout> | undefined;
    const q = requestAnimationFrame(() => {
      t = setTimeout(() => setPronto(true), 60);
    });
    return () => {
      cancelAnimationFrame(q);
      if (t) clearTimeout(t);
    };
  }, []);
  return pronto;
}

const e = criarEstilos(() => ({
  linha: { flexDirection: "row", alignItems: "center", gap: 12 },
}));
