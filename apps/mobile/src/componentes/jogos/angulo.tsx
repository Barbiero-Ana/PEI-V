import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Svg, { Circle, ClipPath, Defs, G, Line, Path, Rect, Text as SvgText } from "react-native-svg";
import type { RodadaAngulo } from "@modolume/core";
import { useUltimo } from "@/lib/useUltimo";
import { Botao, Texto } from "../ui";
import { cor, criarEstilos, fonte, raio } from "@/tema";
import type { PropsJogo } from "./tipos";
import { Acoes } from "./Acoes";

/**
 * Gire na medida (ângulos): o objeto começa apontando para cima (0°) e o
 * aluno gira com o dedo, no sentido horário, até o ângulo pedido. O giro
 * encaixa de 15 em 15 graus e o arco percorrido fica desenhado. Com a dica,
 * aparece quantos graus já girou.
 */

const PASSO = 15;

/** O que gira no centro. */
function Objeto({ tema, c, r }: { tema: RodadaAngulo["tema"]; c: number; r: number }) {
  if (tema === "farol")
    return (
      <G>
        {/* facho de luz em duas camadas */}
        <Path
          d={`M ${c} ${c} L ${c - r * 0.36} ${c - r * 0.9} A ${r} ${r} 0 0 1 ${c + r * 0.36} ${c - r * 0.9} Z`}
          fill="#FFD9A0"
          opacity={0.35}
        />
        <Path
          d={`M ${c} ${c} L ${c - r * 0.18} ${c - r * 0.92} A ${r} ${r} 0 0 1 ${c + r * 0.18} ${c - r * 0.92} Z`}
          fill="#FFF6E8"
          opacity={0.55}
        />
        {/* torre vista de cima: listras e a lanterna */}
        <Circle cx={c} cy={c} r={r * 0.24} fill="#FFFFFF" stroke={cor.tinta} strokeWidth={3} />
        <Circle cx={c} cy={c} r={r * 0.17} fill="none" stroke={cor.pessegoEscuro} strokeWidth={r * 0.05} />
        <Circle cx={c} cy={c} r={r * 0.08} fill="#FFD9A0" stroke={cor.tinta} strokeWidth={2} />
        <Rect x={c - r * 0.05} y={c - r * 0.3} width={r * 0.1} height={r * 0.08} rx={2} fill={cor.pessego} />
      </G>
    );
  if (tema === "bussola")
    return (
      <G>
        <Path d={`M ${c} ${c - r * 0.74} L ${c + r * 0.11} ${c} L ${c - r * 0.11} ${c} Z`} fill={cor.pessegoEscuro} />
        <Path d={`M ${c} ${c - r * 0.74} L ${c + r * 0.11} ${c} L ${c} ${c} Z`} fill={cor.pessego} />
        <Path d={`M ${c} ${c + r * 0.52} L ${c + r * 0.11} ${c} L ${c - r * 0.11} ${c} Z`} fill="#B9B1DE" />
        <Circle cx={c} cy={c} r={r * 0.08} fill="#FFFFFF" stroke={cor.tinta} strokeWidth={2.5} />
      </G>
    );
  // robô aspirador visto de cima: para-choque, rodinhas, olhos de LED e sensor
  return (
    <G>
      <Rect x={c - r * 0.42} y={c - r * 0.1} width={r * 0.1} height={r * 0.22} rx={3} fill={cor.tinta} />
      <Rect x={c + r * 0.32} y={c - r * 0.1} width={r * 0.1} height={r * 0.22} rx={3} fill={cor.tinta} />
      <Circle cx={c} cy={c} r={r * 0.36} fill="#FFFFFF" stroke={cor.tinta} strokeWidth={3} />
      <Path
        d={`M ${c - r * 0.33} ${c - r * 0.12} A ${r * 0.35} ${r * 0.35} 0 0 1 ${c + r * 0.33} ${c - r * 0.12}`}
        stroke={cor.roxo}
        strokeWidth={r * 0.06}
        fill="none"
        strokeLinecap="round"
      />
      <Circle cx={c} cy={c + r * 0.04} r={r * 0.2} fill={cor.lilas} />
      <Circle cx={c - r * 0.09} cy={c - r * 0.06} r={r * 0.045} fill={cor.tinta} />
      <Circle cx={c + r * 0.09} cy={c - r * 0.06} r={r * 0.045} fill={cor.tinta} />
      <Path
        d={`M ${c - r * 0.07} ${c + r * 0.08} Q ${c} ${c + r * 0.14} ${c + r * 0.07} ${c + r * 0.08}`}
        stroke={cor.tinta}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d={`M ${c} ${c - r * 0.64} L ${c + r * 0.1} ${c - r * 0.46} L ${c - r * 0.1} ${c - r * 0.46} Z`}
        fill={cor.pessegoEscuro}
      />
    </G>
  );
}

/** Cenário dentro do transferidor: piso, mar à noite ou papel de mapa. */
function Fundo({ tema, c, r }: { tema: RodadaAngulo["tema"]; c: number; r: number }) {
  if (tema === "farol")
    return (
      <G>
        <Circle cx={c} cy={c} r={r} fill="#1E2A78" />
        {[0.3, 0.55, 0.8].map((f, i) => (
          <Path
            key={f}
            d={`M ${c - r * 0.9} ${c + r * (f - 0.2)} q ${r * 0.15} -${r * 0.06} ${r * 0.3} 0 t ${r * 0.3} 0 t ${r * 0.3} 0 t ${r * 0.3} 0 t ${r * 0.3} 0`}
            stroke="#8FD3FF"
            strokeWidth={2}
            fill="none"
            opacity={0.25 + i * 0.1}
          />
        ))}
        <Circle cx={c - r * 0.55} cy={c - r * 0.5} r={2} fill="#FFFFFF" opacity={0.7} />
        <Circle cx={c + r * 0.6} cy={c - r * 0.35} r={1.5} fill="#FFFFFF" opacity={0.6} />
      </G>
    );
  if (tema === "bussola")
    return (
      <G>
        <Circle cx={c} cy={c} r={r} fill="#FFF6E8" />
        <Path
          d={`M ${c - r * 0.7} ${c + r * 0.5} C ${c - r * 0.3} ${c + r * 0.1} ${c + r * 0.1} ${c + r * 0.7} ${c + r * 0.6} ${c + r * 0.3}`}
          stroke="#E2C9A6"
          strokeWidth={3}
          strokeDasharray="6 6"
          fill="none"
        />
        {(["N", "L", "S", "O"] as const).map((l, i) => {
          const a = (i * 90 * Math.PI) / 180;
          return (
            <SvgText
              key={l}
              x={c + r * 0.58 * Math.sin(a)}
              y={c - r * 0.58 * Math.cos(a) + 5}
              fontSize={14}
              fontWeight="700"
              fill={l === "N" ? cor.pessegoEscuro : cor.textoSuave}
              textAnchor="middle"
            >
              {l}
            </SvgText>
          );
        })}
      </G>
    );
  return (
    <G>
      <Circle cx={c} cy={c} r={r} fill="#F2EFFC" />
      {Array.from({ length: 7 }, (_, i) => (
        <G key={i}>
          <Line
            x1={c - r + (i + 1) * (r / 4)}
            y1={c - r}
            x2={c - r + (i + 1) * (r / 4)}
            y2={c + r}
            stroke="#E2DCF5"
            strokeWidth={1.5}
          />
          <Line
            x1={c - r}
            y1={c - r + (i + 1) * (r / 4)}
            x2={c + r}
            y2={c - r + (i + 1) * (r / 4)}
            stroke="#E2DCF5"
            strokeWidth={1.5}
          />
        </G>
      ))}
    </G>
  );
}

export function JogoAngulo({ rodada, onErro, onAcerto, bloqueado, dica = false }: PropsJogo<RodadaAngulo>) {
  const [lado, setLado] = useState(300);
  const [angulo, setAngulo] = useState(0);
  const [giro] = useState(() => new Animated.Value(0));
  const estado = useUltimo({ lado, bloqueado });
  const c = lado / 2;
  const r = c - 8;

  // o objeto segue o ângulo com uma mola suave, sempre pelo caminho mais curto
  const visual = useRef(0);
  useEffect(() => {
    const atual = ((visual.current % 360) + 360) % 360;
    let d = angulo - atual;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    visual.current += d;
    Animated.spring(giro, { toValue: visual.current, friction: 7, tension: 120, useNativeDriver: false }).start();
  }, [angulo, giro]);

  const gesto = useMemo(() => {
    const emAngulo = (x: number, y: number) => {
      const cc = estado.current.lado / 2;
      let g = (Math.atan2(x - cc, -(y - cc)) * 180) / Math.PI;
      if (g < 0) g += 360;
      return (Math.round(g / PASSO) * PASSO) % 360;
    };
    return Gesture.Pan()
      .runOnJS(true)
      .minDistance(0)
      .onBegin((e) => !estado.current.bloqueado && setAngulo(emAngulo(e.x, e.y)))
      .onUpdate((e) => !estado.current.bloqueado && setAngulo(emAngulo(e.x, e.y)));
  }, [estado]);

  function conferir() {
    if (angulo === rodada.angulo) return onAcerto(`Isso! Girou exatamente ${rodada.angulo}°.`);
    const dif = rodada.angulo - angulo;
    onErro(
      dif > 0
        ? `Girou ${angulo}°. Ainda falta girar ${dif}°.`
        : `Passou: girou ${angulo}°, ${-dif}° a mais que o pedido.`,
    );
  }

  // arco de 0° até o ângulo atual (sentido horário)
  const ponto = (g: number, raio: number) => ({
    x: c + raio * Math.sin((g * Math.PI) / 180),
    y: c - raio * Math.cos((g * Math.PI) / 180),
  });
  const ra = r * 0.62;
  const fim = ponto(angulo, ra);
  const arco =
    angulo === 0 ? "" : `M ${c} ${c} L ${c} ${c - ra} A ${ra} ${ra} 0 ${angulo > 180 ? 1 : 0} 1 ${fim.x} ${fim.y} Z`;

  return (
    <View style={{ flex: 1, gap: 12, alignItems: "center" }}>
      {/* margem automática: centraliza o conteúdo acima dos botões */}
      <View style={{ marginTop: "auto" }} />
      <View style={g.pedido}>
        {rodada.esconderAlvo && !bloqueado ? (
          <Texto style={{ fontFamily: fonte.titulo, fontSize: 16, color: cor.roxo, lineHeight: 34 }}>
            Calcule o giro e gire para a direita
          </Texto>
        ) : (
          <>
            <Texto style={{ fontSize: 14, color: cor.textoSuave }}>Gire</Texto>
            <Texto style={{ fontFamily: fonte.tituloForte, fontSize: 28, color: cor.roxo, lineHeight: 34 }}>
              {rodada.angulo}°
            </Texto>
            <Texto style={{ fontSize: 14, color: cor.textoSuave }}>para a direita</Texto>
          </>
        )}
      </View>

      {/* o disco é sempre um quadrado de lado fixo: assim o centro do giro
          coincide com o centro do transferidor mesmo se faltar altura */}
      <View
        style={{
          width: "100%",
          maxWidth: 320,
          aspectRatio: 1,
          flexShrink: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
        onLayout={(e) => setLado(Math.floor(Math.min(e.nativeEvent.layout.width, e.nativeEvent.layout.height)))}
      >
        <GestureDetector gesture={gesto}>
          <View collapsable={false} style={{ width: lado, height: lado }}>
            <Svg width={lado} height={lado}>
              {/* o cenário fica recortado dentro do círculo */}
              <Defs>
                <ClipPath id="discoAngulo">
                  <Circle cx={c} cy={c} r={r} />
                </ClipPath>
              </Defs>
              <G clipPath="url(#discoAngulo)">
                <Fundo tema={rodada.tema} c={c} r={r} />
              </G>
              <Circle cx={c} cy={c} r={r} fill="none" stroke={cor.roxo} strokeWidth={5} />
              {Array.from({ length: 360 / PASSO }, (_, i) => {
                const gr = i * PASSO;
                const forte = gr % 45 === 0;
                const a = ponto(gr, r - 4);
                const b = ponto(gr, r - (forte ? 18 : 11));
                return (
                  <Line
                    key={gr}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={rodada.tema === "farol" ? "#C9B4FF" : forte ? cor.tinta : cor.bordaForte}
                    strokeWidth={forte ? 3 : 1.5}
                    strokeLinecap="round"
                  />
                );
              })}
              {Array.from({ length: 8 }, (_, i) => {
                const gr = i * 45;
                const p = ponto(gr, r - 32);
                return (
                  <SvgText
                    key={gr}
                    x={p.x}
                    y={p.y + 4}
                    fontSize={11}
                    fontWeight="700"
                    fill={rodada.tema === "farol" ? "#FFFFFF" : cor.tinta}
                    textAnchor="middle"
                  >
                    {gr}
                  </SvgText>
                );
              })}
              {/* ângulo percorrido */}
              {arco ? <Path d={arco} fill={cor.lilas} opacity={0.35} stroke={cor.roxo} strokeWidth={2} /> : null}
              <Line x1={c} y1={c} x2={c} y2={c - ra} stroke={cor.roxo} strokeWidth={2} strokeDasharray="4 4" />
              {dica ? (
                <G>
                  <Rect x={c - 38} y={c + r * 0.36} width={76} height={24} rx={12} fill={cor.pessego} />
                  <SvgText
                    x={c}
                    y={c + r * 0.36 + 16}
                    fontSize={13}
                    fontWeight="700"
                    fill={cor.tinta}
                    textAnchor="middle"
                  >
                    {`${angulo} graus`}
                  </SvgText>
                </G>
              ) : null}
            </Svg>
            {/* o objeto gira por cima */}
            <Animated.View
              pointerEvents="none"
              style={[
                { position: "absolute", left: 0, top: 0, width: lado, height: lado },
                {
                  transform: [
                    { rotate: giro.interpolate({ inputRange: [-3600, 3600], outputRange: ["-3600deg", "3600deg"] }) },
                  ],
                },
              ]}
            >
              <Svg width={lado} height={lado}>
                <Objeto tema={rodada.tema} c={c} r={r} />
              </Svg>
            </Animated.View>
          </View>
        </GestureDetector>
      </View>

      <Texto style={{ fontSize: 12, color: cor.textoSuave, textAlign: "center" }}>
        Arraste o dedo em volta do círculo. Cada marquinha vale {PASSO}°.
      </Texto>
      <Acoes>
        <Botao
          titulo="Voltar a 0°"
          variante="secundario"
          onPress={() => setAngulo(0)}
          disabled={bloqueado || angulo === 0}
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
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: raio.m,
    backgroundColor: cor.superficie,
    borderWidth: 1,
    borderColor: cor.borda,
  },
}));
