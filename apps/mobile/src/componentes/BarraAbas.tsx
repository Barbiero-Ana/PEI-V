import { useEffect, useState } from "react";
import { Animated, Pressable, View } from "react-native";
import type { BottomTabBarProps } from "expo-router/tabs";
import { useJogador } from "@/estado/jogador";
import { cor, criarEstilos, fonte } from "@/tema";

/**
 * Barra de navegação inferior com indicador que desliza (mola) até a aba
 * tocada, ícone ativo levemente maior e vibração curta de seleção.
 */

const PILULA = 56;

export function BarraAbas({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const { vibrar } = useJogador();
  const [largura, setLargura] = useState(0);
  const [posicao] = useState(() => new Animated.Value(state.index));

  useEffect(() => {
    Animated.spring(posicao, {
      toValue: state.index,
      useNativeDriver: true,
      damping: 16,
      stiffness: 180,
      mass: 0.8,
    }).start();
  }, [state.index, posicao]);

  const n = state.routes.length;
  const item = largura / n;

  return (
    <View
      style={[a.barra, { paddingBottom: Math.max(insets.bottom, 8) }]}
      onLayout={(e) => setLargura(e.nativeEvent.layout.width)}
    >
      {largura > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            a.pilula,
            {
              transform: [
                {
                  translateX: posicao.interpolate({
                    inputRange: [0, n - 1],
                    outputRange: [(item - PILULA) / 2, item * (n - 1) + (item - PILULA) / 2],
                  }),
                },
              ],
            },
          ]}
        />
      ) : null}

      {state.routes.map((rota, i) => {
        const { options } = descriptors[rota.key]!;
        const ativo = state.index === i;
        const escala = posicao.interpolate({
          inputRange: [i - 1, i, i + 1],
          outputRange: [1, 1.12, 1],
          extrapolate: "clamp",
        });
        const subir = posicao.interpolate({
          inputRange: [i - 1, i, i + 1],
          outputRange: [0, -1, 0],
          extrapolate: "clamp",
        });

        function tocar() {
          const evento = navigation.emit({ type: "tabPress", target: rota.key, canPreventDefault: true });
          if (!ativo && !evento.defaultPrevented) {
            vibrar("toque");
            navigation.navigate(rota.name, rota.params);
          }
        }

        return (
          <Pressable
            key={rota.key}
            onPress={tocar}
            onLongPress={() => navigation.emit({ type: "tabLongPress", target: rota.key })}
            accessibilityRole="tab"
            accessibilityState={{ selected: ativo }}
            accessibilityLabel={options.title}
            style={a.item}
          >
            <Animated.View style={[a.icone, { transform: [{ scale: escala }, { translateY: subir }] }]}>
              {options.tabBarIcon?.({ focused: ativo, color: ativo ? cor.roxo : cor.textoSuave, size: 22 })}
            </Animated.View>
            <Animated.Text style={[a.rotulo, { color: ativo ? cor.roxo : cor.textoSuave }]} numberOfLines={1}>
              {options.title}
            </Animated.Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const a = criarEstilos(() => ({
  barra: {
    flexDirection: "row",
    backgroundColor: cor.superficie,
    borderTopWidth: 1,
    borderTopColor: cor.borda,
    paddingTop: 8,
  },
  pilula: {
    position: "absolute",
    top: 8,
    left: 0,
    width: PILULA,
    height: 32,
    borderRadius: 16,
    backgroundColor: cor.roxoClaro,
  },
  item: { flex: 1, alignItems: "center", gap: 3, minHeight: 54 },
  icone: { height: 32, justifyContent: "center", alignItems: "center" },
  rotulo: { fontFamily: fonte.textoForte, fontSize: 11, lineHeight: 14 },
}));
