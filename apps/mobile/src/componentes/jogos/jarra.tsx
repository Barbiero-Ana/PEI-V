import { useMemo, useState } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import type { RodadaJarra } from "@modolume/core";
import { useUltimo } from "@/lib/useUltimo";
import { Botao, Texto } from "../ui";
import { cor, criarEstilos, fonte, raio } from "@/tema";
import type { PropsJogo } from "./tipos";
import { Acoes } from "./Acoes";

/**
 * Jarra medidora (completar): arrasta o dedo na jarra para encher até a
 * medida pedida, lendo a escala em mL.
 */

/** A escala ocupa 88% da altura: sobra uma folga no topo, como numa jarra real. */
const UTIL = 0.88;

const LIQUIDO: Record<RodadaJarra["liquido"], { cor: string; superficie: string; nome: string }> = {
  leite: { cor: "#F6EAD3", superficie: "#FFFBF2", nome: "leite" },
  suco: { cor: "#FFB98A", superficie: "#FFD2B5", nome: "suco" },
  agua: { cor: "#8FD3FF", superficie: "#B9E4FF", nome: "água" },
};

const ml = (v: number) => (v >= 1000 && v % 1000 === 0 ? `${v / 1000} L` : `${v} mL`);

export function JogoJarra({ rodada, onErro, onAcerto, bloqueado }: PropsJogo<RodadaJarra>) {
  const { capacidade, passo } = rodada;
  const [nivel, setNivel] = useState(0);
  const [altura, setAltura] = useState(260);
  const estado = useUltimo({ altura, bloqueado });

  const liq = LIQUIDO[rodada.liquido];
  const marcas = Math.round(capacidade / passo);
  const rotuloCada = capacidade / 4;

  const gesto = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .minDistance(0)
        .onBegin((e) => !estado.current.bloqueado && setNivel(valorEm(e.y)))
        .onUpdate((e) => !estado.current.bloqueado && setNivel(valorEm(e.y))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [capacidade, passo],
  );

  function valorEm(y: number) {
    const h = estado.current.altura;
    const k = Math.max(0, Math.min(1, (1 - y / h) / UTIL));
    return Math.round((k * capacidade) / passo) * passo;
  }

  function conferir() {
    if (nivel === rodada.alvo) return onAcerto(`Na medida certinha: ${ml(rodada.alvo)}!`);
    onErro(
      nivel > rodada.alvo
        ? "Passou da medida. Tire um pouco de líquido."
        : "Ainda falta um pouco. Observe as marquinhas da escala.",
    );
  }

  const pct = (nivel / capacidade) * UTIL;

  return (
    <View style={{ flex: 1, gap: 12 }}>
      <View style={j.pedido}>
        <Texto style={{ flex: 1 }}>
          Coloque {liq.nome} na{" "}
          <Texto style={{ fontFamily: fonte.textoForte, color: cor.tinta }}>{rodada.recipiente}</Texto> até
        </Texto>
        <View style={j.alvo}>
          <Texto style={{ fontFamily: fonte.titulo, fontSize: 20, color: cor.azulEscuro }}>{ml(rodada.alvo)}</Texto>
        </View>
      </View>

      <View style={{ flex: 1, flexDirection: "row", justifyContent: "center", gap: 10, minHeight: 220 }}>
        <View style={{ flexDirection: "row" }}>
          <GestureDetector gesture={gesto}>
            <View style={j.jarra} collapsable={false} onLayout={(e) => setAltura(e.nativeEvent.layout.height)}>
              <View style={[j.agua, { height: `${pct * 100}%`, backgroundColor: liq.cor }]}>
                {nivel > 0 ? <View style={[j.superficie, { backgroundColor: liq.superficie }]} /> : null}
                {nivel > 0 && rodada.liquido !== "leite"
                  ? [0.2, 0.55, 0.8].map((x, i) => (
                      <View
                        key={i}
                        style={[
                          j.bolha,
                          { left: `${x * 100}%`, bottom: `${18 + i * 22}%`, width: 6 + i * 2, height: 6 + i * 2 },
                        ]}
                      />
                    ))
                  : null}
              </View>
              {/* escala */}
              {Array.from({ length: marcas + 1 }, (_, i) => {
                const v = i * passo;
                const forte = v % rotuloCada === 0;
                if (i === 0) return null;
                return (
                  <View
                    key={i}
                    style={[j.marca, { bottom: `${(v / capacidade) * UTIL * 100}%`, width: forte ? 26 : 14 }]}
                  >
                    {forte ? <Texto style={j.numero}>{v}</Texto> : null}
                  </View>
                );
              })}
            </View>
          </GestureDetector>
          <View style={j.alca} pointerEvents="none" />
        </View>
        <View style={{ justifyContent: "flex-end", paddingBottom: 6 }}>
          <Texto style={{ fontSize: 11, color: cor.textoSuave }}>mL</Texto>
        </View>
      </View>

      <Texto style={{ textAlign: "center", fontSize: 12, color: cor.textoSuave }}>
        Arraste o dedo na jarra para encher ou esvaziar.
      </Texto>
      <Acoes>
        <Botao
          titulo="Esvaziar"
          variante="secundario"
          onPress={() => setNivel(0)}
          disabled={bloqueado || nivel === 0}
        />
        <Botao titulo="Conferir" onPress={conferir} disabled={bloqueado} style={{ flex: 1 }} />
      </Acoes>
    </View>
  );
}

const j = criarEstilos(() => ({
  pedido: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: raio.m,
    borderWidth: 1,
    borderColor: cor.borda,
    backgroundColor: cor.superficie,
  },
  alvo: { backgroundColor: cor.azulClaro, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4 },
  jarra: {
    width: 150,
    borderWidth: 4,
    borderTopWidth: 0,
    borderColor: cor.tinta,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    backgroundColor: "rgba(234,247,255,0.5)",
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  agua: { width: "100%", borderTopWidth: 0 },
  alca: {
    width: 34,
    height: "46%",
    marginTop: "14%",
    marginLeft: -4,
    borderWidth: 8,
    borderLeftWidth: 0,
    borderColor: cor.tinta,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
  },
  superficie: { position: "absolute", top: 0, left: 0, right: 0, height: 6, backgroundColor: "#B9E4FF" },
  bolha: { position: "absolute", borderRadius: 10, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.8)" },
  marca: { position: "absolute", right: 0, height: 2, backgroundColor: cor.tinta },
  numero: { position: "absolute", right: 30, top: -9, fontFamily: fonte.titulo, fontSize: 12, color: cor.tinta },
}));
