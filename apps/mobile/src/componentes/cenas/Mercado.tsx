import { useEffect, useState } from "react";
import { Animated, Easing, Platform, View } from "react-native";
import Svg, { Circle, Ellipse, G, Line, Path, Rect, Text as SvgText } from "react-native-svg";
import { Texto } from "../ui";
import { cor, criarEstilos, fonte } from "@/tema";
import type { RodadaDinheiro } from "@modolume/core";

/**
 * Cena do caixa do mercadinho: prateleiras com produtos variados ao fundo, a
 * atendente de avental atrás do balcão, caixa registradora com visor
 * (TOTAL / PAGO) e o produto chegando pela esteira. A fala do atendente aparece num balão por cima da cena.
 */

export type Humor = "esperando" | "pensando" | "feliz";
export type ItemMercado = RodadaDinheiro["item"];

/** Uma linha do visor do caixa. */
export type LinhaVisor = { rotulo: string; valor: number };

const L = 360; // largura do desenho (viewBox)
const A = 170; // altura do desenho

const PELE = "#E2AE87";
const CABELO = "#2B2350";
const NATIVO = Platform.OS !== "web";

const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;
const fmtCurto = (v: number) => (Number.isInteger(v) ? `R$ ${v}` : fmt(v));

export function CenaCaixa({
  largura,
  item,
  preco,
  visor,
  certo,
  humor,
  fala,
}: {
  largura: number;
  item: ItemMercado;
  preco: number;
  /** Duas linhas do visor (ex.: TOTAL e PAGO, ou RECEBIDO e TROCO). */
  visor: [LinhaVisor, LinhaVisor];
  /** A segunda linha fica verde quando o valor está certo. */
  certo: boolean;
  humor: Humor;
  fala: string;
}) {
  const k = largura / L;
  const altura = A * k;

  // produto desliza pela esteira até o caixa
  const [chegada] = useState(() => new Animated.Value(0));
  // balão "pula" a cada fala nova
  const [balao] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(chegada, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: NATIVO,
    }).start();
  }, [chegada]);

  useEffect(() => {
    balao.setValue(0);
    Animated.spring(balao, { toValue: 1, friction: 5, tension: 120, useNativeDriver: NATIVO }).start();
  }, [fala, balao]);

  return (
    <View style={{ width: largura, height: altura, borderRadius: 18, overflow: "hidden", backgroundColor: "#EDE9FA" }}>
      <Svg width={largura} height={altura} viewBox={`0 0 ${L} ${A}`}>
        <Fundo />
        <Atendente humor={humor} />
        <Balcao />
        <Maos />
        <Registradora visor={visor} certo={certo} />
      </Svg>

      {/* produto na esteira */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 150 * k,
          top: 70 * k,
          width: 48 * k,
          height: 50 * k,
          opacity: chegada,
          transform: [{ translateX: chegada.interpolate({ inputRange: [0, 1], outputRange: [-40 * k, 0] }) }],
        }}
      >
        <Produto item={item} tamanho={48 * k} />
        <View style={[m.etiqueta, { top: 28 * k, right: -26 * k }]}>
          <Texto style={{ fontFamily: fonte.titulo, fontSize: Math.max(10, 11 * k), color: cor.tinta, lineHeight: 14 }}>
            {fmtCurto(preco)}
          </Texto>
        </View>
      </Animated.View>

      {/* balão de fala */}
      <Animated.View
        pointerEvents="none"
        style={[
          m.balao,
          {
            left: 104 * k,
            top: 10 * k,
            width: 118 * k,
            opacity: balao,
            transform: [{ scale: balao.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
          },
          humor === "feliz" && { borderColor: cor.roxo },
        ]}
      >
        <View style={m.rabo} />
        <Texto style={[m.fala, { fontSize: Math.max(11, 12.5 * k) }]}>{fala}</Texto>
      </Animated.View>
    </View>
  );
}

type TipoProduto = "caixa" | "lata" | "garrafa" | "pote" | "saco";

/** Produto de prateleira desenhado com a base em (x, y). */
function ProdutoPrateleira({ x, y, tipo, tinta }: { x: number; y: number; tipo: TipoProduto; tinta: string }) {
  switch (tipo) {
    case "caixa":
      return (
        <G>
          <Rect x={x} y={y - 24} width={16} height={24} rx={1.5} fill={tinta} />
          <Rect x={x} y={y - 24} width={16} height={4} rx={1.5} fill="#FFFFFF" opacity={0.35} />
          <Rect x={x + 3} y={y - 15} width={10} height={6} rx={1} fill="#FFFFFF" opacity={0.85} />
        </G>
      );
    case "lata":
      return (
        <G>
          <Rect x={x} y={y - 16} width={12} height={16} rx={2} fill={tinta} />
          <Ellipse cx={x + 6} cy={y - 16} rx={6} ry={1.8} fill="#FFFFFF" opacity={0.55} />
          <Rect x={x} y={y - 11} width={12} height={5} fill="#FFFFFF" opacity={0.8} />
        </G>
      );
    case "garrafa":
      return (
        <G>
          <Path
            d={`M ${x + 3} ${y} L ${x + 3} ${y - 15} C ${x + 3} ${y - 19} ${x + 4.5} ${y - 20} ${x + 4.5} ${y - 23} L ${x + 7.5} ${y - 23} C ${x + 7.5} ${y - 20} ${x + 9} ${y - 19} ${x + 9} ${y - 15} L ${x + 9} ${y} Z`}
            fill={tinta}
          />
          <Rect x={x + 4.2} y={y - 26} width={3.6} height={3.5} rx={1} fill={cor.tinta} opacity={0.7} />
          <Rect x={x + 3} y={y - 11} width={6} height={5} fill="#FFFFFF" opacity={0.8} />
        </G>
      );
    case "pote":
      return (
        <G>
          <Rect x={x} y={y - 14} width={16} height={14} rx={3.5} fill={tinta} />
          <Rect x={x - 1} y={y - 17} width={18} height={4} rx={1.5} fill={cor.tinta} opacity={0.65} />
          <Circle cx={x + 8} cy={y - 7} r={3.5} fill="#FFFFFF" opacity={0.8} />
        </G>
      );
    default:
      return (
        <G>
          <Path
            d={`M ${x} ${y} C ${x - 1} ${y - 10} ${x + 1} ${y - 17} ${x + 2} ${y - 20} L ${x + 16} ${y - 20} C ${x + 17} ${y - 17} ${x + 19} ${y - 10} ${x + 18} ${y} Z`}
            fill={tinta}
          />
          <Path d={`M ${x + 2} ${y - 20} L ${x + 16} ${y - 20}`} stroke="#FFFFFF" strokeWidth={1.4} opacity={0.6} />
          <Rect x={x + 5} y={y - 13} width={8} height={6} rx={2} fill="#FFFFFF" opacity={0.85} />
        </G>
      );
  }
}

const TIPOS: TipoProduto[] = ["caixa", "lata", "garrafa", "pote", "saco", "lata", "caixa", "garrafa"];
const TONS = ["#B9A6FF", "#FFB98A", "#8FD3FF", "#FF9DBE", "#9BD9A8", "#F6C344", "#C9B4FF", "#7FC4F0"];

function Fundo() {
  return (
    <G>
      {/* parede com rodapé mais escuro */}
      <Rect x={0} y={0} width={L} height={A} fill="#EEEAFB" />
      <Rect x={0} y={96} width={L} height={30} fill="#E3DDF7" />
      {/* duas prateleiras de mercadoria */}
      {[44, 84].map((y, f) => (
        <G key={y}>
          {/* fundo do móvel */}
          <Rect x={0} y={y - 30} width={L} height={30} fill="#F7F5FD" />
          {Array.from({ length: 14 }, (_, i) => {
            const x = 3 + i * 26 + (f ? 11 : 0);
            const k = (i * 3 + f * 5) % TIPOS.length;
            return <ProdutoPrateleira key={i} x={x} y={y} tipo={TIPOS[k]!} tinta={TONS[(i + f * 3) % TONS.length]!} />;
          })}
          {/* tábua da prateleira com etiquetas de preço */}
          <Rect x={0} y={y} width={L} height={5} fill="#CFC6EE" />
          <Rect x={0} y={y + 5} width={L} height={2} fill="#B6ABE0" />
          {Array.from({ length: 9 }, (_, i) => (
            <Rect key={i} x={14 + i * 40 + (f ? 18 : 0)} y={y + 1} width={10} height={3.5} rx={0.8} fill="#FFFFFF" />
          ))}
        </G>
      ))}
      {/* placa do caixa */}
      <Line x1={36} y1={0} x2={36} y2={8} stroke="#9A93C2" strokeWidth={1} />
      <Line x1={104} y1={0} x2={104} y2={8} stroke="#9A93C2" strokeWidth={1} />
      <Rect x={26} y={8} width={88} height={18} rx={5} fill={cor.tinta} />
      <Circle cx={36} cy={17} r={3.5} fill={cor.pessego} />
      <SvgText x={76} y={21} fontSize={9.5} fontWeight="700" fill="#FFFFFF" textAnchor="middle" letterSpacing={1}>
        CAIXA 1
      </SvgText>
    </G>
  );
}

function Atendente({ humor }: { humor: Humor }) {
  return (
    <G>
      {/* rabo de cavalo atrás da cabeça, com elástico */}
      <Path d="M 52 60 C 40 62 38 78 44 88 C 46 80 48 72 54 68 Z" fill={CABELO} />
      <Circle cx={51} cy={63} r={2.6} fill={cor.pessego} />
      {/* blusa roxa */}
      <Path d="M 30 124 C 30 102 42 92 70 92 C 98 92 110 102 110 124 Z" fill={cor.roxo} />
      {/* avental pêssego com bolso e caneta */}
      <Path d="M 52 96 L 88 96 L 92 124 L 48 124 Z" fill={cor.pessego} />
      <Path d="M 52 96 L 57 93 M 88 96 L 83 93" stroke={cor.pessegoEscuro} strokeWidth={2} strokeLinecap="round" />
      <Rect x={58} y={108} width={14} height={9} rx={2} fill={cor.pessegoEscuro} opacity={0.45} />
      <Rect x={61} y={104} width={2.4} height={8} rx={1} fill={cor.azulEscuro} />
      {/* crachá */}
      <Rect x={75} y={101} width={14} height={9} rx={2} fill="#FFFFFF" />
      <SvgText x={82} y={108} fontSize={6} fontWeight="700" fill={cor.roxo} textAnchor="middle">
        LU
      </SvgText>
      {/* pescoço e gola */}
      <Rect x={65} y={78} width={10} height={14} rx={3} fill={PELE} />
      <Path d="M 60 91 L 70 99 L 80 91" stroke="#FFFFFF" strokeWidth={2.4} fill="none" strokeLinejoin="round" />
      {/* braços apoiados no balcão */}
      <Path d="M 36 106 C 32 112 34 118 42 120" stroke={cor.roxo} strokeWidth={9} fill="none" strokeLinecap="round" />
      <Path
        d="M 104 106 C 108 112 106 118 98 120"
        stroke={cor.roxo}
        strokeWidth={9}
        fill="none"
        strokeLinecap="round"
      />
      {/* cabeça e orelhas */}
      <Circle cx={51.5} cy={65} r={4} fill={PELE} />
      <Circle cx={88.5} cy={65} r={4} fill={PELE} />
      <Circle cx={70} cy={63} r={19} fill={PELE} />
      {/* cabelo com franja */}
      <Path
        d="M 51 64 C 49 50 56 43 70 43 C 84 43 91 50 89 64 C 88 58 85 54 80 52 C 76 57 68 58 60 55 C 56 57 53 60 51 64 Z"
        fill={CABELO}
      />
      {/* boné */}
      <Path d="M 52 52 C 52 36 88 36 88 52 Z" fill={cor.pessego} />
      <Path d="M 84 50 C 92 49 99 51 102 54 C 96 55 89 54 84 53 Z" fill={cor.pessegoEscuro} />
      <Circle cx={70} cy={39.5} r={2} fill={cor.pessegoEscuro} />
      <Circle cx={70} cy={46.5} r={3.4} fill="#FFFFFF" />
      <Path
        d="M 68.3 46.5 L 69.6 47.8 L 71.9 45.2"
        stroke={cor.roxo}
        strokeWidth={1}
        fill="none"
        strokeLinecap="round"
      />
      <Rosto humor={humor} />
    </G>
  );
}

function Rosto({ humor }: { humor: Humor }) {
  const tinta = "#3A2E5C";
  const olho = (cx: number, cy: number) => (
    <G key={cx}>
      <Circle cx={cx} cy={cy} r={2.5} fill={tinta} />
      <Circle cx={cx + 0.9} cy={cy - 0.9} r={0.9} fill="#FFFFFF" />
    </G>
  );
  return (
    <G>
      <Circle cx={59} cy={70} r={3.6} fill="#FF9DBE" opacity={0.45} />
      <Circle cx={81} cy={70} r={3.6} fill="#FF9DBE" opacity={0.45} />
      <Path d="M 70 64 Q 71.5 67 69.5 68" stroke="#C98A68" strokeWidth={1.2} fill="none" strokeLinecap="round" />
      {humor === "feliz" ? (
        <>
          <Path d="M 59 63 Q 63 58.5 67 63" stroke={tinta} strokeWidth={2} fill="none" strokeLinecap="round" />
          <Path d="M 73 63 Q 77 58.5 81 63" stroke={tinta} strokeWidth={2} fill="none" strokeLinecap="round" />
          <Path d="M 62 71 Q 70 81 78 71 Z" fill="#8C3F4A" />
          <Path d="M 65 74.5 Q 70 77 75 74.5" stroke="#E98A8A" strokeWidth={2} fill="none" />
        </>
      ) : humor === "pensando" ? (
        <>
          <Path d="M 59 56 L 66 57" stroke={tinta} strokeWidth={1.6} strokeLinecap="round" />
          <Path d="M 74 55 Q 78 52.5 82 54.5" stroke={tinta} strokeWidth={1.6} fill="none" strokeLinecap="round" />
          {olho(63, 61.5)}
          {olho(77, 61)}
          <Path d="M 65 74 Q 70 72.5 76 74.5" stroke={tinta} strokeWidth={2} fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <Path d="M 59 57 Q 63 55 66 57" stroke={tinta} strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <Path d="M 74 57 Q 77 55 81 57" stroke={tinta} strokeWidth={1.5} fill="none" strokeLinecap="round" />
          {olho(63, 62)}
          {olho(77, 62)}
          <Path d="M 64 72 Q 70 76.5 76 72" stroke={tinta} strokeWidth={2} fill="none" strokeLinecap="round" />
        </>
      )}
    </G>
  );
}

/** Mãos da atendente apoiadas por cima do balcão. */
function Maos() {
  return (
    <G>
      <Path d="M 36 108 C 34 113 37 116 42 116" stroke={cor.roxo} strokeWidth={9} fill="none" strokeLinecap="round" />
      <Path
        d="M 104 108 C 106 113 103 116 98 116"
        stroke={cor.roxo}
        strokeWidth={9}
        fill="none"
        strokeLinecap="round"
      />
      <Ellipse cx={47} cy={115.5} rx={7} ry={4.2} fill={PELE} />
      <Ellipse cx={93} cy={115.5} rx={7} ry={4.2} fill={PELE} />
    </G>
  );
}

function Balcao() {
  return (
    <G>
      {/* tampo com espessura */}
      <Rect x={0} y={114} width={L} height={6} fill="#F5F2FE" />
      <Rect x={0} y={120} width={L} height={6} fill="#CFC6EE" />
      {/* esteira */}
      <Rect x={118} y={109} width={104} height={11} rx={5.5} fill="#3D4372" />
      {Array.from({ length: 12 }, (_, i) => (
        <Line key={i} x1={126 + i * 8} y1={110.5} x2={122 + i * 8} y2={118.5} stroke="#5A6197" strokeWidth={1.2} />
      ))}
      <Circle cx={123.5} cy={114.5} r={3.5} fill="#8C92BF" />
      <Circle cx={216.5} cy={114.5} r={3.5} fill="#8C92BF" />
      {/* divisória "próximo cliente" */}
      <Rect x={124} y={102} width={20} height={7} rx={2} fill={cor.lilas} />
      {/* frente do balcão: painéis coloridos com friso */}
      <Rect x={0} y={126} width={L} height={36} fill="#B9A6FF" />
      {Array.from({ length: 6 }, (_, i) => (
        <Rect key={i} x={6 + i * 60} y={131} width={48} height={26} rx={4} fill="#C9B9FF" />
      ))}
      <Rect x={0} y={141} width={L} height={5} fill={cor.pessego} />
      {/* rodapé */}
      <Rect x={0} y={162} width={L} height={8} fill={cor.tinta} />
    </G>
  );
}

function Registradora({ visor: [a, b], certo }: { visor: [LinhaVisor, LinhaVisor]; certo: boolean }) {
  return (
    <G>
      {/* haste do visor */}
      <Rect x={281} y={62} width={7} height={24} fill="#9A93C2" />
      {/* visor */}
      <Rect x={230} y={14} width={110} height={52} rx={7} fill={cor.tinta} />
      <Rect x={236} y={20} width={98} height={40} rx={4} fill="#141B57" />
      <SvgText x={242} y={34} fontSize={7.5} fontWeight="700" fill={cor.azul} letterSpacing={0.8}>
        {a.rotulo}
      </SvgText>
      <SvgText x={328} y={35} fontSize={12} fontWeight="700" fill="#FFFFFF" textAnchor="end">
        {fmt(a.valor)}
      </SvgText>
      <Line x1={242} y1={40} x2={328} y2={40} stroke="#2E3A8C" strokeWidth={1} />
      <SvgText x={242} y={53} fontSize={7.5} fontWeight="700" fill={cor.pessego} letterSpacing={0.8}>
        {b.rotulo}
      </SvgText>
      <SvgText x={328} y={54} fontSize={12} fontWeight="700" fill={certo ? "#9BE7B8" : cor.pessego} textAnchor="end">
        {fmt(b.valor)}
      </SvgText>
      {/* corpo e teclado */}
      <Path d="M 244 86 L 326 86 L 332 102 L 238 102 Z" fill="#CFC8EA" />
      {Array.from({ length: 3 }, (_, l) =>
        Array.from({ length: 6 }, (_, c) => (
          <Rect
            key={`${l}-${c}`}
            x={250 + c * 12 + l * -1.5}
            y={88.5 + l * 4.3}
            width={9}
            height={3}
            rx={1}
            fill={c === 5 && l === 2 ? cor.pessego : "#F7F6FD"}
          />
        )),
      )}
      {/* gaveta */}
      <Rect x={234} y={102} width={102} height={16} rx={3} fill="#B9B1DE" />
      <Rect x={270} y={108} width={30} height={3} rx={1.5} fill="#8E86BD" />
    </G>
  );
}

/** Ilustração do produto da rodada. */
export function Produto({ item, tamanho = 48 }: { item: ItemMercado; tamanho?: number }) {
  return (
    <Svg width={tamanho} height={tamanho * (50 / 48)} viewBox="0 0 48 50">
      {item === "suco" ? (
        <G>
          <Path d="M 12 14 L 24 6 L 36 14 Z" fill="#F6E1C8" />
          <Rect x={12} y={14} width={24} height={34} rx={2} fill="#FFFFFF" stroke="#E7E3F6" />
          <Rect x={12} y={22} width={24} height={18} fill={cor.pessego} />
          <Circle cx={24} cy={31} r={6} fill="#FFC27A" stroke="#E98A52" strokeWidth={1} />
          <Path
            d="M 24 25 L 24 37 M 18 31 L 30 31 M 20 27 L 28 35 M 28 27 L 20 35"
            stroke="#E98A52"
            strokeWidth={0.7}
          />
          <Path d="M 29 10 L 33 1" stroke={cor.azulEscuro} strokeWidth={2} strokeLinecap="round" />
        </G>
      ) : item === "caderno" ? (
        <G>
          <Rect x={8} y={6} width={34} height={42} rx={3} fill={cor.roxo} />
          <Rect x={14} y={12} width={24} height={30} rx={2} fill="#8D77FF" />
          <Rect x={18} y={20} width={16} height={7} rx={1.5} fill="#FFFFFF" />
          {Array.from({ length: 7 }, (_, i) => (
            <Ellipse
              key={i}
              cx={9}
              cy={10 + i * 5.5}
              rx={3.2}
              ry={1.6}
              fill="none"
              stroke="#9AA1AA"
              strokeWidth={1.3}
            />
          ))}
        </G>
      ) : item === "album" ? (
        <G>
          <Rect x={6} y={8} width={36} height={40} rx={3} fill={cor.azulEscuro} />
          <Rect x={10} y={12} width={28} height={8} rx={1.5} fill="#FFFFFF" />
          <Rect x={13} y={14.5} width={22} height={3} rx={1} fill={cor.azulEscuro} />
          {[0, 1, 2].map((c) =>
            [0, 1].map((l) => (
              <Rect
                key={`${c}${l}`}
                x={11 + c * 9.5}
                y={24 + l * 11}
                width={7.5}
                height={9}
                rx={1}
                fill={[cor.pessego, cor.lilas, cor.azul][(c + l) % 3]}
              />
            )),
          )}
          {/* figurinhas soltas */}
          <Rect
            x={30}
            y={2}
            width={10}
            height={12}
            rx={1.5}
            fill="#FFFFFF"
            stroke={cor.pessego}
            strokeWidth={1.5}
            transform="rotate(14 35 8)"
          />
        </G>
      ) : item === "biscoito" ? (
        <G>
          <Path d="M 6 12 L 42 12 L 44 44 L 4 44 Z" fill={cor.azulEscuro} />
          <Path d="M 6 12 L 9 6 L 39 6 L 42 12 Z" fill="#5BAEE0" />
          <Rect x={8} y={18} width={32} height={10} rx={2} fill="#FFFFFF" />
          <Rect x={11} y={21} width={20} height={4} rx={1} fill={cor.azulEscuro} />
          {[14, 24, 34].map((x) => (
            <G key={x}>
              <Circle cx={x} cy={36} r={5.5} fill="#E2B57C" stroke="#B8894F" strokeWidth={1} />
              <Circle cx={x - 1.5} cy={35} r={0.9} fill="#8D5B4C" />
              <Circle cx={x + 1.8} cy={37.5} r={0.9} fill="#8D5B4C" />
            </G>
          ))}
        </G>
      ) : (
        <G>
          <Rect x={21.5} y={34} width={5} height={15} rx={2} fill="#E3C79A" />
          <Path
            d="M 12 16 C 12 4 36 4 36 16 L 36 34 C 36 37 34 38 31 38 L 17 38 C 14 38 12 37 12 34 Z"
            fill={cor.lilas}
          />
          <Path d="M 12 16 C 12 4 36 4 36 16 L 36 20 C 31 24 27 18 24 22 C 21 26 16 20 12 23 Z" fill="#8D5B4C" />
          <Path d="M 17 12 L 17 30" stroke="#FFFFFF" strokeOpacity={0.6} strokeWidth={2.5} strokeLinecap="round" />
        </G>
      )}
    </Svg>
  );
}

const m = criarEstilos(() => ({
  etiqueta: {
    position: "absolute",
    backgroundColor: cor.pessego,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
    transform: [{ rotate: "8deg" }],
  },
  balao: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: cor.bordaForte,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  rabo: {
    position: "absolute",
    left: -6,
    top: 22,
    width: 10,
    height: 10,
    backgroundColor: "#FFFFFF",
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: cor.bordaForte,
    transform: [{ rotate: "45deg" }],
  },
  fala: { fontFamily: fonte.textoForte, color: cor.tinta, lineHeight: 16 },
}));
