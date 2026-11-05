import { useEffect, useState } from "react";
import { Animated, Pressable } from "react-native";
import { cor } from "@/tema";

/** Interruptor liga/desliga com o mesmo visual em Android, iOS e web. */
export function Interruptor({
  valor,
  onMudar,
  rotulo,
}: {
  valor: boolean;
  onMudar: (v: boolean) => void;
  rotulo: string;
}) {
  const [x] = useState(() => new Animated.Value(valor ? 1 : 0));
  useEffect(() => {
    Animated.spring(x, { toValue: valor ? 1 : 0, useNativeDriver: false, friction: 7, tension: 80 }).start();
  }, [valor, x]);

  return (
    <Pressable
      onPress={() => onMudar(!valor)}
      accessibilityRole="switch"
      accessibilityState={{ checked: valor }}
      accessibilityLabel={rotulo}
      hitSlop={8}
    >
      <Animated.View
        style={{
          width: 50,
          height: 30,
          borderRadius: 15,
          padding: 3,
          backgroundColor: x.interpolate({ inputRange: [0, 1], outputRange: [cor.inativo, cor.roxo] }),
        }}
      >
        <Animated.View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: "#fff",
            transform: [{ translateX: x.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }) }],
          }}
        />
      </Animated.View>
    </Pressable>
  );
}
