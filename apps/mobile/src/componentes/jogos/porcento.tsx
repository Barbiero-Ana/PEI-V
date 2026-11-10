import { useMemo, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Svg, { Path, Rect } from "react-native-svg";
import type { RodadaPorcento } from "@modolume/core";
import { useUltimo } from "@/lib/useUltimo";
import { BarraProgresso, Botao, Texto } from "../ui";
import { cor, criarEstilos, fonte, porTema, raio } from "@/tema";
import type { PropsJogo } from "./tipos";
import { Acoes } from "./Acoes";

/**
 * Promoção da loja (porcentagem): uma grade de 100 quadradinhos, cada um vale
 * 1%. Passar o dedo pinta; tocar no número da fileira pinta 10% de uma vez.
 */

type Tema = NonNullable<RodadaPorcento["tema"]>;

const TEMA: Record<Tema, { cheio: string; vazio: string; moldura: string; nome: string }> = porTema(() => ({
  ingressos: { cheio: cor.roxo, vazio: "#EFEBFF", moldura: cor.lilas, nome: "ingressos" },
  horta: { cheio: "#6DB97A", vazio: "#EAD7BF", moldura: "#B98F5A", nome: "canteiros" },
  bateria: { cheio: "#4CB97A", vazio: "#E4E6F0", moldura: cor.tinta, nome: "carga" },
}));

const LADO = 10;

export function JogoPorcento({ rodada, onErro, onAcerto, bloqueado, dica = false }: PropsJogo<RodadaPorcento>) {
  const tema = TEMA[rodada.tema ?? "ingressos"];
  const [pintadas, setPintadas] = useState<Set<number>>(new Set());
  const [lado, setLado] = useState(300);
  const ref = useUltimo({ lado, bloqueado, pintadas });
  const pincel = useRef<"pintar" | "apagar" | null>(null);
  const t = lado / LADO;
  const pct = pintadas.size;
  const pedido = rodada.pedido ?? `${rodada.alvo}%`;

  const gesto = useMemo(() => {
    const celula = (x: number, y: number) => {
      const tt = ref.current.lado / LADO;
      const c = Math.floor(x / tt);
      const l = Math.floor(y / tt);
      if (c < 0 || c >= LADO || l < 0 || l >= LADO) return null;
      return l * LADO + c;
    };
    const aplicar = (i: number | null) => {
      const modo = pincel.current;
      if (i === null || !modo) return;
      setPintadas((p) => {
        if (modo === "pintar" ? p.has(i) : !p.has(i)) return p;
        const n = new Set(p);
        if (modo === "pintar") n.add(i);
        else n.delete(i);
        return n;
      });
    };
    return Gesture.Pan()
      .runOnJS(true)
      .minDistance(0)
      .onBegin((e) => {
        if (ref.current.bloqueado) return;
        const i = celula(e.x, e.y);
        if (i === null) return;
        pincel.current = ref.current.pintadas.has(i) ? "apagar" : "pintar";
        aplicar(i);
      })
      .onUpdate((e) => aplicar(celula(e.x, e.y)))
      .onFinalize(() => (pincel.current = null));
  }, [ref]);

  function alternarFileira(l: number) {
    if (bloqueado) return;
    setPintadas((p) => {
      const n = new Set(p);
      const cheia = Array.from({ length: LADO }, (_, c) => l * LADO + c).every((i) => p.has(i));
      for (let c = 0; c < LADO; c += 1) {
        if (cheia) n.delete(l * LADO + c);
        else n.add(l * LADO + c);
      }
      return n;
    });
  }

  function conferir() {
    if (pct === rodada.alvo) {
      const extra = rodada.pedido ? ` ${rodada.pedido} é o mesmo que ${rodada.alvo}%.` : "";
      return onAcerto(`Isso! ${rodada.alvo} de 100 quadradinhos.${extra}`);
    }
    onErro(
      pct < rodada.alvo
        ? `Você pintou ${pct}%. Ainda faltam ${rodada.alvo - pct} quadradinhos.`
        : `Você pintou ${pct}%, ${pct - rodada.alvo} a mais que o pedido.`,
    );
  }

  return (
    <View style={{ flex: 1, gap: 12 }}>
      <View style={g.pedido}>
        <View style={g.selo}>
          <Texto style={{ fontFamily: fonte.tituloForte, fontSize: 24, color: cor.roxo, lineHeight: 30 }}>
            {pedido}
          </Texto>
        </View>
        <View style={{ flex: 1, gap: 6 }}>
          <Texto style={{ fontSize: 14, color: cor.texto }}>
            Pinte <Texto style={{ fontFamily: fonte.textoForte, fontSize: 14, color: cor.tinta }}>{pedido}</Texto> dos{" "}
            {tema.nome}.
          </Texto>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ flex: 1 }}>
              <BarraProgresso valor={pct} altura={7} cor={pct > rodada.alvo ? cor.pessego : tema.cheio} />
            </View>
            <Texto style={{ fontFamily: fonte.titulo, fontSize: 13, color: cor.tinta }}>{pct}%</Texto>
          </View>
        </View>
      </View>

      <View
        style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}
        onLayout={(e) => {
          // a grade é quadrada: cabe na largura (sem a coluna de números) e na altura disponíveis
          const { width, height } = e.nativeEvent.layout;
          setLado(Math.floor(Math.min(width - 28 - 6 - 14, height - 14, 320)));
        }}
      >
        {/* números das fileiras: tocar pinta 10% */}
        <View style={{ gap: 0 }}>
          {Array.from({ length: LADO }, (_, l) => (
            <Pressable
              key={l}
              onPress={() => alternarFileira(l)}
              accessibilityRole="button"
              accessibilityLabel={`Pintar a fileira ${l + 1} inteira`}
              style={[g.fileira, { height: t }]}
            >
              <Texto style={{ fontSize: 10, color: cor.textoSuave, fontFamily: fonte.textoForte }}>
                {(l + 1) * 10}
              </Texto>
            </Pressable>
          ))}
        </View>
        <View style={[g.moldura, { borderColor: tema.moldura }, rodada.tema === "bateria" && { borderRadius: 10 }]}>
          <GestureDetector gesture={gesto}>
            <View collapsable={false} style={{ width: lado, height: lado }}>
              <Svg width={lado} height={lado}>
                {Array.from({ length: LADO * LADO }, (_, i) => {
                  const c = i % LADO;
                  const l = Math.floor(i / LADO);
                  return (
                    <Rect
                      key={i}
                      x={c * t + 1.5}
                      y={l * t + 1.5}
                      width={t - 3}
                      height={t - 3}
                      rx={3}
                      fill={pintadas.has(i) ? tema.cheio : tema.vazio}
                    />
                  );
                })}
                {/* dica: até onde pintar (fileiras inteiras de 10 e o que sobra) */}
                {dica ? (
                  <Path
                    d={
                      rodada.alvo % 10 === 0
                        ? `M 0 ${(rodada.alvo / 10) * t} H ${lado}`
                        : `M 0 ${Math.ceil(rodada.alvo / 10) * t} H ${(rodada.alvo % 10) * t} V ${Math.floor(rodada.alvo / 10) * t} H ${lado}`
                    }
                    stroke={cor.pessegoEscuro}
                    strokeWidth={4}
                    strokeDasharray="8 6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : null}
              </Svg>
            </View>
          </GestureDetector>
          {rodada.tema === "bateria" ? <View style={[g.polo, { backgroundColor: tema.moldura }]} /> : null}
        </View>
      </View>

      <Texto style={{ fontSize: 12, color: cor.textoSuave, textAlign: "center" }}>
        Passe o dedo para pintar. Toque no número da fileira para pintar 10 de uma vez.
      </Texto>
      <Acoes>
        <Botao
          titulo="Limpar"
          variante="secundario"
          onPress={() => setPintadas(new Set())}
          disabled={bloqueado || pct === 0}
        />
        <Botao titulo="Conferir" onPress={conferir} disabled={bloqueado} style={{ flex: 1 }} />
      </Acoes>
    </View>
  );
}

const g = criarEstilos(() => ({
  pedido: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: raio.m,
    borderWidth: 1,
    borderColor: cor.borda,
    backgroundColor: cor.superficie,
  },
  selo: {
    minWidth: 72,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: cor.roxoClaro,
  },
  fileira: { width: 28, alignItems: "flex-end", justifyContent: "center", paddingRight: 2 },
  moldura: { flexShrink: 1, padding: 4, borderWidth: 3, borderRadius: 14, backgroundColor: cor.superficie },
  polo: { position: "absolute", right: -11, top: "42%", width: 8, height: "16%", borderRadius: 3 },
}));
