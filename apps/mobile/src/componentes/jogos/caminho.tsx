import { useEffect, useMemo, useState } from "react";
import { Animated, Easing, Platform, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Svg, { Circle, G, Line, Path, Polyline, Rect, Text as SvgText } from "react-native-svg";
import type { RodadaCaminho } from "@modolume/core";
import { useUltimo } from "@/lib/useUltimo";
import { Botao, Texto } from "../ui";
import { cor, criarEstilos, raio } from "@/tema";
import type { PropsJogo } from "./tipos";
import { Acoes } from "./Acoes";

/**
 * Caminho do entregador (sequência): o aluno passa o dedo pelos quarteirões
 * do mapa, do ponto de partida até o destino, seguindo as direções ou
 * desviando das obras pelo caminho mais curto. Voltar o dedo desfaz.
 */

type Celula = [number, number];

const NATIVO = Platform.OS !== "web";

/** Moto de entrega com baú (desenhada olhando para a direita). */
function Moto({ t }: { t: number }) {
  return (
    <Svg width={t * 0.78} height={t * 0.78} viewBox="0 0 40 40">
      {/* baú */}
      <Rect x={3} y={9} width={13} height={12} rx={2} fill="#FFFFFF" stroke={cor.roxo} strokeWidth={2} />
      <Path d="M5.5 13 H13.5" stroke={cor.roxo} strokeWidth={1.6} />
      {/* corpo da moto */}
      <Path d="M8 24 H24 L29 17 H33 L31 24 Z" fill={cor.pessego} />
      <Path d="M29 17 L31 11 H34" stroke={cor.tinta} strokeWidth={2.2} fill="none" strokeLinecap="round" />
      {/* piloto com capacete */}
      <Path d="M17 23 L19 15 L24 15 L25 23 Z" fill={cor.azulEscuro} />
      <Circle cx={22} cy={10.5} r={5} fill={cor.roxo} />
      <Path d="M23 9 H27 V12 H23.5 Z" fill="#BFE6FF" />
      {/* rodas */}
      <Circle cx={10} cy={30} r={5.2} fill={cor.tinta} />
      <Circle cx={10} cy={30} r={2} fill="#D6CFF0" />
      <Circle cx={31} cy={30} r={5.2} fill={cor.tinta} />
      <Circle cx={31} cy={30} r={2} fill="#D6CFF0" />
    </Svg>
  );
}

const PREDIOS = ["#D9CCFF", "#FFD2B5", "#BFE6FF", "#E7E3F6"];

/** O destino desenhado no cruzamento final. */
function Destino({ tipo, x, y, t }: { tipo: NonNullable<RodadaCaminho["destino"]>; x: number; y: number; t: number }) {
  const k = t / 64;
  return (
    <G transform={`translate(${x} ${y}) scale(${k})`}>
      <Circle cx={0} cy={0} r={24} fill="#FFFFFF" stroke={cor.roxo} strokeWidth={3} />
      {tipo === "casa" ? (
        <G>
          <Path d="M -12 2 L 0 -11 L 12 2 V 13 H -12 Z" fill={cor.pessego} />
          <Path d="M -15 3 L 0 -13 L 15 3" stroke={cor.roxo} strokeWidth={3.5} fill="none" strokeLinejoin="round" />
          <Rect x={-3.5} y={4} width={7} height={9} fill={cor.roxo} />
        </G>
      ) : tipo === "escola" ? (
        <G>
          <Rect x={-14} y={-4} width={28} height={17} fill={cor.azul} />
          <Path d="M -16 -4 L 0 -13 L 16 -4 Z" fill={cor.roxo} />
          <Rect x={-3} y={5} width={6} height={8} fill={cor.tinta} />
          <Rect x={-11} y={0} width={5} height={4} fill="#FFFFFF" />
          <Rect x={6} y={0} width={5} height={4} fill="#FFFFFF" />
          <Line x1={0} y1={-13} x2={0} y2={-20} stroke={cor.tinta} strokeWidth={1.5} />
          <Path d="M 0 -20 L 7 -18 L 0 -16 Z" fill={cor.pessego} />
        </G>
      ) : (
        <G>
          <Rect x={-2} y={2} width={4} height={11} fill="#B48A5E" />
          <Circle cx={0} cy={-4} r={11} fill="#8CCB9F" />
          <Circle cx={-6} cy={-7} r={3} fill="#A9D8B8" />
          <Path d="M -16 13 H 16" stroke="#8CCB9F" strokeWidth={3} strokeLinecap="round" />
        </G>
      )}
    </G>
  );
}
const igual = (a: Celula, b: Celula) => a[0] === b[0] && a[1] === b[1];

/** Menor número de passos entre início e fim, desviando dos bloqueios. */
function menorCaminho(r: RodadaCaminho): number {
  const bloq = new Set((r.bloqueios ?? []).map(([x, y]) => `${x},${y}`));
  const fila: [number, number, number][] = [[r.inicio[0], r.inicio[1], 0]];
  const visto = new Set([`${r.inicio[0]},${r.inicio[1]}`]);
  while (fila.length) {
    const [x, y, d] = fila.shift()!;
    if (x === r.fim[0] && y === r.fim[1]) return d;
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      const nx = x + dx;
      const ny = y + dy;
      const k = `${nx},${ny}`;
      if (nx < 0 || ny < 0 || nx >= r.colunas || ny >= r.linhas || bloq.has(k) || visto.has(k)) continue;
      visto.add(k);
      fila.push([nx, ny, d + 1]);
    }
  }
  return Infinity;
}

export function JogoCaminho({ rodada, onErro, onAcerto, bloqueado }: PropsJogo<RodadaCaminho>) {
  const [caminho, setCaminho] = useState<Celula[]>([rodada.inicio]);
  // posição animada da moto, em unidades de quarteirão
  const [pos] = useState(() => new Animated.ValueXY({ x: rodada.inicio[0], y: rodada.inicio[1] }));
  const [quique] = useState(() => new Animated.Value(0));
  const [fumaca] = useState(() => new Animated.Value(1));
  const [entrega] = useState(() => new Animated.Value(0));
  const [largura, setLargura] = useState(300);
  const t = Math.min(64, Math.floor(largura / rodada.colunas));
  const W = t * rodada.colunas;
  const H = t * rodada.linhas;
  const bloq = useMemo(() => new Set((rodada.bloqueios ?? []).map(([x, y]) => `${x},${y}`)), [rodada.bloqueios]);
  const estado = useUltimo({ t, bloqueado, caminho });

  const gesto = useMemo(() => {
    const celula = (x: number, y: number): Celula | null => {
      const c = Math.floor(x / estado.current.t);
      const r = Math.floor(y / estado.current.t);
      return c >= 0 && r >= 0 && c < rodada.colunas && r < rodada.linhas ? [c, r] : null;
    };
    const visitar = (cel: Celula | null) => {
      if (!cel || estado.current.bloqueado || bloq.has(`${cel[0]},${cel[1]}`)) return;
      setCaminho((cam) => {
        const ultimo = cam[cam.length - 1]!;
        if (igual(ultimo, cel)) return cam;
        // voltar uma casa desfaz o último passo
        if (cam.length > 1 && igual(cam[cam.length - 2]!, cel)) return cam.slice(0, -1);
        const vizinho = Math.abs(ultimo[0] - cel[0]) + Math.abs(ultimo[1] - cel[1]) === 1;
        if (!vizinho || cam.some((c) => igual(c, cel))) return cam;
        return [...cam, cel];
      });
    };
    return Gesture.Pan()
      .runOnJS(true)
      .minDistance(0)
      .onBegin((e) => visitar(celula(e.x, e.y)))
      .onUpdate((e) => visitar(celula(e.x, e.y)));
  }, [estado, bloq, rodada.colunas, rodada.linhas]);

  // a moto desliza até o último cruzamento, quicando e soltando fumaça
  const ultimo = caminho[caminho.length - 1]!;
  // a moto olha para o lado do último passo na horizontal
  let virado = false;
  for (let k = caminho.length - 1; k > 0; k -= 1) {
    if (caminho[k]![0] !== caminho[k - 1]![0]) {
      virado = caminho[k]![0] < caminho[k - 1]![0];
      break;
    }
  }
  useEffect(() => {
    Animated.parallel([
      Animated.timing(pos, {
        toValue: { x: ultimo[0], y: ultimo[1] },
        duration: 230,
        easing: Easing.out(Easing.quad),
        useNativeDriver: NATIVO,
      }),
      Animated.sequence([
        Animated.timing(quique, {
          toValue: 1,
          duration: 115,
          easing: Easing.out(Easing.quad),
          useNativeDriver: NATIVO,
        }),
        Animated.timing(quique, { toValue: 0, duration: 115, easing: Easing.in(Easing.quad), useNativeDriver: NATIVO }),
      ]),
      Animated.sequence([
        Animated.timing(fumaca, { toValue: 0, duration: 0, useNativeDriver: NATIVO }),
        Animated.timing(fumaca, {
          toValue: 1,
          duration: 420,
          easing: Easing.out(Easing.quad),
          useNativeDriver: NATIVO,
        }),
      ]),
    ]).start();
  }, [ultimo[0], ultimo[1]]); // eslint-disable-line react-hooks/exhaustive-deps

  // entrega feita: caixinha pula para o destino e ondas saem dele
  useEffect(() => {
    if (!bloqueado) return;
    entrega.setValue(0);
    Animated.timing(entrega, {
      toValue: 1,
      duration: 1400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: NATIVO,
    }).start();
  }, [bloqueado, entrega]);

  function conferir() {
    const ultimo = caminho[caminho.length - 1]!;
    if (!igual(ultimo, rodada.fim))
      return onErro("O caminho ainda não chegou ao destino. Continue passando o dedo pelas ruas.");
    const passos = caminho.length - 1;
    const ideal = rodada.passos ?? menorCaminho(rodada);
    if (passos > ideal)
      return onErro(
        `Chegou! Mas você andou ${passos} quarteirões. Dá para ir em ${ideal}. Tente um caminho mais curto.`,
      );
    onAcerto(`Entrega feita em ${passos} quarteirões!`);
  }

  const centro = (c: Celula) => `${c[0] * t + t / 2},${c[1] * t + t / 2}`;
  const fx = rodada.fim[0] * t + t / 2;
  const fy = rodada.fim[1] * t + t / 2;
  const ix = rodada.inicio[0] * t + t / 2;
  const iy = rodada.inicio[1] * t + t / 2;
  const rua = t * 0.36;
  // placa ao lado do ponto de partida, sem sair do mapa
  const placaX = Math.min(W - 70, Math.max(2, ix - 34));
  const placaY = iy > H / 2 ? iy - t * 0.5 - 14 : iy + t * 0.3;

  return (
    <View style={{ flex: 1, gap: 12 }}>
      {/* margem automática: centraliza o conteúdo acima dos botões */}
      <View style={{ marginTop: "auto" }} />
      <View style={c$.mapa} onLayout={(e) => setLargura(e.nativeEvent.layout.width - 24)}>
        <GestureDetector gesture={gesto}>
          <View collapsable={false} style={{ width: W, height: H, alignSelf: "center" }}>
            <Svg width={W} height={H}>
              {/* bairro: quarteirões entre as ruas */}
              <Rect x={0} y={0} width={W} height={H} fill="#E3F0E7" />
              {Array.from({ length: rodada.linhas + 1 }, (_, br) =>
                Array.from({ length: rodada.colunas + 1 }, (_, bc) => {
                  const x0 = Math.max(0, (bc - 1) * t + t / 2 + rua / 2);
                  const x1 = Math.min(W, bc * t + t / 2 - rua / 2);
                  const y0 = Math.max(0, (br - 1) * t + t / 2 + rua / 2);
                  const y1 = Math.min(H, br * t + t / 2 - rua / 2);
                  if (x1 - x0 < 6 || y1 - y0 < 6) return null;
                  const n = (bc * 7 + br * 3) % 5;
                  if (n === 4) {
                    // pracinha com árvore
                    return (
                      <G key={`b${bc}-${br}`}>
                        <Rect x={x0 + 2} y={y0 + 2} width={x1 - x0 - 4} height={y1 - y0 - 4} rx={4} fill="#CDE6D5" />
                        <Circle
                          cx={(x0 + x1) / 2}
                          cy={(y0 + y1) / 2}
                          r={Math.min(x1 - x0, y1 - y0) * 0.28}
                          fill="#9ED0AE"
                        />
                      </G>
                    );
                  }
                  const tom = PREDIOS[n % PREDIOS.length]!;
                  return (
                    <G key={`b${bc}-${br}`}>
                      <Rect x={x0 + 2} y={y0 + 2} width={x1 - x0 - 4} height={y1 - y0 - 4} rx={4} fill={tom} />
                      <Rect
                        x={x0 + 2}
                        y={y0 + 2}
                        width={x1 - x0 - 4}
                        height={Math.min(6, (y1 - y0) / 4)}
                        rx={3}
                        fill="#FFFFFF"
                        opacity={0.5}
                      />
                      {x1 - x0 > 22 && y1 - y0 > 22
                        ? [0.3, 0.62].map((jx) =>
                            [0.45, 0.72].map((jy) => (
                              <Rect
                                key={`${jx}${jy}`}
                                x={x0 + (x1 - x0) * jx}
                                y={y0 + (y1 - y0) * jy - 3}
                                width={5}
                                height={5}
                                rx={1}
                                fill="#FFFFFF"
                                opacity={0.75}
                              />
                            )),
                          )
                        : null}
                    </G>
                  );
                }),
              )}
              {/* ruas */}
              {Array.from({ length: rodada.linhas }, (_, r) => (
                <Rect key={`h${r}`} x={0} y={r * t + t / 2 - rua / 2} width={W} height={rua} fill="#CFD2E4" />
              ))}
              {Array.from({ length: rodada.colunas }, (_, c) => (
                <Rect key={`v${c}`} x={c * t + t / 2 - rua / 2} y={0} width={rua} height={H} fill="#CFD2E4" />
              ))}
              {Array.from({ length: rodada.linhas }, (_, r) => (
                <Line
                  key={`fh${r}`}
                  x1={0}
                  y1={r * t + t / 2}
                  x2={W}
                  y2={r * t + t / 2}
                  stroke="#FFFFFF"
                  strokeWidth={1.5}
                  strokeDasharray="5 6"
                />
              ))}
              {Array.from({ length: rodada.colunas }, (_, c) => (
                <Line
                  key={`fv${c}`}
                  x1={c * t + t / 2}
                  y1={0}
                  x2={c * t + t / 2}
                  y2={H}
                  stroke="#FFFFFF"
                  strokeWidth={1.5}
                  strokeDasharray="5 6"
                />
              ))}
              {/* obras: cavalete listrado e cone no cruzamento */}
              {(rodada.bloqueios ?? []).map(([c, r]) => {
                const x = c * t + t / 2;
                const y = r * t + t / 2;
                return (
                  <G key={`o${c}${r}`}>
                    <Rect
                      x={x - rua * 0.7}
                      y={y - rua * 0.7}
                      width={rua * 1.4}
                      height={rua * 1.4}
                      rx={4}
                      fill="#FFF1E7"
                    />
                    <Rect x={x - rua * 0.6} y={y - 4} width={rua * 1.2} height={8} fill={cor.pessegoEscuro} />
                    {[-0.35, 0, 0.35].map((f) => (
                      <Rect key={f} x={x + rua * f - 2} y={y - 4} width={4} height={8} fill="#FFFFFF" />
                    ))}
                    <Path
                      d={`M ${x} ${y - rua * 0.6} L ${x + rua * 0.3} ${y - 5} L ${x - rua * 0.3} ${y - 5} Z`}
                      fill={cor.pessegoEscuro}
                    />
                  </G>
                );
              })}
              {/* placa do ponto de partida */}
              {rodada.origem ? (
                <G>
                  <Rect x={placaX} y={placaY} width={68} height={16} rx={5} fill={cor.tinta} />
                  <SvgText
                    x={placaX + 34}
                    y={placaY + 11.5}
                    fontSize={9}
                    fontWeight="700"
                    fill="#FFFFFF"
                    textAnchor="middle"
                  >
                    {rodada.origem}
                  </SvgText>
                </G>
              ) : null}
              <Destino tipo={rodada.destino ?? "casa"} x={fx} y={fy} t={t} />
              {/* caminho traçado */}
              <Polyline
                points={caminho.map(centro).join(" ")}
                fill="none"
                stroke={cor.roxo}
                strokeWidth={t * 0.16}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity={0.75}
              />
            </Svg>

            {/* ondas no destino quando a entrega é feita */}
            {bloqueado
              ? [0, 0.3].map((atraso) => (
                  <Animated.View
                    key={atraso}
                    pointerEvents="none"
                    style={[
                      c$.onda,
                      {
                        left: fx - t * 0.4,
                        top: fy - t * 0.4,
                        width: t * 0.8,
                        height: t * 0.8,
                        borderRadius: t * 0.4,
                        opacity: entrega.interpolate({
                          inputRange: [atraso, atraso + 0.2, 1],
                          outputRange: [0, 0.9, 0],
                          extrapolate: "clamp",
                        }),
                        transform: [
                          {
                            scale: entrega.interpolate({
                              inputRange: [atraso, 1],
                              outputRange: [0.6, 2.2],
                              extrapolate: "clamp",
                            }),
                          },
                        ],
                      },
                    ]}
                  />
                ))
              : null}

            {/* fumacinha que fica para trás a cada passo */}
            <Animated.View
              pointerEvents="none"
              style={[
                c$.fumaca,
                {
                  width: t * 0.18,
                  height: t * 0.18,
                  borderRadius: t * 0.09,
                  opacity: fumaca.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.7, 0] }),
                  transform: [
                    { translateX: Animated.add(Animated.multiply(pos.x, t), t / 2 + (virado ? t * 0.3 : -t * 0.38)) },
                    { translateY: Animated.add(Animated.multiply(pos.y, t), t * 0.58) },
                    { scale: fumaca.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.8] }) },
                  ],
                },
              ]}
            />

            {/* a moto */}
            <Animated.View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                transform: [
                  { translateX: Animated.add(Animated.multiply(pos.x, t), t * 0.11) },
                  {
                    translateY: Animated.add(
                      Animated.multiply(pos.y, t),
                      quique.interpolate({ inputRange: [0, 1], outputRange: [t * 0.08, t * 0.08 - 5] }),
                    ),
                  },
                  { scaleX: virado ? -1 : 1 },
                ],
              }}
            >
              <Moto t={t} />
            </Animated.View>

            {/* caixinha entregue pulando para o destino */}
            {bloqueado ? (
              <Animated.View
                pointerEvents="none"
                style={[
                  c$.caixinha,
                  {
                    left: fx - 7,
                    top: fy - 7,
                    opacity: entrega.interpolate({
                      inputRange: [0, 0.1, 0.55, 0.7],
                      outputRange: [0, 1, 1, 0],
                      extrapolate: "clamp",
                    }),
                    transform: [
                      {
                        translateY: entrega.interpolate({
                          inputRange: [0, 0.3, 0.6],
                          outputRange: [0, -t * 0.7, -t * 0.1],
                          extrapolate: "clamp",
                        }),
                      },
                      {
                        rotate: entrega.interpolate({
                          inputRange: [0, 0.6],
                          outputRange: ["0deg", "200deg"],
                          extrapolate: "clamp",
                        }),
                      },
                    ],
                  },
                ]}
              />
            ) : null}
          </View>
        </GestureDetector>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "center", gap: 16 }}>
        <Texto style={{ fontSize: 13, color: cor.textoSuave }}>Quarteirões andados: {caminho.length - 1}</Texto>
      </View>
      <Acoes>
        <Botao
          titulo="Recomeçar"
          variante="secundario"
          onPress={() => setCaminho([rodada.inicio])}
          disabled={bloqueado || caminho.length === 1}
        />
        <Botao titulo="Entregar" onPress={conferir} disabled={bloqueado || caminho.length === 1} style={{ flex: 1 }} />
      </Acoes>
    </View>
  );
}

const c$ = criarEstilos(() => ({
  onda: { position: "absolute", borderWidth: 3, borderColor: cor.roxo },
  fumaca: { position: "absolute", left: 0, top: 0, backgroundColor: "#FFFFFF" },
  caixinha: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: cor.roxo,
  },
  mapa: { padding: 12, borderRadius: raio.g, borderWidth: 1, borderColor: cor.borda, backgroundColor: "#E3F0E7" },
}));
