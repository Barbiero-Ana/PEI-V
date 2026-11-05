import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { Animated, Easing, Platform, Pressable, View } from "react-native";
import Svg, { Circle, G, Line } from "react-native-svg";
import type { Constelacao } from "@modolume/core";
import { useAcessibilidade } from "@/estado/acessibilidade";

/**
 * O céu do aluno: uma constelação com as estrelas acesas conforme os pontos.
 *
 * modo "estatico": desenho parado (cartões, miniaturas).
 * modo "vivo":     fundo cintilando e estrelas acesas pulsando (álbum, início).
 * modo "celebrar": as estrelas acendem uma a uma, as linhas se desenham,
 *                  halos pulsam e passa uma estrela cadente.
 *
 * Brilho feito com halos em camadas (sem degradê nem blur).
 */

/**
 * Na web, o Animated repassa `collapsable` ao elemento SVG e o navegador
 * reclama. Lá removemos a prop; no celular os componentes ficam intactos.
 */
export function semCollapsable<P extends object>(C: ComponentType<P>): ComponentType<P> {
  if (Platform.OS !== "web") return C;
  const Envolto = ({ collapsable: _c, ...resto }: P & { collapsable?: boolean }) => <C {...(resto as P)} />;
  return Envolto as ComponentType<P>;
}

const AnimatedCircle = Animated.createAnimatedComponent(semCollapsable(Circle));
const AnimatedLine = Animated.createAnimatedComponent(semCollapsable(Line));
const AnimatedG = Animated.createAnimatedComponent(semCollapsable(G));
const NATIVO = Platform.OS !== "web";

const CEU = "#141B57";
const ESTRELA = "#FFF6E8";
const HALO = "#FFAC7A";
const LINHA = "#C9B4FF";

type Modo = "estatico" | "vivo" | "celebrar";

function rng(semente: number) {
  let s = semente || 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function Ceu({
  constelacao,
  acesas,
  largura,
  altura,
  modo = "estatico",
  novas = 0,
  raio = 20,
  onFimCelebracao,
  onTocarEstrela,
  selecionada = null,
}: {
  constelacao: Constelacao;
  acesas: number;
  largura: number;
  altura?: number;
  modo?: Modo;
  /** Quantas das estrelas acesas são novas (piscam ao entrar). */
  novas?: number;
  raio?: number;
  onFimCelebracao?: () => void;
  /** Toque numa estrela (acesa ou não), para mostrar o nome dela. */
  onTocarEstrela?: (indice: number) => void;
  selecionada?: number | null;
}) {
  const h = altura ?? largura * 0.8;
  const total = constelacao.estrelas.length;
  const completa = acesas >= total;
  const margem = Math.min(largura, h) * 0.1;
  const px = (x: number) => margem + (x / 100) * (largura - 2 * margem);
  const py = (y: number) => margem + (y / 100) * (h - 2 * margem);
  const escala = Math.min(largura, h) / 300;

  // estrelinhas de fundo (posição fixa por constelação)
  const fundo = useMemo(() => {
    const r = rng(constelacao.id.split("").reduce((a, c) => a + c.charCodeAt(0) * 7, 3));
    return Array.from({ length: 46 }, () => ({ x: r() * largura, y: r() * h, r: 0.6 + r() * 1.3, fase: r() }));
  }, [constelacao.id, largura, h]);

  const { animacoesReduzidas } = useAcessibilidade();
  const [cintilar] = useState(() => new Animated.Value(0));
  const [entrada] = useState(() => constelacao.estrelas.map(() => new Animated.Value(modo === "celebrar" ? 0 : 1)));
  const [tracos] = useState(() => constelacao.ligacoes.map(() => new Animated.Value(modo === "celebrar" ? 0 : 1)));
  const [cadente] = useState(() => new Animated.Value(0));
  const [titulo] = useState(() => new Animated.Value(modo === "celebrar" ? 0 : 1));

  useEffect(() => {
    if (modo === "estatico" || (modo === "vivo" && animacoesReduzidas)) return;
    // o cintilar anima só a opacidade de duas camadas (no nativo, fora do JS):
    // leve mesmo com vários céus na tela
    const loops = [
      Animated.loop(
        Animated.sequence([
          Animated.timing(cintilar, {
            toValue: 1,
            duration: 2200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: NATIVO,
          }),
          Animated.timing(cintilar, {
            toValue: 0,
            duration: 2200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: NATIVO,
          }),
        ]),
      ),
    ];
    loops.forEach((l) => l.start());

    let sequencia: Animated.CompositeAnimation | null = null;
    if (modo === "celebrar") {
      sequencia = Animated.sequence([
        Animated.delay(350),
        Animated.stagger(
          260,
          entrada.map((v) => Animated.spring(v, { toValue: 1, friction: 4, tension: 70, useNativeDriver: false })),
        ),
        Animated.stagger(
          220,
          tracos.map((v) =>
            Animated.timing(v, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
          ),
        ),
        Animated.parallel([
          Animated.timing(titulo, { toValue: 1, duration: 600, useNativeDriver: false }),
          Animated.timing(cadente, {
            toValue: 1,
            duration: 1100,
            easing: Easing.in(Easing.quad),
            useNativeDriver: false,
          }),
        ]),
      ]);
      sequencia.start(({ finished }) => finished && onFimCelebracao?.());
    } else if (novas > 0) {
      // estrelas novas entram com um "pop"
      const primeiraNova = acesas - novas;
      entrada.forEach((v, i) => {
        if (i >= primeiraNova && i < acesas) {
          v.setValue(0);
          Animated.spring(v, {
            toValue: 1,
            friction: 3,
            tension: 60,
            delay: 400 + (i - primeiraNova) * 300,
            useNativeDriver: false,
          }).start();
        }
      });
    }
    return () => {
      loops.forEach((l) => l.stop());
      sequencia?.stop();
    };
  }, [modo, animacoesReduzidas]); // eslint-disable-line react-hooks/exhaustive-deps

  // quando `acesas` aumenta com a tela aberta, as novas estrelas acendem com
  // um pulo e, se a constelação fechar, as linhas se desenham uma a uma
  const acesasAntes = useRef(acesas);
  useEffect(() => {
    const antes = acesasAntes.current;
    acesasAntes.current = acesas;
    if (acesas <= antes) return;
    for (let i = antes; i < acesas; i += 1) {
      const v = entrada[i];
      if (!v) continue;
      v.setValue(0);
      Animated.spring(v, { toValue: 1, friction: 3.5, tension: 80, useNativeDriver: false }).start();
    }
    // ligações que acabaram de se formar se desenham, depois do "pulo" da estrela
    constelacao.ligacoes.forEach(([a, b], k) => {
      const formadaAgora = Math.max(a, b) >= antes && Math.max(a, b) < acesas;
      if (!formadaAgora) return;
      const v = tracos[k]!;
      v.setValue(0);
      Animated.timing(v, {
        toValue: 1,
        duration: 520,
        delay: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    });
  }, [acesas, entrada, tracos, constelacao.ligacoes]);

  const vivo = modo !== "estatico";

  return (
    <View style={{ width: largura, height: h, borderRadius: raio, overflow: "hidden", backgroundColor: CEU }}>
      {/* fundo vivo: duas camadas que se revezam no brilho */}
      {vivo
        ? [0, 1].map((camada) => (
            <Animated.View
              key={camada}
              pointerEvents="none"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                opacity: cintilar.interpolate({ inputRange: [0, 1], outputRange: camada ? [0.9, 0.3] : [0.3, 0.9] }),
              }}
            >
              <Svg width={largura} height={h}>
                {fundo
                  .filter((_, i) => i % 2 === camada)
                  .map((e, i) => (
                    <Circle key={i} cx={e.x} cy={e.y} r={e.r} fill="#FFFFFF" opacity={0.55 + e.fase * 0.45} />
                  ))}
              </Svg>
            </Animated.View>
          ))
        : null}
      <Svg width={largura} height={h} style={{ position: "absolute", left: 0, top: 0 }}>
        {/* fundo: no modo parado, todas as estrelinhas aqui */}
        {!vivo
          ? fundo.map((e, i) => (
              <Circle key={i} cx={e.x} cy={e.y} r={e.r} fill="#FFFFFF" opacity={0.25 + e.fase * 0.35} />
            ))
          : null}

        {/* desenho-guia (fraco) */}
        {constelacao.ligacoes.map(([a, b], i) => {
          const A = constelacao.estrelas[a]!;
          const B = constelacao.estrelas[b]!;
          return (
            <Line
              key={`g${i}`}
              x1={px(A.x)}
              y1={py(A.y)}
              x2={px(B.x)}
              y2={py(B.y)}
              stroke={LINHA}
              strokeOpacity={0.16}
              strokeWidth={1.2 * escala + 0.6}
              strokeDasharray="3 5"
            />
          );
        })}

        {/* linhas: aparecem quando as duas estrelas da ponta estão acesas */}
        {constelacao.ligacoes.map(([a, b], i) => {
          if (a >= acesas || b >= acesas) return null;
          // desenha da estrela acesa antes para a acesa depois
          const [ia, ib] = a < b ? [a, b] : [b, a];
          const A = constelacao.estrelas[ia]!;
          const B = constelacao.estrelas[ib]!;
          const [x1, y1, x2, y2] = [px(A.x), py(A.y), px(B.x), py(B.y)];
          const comprimento = Math.hypot(x2 - x1, y2 - y1);
          return (
            <AnimatedLine
              key={`l${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={LINHA}
              strokeOpacity={completa ? 0.85 : 0.6}
              strokeWidth={2 * escala + 0.6}
              strokeLinecap="round"
              strokeDasharray={`${comprimento} ${comprimento}`}
              strokeDashoffset={tracos[i]!.interpolate({ inputRange: [0, 1], outputRange: [comprimento, 0] })}
            />
          );
        })}

        {constelacao.estrelas.map((e, i) => {
          const x = px(e.x);
          const y = py(e.y);
          const r = (2.4 + e.brilho * 1.3) * escala + 1;
          if (i >= acesas) {
            return (
              <Circle
                key={`e${i}`}
                cx={x}
                cy={y}
                r={r * 0.7}
                fill="none"
                stroke="#FFFFFF"
                strokeOpacity={0.3}
                strokeWidth={1}
              />
            );
          }
          const v = entrada[i]!;
          const halo = r * 2.9;
          return (
            <AnimatedG key={`e${i}`} opacity={v}>
              <AnimatedCircle cx={x} cy={y} r={halo} fill={HALO} opacity={0.12} />
              <AnimatedCircle
                cx={x}
                cy={y}
                r={v.interpolate({ inputRange: [0, 1], outputRange: [0, r * 1.8] })}
                fill={HALO}
                opacity={0.22}
              />
              <AnimatedCircle
                cx={x}
                cy={y}
                r={v.interpolate({ inputRange: [0, 1], outputRange: [0, r] })}
                fill={ESTRELA}
              />
              {/* raios em cruz */}
              <Line
                x1={x - r * 2}
                y1={y}
                x2={x + r * 2}
                y2={y}
                stroke={ESTRELA}
                strokeOpacity={0.55}
                strokeWidth={0.9}
              />
              <Line
                x1={x}
                y1={y - r * 2}
                x2={x}
                y2={y + r * 2}
                stroke={ESTRELA}
                strokeOpacity={0.55}
                strokeWidth={0.9}
              />
            </AnimatedG>
          );
        })}

        {/* estrela tocada: anel em volta */}
        {selecionada !== null && constelacao.estrelas[selecionada] ? (
          <AnimatedCircle
            cx={px(constelacao.estrelas[selecionada]!.x)}
            cy={py(constelacao.estrelas[selecionada]!.y)}
            r={16 * escala + 9}
            fill="none"
            stroke={HALO}
            strokeWidth={2}
            strokeDasharray="4 4"
          />
        ) : null}

        {/* estrela cadente (celebração) */}
        {modo === "celebrar" ? (
          <AnimatedG opacity={cadente.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 1, 1, 0] })}>
            <AnimatedLine
              x1={cadente.interpolate({ inputRange: [0, 1], outputRange: [largura * 0.15, largura * 0.85] })}
              y1={cadente.interpolate({ inputRange: [0, 1], outputRange: [h * 0.08, h * 0.32] })}
              x2={cadente.interpolate({ inputRange: [0, 1], outputRange: [largura * 0.05, largura * 0.75] })}
              y2={cadente.interpolate({ inputRange: [0, 1], outputRange: [h * 0.04, h * 0.28] })}
              stroke="#FFFFFF"
              strokeWidth={2}
              strokeLinecap="round"
            />
          </AnimatedG>
        ) : null}
      </Svg>

      {/* áreas de toque das estrelas (maiores que o desenho, para o dedo) */}
      {onTocarEstrela
        ? constelacao.estrelas.map((e, i) => {
            const r = Math.max(20, 22 * escala);
            return (
              <Pressable
                key={`t${i}`}
                onPress={() => onTocarEstrela(i)}
                accessibilityRole="button"
                accessibilityLabel={e.nome ?? `Estrela ${i + 1}`}
                style={{
                  position: "absolute",
                  left: px(e.x) - r,
                  top: py(e.y) - r,
                  width: r * 2,
                  height: r * 2,
                  borderRadius: r,
                }}
              />
            );
          })
        : null}
    </View>
  );
}
