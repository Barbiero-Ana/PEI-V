import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, View } from "react-native";
import { Gesture, GestureDetector, ScrollView } from "react-native-gesture-handler";
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from "react-native-svg";
import type { RodadaRelogio } from "@modolume/core";
import { semCollapsable } from "../Ceu";
import { useUltimo } from "@/lib/useUltimo";
import { Botao, Texto } from "../ui";
import { cor, criarEstilos, fonte } from "@/tema";
import type { PropsJogo } from "./tipos";
import { Acoes } from "./Acoes";

/**
 * Que horas são? (manipulação): arrasta os ponteiros do relógio. O ponteiro
 * movido é o mais próximo de onde o dedo tocou. O pequeno anda junto com os
 * minutos, como num relógio de verdade.
 */

const rl = criarEstilos(() => ({
  explica: {
    alignSelf: "stretch",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: cor.superficie,
    borderWidth: 1,
    borderColor: cor.borda,
    overflow: "hidden",
  },
  bilhete: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFF1E7",
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 6,
    transform: [{ rotate: "-2deg" }],
    borderBottomWidth: 3,
    borderBottomColor: "#FFD2B5",
  },
  fita: {
    position: "absolute",
    top: -7,
    alignSelf: "center",
    left: "42%",
    width: 34,
    height: 12,
    backgroundColor: "rgba(201,180,255,0.7)",
    transform: [{ rotate: "3deg" }],
  },
}));

const AnimatedG = Animated.createAnimatedComponent(semCollapsable(G));

const doisDigitos = (n: number) => String(n).padStart(2, "0");

export function JogoRelogio({ rodada, onErro, onAcerto, bloqueado, dica = false }: PropsJogo<RodadaRelogio>) {
  const [hora, setHora] = useState(12);
  const [minuto, setMinuto] = useState(0);
  const [area, setArea] = useState({ w: 320, h: 420 });
  // o relógio encolhe para caber junto com o bilhete e, na dica, com a explicação
  const lado = Math.round(Math.max(170, Math.min(300, area.w, area.h - (dica ? 230 : 110))));
  const [movendo, setMovendo] = useState<"hora" | "minuto" | null>(null);
  const estado = useUltimo({ hora, minuto, lado, bloqueado });
  const ponteiro = useRef<"hora" | "minuto">("minuto");
  // a dica entra e sai devagar (sem empurrar tudo de uma vez)
  const [ajuda] = useState(() => new Animated.Value(dica ? 1 : 0));
  useEffect(() => {
    Animated.timing(ajuda, {
      toValue: dica ? 1 : 0,
      duration: 420,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [dica, ajuda]);

  const angMin = minuto * 6;
  const angHora = ((hora % 12) + minuto / 60) * 30;

  const gesto = useMemo(() => {
    const angulo = (x: number, y: number) => {
      const c = estado.current.lado / 2;
      let a = (Math.atan2(y - c, x - c) * 180) / Math.PI + 90;
      if (a < 0) a += 360;
      return a;
    };
    const distAng = (a: number, b: number) => {
      const d = Math.abs(a - b) % 360;
      return d > 180 ? 360 - d : d;
    };
    const aplicar = (a: number) => {
      const { minuto: m } = estado.current;
      if (ponteiro.current === "minuto") {
        setMinuto((Math.round(a / 30) * 5) % 60);
      } else {
        let h = Math.round((a - m * 0.5) / 30) % 12;
        if (h <= 0) h += 12;
        setHora(h);
      }
    };
    return Gesture.Pan()
      .runOnJS(true)
      .minDistance(0)
      .onStart((e) => {
        if (estado.current.bloqueado) return;
        const a = angulo(e.x, e.y);
        const c = estado.current.lado / 2;
        const raio = Math.hypot(e.x - c, e.y - c) / c;
        const { hora: h, minuto: m } = estado.current;
        const aH = ((h % 12) + m / 60) * 30;
        const aM = m * 6;
        // perto do centro favorece o ponteiro pequeno; na borda, o grande
        const custoH = distAng(a, aH) + (raio > 0.62 ? 25 : 0);
        const custoM = distAng(a, aM) + (raio < 0.45 ? 25 : 0);
        ponteiro.current = custoH < custoM ? "hora" : "minuto";
        setMovendo(ponteiro.current);
        aplicar(a);
      })
      .onUpdate((e) => !estado.current.bloqueado && aplicar(angulo(e.x, e.y)))
      .onFinalize(() => setMovendo(null));
  }, [estado]);

  function conferir() {
    const horaOk = hora === rodada.hora;
    const minOk = minuto === rodada.minuto;
    if (horaOk && minOk) return onAcerto(`Isso! ${rodada.hora}:${doisDigitos(rodada.minuto)} no relógio.`);
    if (minOk) return onErro("O ponteiro grande (minutos) está certo! Agora ajuste o pequeno, das horas.");
    if (horaOk) return onErro("O ponteiro pequeno (horas) está certo! Agora ajuste o grande, dos minutos.");
    onErro("Ainda não. Lembre: o ponteiro grande marca os minutos e o pequeno, as horas.");
  }

  const c = lado / 2;
  const ponta = (ang: number, r: number) => ({
    x: c + r * Math.sin((ang * Math.PI) / 180),
    y: c - r * Math.cos((ang * Math.PI) / 180),
  });
  const pM = ponta(angMin, c * 0.74);
  const pH = ponta(angHora, c * 0.48);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        onLayout={(e) => setArea({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          gap: 12,
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 8,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* bilhete da agenda com o horário */}
        <View style={rl.bilhete}>
          <View style={rl.fita} />
          <Texto style={{ fontSize: 12, color: cor.pessegoEscuro, fontFamily: fonte.textoForte }}>Na agenda:</Texto>
          <Texto style={{ fontFamily: fonte.tituloForte, fontSize: 24, color: cor.tinta, lineHeight: 30 }}>
            {rodada.hora}:{doisDigitos(rodada.minuto)}
          </Texto>
        </View>

        <Animated.View
          style={[
            rl.explica,
            {
              opacity: ajuda,
              maxHeight: ajuda.interpolate({ inputRange: [0, 1], outputRange: [0, 160] }),
              paddingVertical: ajuda.interpolate({ inputRange: [0, 1], outputRange: [0, 10] }),
              borderWidth: ajuda.interpolate({ inputRange: [0, 0.05, 1], outputRange: [0, 1, 1] }),
              transform: [{ translateY: ajuda.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
            },
          ]}
        >
          <Explica cor={cor.pessego} titulo="Pequeno = horas">
            {minuto === 0 ? `Aponta para o ${hora}: ${hora} horas.` : `Passou do ${hora}: ainda são ${hora} horas.`}
          </Explica>
          <View style={{ height: 1, backgroundColor: cor.borda }} />
          <Explica cor={cor.roxo} titulo="Grande = minutos">
            {minuto === 0
              ? "No 12: 0 minutos, hora certinha."
              : `No ${minuto / 5}: ${minuto / 5} × 5 = ${minuto} minutos.`}
          </Explica>
        </Animated.View>
        <View style={{ width: lado, height: lado }}>
          <GestureDetector gesture={gesto}>
            <View collapsable={false} style={{ flex: 1 }}>
              <Svg width={lado} height={lado}>
                {/* aro de relógio de parede */}
                <Circle cx={c} cy={c} r={c - 2} fill={cor.roxo} />
                <Circle cx={c} cy={c} r={c - 9} fill={cor.tinta} />
                <Circle cx={c} cy={c} r={c - 13} fill="#FFFDF7" />
                <Circle cx={c} cy={c} r={c * 0.2} fill="none" stroke={cor.borda} strokeWidth={1} />
                {Array.from({ length: 60 }, (_, i) => {
                  const forte = i % 5 === 0;
                  const a = ponta(i * 6, c - 18);
                  const b = ponta(i * 6, c - (forte ? 30 : 23));
                  return (
                    <Line
                      key={i}
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      stroke={forte ? cor.tinta : cor.bordaForte}
                      strokeWidth={forte ? 3 : 1.5}
                      strokeLinecap="round"
                    />
                  );
                })}
                {Array.from({ length: 12 }, (_, i) => {
                  const n = i + 1;
                  const p = ponta(n * 30, c - 56);
                  return (
                    <SvgText
                      key={n}
                      x={p.x}
                      y={p.y + 7}
                      fontSize={c * 0.135}
                      fontWeight="700"
                      fill={cor.tinta}
                      textAnchor="middle"
                    >
                      {n}
                    </SvgText>
                  );
                })}
                {
                  <AnimatedG opacity={ajuda}>
                    {/* minutos percorridos desde o 12 */}
                    {minuto > 0 ? (
                      <Path
                        d={`M ${c} ${c} L ${c} ${c - (c - 34)} A ${c - 34} ${c - 34} 0 ${minuto > 30 ? 1 : 0} 1 ${ponta(angMin, c - 34).x} ${ponta(angMin, c - 34).y} Z`}
                        fill={cor.lilas}
                        opacity={0.28}
                      />
                    ) : null}
                    {/* quanto vale cada número para o ponteiro grande */}
                    {Array.from({ length: 12 }, (_, i) => {
                      const p = ponta(i * 30, c - 38);
                      return (
                        <SvgText
                          key={`m${i}`}
                          x={p.x}
                          y={p.y + 4}
                          fontSize={c * 0.075}
                          fontWeight="700"
                          fill={cor.pessegoEscuro}
                          textAnchor="middle"
                        >
                          {i * 5}
                        </SvgText>
                      );
                    })}
                  </AnimatedG>
                }
                {/* ponteiro das horas */}
                <G>
                  <Line x1={c} y1={c} x2={pH.x} y2={pH.y} stroke={cor.tinta} strokeWidth={10} strokeLinecap="round" />
                  <Circle
                    cx={pH.x}
                    cy={pH.y}
                    r={movendo === "hora" ? 14 : 10}
                    fill={cor.pessego}
                    stroke={cor.tinta}
                    strokeWidth={3}
                  />
                </G>
                {/* ponteiro dos minutos */}
                <G>
                  <Line x1={c} y1={c} x2={pM.x} y2={pM.y} stroke={cor.roxo} strokeWidth={6} strokeLinecap="round" />
                  <Circle
                    cx={pM.x}
                    cy={pM.y}
                    r={movendo === "minuto" ? 14 : 10}
                    fill={cor.roxo}
                    stroke="#fff"
                    strokeWidth={3}
                  />
                </G>
                <Circle cx={c} cy={c} r={8} fill={cor.tinta} />
                {/* etiquetas na ponta dos ponteiros */}
                {
                  <AnimatedG opacity={ajuda}>
                    <Etiqueta p={ponta(angHora, c * 0.3)} texto={`${hora} h`} fundo={cor.pessego} tinta={cor.tinta} />
                    <Etiqueta p={ponta(angMin, c * 0.55)} texto={`${minuto} min`} fundo={cor.roxo} tinta="#FFFFFF" />
                  </AnimatedG>
                }
              </Svg>
            </View>
          </GestureDetector>
        </View>

        {!dica ? (
          <View style={{ flexDirection: "row", gap: 16 }}>
            <Legenda cor={cor.pessego} texto="pequeno: horas" />
            <Legenda cor={cor.roxo} texto="grande: minutos" />
          </View>
        ) : null}
      </ScrollView>
      <Acoes>
        <Botao titulo="Conferir" onPress={conferir} disabled={bloqueado} style={{ flex: 1 }} />
      </Acoes>
    </View>
  );
}

/** Etiqueta arredondada desenhada no relógio. */
function Etiqueta({
  p,
  texto,
  fundo,
  tinta,
}: {
  p: { x: number; y: number };
  texto: string;
  fundo: string;
  tinta: string;
}) {
  const w = texto.length * 7 + 14;
  return (
    <G>
      <Rect x={p.x - w / 2} y={p.y - 11} width={w} height={22} rx={11} fill={fundo} stroke="#FFFFFF" strokeWidth={2} />
      <SvgText x={p.x} y={p.y + 4} fontSize={12} fontWeight="700" fill={tinta} textAnchor="middle">
        {texto}
      </SvgText>
    </G>
  );
}

function Explica({ cor: c, titulo, children }: { cor: string; titulo: string; children: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c }} />
      <Texto style={{ fontFamily: fonte.titulo, fontSize: 13, color: cor.tinta, width: 150 }}>{titulo}</Texto>
      <Texto style={{ flex: 1, fontSize: 13, color: cor.texto, lineHeight: 18 }}>{children}</Texto>
    </View>
  );
}

function Legenda({ cor: c, texto }: { cor: string; texto: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: c }} />
      <Texto style={{ fontSize: 13, color: cor.textoSuave }}>{texto}</Texto>
    </View>
  );
}
