import { useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from "react-native-svg";
import type { RodadaArea } from "@modolume/core";
import { useUltimo } from "@/lib/useUltimo";
import { Check } from "../Icones";
import { Botao, Texto } from "../ui";
import { cor, criarEstilos, fonte, raio } from "@/tema";
import type { PropsJogo } from "./tipos";
import { Acoes } from "./Acoes";

/**
 * Cerca da horta (área e perímetro): arrastar o dedo no terreno desenha um
 * canteiro retangular. Área = quadradinhos de dentro; perímetro = metros de
 * cerca em volta. Os dois aparecem ao vivo.
 */

type Ret = { c0: number; r0: number; c1: number; r1: number };

export function JogoArea({ rodada, onErro, onAcerto, bloqueado, dica = false }: PropsJogo<RodadaArea>) {
  const { colunas, linhas } = rodada;
  const [largura, setLargura] = useState(320);
  const [ret, setRet] = useState<Ret | null>(null);
  const t = Math.min(42, Math.floor(largura / colunas));
  const W = t * colunas;
  const H = t * linhas;
  const estado = useUltimo({ t, bloqueado });

  const inicio = useRef<{ c: number; r: number } | null>(null);
  const gesto = useMemo(() => {
    const celula = (x: number, y: number) => {
      const tt = estado.current.t;
      return {
        c: Math.max(0, Math.min(colunas - 1, Math.floor(x / tt))),
        r: Math.max(0, Math.min(linhas - 1, Math.floor(y / tt))),
      };
    };
    const atualizar = (fim: { c: number; r: number }) => {
      const i = inicio.current;
      if (!i) return;
      setRet({
        c0: Math.min(i.c, fim.c),
        r0: Math.min(i.r, fim.r),
        c1: Math.max(i.c, fim.c),
        r1: Math.max(i.r, fim.r),
      });
    };
    return Gesture.Pan()
      .runOnJS(true)
      .minDistance(0)
      .onBegin((e) => {
        if (estado.current.bloqueado) return;
        inicio.current = celula(e.x, e.y);
        atualizar(inicio.current);
      })
      .onUpdate((e) => !estado.current.bloqueado && atualizar(celula(e.x, e.y)))
      .onFinalize(() => (inicio.current = null));
  }, [colunas, linhas, estado]);

  const larg = ret ? ret.c1 - ret.c0 + 1 : 0;
  const alt = ret ? ret.r1 - ret.r0 + 1 : 0;
  const area = larg * alt;
  const perimetro = ret ? 2 * (larg + alt) : 0;

  // maior área possível com o perímetro pedido (dentro do terreno)
  const maiorPossivel = useMemo(() => {
    if (!rodada.perimetro) return 0;
    let melhor = 0;
    const meio = rodada.perimetro / 2;
    for (let x = 1; x < meio; x += 1) {
      const y = meio - x;
      const cabe = (x <= colunas && y <= linhas) || (x <= linhas && y <= colunas);
      if (cabe && Number.isInteger(y)) melhor = Math.max(melhor, x * y);
    }
    return melhor;
  }, [rodada.perimetro, colunas, linhas]);

  const areaOk = rodada.maiorArea ? area === maiorPossivel : rodada.area === undefined || area === rodada.area;
  const perimetroOk = rodada.perimetro === undefined || perimetro === rodada.perimetro;

  function conferir() {
    if (!ret) return onErro("Arraste o dedo no terreno para desenhar o canteiro.");
    if (areaOk && perimetroOk)
      return onAcerto(
        `Isso! ${larg} × ${alt} = ${area} de área, e ${larg} + ${alt} + ${larg} + ${alt} = ${perimetro} metros de cerca.`,
      );
    if (!perimetroOk)
      return onErro(`A cerca deu ${perimetro} metros, mas precisa de ${rodada.perimetro}. Conte os lados de fora.`);
    if (rodada.maiorArea)
      return onErro(`A cerca está certa, mas dá para fazer uma horta maior que ${area}. Teste outros formatos.`);
    onErro(`A área deu ${area}, mas precisa ser ${rodada.area}. Conte os quadradinhos de dentro.`);
  }

  return (
    <View style={{ flex: 1, gap: 10 }}>
      {/* placar ao vivo: área (dentro) e perímetro (cerca) */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Medida
          tipo="area"
          valor={area}
          unidade="m²"
          conta={ret ? `${larg} × ${alt}` : "toque e arraste"}
          meta={
            rodada.maiorArea ? "a maior possível" : rodada.area !== undefined ? `pedido: ${rodada.area} m²` : "livre"
          }
          ok={!!ret && areaOk}
        />
        <Medida
          tipo="perimetro"
          valor={perimetro}
          unidade="m"
          conta={ret ? `${larg} + ${alt} + ${larg} + ${alt}` : "volta toda"}
          meta={rodada.perimetro !== undefined ? `pedido: ${rodada.perimetro} m` : "livre"}
          ok={!!ret && perimetroOk}
        />
      </View>

      {/* gramado com o terreno de terra no meio */}
      <View style={{ flex: 1, justifyContent: "center", gap: 8 }}>
        <View style={a.gramado} onLayout={(e) => setLargura(e.nativeEvent.layout.width - 2 * MARGEM)}>
          <Tufos />
          <GestureDetector gesture={gesto}>
            <View collapsable={false} style={{ width: W, height: H, alignSelf: "center" }}>
              <Svg width={W} height={H}>
                {/* terra arada */}
                <Rect x={0} y={0} width={W} height={H} rx={10} fill="#E6C9A3" />
                {Array.from({ length: linhas }, (_, r) =>
                  Array.from({ length: colunas }, (_, c) => {
                    const dentro = ret && c >= ret.c0 && c <= ret.c1 && r >= ret.r0 && r <= ret.r1;
                    const x = c * t;
                    const y = r * t;
                    return (
                      <G key={`${c}-${r}`}>
                        {dentro ? <Rect x={x} y={y} width={t} height={t} fill="#C99D70" /> : null}
                        {/* sulcos da terra */}
                        <Path
                          d={`M ${x + t * 0.22} ${y + t * 0.36} q ${t * 0.14} -${t * 0.06} ${t * 0.28} 0 M ${x + t * 0.5} ${y + t * 0.7} q ${t * 0.14} -${t * 0.06} ${t * 0.28} 0`}
                          stroke={dentro ? "#B4875B" : "#D6B386"}
                          strokeWidth={1.6}
                          fill="none"
                          strokeLinecap="round"
                        />
                        {dentro ? <Alface x={x + t / 2} y={y + t / 2} t={t} /> : null}
                        {/* dica: número de cada quadradinho dentro do canteiro */}
                        {dentro && dica ? (
                          <G>
                            <Circle cx={x + 9} cy={y + 9} r={7} fill="#FFFFFF" opacity={0.9} />
                            <SvgText
                              x={x + 9}
                              y={y + 12}
                              fontSize={9}
                              fontWeight="700"
                              fill="#2E6B45"
                              textAnchor="middle"
                            >
                              {(r - ret!.r0) * larg + (c - ret!.c0) + 1}
                            </SvgText>
                          </G>
                        ) : null}
                      </G>
                    );
                  }),
                )}
                {/* linhas de 1 metro */}
                {Array.from({ length: colunas - 1 }, (_, i) => (
                  <Line
                    key={`gc${i}`}
                    x1={(i + 1) * t}
                    y1={4}
                    x2={(i + 1) * t}
                    y2={H - 4}
                    stroke="#D9B98F"
                    strokeWidth={1}
                  />
                ))}
                {Array.from({ length: linhas - 1 }, (_, i) => (
                  <Line
                    key={`gl${i}`}
                    x1={4}
                    y1={(i + 1) * t}
                    x2={W - 4}
                    y2={(i + 1) * t}
                    stroke="#D9B98F"
                    strokeWidth={1}
                  />
                ))}
                {ret ? <Cerca ret={ret} t={t} larg={larg} alt={alt} W={W} /> : null}
              </Svg>
            </View>
          </GestureDetector>
        </View>
        <Texto style={{ textAlign: "center", fontSize: 12, color: cor.textoSuave }}>
          Cada quadradinho tem 1 metro de lado. Arraste de um canto ao outro.
        </Texto>
      </View>

      <Acoes>
        <Botao titulo="Limpar" variante="secundario" onPress={() => setRet(null)} disabled={bloqueado || !ret} />
        <Botao titulo="Conferir" onPress={conferir} disabled={bloqueado} style={{ flex: 1 }} />
      </Acoes>
    </View>
  );
}

const MARGEM = 16;
const MADEIRA = "#B07A4A";
const MADEIRA_CLARA = "#D29A62";

/** Pé de alface visto de cima: folhas em volta e o miolo claro. */
function Alface({ x, y, t }: { x: number; y: number; t: number }) {
  const r = t * 0.17;
  return (
    <G>
      {[0, 72, 144, 216, 288].map((g) => {
        const a = (g * Math.PI) / 180;
        return <Circle key={g} cx={x + Math.cos(a) * r * 0.9} cy={y + Math.sin(a) * r * 0.9} r={r} fill="#6DB97A" />;
      })}
      <Circle cx={x} cy={y} r={r * 1.05} fill="#94D19B" />
      <Circle cx={x - r * 0.25} cy={y - r * 0.25} r={r * 0.4} fill="#C4E8B8" />
    </G>
  );
}

/** Cerca de madeira em volta do canteiro, com mourões a cada metro e as medidas dos lados. */
function Cerca({ ret, t, larg, alt, W }: { ret: Ret; t: number; larg: number; alt: number; W: number }) {
  const x0 = ret.c0 * t;
  const y0 = ret.r0 * t;
  const w = larg * t;
  const h = alt * t;
  const postes: { x: number; y: number }[] = [];
  for (let i = 0; i <= larg; i += 1) postes.push({ x: x0 + i * t, y: y0 }, { x: x0 + i * t, y: y0 + h });
  for (let i = 1; i < alt; i += 1) postes.push({ x: x0, y: y0 + i * t }, { x: x0 + w, y: y0 + i * t });
  // etiquetas: em cima (ou embaixo, se não couber) e do lado com mais espaço
  const cimaY = y0 > 22 ? y0 - 14 : y0 + h + 14;
  const ladoEsq = x0 > 40 || x0 + w > W - 40;
  const ladoX = ladoEsq ? x0 - 22 : x0 + w + 22;
  return (
    <G>
      {/* duas réguas de madeira */}
      <Rect x={x0} y={y0} width={w} height={h} rx={2} fill="none" stroke={MADEIRA} strokeWidth={4} />
      <Rect
        x={x0 + 4}
        y={y0 + 4}
        width={w - 8}
        height={h - 8}
        rx={2}
        fill="none"
        stroke={MADEIRA_CLARA}
        strokeWidth={1.5}
        opacity={0.8}
      />
      {postes.map((p, i) => (
        <G key={i}>
          <Rect x={p.x - 3.5} y={p.y - 3.5} width={7} height={7} rx={1.5} fill={MADEIRA} />
          <Rect x={p.x - 2} y={p.y - 2} width={4} height={2} rx={1} fill={MADEIRA_CLARA} />
        </G>
      ))}
      <Etiqueta x={x0 + w / 2} y={cimaY} texto={`${larg} m`} />
      <Etiqueta x={ladoX} y={y0 + h / 2} texto={`${alt} m`} />
    </G>
  );
}

function Etiqueta({ x, y, texto }: { x: number; y: number; texto: string }) {
  const w = texto.length * 7 + 12;
  return (
    <G>
      <Rect x={x - w / 2} y={y - 10} width={w} height={20} rx={10} fill="#FFFFFF" stroke={MADEIRA} strokeWidth={1.5} />
      <SvgText x={x} y={y + 4} fontSize={11} fontWeight="700" fill={cor.tinta} textAnchor="middle">
        {texto}
      </SvgText>
    </G>
  );
}

/** Tufos de grama e florzinhas na borda do gramado (só enfeite). */
function Tufos() {
  const [tam, setTam] = useState({ w: 0, h: 0 });
  const tufos = [
    [0.04, 0.5],
    [0.97, 0.3],
    [0.96, 0.78],
    [0.3, 0.985],
    [0.7, 0.015],
    [0.03, 0.12],
    [0.55, 0.985],
    [0.15, 0.015],
  ];
  const flores = [
    [0.025, 0.85, cor.pessego],
    [0.975, 0.55, cor.lilas],
    [0.86, 0.985, cor.pessego],
    [0.42, 0.015, cor.lilas],
  ] as const;
  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      onLayout={(e) => setTam({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
    >
      {tam.w ? (
        <Svg width={tam.w} height={tam.h}>
          {tufos.map(([fx, fy], i) => {
            const x = fx! * tam.w;
            const y = Math.min(tam.h - 3, Math.max(14, fy! * tam.h + 4));
            return (
              <Path
                key={i}
                d={`M ${x - 4} ${y} q 1 -6 -1 -9 M ${x} ${y} q 0 -7 1 -11 M ${x + 4} ${y} q 0 -5 3 -8`}
                stroke="#7DB86F"
                strokeWidth={1.8}
                fill="none"
                strokeLinecap="round"
              />
            );
          })}
          {flores.map(([fx, fy, c], i) => (
            <G key={i}>
              {[0, 90, 180, 270].map((g) => (
                <Circle
                  key={g}
                  cx={fx * tam.w + 3 * Math.cos((g * Math.PI) / 180)}
                  cy={fy * tam.h + 3 * Math.sin((g * Math.PI) / 180)}
                  r={2.4}
                  fill={c}
                />
              ))}
              <Circle cx={fx * tam.w} cy={fy * tam.h} r={1.6} fill="#FFFFFF" />
            </G>
          ))}
        </Svg>
      ) : null}
    </View>
  );
}

function Medida({
  tipo,
  valor,
  unidade,
  conta,
  meta,
  ok,
}: {
  tipo: "area" | "perimetro";
  valor: number;
  unidade: string;
  conta: string;
  meta: string;
  ok: boolean;
}) {
  const area = tipo === "area";
  return (
    <View style={[a.medida, ok && { borderColor: cor.roxo }]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {/* símbolo: quadradinhos (área) ou cerca (perímetro) */}
        <View style={[a.simbolo, { backgroundColor: area ? "#E3F3E1" : "#F6E7D6" }]}>
          <Svg width={20} height={20} viewBox="0 0 20 20">
            {area ? (
              <G>
                <Rect x={3} y={3} width={6.5} height={6.5} rx={1.5} fill="#6DB97A" />
                <Rect x={10.5} y={3} width={6.5} height={6.5} rx={1.5} fill="#6DB97A" />
                <Rect x={3} y={10.5} width={6.5} height={6.5} rx={1.5} fill="#6DB97A" />
                <Rect x={10.5} y={10.5} width={6.5} height={6.5} rx={1.5} fill="#94D19B" />
              </G>
            ) : (
              <Rect
                x={3}
                y={3}
                width={14}
                height={14}
                rx={2}
                fill="none"
                stroke={MADEIRA}
                strokeWidth={2.5}
                strokeDasharray="4 2"
              />
            )}
          </Svg>
        </View>
        <Texto style={{ fontFamily: fonte.textoForte, fontSize: 13, color: cor.textoSuave, flex: 1 }}>
          {area ? "Área" : "Perímetro"}
        </Texto>
        {ok ? (
          <View style={a.ok}>
            <Check tamanho={11} />
          </View>
        ) : null}
      </View>
      <Texto
        style={{
          fontFamily: fonte.tituloForte,
          fontSize: 26,
          color: ok ? cor.roxo : cor.tinta,
          lineHeight: 32,
          marginTop: 4,
        }}
      >
        {valor}
        <Texto style={{ fontSize: 13, color: cor.textoSuave }}> {unidade}</Texto>
      </Texto>
      <Texto style={{ fontSize: 11, color: cor.textoSuave }} numberOfLines={1}>
        {conta}
      </Texto>
      <Texto
        style={{ fontSize: 11, color: cor.pessegoEscuro, fontFamily: fonte.textoForte, marginTop: 2 }}
        numberOfLines={1}
      >
        {meta}
      </Texto>
    </View>
  );
}

const a = criarEstilos(() => ({
  medida: {
    flex: 1,
    padding: 12,
    borderRadius: raio.m,
    backgroundColor: cor.superficie,
    borderWidth: 1.5,
    borderColor: cor.borda,
  },
  simbolo: { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  gramado: {
    padding: MARGEM,
    borderRadius: 22,
    backgroundColor: "#CDE7C4",
    borderBottomWidth: 6,
    borderBottomColor: "#A9D29C",
  },
  ok: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: cor.roxo,
    alignItems: "center",
    justifyContent: "center",
  },
}));
