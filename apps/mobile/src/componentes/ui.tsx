import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useAcessibilidade } from "@/estado/acessibilidade";
import { cor, criarEstilos, ehAltoContraste, fonte, porTema, raio, sombra } from "@/tema";

/** Fonte equivalente na Lexend, usada no modo para dislexia. */
const LEXEND: Record<string, string> = {
  [fonte.titulo]: "Lexend_600SemiBold",
  [fonte.tituloForte]: "Lexend_700Bold",
  [fonte.texto]: "Lexend_400Regular",
  [fonte.textoMedio]: "Lexend_500Medium",
  [fonte.textoForte]: "Lexend_600SemiBold",
};

/**
 * Todo texto do app passa por aqui, então as opções de acessibilidade
 * (tamanho e fonte para dislexia) valem em todas as telas.
 */
function useEstiloAcessivel(estilo: StyleProp<TextStyle>): TextStyle {
  const { escala, dislexia } = useAcessibilidade();
  const plano = StyleSheet.flatten(estilo) ?? {};
  const tamanho = (plano.fontSize ?? 15) * escala;
  // sem altura de linha definida, ela acompanha a fonte; senão o Android
  // corta o topo e a base dos números grandes
  const base = plano.fontSize ?? 15;
  // a Poppins é alta: abaixo de ~1,35× o tamanho, o Android corta o topo dos números
  const minimo = plano.fontFamily?.startsWith("Poppins") ? base * 1.35 : 0;
  const linha = Math.max(plano.lineHeight ?? Math.max(21, base * 1.3), minimo) * escala;
  return {
    ...plano,
    fontSize: tamanho,
    lineHeight: Math.round(linha * (dislexia ? 1.12 : 1)),
    ...(dislexia && plano.fontFamily
      ? { fontFamily: LEXEND[plano.fontFamily] ?? plano.fontFamily, letterSpacing: 0.4 }
      : null),
  };
}

export function Texto({ style, ...p }: TextProps) {
  return <Text {...p} style={useEstiloAcessivel([s.texto, style])} />;
}

export function Titulo({ style, tamanho = 22, ...p }: TextProps & { tamanho?: number }) {
  return (
    <Text {...p} style={useEstiloAcessivel([s.titulo, { fontSize: tamanho, lineHeight: tamanho * 1.25 }, style])} />
  );
}

export function Rotulo({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={useEstiloAcessivel([s.rotulo, style])}>{children}</Text>;
}

type Variante = "primario" | "secundario" | "destaque" | "fantasma";

export function Botao({
  titulo,
  variante = "primario",
  icone,
  carregando,
  style,
  disabled,
  ...p
}: PressableProps & {
  titulo: string;
  variante?: Variante;
  icone?: ReactNode;
  carregando?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const v = VARIANTE[variante];
  const { falar } = useAcessibilidade();
  const estiloTexto = useEstiloAcessivel([s.botaoTexto, { color: v.texto }]);
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      {...p}
      onPress={(e) => {
        falar(titulo);
        p.onPress?.(e);
      }}
      style={({ pressed }) => [
        s.botao,
        { backgroundColor: v.fundo, borderColor: v.borda },
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.92 },
        disabled && { opacity: 0.45 },
        style,
      ]}
    >
      {carregando ? <ActivityIndicator color={v.texto} /> : null}
      <Text style={estiloTexto}>{titulo}</Text>
      {icone}
    </Pressable>
  );
}

const VARIANTE: Record<Variante, { fundo: string; texto: string; borda: string }> = porTema(() => ({
  primario: { fundo: cor.roxo, texto: "#fff", borda: cor.roxo },
  destaque: { fundo: cor.pessego, texto: cor.tinta, borda: cor.pessego },
  secundario: { fundo: cor.superficie, texto: cor.tinta, borda: cor.bordaForte },
  fantasma: { fundo: "transparent", texto: cor.textoSuave, borda: "transparent" },
}));

export function BarraProgresso({
  valor,
  cor: c = cor.roxo,
  altura = 8,
  fundo = ehAltoContraste() ? cor.trilho : cor.suave,
}: {
  valor: number;
  cor?: string;
  altura?: number;
  fundo?: string;
}) {
  return (
    <View style={{ height: altura, borderRadius: altura, backgroundColor: fundo, overflow: "hidden" }}>
      <View
        style={{
          width: `${Math.max(0, Math.min(100, valor))}%`,
          height: "100%",
          borderRadius: altura,
          backgroundColor: c,
        }}
      />
    </View>
  );
}

export const s = criarEstilos(() => ({
  texto: { fontFamily: fonte.texto, fontSize: 15, lineHeight: 21, color: cor.texto },
  titulo: { fontFamily: fonte.titulo, color: cor.tinta, letterSpacing: -0.3 },
  rotulo: {
    fontFamily: fonte.titulo,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: cor.textoSuave,
  },
  cartao: {
    backgroundColor: cor.superficie,
    borderRadius: raio.xg,
    borderWidth: 1,
    borderColor: cor.borda,
    padding: 18,
    ...sombra,
  },
  botao: {
    minHeight: 50,
    borderRadius: raio.m,
    borderWidth: 1,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  botaoTexto: { fontFamily: fonte.titulo, fontSize: 16 },
}));
