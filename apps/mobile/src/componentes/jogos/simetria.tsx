import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Platform, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import type { RodadaSimetria } from "@modolume/core";
import { useUltimo } from "@/lib/useUltimo";
import { Botao, Texto } from "../ui";
import { cor, criarEstilos, raio } from "@/tema";
import type { PropsJogo } from "./tipos";
import { Acoes } from "./Acoes";

type Tema = NonNullable<RodadaSimetria["tema"]>;

/** Forma em volta de cada metade e do eixo, para a grade virar o objeto. */
const FORMA: Record<Tema, { esq: object; dir: object; eixo: object; fundo: string }> = {
  borboleta: {
    esq: { borderTopLeftRadius: 46, borderBottomLeftRadius: 30, borderTopRightRadius: 8, borderBottomRightRadius: 8 },
    dir: { borderTopRightRadius: 46, borderBottomRightRadius: 30, borderTopLeftRadius: 8, borderBottomLeftRadius: 8 },
    eixo: { width: 12, borderRadius: 6, backgroundColor: "#3A2E5C", marginHorizontal: 4 },
    fundo: "#F5F0FF",
  },
  tapete: {
    esq: { borderTopLeftRadius: 4, borderBottomLeftRadius: 4 },
    dir: { borderTopRightRadius: 4, borderBottomRightRadius: 4 },
    eixo: { width: 10, backgroundColor: "transparent", marginHorizontal: 2 },
    fundo: "#FFF1E7",
  },
  mascara: {
    esq: { borderTopLeftRadius: 18, borderBottomLeftRadius: 40 },
    dir: { borderTopRightRadius: 18, borderBottomRightRadius: 40 },
    eixo: { width: 10, backgroundColor: "transparent", marginHorizontal: 2 },
    fundo: "#EAF7FF",
  },
};

/**
 * Espelho mágico (completar): a metade esquerda está pintada; o aluno pinta a
 * direita passando o dedo, para o desenho ficar igual ao reflexo no espelho.
 */
export function JogoSimetria({ rodada, onErro, onAcerto, bloqueado, dica = false }: PropsJogo<RodadaSimetria>) {
  const linhas = rodada.esquerda.length;
  const meia = rodada.esquerda[0]!.length;
  const [pintadas, setPintadas] = useState<Set<string>>(new Set());
  const [largura, setLargura] = useState(160);
  const tamanho = Math.min(44, Math.floor(largura / meia) - 4);
  const estado = useUltimo({ tamanho, bloqueado, pintadas });
  const pincel = useRef<"pintar" | "apagar" | null>(null);
  const tema: Tema = rodada.tema ?? "borboleta";
  const forma = FORMA[tema];
  // comemoração: a borboleta bate as asas; tapete e máscara brilham
  const [festa] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!bloqueado) return;
    festa.setValue(0);
    Animated.sequence(
      [1, 0, 1, 0, 1, 0].map((v) =>
        Animated.timing(festa, {
          toValue: v,
          duration: 240,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: NATIVO,
        }),
      ),
    ).start();
  }, [bloqueado, festa]);
  const asa = (lado: "esq" | "dir") =>
    tema === "borboleta"
      ? {
          transformOrigin: lado === "esq" ? "right" : "left",
          transform: [{ scaleX: festa.interpolate({ inputRange: [0, 1], outputRange: [1, 0.55] }) }],
        }
      : { opacity: festa.interpolate({ inputRange: [0, 1], outputRange: [1, 0.75] }) };

  const esperado = useMemo(() => {
    const s = new Set<string>();
    rodada.esquerda.forEach((linha, r) => [...linha].forEach((ch, c) => ch === "X" && s.add(`${r},${meia - 1 - c}`)));
    return s;
  }, [rodada.esquerda, meia]);

  const gesto = useMemo(() => {
    const celula = (x: number, y: number) => {
      const t = estado.current.tamanho + 4;
      const c = Math.floor(x / t);
      const r = Math.floor(y / t);
      return c >= 0 && c < meia && r >= 0 && r < linhas ? `${r},${c}` : null;
    };
    const aplicar = (k: string | null) => {
      if (!k || !pincel.current) return;
      const modo = pincel.current;
      setPintadas((p) => {
        if (modo === "pintar" ? p.has(k) : !p.has(k)) return p;
        const n = new Set(p);
        if (modo === "pintar") n.add(k);
        else n.delete(k);
        return n;
      });
    };
    return Gesture.Pan()
      .runOnJS(true)
      .minDistance(0)
      .onBegin((e) => {
        if (estado.current.bloqueado) return;
        const k = celula(e.x, e.y);
        if (!k) return;
        pincel.current = estado.current.pintadas.has(k) ? "apagar" : "pintar";
        aplicar(k);
      })
      .onUpdate((e) => aplicar(celula(e.x, e.y)))
      .onFinalize(() => (pincel.current = null));
  }, [estado, meia, linhas]);

  function conferir() {
    let diferentes = 0;
    for (let r = 0; r < linhas; r += 1)
      for (let c = 0; c < meia; c += 1) if (esperado.has(`${r},${c}`) !== pintadas.has(`${r},${c}`)) diferentes += 1;
    if (diferentes === 0) return onAcerto("Simetria perfeita! Os dois lados ficaram iguais, como num espelho.");
    onErro(
      `Ainda há ${diferentes} quadradinho${diferentes > 1 ? "s" : ""} diferente${diferentes > 1 ? "s" : ""} do reflexo.`,
    );
  }

  const quadrado = (pintado: boolean, fixo: boolean, fantasma = false) => (
    <View style={[s.celula, { width: tamanho, height: tamanho }, fantasma && !pintado && s.fantasma]}>
      {pintado ? <Tinta fixo={fixo} /> : null}
    </View>
  );

  return (
    <View style={{ flex: 1, gap: 12 }}>
      {/* margem automática: centraliza o conteúdo acima dos botões */}
      <View style={{ marginTop: "auto" }} />
      <View style={s.quadro}>
        {tema === "tapete" ? <Franja /> : null}
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          {/* esquerda: modelo */}
          <View
            style={{ flex: 1, alignItems: "flex-end" }}
            onLayout={(e) => setLargura(e.nativeEvent.layout.width - 16)}
          >
            <Animated.View style={[s.metade, { backgroundColor: forma.fundo }, forma.esq, asa("esq")]}>
              {tema === "mascara" ? <View style={[s.fita, { left: -18 }]} /> : null}
              {rodada.esquerda.map((linha, r) => (
                <View key={r} style={s.linha}>
                  {[...linha].map((ch, c) => (
                    <View key={c}>{quadrado(ch === "X", true)}</View>
                  ))}
                </View>
              ))}
            </Animated.View>
          </View>
          {/* eixo do espelho: corpo da borboleta, costura do tapete, ponte da máscara */}
          <View style={[s.espelho, forma.eixo]}>
            {tema === "borboleta" ? (
              <>
                <View style={[s.antena, { left: -4, transform: [{ rotate: "-25deg" }] }]} />
                <View style={[s.antena, { right: -4, transform: [{ rotate: "25deg" }] }]} />
              </>
            ) : (
              <View style={s.vidro}>
                <View style={[s.brilho, { top: "18%" }]} />
                <View style={[s.brilho, { top: "30%", height: 10 }]} />
              </View>
            )}
          </View>
          {/* direita: o aluno pinta */}
          <View style={{ flex: 1, alignItems: "flex-start" }}>
            <Animated.View style={[s.metade, { backgroundColor: forma.fundo }, forma.dir, asa("dir")]}>
              {tema === "mascara" ? <View style={[s.fita, { right: -18 }]} /> : null}
              <GestureDetector gesture={gesto}>
                <View collapsable={false}>
                  {Array.from({ length: linhas }, (_, r) => (
                    <View key={r} style={s.linha}>
                      {Array.from({ length: meia }, (_, c) => (
                        <View key={c}>
                          {quadrado(pintadas.has(`${r},${c}`), false, dica && esperado.has(`${r},${c}`))}
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              </GestureDetector>
            </Animated.View>
          </View>
        </View>
        {tema === "tapete" ? <Franja /> : null}
        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <Texto style={{ flex: 1, textAlign: "center", fontSize: 12, color: cor.textoSuave }}>modelo</Texto>
          <Texto style={{ flex: 1, textAlign: "center", fontSize: 12, color: cor.textoSuave }}>pinte aqui</Texto>
        </View>
      </View>
      <Texto style={{ textAlign: "center", fontSize: 12, color: cor.textoSuave }}>
        Passe o dedo para pintar. Comece num quadrado pintado para apagar.
      </Texto>
      <Acoes>
        <Botao
          titulo="Limpar"
          variante="secundario"
          onPress={() => setPintadas(new Set())}
          disabled={bloqueado || pintadas.size === 0}
        />
        <Botao titulo="Conferir" onPress={conferir} disabled={bloqueado} style={{ flex: 1 }} />
      </Acoes>
    </View>
  );
}

/** Franjas do tapete de crochê. */
function Franja() {
  return (
    <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, height: 10 }}>
      {Array.from({ length: 16 }, (_, i) => (
        <View key={i} style={{ width: 2, height: 10, borderRadius: 1, backgroundColor: cor.pessego }} />
      ))}
    </View>
  );
}

const NATIVO = Platform.OS !== "web";

/** Quadradinho pintado: entra com um "pop" suave. */
function Tinta({ fixo }: { fixo: boolean }) {
  const [v] = useState(() => new Animated.Value(fixo ? 1 : 0));
  useEffect(() => {
    if (fixo) return;
    Animated.spring(v, { toValue: 1, friction: 5, tension: 160, useNativeDriver: NATIVO }).start();
  }, [fixo, v]);
  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        s.tinta,
        {
          backgroundColor: fixo ? cor.roxo : cor.pessego,
          opacity: v,
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }],
        },
      ]}
    >
      <View style={s.reflexo} />
    </Animated.View>
  );
}

const s = criarEstilos(() => ({
  tinta: { borderRadius: 6 },
  reflexo: {
    position: "absolute",
    top: 4,
    left: 4,
    width: "35%",
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
    opacity: 0.45,
  },
  fantasma: { borderStyle: "dashed", borderColor: cor.pessegoEscuro, backgroundColor: cor.pessegoClaro },
  vidro: {
    flex: 1,
    width: 8,
    borderRadius: 4,
    backgroundColor: "#BFE6FF",
    borderWidth: 1,
    borderColor: cor.azul,
    overflow: "hidden",
  },
  brilho: {
    position: "absolute",
    left: 1,
    width: 3,
    height: 18,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
    opacity: 0.8,
  },
  metade: { padding: 8, paddingBottom: 4 },
  antena: { position: "absolute", top: -16, width: 2, height: 18, borderRadius: 1, backgroundColor: "#3A2E5C" },
  fita: { position: "absolute", top: "35%", width: 18, height: 4, borderRadius: 2, backgroundColor: cor.lilas },
  quadro: {
    padding: 14,
    borderRadius: raio.g,
    borderWidth: 1,
    borderColor: cor.borda,
    backgroundColor: cor.superficie,
  },
  linha: { flexDirection: "row", gap: 4, marginBottom: 4 },
  celula: { borderRadius: 6, borderWidth: 1.5, borderColor: cor.borda, backgroundColor: cor.fundo },
  espelho: { width: 4, borderRadius: 2, backgroundColor: cor.azul, marginHorizontal: 8, marginVertical: 6 },
}));
