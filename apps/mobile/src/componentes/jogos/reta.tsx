import { useMemo, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from "react-native-svg";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import type { RodadaReta } from "@modolume/core";
import { Botao, Texto } from "../ui";
import { cor, criarEstilos, fonte, raio } from "@/tema";
import type { PropsJogo } from "./tipos";
import { useUltimo } from "@/lib/useUltimo";
import { Acoes } from "./Acoes";

/**
 * Reta numérica (manipulação): só as pontas têm número. O aluno arrasta o
 * marcador (ou toca na reta) e ajusta com − / +; precisa contar as marquinhas.
 */

const MARGEM = 22;
const ALTURA = 170;

type Tema = NonNullable<RodadaReta["tema"]>;

/** Cenário atrás da reta: chão, céu e o que fica em cada ponta. */
function Cenario({ tema, w, x0, x1 }: { tema: Tema; w: number; x0: number; x1: number }) {
  const H = ALTURA;
  switch (tema) {
    case "estrada":
      return (
        <G>
          <Rect x={0} y={0} width={w} height={H} fill="#EAF7FF" />
          <Path d={`M 0 98 Q ${w * 0.25} 74 ${w * 0.5} 94 T ${w} 90 V ${H} H 0 Z`} fill="#DDEFE4" />
          <Rect x={0} y={100} width={w} height={34} fill="#CFD2E4" />
          <Line x1={0} y1={101} x2={w} y2={101} stroke="#FFFFFF" strokeWidth={2} />
          <Line x1={0} y1={133} x2={w} y2={133} stroke="#FFFFFF" strokeWidth={2} />
          {/* casa no começo, guarda-sol da praia no fim */}
          <G transform={`translate(${x0 - 10} 70)`}>
            <Path d="M 0 12 L 10 3 L 20 12 V 26 H 0 Z" fill={cor.lilas} />
            <Path d="M -2 13 L 10 2 L 22 13" stroke={cor.roxo} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
            <Rect x={8} y={17} width={5} height={9} fill={cor.roxo} />
          </G>
          <G transform={`translate(${x1 - 12} 66)`}>
            <Path d="M 0 12 Q 12 -2 24 12 Z" fill={cor.pessego} />
            <Line x1={12} y1={12} x2={12} y2={32} stroke={cor.tinta} strokeWidth={2} />
            <Path d="M -4 32 Q 12 26 28 32 Z" fill="#FFE3B8" />
          </G>
        </G>
      );
    case "regua":
      return (
        <G>
          <Rect x={0} y={0} width={w} height={H} fill="#F7F6FD" />
          <Rect
            x={x0 - 14}
            y={96}
            width={x1 - x0 + 28}
            height={46}
            rx={5}
            fill="#FFE9C4"
            stroke="#E9C58C"
            strokeWidth={1.5}
          />
          <Rect x={x0 - 14} y={96} width={x1 - x0 + 28} height={4} rx={2} fill="#F6D9A6" />
        </G>
      );
    case "trilha":
      return (
        <G>
          <Rect x={0} y={0} width={w} height={H} fill="#F2F8F4" />
          {Array.from({ length: Math.ceil(w / 54) }, (_, i) => (
            <G key={i} transform={`translate(${i * 54 + 18} ${i % 2 ? 22 : 30})`} opacity={0.55}>
              <Rect x={-2} y={18} width={4} height={12} fill="#B48A5E" />
              <Circle cx={0} cy={12} r={12} fill="#A9D8B8" />
            </G>
          ))}
          <Rect x={0} y={104} width={w} height={28} fill="#EAD7BF" />
          <G transform={`translate(${x1 - 2} 64)`}>
            <Line x1={0} y1={0} x2={0} y2={40} stroke={cor.tinta} strokeWidth={2.5} />
            <Path d="M 0 0 L 18 6 L 0 12 Z" fill={cor.pessego} />
          </G>
        </G>
      );
    case "corrida":
      return (
        <G>
          <Rect x={0} y={0} width={w} height={H} fill="#F5F0FF" />
          <Rect x={0} y={110} width={w} height={H - 110} fill="#DDEFE4" />
          <Line x1={x0} y1={96} x2={x0} y2={140} stroke="#FFFFFF" strokeWidth={4} />
          {/* bandeira de chegada xadrez */}
          <G transform={`translate(${x1 - 2} 62)`}>
            <Line x1={0} y1={0} x2={0} y2={44} stroke={cor.tinta} strokeWidth={2.5} />
            {[0, 1, 2].map((l) =>
              [0, 1, 2].map((c) => (
                <Rect
                  key={`${l}${c}`}
                  x={c * 6}
                  y={l * 5}
                  width={6}
                  height={5}
                  fill={(l + c) % 2 ? "#FFFFFF" : cor.tinta}
                />
              )),
            )}
          </G>
        </G>
      );
  }
}

/** O que está andando na reta (desenho branco dentro do marcador). */
function Viajante({ tema }: { tema: Tema }) {
  return (
    <Svg width={26} height={26} viewBox="0 0 26 26">
      {tema === "estrada" ? (
        <G>
          <Path d="M 4 15 L 7 9 C 7.5 8 8.5 7.5 9.5 7.5 L 16.5 7.5 C 17.5 7.5 18.5 8 19 9 L 22 15 Z" fill="#FFFFFF" />
          <Rect x={2} y={14} width={22} height={6} rx={2} fill="#FFFFFF" />
          <Circle cx={7.5} cy={20.5} r={2.6} fill={cor.tinta} />
          <Circle cx={18.5} cy={20.5} r={2.6} fill={cor.tinta} />
        </G>
      ) : tema === "regua" ? (
        <G transform="rotate(-45 13 13)">
          <Rect x={9} y={2} width={8} height={16} fill="#FFFFFF" />
          <Path d="M 9 18 L 13 25 L 17 18 Z" fill="#FFE3B8" />
          <Path d="M 12 23 L 13 25 L 14 23 Z" fill={cor.tinta} />
        </G>
      ) : tema === "trilha" ? (
        <G fill="#FFFFFF">
          <Path d="M 7 4 C 10 4 11 8 10 12 C 9 15 5 15 5 11 C 5 8 5 4 7 4 Z" />
          <Circle cx={7.5} cy={17} r={2.5} />
          <Path d="M 18 9 C 21 9 22 13 21 17 C 20 20 16 20 16 16 C 16 13 16 9 18 9 Z" />
          <Circle cx={18.5} cy={22} r={2.5} />
        </G>
      ) : (
        <G>
          <Circle cx={13} cy={6} r={4} fill="#FFFFFF" />
          <Path d="M 6 12 C 6 10 20 10 20 12 L 21 23 C 21 25 5 25 5 23 Z" fill="#FFE3B8" />
          <Path d="M 6 13 C 10 15 16 15 20 13" stroke="#E9C58C" strokeWidth={1.5} fill="none" />
        </G>
      )}
    </Svg>
  );
}

export function JogoReta({ rodada, onErro, onAcerto, bloqueado, dica = false }: PropsJogo<RodadaReta>) {
  const { min, max, passo, alvo } = rodada;
  const [largura, setLargura] = useState(300);
  const [valor, setValor] = useState(min);
  const [arrastando, setArrastando] = useState(false);
  const [errado, setErrado] = useState<number | null>(null);
  // posição animada do marcador, em unidades da reta (desliza e encaixa)
  const [posicao] = useState(() => new Animated.Value(min));
  const ref = useUltimo({ largura, bloqueado });

  const marcas = Math.round((max - min) / passo);
  const util = Math.max(1, largura - 2 * MARGEM);
  const px = (v: number) => MARGEM + ((v - min) / (max - min)) * util;
  const ajustar = (v: number) => Math.min(max, Math.max(min, Math.round((v - min) / passo) * passo + min));
  const escrever = (v: number) =>
    passo < 1 ? String(Math.round(v * 100) / 100).replace(".", ",") : String(Math.round(v));
  const textoAlvo = rodada.rotulo ?? String(alvo);
  const unidade = rodada.unidade ? ` ${rodada.unidade}` : "";
  const tema: Tema = rodada.tema ?? "regua";
  const grandeCada = marcas >= 10 ? 5 : marcas >= 8 ? 2 : 1;

  const encaixar = (v: number) => {
    setValor(v);
    Animated.spring(posicao, { toValue: v, friction: 6, tension: 140, useNativeDriver: false }).start();
  };

  const gesto = useMemo(() => {
    const emX = (x: number) => {
      const u = Math.max(1, ref.current.largura - 2 * MARGEM);
      return min + Math.max(0, Math.min(1, (x - MARGEM) / u)) * (max - min);
    };
    const pan = Gesture.Pan()
      .runOnJS(true)
      .minDistance(0)
      .onBegin((e) => {
        if (ref.current.bloqueado) return;
        setArrastando(true);
        setErrado(null);
        const v = emX(e.x);
        posicao.setValue(v);
        setValor(v);
      })
      .onUpdate((e) => {
        if (ref.current.bloqueado) return;
        const v = emX(e.x);
        posicao.setValue(v);
        setValor(v);
      })
      .onFinalize(() => {
        setArrastando(false);
        setValor((v) => {
          const certo = ajustar(v);
          Animated.spring(posicao, { toValue: certo, friction: 6, tension: 140, useNativeDriver: false }).start();
          return certo;
        });
      });
    return pan;
  }, [min, max, passo]); // eslint-disable-line react-hooks/exhaustive-deps

  function conferir() {
    const v = ajustar(valor);
    if (Math.abs(v - alvo) < passo / 2) return onAcerto(`Isso! O ${textoAlvo} fica exatamente aí.`);
    setErrado(v);
    onErro(`Você marcou o ${escrever(v)}. Conte de novo as marquinhas a partir do ${min}.`);
  }

  const mexer = (d: number) => {
    setErrado(null);
    encaixar(ajustar(ajustar(valor) + d * passo));
  };

  const xMarcador = posicao.interpolate({
    inputRange: [min, max],
    outputRange: [MARGEM, MARGEM + util],
    extrapolate: "clamp",
  });
  const passos = Math.round((ajustar(valor) - min) / passo);

  return (
    <View style={{ flex: 1, gap: 14 }}>
      {/* margem automática: centraliza o conteúdo acima dos botões */}
      <View style={{ marginTop: "auto" }} />
      <View style={r.placa}>
        <View style={r.parafuso} />
        {rodada.esconderAlvo && !bloqueado ? (
          <Texto style={{ fontFamily: fonte.titulo, fontSize: 17, color: cor.roxo, lineHeight: 36 }}>
            Calcule e leve o marcador até a resposta
          </Texto>
        ) : (
          <>
            <Texto style={{ fontSize: 14, color: cor.textoSuave }}>Leve o marcador até o</Texto>
            <Texto style={{ fontFamily: fonte.tituloForte, fontSize: 30, color: cor.roxo, lineHeight: 36 }}>
              {textoAlvo}
              <Texto style={{ fontFamily: fonte.titulo, fontSize: 16, color: cor.roxo }}>{unidade}</Texto>
            </Texto>
          </>
        )}
        <View style={[r.parafuso, { left: undefined, right: 8 }]} />
      </View>

      <GestureDetector gesture={gesto}>
        <View style={r.area} onLayout={(e) => setLargura(e.nativeEvent.layout.width)} collapsable={false}>
          <Svg width={largura} height={ALTURA} style={StyleSheet.absoluteFill} pointerEvents="none">
            <Cenario tema={tema} w={largura} x0={px(min)} x1={px(max)} />
            {/* dica: saltinhos de marquinha em marquinha, numerados */}
            {dica
              ? Array.from({ length: passos }, (_, k) => {
                  const xa = px(min + k * passo);
                  const xb = px(min + (k + 1) * passo);
                  const meio = (xa + xb) / 2;
                  const altura = Math.min(22, (xb - xa) * 0.7);
                  return (
                    <G key={k}>
                      <Path
                        d={`M ${xa} 112 Q ${meio} ${112 - altura * 2} ${xb} 112`}
                        stroke={cor.roxo}
                        strokeWidth={2}
                        fill="none"
                        strokeDasharray="3 3"
                      />
                      <SvgText
                        x={meio}
                        y={112 - altura - 4}
                        fontSize={10}
                        fontWeight="700"
                        fill={cor.roxo}
                        textAnchor="middle"
                      >
                        {k + 1}
                      </SvgText>
                    </G>
                  );
                })
              : null}
          </Svg>
          <View style={[r.reta, { left: MARGEM - 8, right: MARGEM - 14 }]} />
          {/* trecho já percorrido */}
          <Animated.View
            pointerEvents="none"
            style={[r.percorrido, { left: MARGEM, width: Animated.add(xMarcador, -MARGEM) }]}
          />
          {Array.from({ length: marcas + 1 }, (_, i) => {
            const v = min + i * passo;
            // com negativos, o zero também ganha número: é a referência para contar
            const ponta = i === 0 || i === marcas || (min < 0 && Math.abs(v) < passo / 2);
            const grande = ponta || i % grandeCada === 0;
            const revelado = bloqueado && Math.abs(v - alvo) < passo / 2;
            const marcouErrado = errado !== null && Math.abs(v - errado) < passo / 2;
            return (
              <View
                key={i}
                style={[
                  r.marca,
                  { left: px(v) - 1.5, height: ponta ? 30 : grande ? 24 : 16, top: ponta ? 101 : grande ? 104 : 108 },
                ]}
              >
                {ponta || revelado || marcouErrado ? (
                  <Texto
                    style={[
                      r.rotulo,
                      {
                        color: revelado ? cor.roxo : marcouErrado ? cor.pessegoEscuro : cor.tinta,
                        top: ponta ? 34 : 28,
                      },
                    ]}
                  >
                    {ponta ? String(v) : escrever(v)}
                  </Texto>
                ) : null}
              </View>
            );
          })}
          {/* marcador */}
          <Animated.View
            pointerEvents="none"
            style={[
              r.marcador,
              { transform: [{ translateX: Animated.add(xMarcador, -24) }, { scale: arrastando ? 1.12 : 1 }] },
            ]}
          >
            <View style={[r.cabeca, { backgroundColor: bloqueado ? cor.roxo : cor.pessegoEscuro }]}>
              {bloqueado ? (
                <Texto style={{ fontFamily: fonte.titulo, color: "#fff", fontSize: 13 }}>{textoAlvo}</Texto>
              ) : (
                <Viajante tema={tema} />
              )}
            </View>
            <View style={{ width: 4, height: 26, backgroundColor: bloqueado ? cor.roxo : cor.pessegoEscuro }} />
            <View style={[r.pe, { backgroundColor: bloqueado ? cor.roxo : cor.pessegoEscuro }]} />
          </Animated.View>
        </View>
      </GestureDetector>

      <Texto style={{ fontSize: 13, color: cor.textoSuave, textAlign: "center" }}>
        Entre o {min} e o {max} há {marcas} espaços iguais{dica ? `. Você andou ${passos}.` : "."}
      </Texto>
      <Acoes>
        <Botao
          titulo="−"
          variante="secundario"
          onPress={() => mexer(-1)}
          disabled={bloqueado}
          style={{ width: 56 }}
          accessibilityLabel="Mover para a esquerda"
        />
        <Botao
          titulo="+"
          variante="secundario"
          onPress={() => mexer(1)}
          disabled={bloqueado}
          style={{ width: 56 }}
          accessibilityLabel="Mover para a direita"
        />
        <Botao titulo="Conferir" onPress={conferir} disabled={bloqueado} style={{ flex: 1 }} />
      </Acoes>
    </View>
  );
}

const r = criarEstilos(() => ({
  placa: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: cor.superficie,
    borderWidth: 2,
    borderColor: cor.lilas,
  },
  parafuso: {
    position: "absolute",
    left: 8,
    top: "50%",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: cor.lilas,
    marginTop: -3,
  },
  area: {
    height: ALTURA,
    borderRadius: raio.g,
    borderWidth: 1,
    borderColor: cor.borda,
    backgroundColor: cor.fundo,
    overflow: "hidden",
  },
  reta: { position: "absolute", top: 114, height: 5, borderRadius: 3, backgroundColor: cor.tinta },
  percorrido: { position: "absolute", top: 113, height: 7, borderRadius: 4, backgroundColor: cor.pessego },
  marca: { position: "absolute", width: 3, borderRadius: 2, backgroundColor: cor.tinta },
  rotulo: { position: "absolute", width: 40, left: -18, textAlign: "center", fontFamily: fonte.titulo, fontSize: 16 },
  marcador: { position: "absolute", left: 0, top: 30, width: 48, alignItems: "center" },
  pe: { width: 12, height: 4, borderRadius: 2, marginTop: -1 },
  cabeca: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: cor.superficie,
    alignItems: "center",
    justifyContent: "center",
  },
}));
