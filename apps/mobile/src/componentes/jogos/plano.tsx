import { useMemo, useState } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from "react-native-svg";
import type { RodadaPlano } from "@modolume/core";
import { useUltimo } from "@/lib/useUltimo";
import { Botao, Texto } from "../ui";
import { cor, criarEstilos, fonte, raio } from "@/tema";
import type { PropsJogo } from "./tipos";
import { Acoes } from "./Acoes";

/**
 * Caça ao tesouro (plano cartesiano): um mapa de papel com os eixos x e y.
 * Tocar perto de um cruzamento marca o ponto; as linhas tracejadas mostram
 * quanto ele anda em x e em y. Ao acertar, o tesouro aparece.
 */

const PAPEL = "#FFF6E8";
const GRADE = "#EAD9BF";
const MARGEM = 34; // espaço para os números dos eixos

export function JogoPlano({ rodada, onErro, onAcerto, bloqueado, dica = false }: PropsJogo<RodadaPlano>) {
  const { max, alvo } = rodada;
  const min = rodada.min ?? 0;
  const negativos = min < 0;
  const [lado, setLado] = useState(300);
  const [ponto, setPonto] = useState<[number, number] | null>(null);
  const passo = (lado - MARGEM - 14) / (max - min);
  const px = (x: number) => MARGEM + (x - min) * passo;
  const py = (y: number) => lado - MARGEM - (y - min) * passo;
  const estado = useUltimo({ lado, passo, bloqueado });
  const acertou = bloqueado && ponto?.[0] === alvo[0] && ponto?.[1] === alvo[1];

  const gesto = useMemo(
    () =>
      Gesture.Tap()
        .runOnJS(true)
        .onEnd((e) => {
          const { lado: l, passo: p, bloqueado: b } = estado.current;
          if (b) return;
          const x = Math.round((e.x - MARGEM) / p) + min;
          const y = Math.round((l - MARGEM - e.y) / p) + min;
          if (x < min || y < min || x > max || y > max) return;
          setPonto([x, y]);
        }),
    [estado, max, min],
  );

  function conferir() {
    if (!ponto) return onErro("Toque num cruzamento da grade para marcar o ponto.");
    const [x, y] = ponto;
    if (x === alvo[0] && y === alvo[1]) return onAcerto(`Achou! O tesouro estava em (${x}, ${y}).`);
    if (x === alvo[1] && y === alvo[0] && x !== y)
      return onErro(`Você marcou (${x}, ${y}): os números trocaram de lugar. Primeiro o x (para o lado), depois o y.`);
    onErro(`Aí é o ponto (${x}, ${y}). Confira quanto andar no x e quanto subir no y.`);
  }

  return (
    <View style={{ flex: 1, gap: 12 }}>
      <View style={p.pedido}>
        <Texto style={{ fontSize: 14, color: cor.textoSuave }}>Ponto marcado</Texto>
        <Texto
          style={{
            fontFamily: fonte.tituloForte,
            fontSize: 24,
            color: ponto ? cor.roxo : cor.textoFraco,
            lineHeight: 30,
          }}
        >
          {ponto ? `(${ponto[0]}, ${ponto[1]})` : "( , )"}
        </Texto>
      </View>

      <View
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        onLayout={(e) => setLado(Math.floor(Math.min(e.nativeEvent.layout.width, e.nativeEvent.layout.height, 380)))}
      >
        <GestureDetector gesture={gesto}>
          <View collapsable={false} style={[p.mapa, { width: lado, height: lado }]}>
            <Svg width={lado} height={lado}>
              <Rect x={0} y={0} width={lado} height={lado} rx={18} fill={PAPEL} />
              {/* grade */}
              {Array.from({ length: max - min + 1 }, (_, k) => k + min).map((i) => (
                <G key={i}>
                  <Line x1={px(i)} y1={py(min)} x2={px(i)} y2={py(max)} stroke={GRADE} strokeWidth={1.5} />
                  <Line x1={px(min)} y1={py(i)} x2={px(max)} y2={py(i)} stroke={GRADE} strokeWidth={1.5} />
                  <SvgText
                    x={px(i)}
                    y={py(min) + 22}
                    fontSize={13}
                    fontWeight="700"
                    fill={i === 0 && negativos ? cor.roxo : cor.tinta}
                    textAnchor="middle"
                  >
                    {i}
                  </SvgText>
                  {i !== 0 || negativos ? (
                    <SvgText
                      x={px(min) - 12}
                      y={py(i) + 4.5}
                      fontSize={13}
                      fontWeight="700"
                      fill={cor.tinta}
                      textAnchor="end"
                    >
                      {i}
                    </SvgText>
                  ) : null}
                </G>
              ))}
              {/* eixos com setas */}
              <Line
                x1={px(min)}
                y1={py(0)}
                x2={px(max) + 8}
                y2={py(0)}
                stroke={cor.roxo}
                strokeWidth={3}
                strokeLinecap="round"
              />
              <Line
                x1={px(0)}
                y1={py(min)}
                x2={px(0)}
                y2={py(max) - 8}
                stroke={cor.roxo}
                strokeWidth={3}
                strokeLinecap="round"
              />
              <Path d={`M ${px(max) + 12} ${py(0)} l -8 -5 v 10 Z`} fill={cor.roxo} />
              <Path d={`M ${px(0)} ${py(max) - 12} l -5 8 h 10 Z`} fill={cor.roxo} />
              <SvgText x={px(max) + 4} y={py(0) - 8} fontSize={13} fontWeight="700" fill={cor.roxo}>
                x
              </SvgText>
              <SvgText x={px(0) + 8} y={py(max) - 4} fontSize={13} fontWeight="700" fill={cor.roxo}>
                y
              </SvgText>

              {/* dica: o caminho até o alvo, primeiro em x e depois em y */}
              {dica ? (
                <Path
                  d={`M ${px(0)} ${py(0)} H ${px(alvo[0])} V ${py(alvo[1])}`}
                  stroke={cor.pessego}
                  strokeWidth={3}
                  strokeDasharray="6 6"
                  fill="none"
                  strokeLinecap="round"
                />
              ) : null}

              {/* pontos de referência */}
              {rodada.marcados?.map((m) => (
                <G key={m.nome}>
                  <Circle
                    cx={px(m.ponto[0])}
                    cy={py(m.ponto[1])}
                    r={9}
                    fill="#6DB97A"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                  <SvgText
                    x={px(m.ponto[0])}
                    y={py(m.ponto[1]) - 14}
                    fontSize={11}
                    fontWeight="700"
                    fill="#2E6B45"
                    textAnchor="middle"
                  >
                    {m.nome}
                  </SvgText>
                </G>
              ))}

              {/* ponto marcado e as linhas até os eixos */}
              {ponto ? (
                <G>
                  <Path
                    d={`M ${px(ponto[0])} ${py(0)} V ${py(ponto[1])} H ${px(0)}`}
                    stroke={cor.roxo}
                    strokeWidth={2}
                    strokeDasharray="4 5"
                    fill="none"
                  />
                  {acertou ? (
                    <Tesouro x={px(ponto[0])} y={py(ponto[1])} tipo={rodada.tesouro ?? "bau"} />
                  ) : (
                    <G>
                      <Path
                        d={`M ${px(ponto[0]) - 9} ${py(ponto[1]) - 9} L ${px(ponto[0]) + 9} ${py(ponto[1]) + 9} M ${px(ponto[0]) + 9} ${py(ponto[1]) - 9} L ${px(ponto[0]) - 9} ${py(ponto[1]) + 9}`}
                        stroke={cor.pessegoEscuro}
                        strokeWidth={4.5}
                        strokeLinecap="round"
                      />
                    </G>
                  )}
                </G>
              ) : null}
            </Svg>
          </View>
        </GestureDetector>
      </View>

      <Texto style={{ fontSize: 12, color: cor.textoSuave, textAlign: "center" }}>
        Toque num cruzamento da grade. O primeiro número anda para o lado (x); o segundo, para cima ou para baixo (y).
      </Texto>
      <Acoes>
        <Botao titulo="Apagar" variante="secundario" onPress={() => setPonto(null)} disabled={bloqueado || !ponto} />
        <Botao titulo="Conferir" onPress={conferir} disabled={bloqueado} style={{ flex: 1 }} />
      </Acoes>
    </View>
  );
}

function Tesouro({ x, y, tipo }: { x: number; y: number; tipo: NonNullable<RodadaPlano["tesouro"]> }) {
  if (tipo === "estrela")
    return (
      <Path
        d={`M ${x} ${y - 16} L ${x + 5} ${y - 5} L ${x + 16} ${y - 4} L ${x + 8} ${y + 4} L ${x + 10} ${y + 15} L ${x} ${y + 9} L ${x - 10} ${y + 15} L ${x - 8} ${y + 4} L ${x - 16} ${y - 4} L ${x - 5} ${y - 5} Z`}
        fill="#F6C344"
        stroke={cor.pessegoEscuro}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    );
  if (tipo === "chave")
    return (
      <G>
        <Circle cx={x - 7} cy={y} r={7} fill="none" stroke="#E2A43A" strokeWidth={4} />
        <Path
          d={`M ${x} ${y} H ${x + 16} M ${x + 11} ${y} V ${y + 6} M ${x + 16} ${y} V ${y + 5}`}
          stroke="#E2A43A"
          strokeWidth={4}
          strokeLinecap="round"
        />
      </G>
    );
  return (
    <G>
      <Rect x={x - 15} y={y - 6} width={30} height={18} rx={3} fill="#B07A4A" stroke="#7A5232" strokeWidth={2} />
      <Path
        d={`M ${x - 15} ${y - 4} Q ${x} ${y - 20} ${x + 15} ${y - 4} Z`}
        fill="#C98B4E"
        stroke="#7A5232"
        strokeWidth={2}
      />
      <Rect x={x - 3} y={y - 3} width={6} height={8} rx={1.5} fill="#F6C344" />
    </G>
  );
}

const p = criarEstilos(() => ({
  pedido: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: raio.m,
    borderWidth: 1,
    borderColor: cor.borda,
    backgroundColor: cor.superficie,
  },
  mapa: { borderRadius: 18, borderWidth: 3, borderColor: "#E2C9A6" },
}));
