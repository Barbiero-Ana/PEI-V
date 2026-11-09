import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, View, type ViewInstance } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Svg, { Circle, G, Line, Path } from "react-native-svg";
import { semCollapsable } from "../Ceu";
import type { RodadaPares } from "@modolume/core";
import { embaralhar, sementeDe } from "@/lib/embaralhar";
import { Texto } from "../ui";
import { Check } from "../Icones";
import { cor, criarEstilos, ehAltoContraste, fonte, porTema } from "@/tema";
import type { PropsJogo } from "./tipos";
import { Grupo, RECIPIENTE, type Objeto } from "../cenas/Objetos";
import { useUltimo } from "@/lib/useUltimo";

/**
 * Ligue os pares (associação visual): cada grupo fica numa bandeja com
 * fileiras de 5 casinhas (como um quadro de dez), para contar de 5 em 5.
 * Puxe o barbante do pino da bandeja até a etiqueta com o número certo,
 * ou toque na bandeja e depois na etiqueta.
 */

const CORES = porTema(() => [
  { linha: cor.roxo, fundo: cor.roxoClaro },
  { linha: cor.pessegoEscuro, fundo: cor.pessegoClaro },
  { linha: cor.azulEscuro, fundo: cor.azulClaro },
  { linha: "#D9558A", fundo: "#FFE8F0" },
]);

/**
 * Bandeja de cada cenário: caixote de feira (laranjas), cartela de papelão
 * (ovos) e estacionamento de asfalto com vagas pintadas (carros).
 */
const BANDEJA = porTema(() => {
  const forte = ehAltoContraste();
  return {
    laranja: { fundo: "#FFF4EA", borda: forte ? "#9A5B22" : "#F2CFAE", casa: "#F7DCC4" },
    ovo: { fundo: "#E9D5B3", borda: forte ? "#6E4E24" : "#C9A675", casa: "#D3B88E" },
    carro: { fundo: "#535A7C", borda: forte ? "#1A1E33" : "#343950", casa: "#FFFFFF" },
  };
});

type Ret = { x: number; y: number; w: number; h: number };
type Linha = { x1: number; y1: number; x2: number; y2: number; cor: string; grupo?: number };

const AnimatedPath = Animated.createAnimatedComponent(semCollapsable(Path));
const AnimatedCircle = Animated.createAnimatedComponent(semCollapsable(Circle));

const PINO = 18;

/** Barbante curvo do pino da bandeja até a etiqueta. */
const curva = (l: Linha) => {
  const dx = Math.max(24, (l.x2 - l.x1) * 0.5);
  return `M ${l.x1} ${l.y1} C ${l.x1 + dx} ${l.y1}, ${l.x2 - dx} ${l.y2}, ${l.x2} ${l.y2}`;
};
const comprimento = (l: Linha) => Math.hypot(l.x2 - l.x1, l.y2 - l.y1) * 1.15 + 10;

function misturar(lista: number[]) {
  const base = sementeDe(lista);
  for (let k = 0; k < 50; k += 1) {
    const t = embaralhar(lista, base + k);
    if (t.every((v, i) => v !== lista[i])) return t;
  }
  return [...lista.slice(1), lista[0]!];
}

/** Lugares do quadro (completa a última fileira de 5): cavidades ou vagas pintadas. */
function Casinhas({ n, t, objeto, tinta }: { n: number; t: number; objeto: Objeto; tinta: string }) {
  const total = Math.ceil(n / 5) * 5;
  const passo = t + 3;
  const largura = Math.min(5, total) * passo - 3;
  const linhas = Math.ceil(total / 5);
  const altura = linhas * passo - 3;
  if (objeto === "carro") {
    // faixas brancas separando as vagas de cada fileira
    return (
      <Svg width={largura} height={altura} style={StyleSheet.absoluteFill}>
        {Array.from({ length: linhas }, (_, r) =>
          Array.from({ length: 6 }, (_, c) => {
            const x = Math.min(largura - 1, Math.max(1, c * passo - 1.5));
            return (
              <Line
                key={`${r}-${c}`}
                x1={x}
                x2={x}
                y1={r * passo}
                y2={r * passo + t}
                stroke={tinta}
                strokeWidth={2}
                strokeLinecap="round"
                opacity={0.85}
              />
            );
          }),
        )}
      </Svg>
    );
  }
  return (
    <Svg width={largura} height={altura} style={StyleSheet.absoluteFill}>
      {Array.from({ length: total }, (_, k) => {
        const cx = (k % 5) * passo + t / 2;
        const cy = Math.floor(k / 5) * passo + t / 2;
        return objeto === "ovo" ? (
          // cavidade da cartela: um pouco mais funda embaixo
          <G key={k}>
            <Circle cx={cx} cy={cy} r={t / 2} fill={tinta} />
            <Circle cx={cx} cy={cy + 1.5} r={t / 2 - 2.5} fill="#C7A97C" opacity={0.55} />
          </G>
        ) : (
          <Circle key={k} cx={cx} cy={cy} r={t / 2 - 1} fill={tinta} />
        );
      })}
    </Svg>
  );
}

export function JogoPares({ rodada, onErro, onAcerto, bloqueado, dica = false }: PropsJogo<RodadaPares>) {
  const numeros = useMemo(() => misturar(rodada.quantidades), [rodada.quantidades]);
  const [pares, setPares] = useState<number[]>([]);
  const [selecionado, setSelecionado] = useState<number | null>(null);
  const [viva, setViva] = useState<Linha | null>(null);
  const [sobre, setSobre] = useState<number | null>(null);
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const objeto = rodada.objeto ?? "laranja";
  const rec = RECIPIENTE[objeto];
  const bandeja = BANDEJA[objeto];
  const [area, setArea] = useState({ w: 0, h: 0 });
  // tamanho de cada objeto: 5 por fileira cabem na bandeja
  const [larguraBandeja, setLarguraBandeja] = useState(180);
  const tObjeto = Math.max(18, Math.min(30, Math.floor((larguraBandeja - 28) / 5) - 3));

  const caixa = useRef<ViewInstance>(null);
  const refs = useRef(new Map<string, ViewInstance | null>());
  const rets = useRef(new Map<string, Ret>());
  const origem = useRef({ x: 0, y: 0 });
  // diferença entre as coordenadas do dedo e as de measureInWindow (no Android,
  // com a tela de ponta a ponta, a janela não conta a barra de status)
  const ajuste = useRef({ x: 0, y: 0 });
  const estado = useUltimo({ pares, bloqueado });
  // cada par ligado ganha uma animação de "desenhar o barbante"
  const desenho = useRef(new Map<number, Animated.Value>());

  const medir = useCallback((depois?: () => void) => {
    caixa.current?.measureInWindow((x, y) => {
      origem.current = { x, y };
      let pendentes = refs.current.size;
      if (pendentes === 0) depois?.();
      for (const [k, el] of refs.current) {
        if (!el) {
          pendentes -= 1;
          continue;
        }
        el.measureInWindow((ex, ey, ew, eh) => {
          rets.current.set(k, { x: ex, y: ey, w: ew, h: eh });
          pendentes -= 1;
          if (pendentes === 0) depois?.();
        });
      }
    });
  }, []);

  /** Ponta do barbante: o pino na borda direita da bandeja e o furo da etiqueta. */
  const pontas = useCallback((grupo: number, numero: number) => {
    const a = rets.current.get(`g${grupo}`);
    const b = rets.current.get(`n${numero}`);
    const o = origem.current;
    if (!a || !b) return null;
    return { x1: a.x + a.w - o.x, y1: a.y + a.h / 2 - o.y, x2: b.x - o.x, y2: b.y + b.h / 2 - o.y };
  }, []);

  const recalcularLinhas = useCallback(() => {
    medir(() => {
      setLinhas(
        estado.current.pares.flatMap((v, i) => {
          const p = pontas(v, v);
          return p ? [{ ...p, cor: CORES[i % CORES.length]!.linha, grupo: v }] : [];
        }),
      );
    });
  }, [medir, estado, pontas]);

  useEffect(() => {
    recalcularLinhas();
  }, [pares, recalcularLinhas]);

  function ligar(grupo: number, numero: number) {
    if (bloqueado || pares.includes(grupo) || pares.includes(numero)) return;
    setSelecionado(null);
    if (grupo !== numero) {
      onErro(`Ali não tem ${numero}. Conte de novo: cada fileira cheia tem 5.`);
      return;
    }
    const v = new Animated.Value(0);
    desenho.current.set(grupo, v);
    Animated.timing(v, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    const novos = [...pares, grupo];
    setPares(novos);
    if (novos.length === rodada.quantidades.length) onAcerto("Todos os pares ligados!");
  }

  const ligarRef = useUltimo(ligar);
  const numerosRef = useUltimo(numeros);

  const numeroEm = (x: number, y: number) => {
    const px = x - ajuste.current.x;
    const py = y - ajuste.current.y;
    for (const v of numerosRef.current) {
      const r = rets.current.get(`n${v}`);
      // área de soltura um pouco maior que a etiqueta
      if (r && px >= r.x - 24 && px <= r.x + r.w + 8 && py >= r.y - 6 && py <= r.y + r.h + 6) return v;
    }
    return null;
  };

  // um gesto por grupo, criado uma vez (recriar no meio do arraste o cancelaria)
  const gestos = useMemo(
    () => new Map(rodada.quantidades.map((q) => [q, gestoDo(q)])),
    [rodada.quantidades], // eslint-disable-line react-hooks/exhaustive-deps
  );

  function gestoDo(grupo: number) {
    return Gesture.Pan()
      .runOnJS(true)
      .minDistance(4)
      .onStart((e) => {
        if (estado.current.bloqueado || estado.current.pares.includes(grupo)) return;
        const toque = { x: e.absoluteX - e.x, y: e.absoluteY - e.y };
        medir(() => {
          const a = rets.current.get(`g${grupo}`);
          if (a) ajuste.current = { x: toque.x - a.x, y: toque.y - a.y };
        });
      })
      .onUpdate((e) => {
        if (estado.current.bloqueado || estado.current.pares.includes(grupo)) return;
        const a = rets.current.get(`g${grupo}`);
        const o = origem.current;
        if (!a) return;
        setViva({
          x1: a.x + a.w - o.x,
          y1: a.y + a.h / 2 - o.y,
          x2: e.absoluteX - ajuste.current.x - o.x,
          y2: e.absoluteY - ajuste.current.y - o.y,
          cor: CORES[estado.current.pares.length % CORES.length]!.linha,
        });
        setSobre(numeroEm(e.absoluteX, e.absoluteY));
      })
      .onEnd((e) => {
        const alvo = numeroEm(e.absoluteX, e.absoluteY);
        if (alvo !== null) ligarRef.current(grupo, alvo);
      })
      .onFinalize(() => {
        setViva(null);
        setSobre(null);
      });
  }

  const corDoPar = (v: number) => {
    const i = pares.indexOf(v);
    return i >= 0 ? CORES[i % CORES.length]! : null;
  };

  return (
    <View
      ref={caixa}
      collapsable={false}
      style={{ flex: 1, justifyContent: "center" }}
      onLayout={(e) => {
        setArea({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
        recalcularLinhas();
      }}
    >
      <Svg width={area.w} height={area.h} style={[StyleSheet.absoluteFill, { zIndex: 2 }]} pointerEvents="none">
        {linhas.map((l) => {
          const v = desenho.current.get(l.grupo ?? -1);
          const len = comprimento(l);
          return (
            <AnimatedPath
              key={`l${l.grupo}`}
              d={curva(l)}
              stroke={l.cor}
              strokeWidth={4}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${len} ${len}`}
              strokeDashoffset={v ? v.interpolate({ inputRange: [0, 1], outputRange: [len, 0] }) : 0}
            />
          );
        })}
        {linhas.map((l) => {
          const v = desenho.current.get(l.grupo ?? -1);
          return (
            <AnimatedCircle
              key={`c${l.grupo}`}
              cx={l.x2}
              cy={l.y2}
              r={6}
              fill={l.cor}
              stroke="#FFFFFF"
              strokeWidth={2}
              opacity={v ?? 1}
            />
          );
        })}
        {viva ? (
          <>
            <Path d={curva(viva)} stroke={viva.cor} strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.6} />
            <Circle cx={viva.x2} cy={viva.y2} r={14} fill={viva.cor} opacity={0.16} />
            <Circle cx={viva.x2} cy={viva.y2} r={6} fill={viva.cor} stroke="#FFFFFF" strokeWidth={2} />
          </>
        ) : null}
      </Svg>

      <View style={pr.cabecalhos}>
        <Texto style={[pr.cabeca, { width: "58%" }]}>{rec.rotulo}</Texto>
        <Texto style={[pr.cabeca, { width: 92 }]}>Etiquetas</Texto>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {/* bandejas */}
        <View style={{ width: "58%", gap: 12 }} onLayout={(e) => setLarguraBandeja(e.nativeEvent.layout.width)}>
          {rodada.quantidades.map((q) => {
            const par = corDoPar(q);
            const escolhida = selecionado === q;
            const passo = tObjeto + 3;
            return (
              <GestureDetector key={q} gesture={gestos.get(q)!}>
                <Pressable
                  ref={(el) => {
                    refs.current.set(`g${q}`, el);
                  }}
                  collapsable={false}
                  onPress={() => !bloqueado && !par && setSelecionado((s) => (s === q ? null : q))}
                  accessibilityLabel={`${rec.um} ${par ? "já ligada" : ""}`}
                  style={[
                    pr.bandeja,
                    { backgroundColor: bandeja.fundo, borderColor: bandeja.borda },
                    escolhida && { borderColor: cor.roxo, borderWidth: 3 },
                    par && { borderColor: par.linha, borderWidth: 3 },
                  ]}
                >
                  <View
                    style={{
                      width: Math.min(5, Math.ceil(q / 5) * 5) * passo - 3,
                      height: Math.ceil(q / 5) * passo - 3,
                    }}
                  >
                    <Casinhas n={q} t={tObjeto} objeto={objeto} tinta={bandeja.casa} />
                    <View style={{ position: "absolute", left: 0, top: 0 }}>
                      <GrupoAlinhado n={q} objeto={objeto} t={tObjeto} numerar={dica} />
                    </View>
                  </View>
                  {/* pino de onde sai o barbante */}
                  <View pointerEvents="none" style={pr.trilhoPino}>
                    <View
                      style={[
                        pr.pino,
                        { borderColor: par?.linha ?? (escolhida ? cor.roxo : cor.bordaForte) },
                        (par || escolhida) && { backgroundColor: par?.linha ?? cor.roxo },
                      ]}
                    />
                  </View>
                </Pressable>
              </GestureDetector>
            );
          })}
        </View>

        {/* etiquetas */}
        <View style={{ width: 92, justifyContent: "space-around", gap: 12 }}>
          {numeros.map((n, i) => {
            const par = corDoPar(n);
            const alvo = sobre === n || (selecionado !== null && !par);
            return (
              <Pressable
                key={n}
                ref={(el) => {
                  refs.current.set(`n${n}`, el);
                }}
                collapsable={false}
                onPress={() => selecionado !== null && ligar(selecionado, n)}
                accessibilityLabel={`Etiqueta ${n}`}
                style={[
                  pr.etiqueta,
                  { transform: [{ rotate: i % 2 ? "2deg" : "-2deg" }] },
                  alvo && { borderColor: cor.roxo },
                  sobre === n && { backgroundColor: cor.roxoClaro, transform: [{ scale: 1.06 }] },
                  par && { borderColor: par.linha, backgroundColor: par.linha },
                ]}
              >
                <View style={[pr.furo, par && { borderColor: "#FFFFFF" }]} />
                <Texto
                  style={{
                    fontFamily: fonte.tituloForte,
                    fontSize: 30,
                    lineHeight: 40,
                    color: par ? "#FFFFFF" : cor.tinta,
                  }}
                >
                  {n}
                </Texto>
                {par ? (
                  <View style={pr.ok}>
                    <Check tamanho={10} cor={par.linha} />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>
      {/* altura fixa de duas linhas: o texto muda de tamanho e não pode empurrar o jogo (tela estável) */}
      <Texto
        numberOfLines={2}
        style={{
          fontSize: 13,
          lineHeight: 19,
          minHeight: 38,
          color: cor.textoSuave,
          textAlign: "center",
          marginTop: 16,
        }}
      >
        {selecionado !== null
          ? "Agora toque na etiqueta com o número certo."
          : `Puxe o barbante de cada ${rec.um} até a etiqueta, ou toque numa e depois na outra.`}
      </Texto>
    </View>
  );
}

/** Grupo com a última fileira alinhada à esquerda, casando com as casinhas. */
function GrupoAlinhado({
  n,
  objeto,
  t,
  numerar,
}: {
  n: number;
  objeto: RodadaPares["objeto"] & string;
  t: number;
  numerar: boolean;
}) {
  const cheias = Math.floor(n / 5) * 5;
  const resto = n - cheias;
  return (
    <View style={{ gap: 3 }}>
      {cheias > 0 ? <Grupo n={cheias} objeto={objeto} t={t} numerar={numerar} /> : null}
      {resto > 0 ? <Grupo n={resto} objeto={objeto} t={t} numerar={numerar} /> : null}
    </View>
  );
}

const pr = criarEstilos(() => ({
  cabecalhos: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  cabeca: { textAlign: "center", fontFamily: fonte.titulo, fontSize: 14, color: cor.textoSuave },
  bandeja: {
    minHeight: 68,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 16,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  trilhoPino: { position: "absolute", right: -PINO / 2, top: 0, bottom: 0, justifyContent: "center" },
  pino: {
    width: PINO,
    height: PINO,
    borderRadius: PINO / 2,
    borderWidth: 3,
    backgroundColor: cor.superficie,
  },
  etiqueta: {
    height: 64,
    borderRadius: 14,
    borderTopLeftRadius: 26,
    borderBottomLeftRadius: 26,
    borderWidth: 2.5,
    borderColor: cor.lilas,
    backgroundColor: cor.superficie,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 14,
  },
  furo: {
    position: "absolute",
    left: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: cor.lilas,
    backgroundColor: cor.fundo,
  },
  ok: {
    position: "absolute",
    right: -6,
    top: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
}));
