import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Animated, View, type StyleProp, type ViewInstance, type ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useUltimo } from "@/lib/useUltimo";

/**
 * Arrastar-e-soltar nativo (dedo, mouse e caneta).
 *
 * <AreaArraste>  envolve a tela do jogo e desenha o "fantasma" que segue o dedo.
 * <ZonaSoltura id="..."> é um destino; acende quando o dedo passa por cima.
 * <Arrastavel onSoltar onToque> é o item. Um toque sem arrastar chama onToque
 * (alternativa para quem tem dificuldade de arrastar).
 */

interface Retangulo {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Contexto {
  registrar: (id: string, ref: React.RefObject<ViewInstance | null>) => () => void;
  iniciar: (f: {
    conteudo: ReactNode;
    item: ViewInstance | null;
    w: number;
    h: number;
    x: number;
    y: number;
    dx: number;
    dy: number;
  }) => void;
  mover: (x: number, y: number) => void;
  terminar: (x: number, y: number) => string | null;
  sobre: string | null;
}

const Ctx = createContext<Contexto | null>(null);

const dentro = (r: Retangulo, x: number, y: number, folga = 0) =>
  x >= r.x - folga && x <= r.x + r.w + folga && y >= r.y - folga && y <= r.y + r.h + folga;

/** Tolerância em volta de cada destino: soltar "quase em cima" também vale. */
const FOLGA = 18;

export function AreaArraste({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const area = useRef<ViewInstance>(null);
  const zonas = useRef(new Map<string, React.RefObject<ViewInstance | null>>());
  const retangulos = useRef(new Map<string, Retangulo>());
  const origem = useRef({ x: 0, y: 0 });
  const deslocamento = useRef({ dx: 0, dy: 0 });
  const peca = useRef({ w: 0, h: 0 });
  // diferença entre as coordenadas do dedo e as de measureInWindow (no Android,
  // com a tela de ponta a ponta, a janela não conta a barra de status)
  const ajuste = useRef({ x: 0, y: 0 });
  const [posicao] = useState(() => new Animated.ValueXY({ x: 0, y: 0 }));
  const [fantasma, setFantasma] = useState<{ conteudo: ReactNode; w: number; h: number } | null>(null);
  const [sobre, setSobre] = useState<string | null>(null);
  const sobreRef = useRef<string | null>(null);

  /**
   * Destino sob a peça arrastada. Vale o centro da peça (é para ela que a
   * criança olha ao mirar), com uma folga em volta; se houver mais de um,
   * fica o mais próximo. O dedo exatamente em cima de um destino também vale.
   */
  const alvoEm = useCallback((x: number, y: number) => {
    const px = x - ajuste.current.x;
    const py = y - ajuste.current.y;
    const cx = px - deslocamento.current.dx + peca.current.w / 2;
    const cy = py - deslocamento.current.dy + peca.current.h / 2;
    let melhor: string | null = null;
    let menor = Infinity;
    for (const [id, r] of retangulos.current) {
      if (!dentro(r, cx, cy, FOLGA) && !dentro(r, px, py)) continue;
      const d = Math.hypot(r.x + r.w / 2 - cx, r.y + r.h / 2 - cy);
      if (d < menor) {
        menor = d;
        melhor = id;
      }
    }
    return melhor;
  }, []);

  const valor = useMemo<Contexto>(
    () => ({
      sobre,
      registrar(id, ref) {
        zonas.current.set(id, ref);
        return () => {
          zonas.current.delete(id);
          retangulos.current.delete(id);
        };
      },
      iniciar({ conteudo, item, w, h, x, y, dx, dy }) {
        // mede tudo no início do arraste (a tela pode ter mudado desde a última vez)
        retangulos.current.clear();
        for (const [id, ref] of zonas.current) {
          ref.current?.measureInWindow((zx, zy, zw, zh) => retangulos.current.set(id, { x: zx, y: zy, w: zw, h: zh }));
        }
        item?.measureInWindow((ix, iy) => {
          ajuste.current = { x: x - dx - ix, y: y - dy - iy };
          area.current?.measureInWindow((ax, ay) => {
            origem.current = { x: ax + ajuste.current.x, y: ay + ajuste.current.y };
            posicao.setValue({ x: x - dx - origem.current.x, y: y - dy - origem.current.y });
          });
        });
        deslocamento.current = { dx, dy };
        peca.current = { w, h };
        posicao.setValue({ x: x - dx - origem.current.x, y: y - dy - origem.current.y });
        setFantasma({ conteudo, w, h });
      },
      mover(x, y) {
        posicao.setValue({
          x: x - deslocamento.current.dx - origem.current.x,
          y: y - deslocamento.current.dy - origem.current.y,
        });
        const alvo = alvoEm(x, y);
        if (alvo !== sobreRef.current) {
          sobreRef.current = alvo;
          setSobre(alvo);
        }
      },
      terminar(x, y) {
        const alvo = alvoEm(x, y);
        sobreRef.current = null;
        setSobre(null);
        setFantasma(null);
        return alvo;
      },
    }),
    [sobre, alvoEm, posicao],
  );

  return (
    <Ctx.Provider value={valor}>
      <View ref={area} style={[{ flex: 1 }, style]} collapsable={false}>
        {children}
        {fantasma ? (
          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: fantasma.w,
              height: fantasma.h,
              zIndex: 100,
              elevation: 12,
              transform: [...posicao.getTranslateTransform(), { scale: 1.06 }, { rotate: "-3deg" }],
            }}
          >
            {fantasma.conteudo}
          </Animated.View>
        ) : null}
      </View>
    </Ctx.Provider>
  );
}

function useArea() {
  const c = useContext(Ctx);
  if (!c) throw new Error("Use dentro de <AreaArraste>.");
  return c;
}

export function ZonaSoltura({
  id,
  children,
  style,
  estiloAtivo,
  desativada = false,
}: {
  id: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  estiloAtivo?: StyleProp<ViewStyle>;
  desativada?: boolean;
}) {
  const ctx = useArea();
  const ref = useRef<ViewInstance>(null);
  useEffect(() => (desativada ? undefined : ctx.registrar(id, ref)), [id, desativada]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <View ref={ref} collapsable={false} style={[style, ctx.sobre === id && estiloAtivo]}>
      {children}
    </View>
  );
}

/** Indica se algum arraste está sobre a zona `id` (para destaques customizados). */
export function useSobre() {
  return useArea().sobre;
}

export function Arrastavel({
  children,
  fantasma,
  onSoltar,
  onToque,
  desabilitado = false,
  style,
}: {
  children: ReactNode;
  /** O que segue o dedo (padrão: o próprio conteúdo). */
  fantasma?: ReactNode;
  onSoltar: (alvo: string | null) => void;
  onToque?: () => void;
  desabilitado?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const ctx = useArea();
  const tamanho = useRef({ w: 0, h: 0 });
  const eu = useRef<ViewInstance>(null);
  const [arrastando, setArrastando] = useState(false);
  const cb = useUltimo({ onSoltar, onToque, conteudo: fantasma ?? children, ctx });

  const gesto = useMemo(() => {
    const pan = Gesture.Pan()
      .runOnJS(true)
      .enabled(!desabilitado)
      .minDistance(4)
      .onStart((e) => {
        setArrastando(true);
        cb.current.ctx.iniciar({
          conteudo: cb.current.conteudo,
          item: eu.current,
          w: tamanho.current.w,
          h: tamanho.current.h,
          x: e.absoluteX,
          y: e.absoluteY,
          dx: e.x,
          dy: e.y,
        });
      })
      .onUpdate((e) => cb.current.ctx.mover(e.absoluteX, e.absoluteY))
      .onEnd((e) => cb.current.onSoltar(cb.current.ctx.terminar(e.absoluteX, e.absoluteY)))
      .onFinalize(() => setArrastando(false));
    const tap = Gesture.Tap()
      .runOnJS(true)
      .enabled(!desabilitado)
      .onEnd((_e, ok) => {
        if (ok) cb.current.onToque?.();
      });
    return Gesture.Race(pan, tap);
  }, [desabilitado, cb]);

  return (
    <GestureDetector gesture={gesto}>
      <View
        ref={eu}
        collapsable={false}
        onLayout={(e) => (tamanho.current = { w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
        style={[style, arrastando && { opacity: 0.25 }]}
      >
        {children}
      </View>
    </GestureDetector>
  );
}
