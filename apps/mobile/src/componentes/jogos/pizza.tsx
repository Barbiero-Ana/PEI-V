import { useMemo, useRef, useState } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Line, Path, Rect, Text as SvgText } from "react-native-svg";
import type { RodadaPizza } from "@modolume/core";
import { Botao, Texto } from "../ui";
import { cor, criarEstilos, fonte, porTema, raio } from "@/tema";
import type { PropsJogo } from "./tipos";
import { useUltimo } from "@/lib/useUltimo";
import { Acoes } from "./Acoes";

/**
 * Partes do todo (completar): passa o dedo sobre as partes de um círculo ou
 * barra para pintar a fração. Começar numa parte pintada apaga.
 */

type Tema = NonNullable<RodadaPizza["tema"]>;

/**
 * Aparência de cada tema. A parte vazia é um contorno tracejado claro (o lugar
 * a pintar); a parte pintada vira a comida de verdade.
 */
const TEMA: Record<
  Tema,
  { vazio: string; tracejado: string; massa: string; cheio: string; enfeite: string; base: string; baseBorda: string }
> = porTema(() => ({
  pizza: {
    vazio: "#FFF6E8",
    tracejado: "#E0B06A",
    massa: "#E2A85E",
    cheio: "#FFCF6B",
    enfeite: "#C8553D",
    base: "#E9C9A0",
    baseBorda: "#C49C68",
  },
  torta: {
    vazio: "#FFF6E8",
    tracejado: "#D7AE6E",
    massa: "#D9A464",
    cheio: "#F2C46D",
    enfeite: "#E9B97A",
    base: "#FFFFFF",
    baseBorda: cor.lilas,
  },
  chocolate: {
    vazio: "#F1EEF9",
    tracejado: "#C9C2E3",
    massa: "#5A3328",
    cheio: "#7A4A3C",
    enfeite: "#9A6655",
    base: "#E3DDF2",
    baseBorda: "#C9C2E3",
  },
  horta: {
    vazio: "#EBDCCB",
    tracejado: "#C7A88A",
    massa: "#7A5A47",
    cheio: "#9B755D",
    enfeite: "#6DB97A",
    base: "#CDE7C4",
    baseBorda: "#A9D29C",
  },
}));

function setor(i: number, total: number, c: number, r: number): string {
  const a0 = (i / total) * 2 * Math.PI - Math.PI / 2;
  const a1 = ((i + 1) / total) * 2 * Math.PI - Math.PI / 2;
  const grande = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${c} ${c} L ${c + r * Math.cos(a0)} ${c + r * Math.sin(a0)} A ${r} ${r} 0 ${grande} 1 ${c + r * Math.cos(a1)} ${c + r * Math.sin(a1)} Z`;
}

export function JogoPizza({ rodada, onErro, onAcerto, bloqueado, dica = false }: PropsJogo<RodadaPizza>) {
  const [pintadas, setPintadas] = useState<Set<number>>(new Set());
  const [tam, setTam] = useState({ w: 280, h: 260 });
  const forma = rodada.forma ?? "circulo";
  const nomeTema = rodada.tema ?? (forma === "barra" ? "chocolate" : "pizza");
  const d = rodada.denominador;
  const lado = Math.min(tam.w, tam.h, 300);
  const ref = useUltimo({ tam, lado, bloqueado, pintadas });
  const pincel = useRef<"pintar" | "apagar" | null>(null);

  const gesto = useMemo(() => {
    const parteEm = (x: number, y: number): number | null => {
      const { tam: t, lado: L } = ref.current;
      if (forma === "barra") {
        const w = t.w;
        const x0 = 0;
        if (x < x0 || x > x0 + w) return null;
        return Math.min(d - 1, Math.floor(((x - x0) / w) * d));
      }
      const cx = t.w / 2;
      const cy = t.h / 2;
      const dx = x - cx;
      const dy = y - cy;
      if (Math.hypot(dx, dy) > L / 2) return null;
      let ang = Math.atan2(dy, dx) + Math.PI / 2;
      if (ang < 0) ang += 2 * Math.PI;
      return Math.min(d - 1, Math.floor((ang / (2 * Math.PI)) * d));
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
        const i = parteEm(e.x, e.y);
        if (i === null) return;
        pincel.current = ref.current.pintadas.has(i) ? "apagar" : "pintar";
        aplicar(i);
      })
      .onUpdate((e) => aplicar(parteEm(e.x, e.y)))
      .onFinalize(() => (pincel.current = null));
  }, [forma, d, ref]);

  // frações equivalentes: a fração aparece em outra forma (ex. 3/4 numa pizza de 8 partes)
  const pedido = rodada.pedido ?? { numerador: rodada.numerador, denominador: d };
  const equivalente = Boolean(rodada.pedido);
  // com a dica, as partes que formam cada pedaço da fração pedida ficam agrupadas
  const grupoDica = dica && equivalente ? d / pedido.denominador : 0;

  function conferir() {
    if (pintadas.size === rodada.numerador)
      return onAcerto(
        equivalente
          ? `Isso! ${pedido.numerador}/${pedido.denominador} é o mesmo que ${rodada.numerador}/${d}.`
          : `Isso! ${rodada.numerador}/${d} pintado.`,
      );
    if (equivalente)
      return onErro(
        `Você pintou ${pintadas.size}/${d}. Cada 1/${pedido.denominador} são ${d / pedido.denominador} partes desta pizza.`,
      );
    onErro(`A fração pede ${rodada.numerador} de ${d} partes. Você pintou ${pintadas.size}.`);
  }

  return (
    <View style={{ flex: 1, gap: 12 }}>
      <View style={p.pedido}>
        <View style={{ alignItems: "center" }}>
          <Texto style={p.fracao}>{pedido.numerador}</Texto>
          <View style={{ width: 34, height: 3, borderRadius: 2, backgroundColor: cor.tinta, marginVertical: 3 }} />
          <Texto style={p.fracao}>{pedido.denominador}</Texto>
        </View>
        <View style={{ flex: 1, gap: 8 }}>
          {equivalente ? (
            <Texto style={{ fontSize: 16 }}>
              Pinte{" "}
              <Texto style={{ fontFamily: fonte.textoForte, color: cor.tinta }}>
                {pedido.numerador}/{pedido.denominador}
              </Texto>{" "}
              do todo. Ele foi cortado em <Texto style={{ fontFamily: fonte.textoForte, color: cor.tinta }}>{d}</Texto>{" "}
              partes.
            </Texto>
          ) : (
            <Texto style={{ fontSize: 16 }}>
              Pinte <Texto style={{ fontFamily: fonte.textoForte, color: cor.tinta }}>{rodada.numerador}</Texto> de{" "}
              <Texto style={{ fontFamily: fonte.textoForte, color: cor.tinta }}>{d}</Texto> partes iguais.
            </Texto>
          )}
          {/* quanto já foi pintado, parte por parte */}
          <View style={p.contagem}>
            {Array.from({ length: d }, (_, i) => (
              <View
                key={i}
                style={[
                  p.quadro,
                  i < pintadas.size && { backgroundColor: pintadas.size > rodada.numerador ? cor.pessego : cor.roxo },
                ]}
              />
            ))}
            <Texto style={{ fontFamily: fonte.titulo, fontSize: 12, color: cor.textoSuave, marginLeft: 4 }}>
              {pintadas.size} de {d}
            </Texto>
          </View>
        </View>
      </View>

      <GestureDetector gesture={gesto}>
        <View
          collapsable={false}
          style={{ flex: 1, minHeight: 180, alignItems: "center", justifyContent: "center" }}
          onLayout={(e) => setTam({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
        >
          {forma === "circulo" ? (
            <Disco d={d} lado={lado} pintadas={pintadas} tema={nomeTema} dica={dica} grupo={grupoDica} />
          ) : (
            <Barra d={d} largura={tam.w} pintadas={pintadas} tema={nomeTema} dica={dica} grupo={grupoDica} />
          )}
        </View>
      </GestureDetector>

      <Texto style={{ fontSize: 12, color: cor.textoSuave, textAlign: "center" }}>
        Passe o dedo para pintar. Comece numa parte pintada para apagar.
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

/** Pontos fixos espalhados pelo disco (fração do raio, ângulo). */
const COBERTURA: [number, number][] = [
  ...[0, 1, 2].map((k): [number, number] => [0.3, k * 120 + 60]),
  ...Array.from({ length: 8 }, (_, k): [number, number] => [0.58, k * 45 + 22.5]),
  ...Array.from({ length: 12 }, (_, k): [number, number] => [0.8, k * 30 + 5]),
];

/** Pizza ou torta sobre a tábua/prato. Fatias pintadas saem um pouquinho do lugar. */
/** Com a dica, cada parte ganha um número e, nas equivalentes, os grupos ficam marcados. */
type PropsDesenho = { d: number; pintadas: Set<number>; tema: Tema; dica: boolean; grupo: number };

function Disco({ d, lado, pintadas, tema, dica, grupo }: PropsDesenho & { lado: number }) {
  const t = TEMA[tema];
  const c = lado / 2;
  const R = c - 4; // tábua ou prato
  const r = R - 16; // a comida
  const parte = 360 / d;
  return (
    <Svg width={lado} height={lado}>
      <Defs>
        {Array.from({ length: d }, (_, i) => (
          <ClipPath key={i} id={`fatia${i}`}>
            <Path d={setor(i, d, c, r - 9)} />
          </ClipPath>
        ))}
      </Defs>
      {/* tábua de madeira (pizza) ou prato (torta) */}
      <Circle cx={c} cy={c} r={R} fill={t.base} stroke={t.baseBorda} strokeWidth={3} />
      {tema === "pizza" ? (
        <G>
          <Circle cx={c} cy={c} r={R - 7} fill="none" stroke="#F3DDBF" strokeWidth={1.5} />
          <Rect x={c - 14} y={1} width={28} height={10} rx={5} fill={t.baseBorda} />
        </G>
      ) : (
        <Circle cx={c} cy={c} r={R - 8} fill="none" stroke={cor.lilasClaro} strokeWidth={4} />
      )}
      {Array.from({ length: d }, (_, i) => {
        const cheia = pintadas.has(i);
        // a fatia pintada desliza um pouco para fora, pelo meio dela
        const meio = ((i + 0.5) / d) * 2 * Math.PI - Math.PI / 2;
        const dx = cheia ? Math.cos(meio) * 7 : 0;
        const dy = cheia ? Math.sin(meio) * 7 : 0;
        if (!cheia)
          return (
            <Path
              key={i}
              d={setor(i, d, c, r)}
              fill={t.vazio}
              stroke={t.tracejado}
              strokeWidth={2}
              strokeDasharray="7 6"
              strokeLinejoin="round"
            />
          );
        return (
          <G key={i} transform={`translate(${dx} ${dy})`}>
            {/* borda de massa e recheio */}
            <Path d={setor(i, d, c, r)} fill={t.massa} />
            <Path d={setor(i, d, c, r - 9)} fill={t.cheio} />
            <G clipPath={`url(#fatia${i})`}>
              {tema === "pizza"
                ? COBERTURA.map(([dist, graus], k) => {
                    const dentro = graus - i * parte;
                    if (dentro < 0 || dentro >= parte) return null;
                    const a = (graus * Math.PI) / 180 - Math.PI / 2;
                    const x = c + r * dist * Math.cos(a);
                    const y = c + r * dist * Math.sin(a);
                    return k % 3 === 2 ? (
                      <Ellipse
                        key={k}
                        cx={x}
                        cy={y}
                        rx={r * 0.05}
                        ry={r * 0.025}
                        fill="#6DB97A"
                        transform={`rotate(${graus} ${x} ${y})`}
                      />
                    ) : (
                      <G key={k}>
                        <Circle cx={x} cy={y} r={r * 0.085} fill={t.enfeite} />
                        <Circle cx={x - r * 0.025} cy={y - r * 0.025} r={r * 0.025} fill="#FFFFFF" opacity={0.3} />
                      </G>
                    );
                  })
                : // treliça de massa da torta
                  Array.from({ length: 9 }, (_, k) => {
                    const o = -r + (k * 2 * r) / 8;
                    return (
                      <G key={k}>
                        <Line
                          x1={c + o - r}
                          y1={c - r}
                          x2={c + o + r}
                          y2={c + r}
                          stroke={t.enfeite}
                          strokeWidth={5}
                          strokeLinecap="round"
                        />
                        <Line
                          x1={c + o + r}
                          y1={c - r}
                          x2={c + o - r}
                          y2={c + r}
                          stroke={t.enfeite}
                          strokeWidth={5}
                          strokeLinecap="round"
                        />
                      </G>
                    );
                  })}
            </G>
            <Path d={setor(i, d, c, r)} fill="none" stroke="#FFFFFF" strokeWidth={2.5} strokeLinejoin="round" />
          </G>
        );
      })}
      {dica
        ? Array.from({ length: d }, (_, i) => {
            const a = ((i + 0.5) / d) * 2 * Math.PI - Math.PI / 2;
            const x = c + Math.cos(a) * r * 0.62;
            const y = c + Math.sin(a) * r * 0.62;
            return (
              <G key={`n${i}`}>
                <Circle cx={x} cy={y} r={11} fill="#FFFFFF" opacity={0.92} />
                <SvgText x={x} y={y + 4.5} fontSize={13} fontWeight="700" fill={cor.tinta} textAnchor="middle">
                  {i + 1}
                </SvgText>
              </G>
            );
          })
        : null}
      {grupo > 1
        ? Array.from({ length: d / grupo }, (_, i) => {
            const a = ((i * grupo) / d) * 2 * Math.PI - Math.PI / 2;
            return (
              <Line
                key={`g${i}`}
                x1={c}
                y1={c}
                x2={c + Math.cos(a) * (r + 6)}
                y2={c + Math.sin(a) * (r + 6)}
                stroke={cor.roxo}
                strokeWidth={5}
                strokeLinecap="round"
              />
            );
          })
        : null}
    </Svg>
  );
}

/** Barra de chocolate (papel-alumínio onde não pintou) ou canteiros da horta. */
function Barra({ d, largura, pintadas, tema, dica, grupo }: PropsDesenho & { largura: number }) {
  const t = TEMA[tema];
  const h = 120;
  const pad = 8;
  const w = (largura - pad * 2) / d;
  return (
    <Svg width={largura} height={h}>
      <Rect x={0} y={0} width={largura} height={h} rx={16} fill={t.base} stroke={t.baseBorda} strokeWidth={2} />
      {Array.from({ length: d }, (_, i) => {
        const x = pad + i * w;
        const cheio = pintadas.has(i);
        const y = pad;
        const ph = h - pad * 2;
        if (!cheio)
          return (
            <Rect
              key={i}
              x={x + 3}
              y={y}
              width={w - 6}
              height={ph}
              rx={10}
              fill={t.vazio}
              stroke={t.tracejado}
              strokeWidth={2}
              strokeDasharray="7 6"
            />
          );
        return (
          <G key={i}>
            <Rect x={x + 3} y={y} width={w - 6} height={ph} rx={10} fill={t.massa} />
            <Rect x={x + 3} y={y} width={w - 6} height={ph - 6} rx={10} fill={t.cheio} />
            {tema === "chocolate" ? (
              <G>
                <Rect x={x + 11} y={y + 9} width={w - 22} height={ph - 26} rx={6} fill={t.enfeite} opacity={0.55} />
                <Rect x={x + 13} y={y + 11} width={(w - 26) * 0.5} height={4} rx={2} fill="#FFFFFF" opacity={0.25} />
              </G>
            ) : (
              <G>
                {[0.36, 0.66].map((f) => (
                  <Line
                    key={f}
                    x1={x + 10}
                    y1={h * f}
                    x2={x + w - 10}
                    y2={h * f}
                    stroke="#FFFFFF"
                    strokeOpacity={0.2}
                    strokeWidth={2}
                  />
                ))}
                {[0.34, 0.68].map((f) => {
                  const bx = x + w / 2;
                  const by = h * f + 8;
                  return (
                    <G key={f}>
                      <Line
                        x1={bx}
                        y1={by}
                        x2={bx}
                        y2={by - 12}
                        stroke={t.enfeite}
                        strokeWidth={2}
                        strokeLinecap="round"
                      />
                      <Path
                        d={`M ${bx} ${by - 9} C ${bx - 9} ${by - 14} ${bx - 9} ${by - 20} ${bx - 2} ${by - 16} Z`}
                        fill={t.enfeite}
                      />
                      <Path
                        d={`M ${bx} ${by - 11} C ${bx + 9} ${by - 16} ${bx + 9} ${by - 22} ${bx + 2} ${by - 18} Z`}
                        fill={t.enfeite}
                      />
                    </G>
                  );
                })}
              </G>
            )}
          </G>
        );
      })}
      {dica
        ? Array.from({ length: d }, (_, i) => (
            <G key={`n${i}`}>
              <Circle cx={pad + (i + 0.5) * w} cy={h - 22} r={11} fill="#FFFFFF" opacity={0.92} />
              <SvgText
                x={pad + (i + 0.5) * w}
                y={h - 17.5}
                fontSize={13}
                fontWeight="700"
                fill={cor.tinta}
                textAnchor="middle"
              >
                {i + 1}
              </SvgText>
            </G>
          ))
        : null}
      {grupo > 1
        ? Array.from({ length: d / grupo + 1 }, (_, i) => (
            <Line
              key={`g${i}`}
              x1={pad + i * grupo * w}
              y1={2}
              x2={pad + i * grupo * w}
              y2={h - 2}
              stroke={cor.roxo}
              strokeWidth={5}
              strokeLinecap="round"
            />
          ))
        : null}
    </Svg>
  );
}

const p = criarEstilos(() => ({
  pedido: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 12,
    borderRadius: raio.m,
    borderWidth: 1,
    borderColor: cor.borda,
    backgroundColor: cor.superficie,
  },
  fracao: { fontFamily: fonte.titulo, fontSize: 24, color: cor.tinta, lineHeight: 28 },
  contagem: { flexDirection: "row", alignItems: "center", gap: 4 },
  quadro: { flex: 1, maxWidth: 36, height: 8, borderRadius: 4, backgroundColor: cor.trilho },
}));
