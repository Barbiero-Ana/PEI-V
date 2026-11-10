import { View } from "react-native";
import Svg, { Circle, Ellipse, G, Path, Rect, Text as SvgText } from "react-native-svg";
import { cor } from "@/tema";

/** Produtos da quitanda para a balança, com etiqueta de peso. */

function Desenho({ nome }: { nome: string }) {
  const n = nome.toLowerCase();
  if (n.startsWith("batata") || n.startsWith("cebola")) {
    const cebola = n.startsWith("cebola");
    const c = cebola ? "#D7B6E8" : "#D9B48A";
    const e = cebola ? "#A97FC4" : "#B48A5E";
    return (
      <G>
        {[
          [14, 30],
          [26, 31],
          [38, 30],
          [20, 21],
          [32, 21],
          [26, 12],
        ].map(([x, y], i) =>
          cebola ? (
            <G key={i}>
              <Circle cx={x} cy={y} r={7} fill={c} stroke={e} strokeWidth={1} />
              <Path d={`M ${x} ${y! - 7} L ${x! + 1} ${y! - 10}`} stroke={e} strokeWidth={1.4} />
            </G>
          ) : (
            <Ellipse key={i} cx={x} cy={y} rx={7.5} ry={6} fill={c} stroke={e} strokeWidth={1} />
          ),
        )}
        {/* saco de rede */}
        <Path
          d="M 6 10 L 46 10 L 44 38 L 8 38 Z"
          fill="none"
          stroke={cor.pessegoEscuro}
          strokeWidth={1}
          strokeDasharray="2 2"
        />
        <Path d="M 4 8 L 48 8" stroke={cor.pessegoEscuro} strokeWidth={2.5} strokeLinecap="round" />
      </G>
    );
  }
  if (n.startsWith("melancia")) {
    return (
      <G>
        <Ellipse cx={26} cy={24} rx={21} ry={15} fill="#7FBF8E" />
        {[-12, -4, 4, 12].map((dx) => (
          <Path
            key={dx}
            d={`M ${26 + dx} 10 C ${22 + dx} 18 ${22 + dx} 30 ${26 + dx} 38`}
            stroke="#4E8F62"
            strokeWidth={2.5}
            fill="none"
          />
        ))}
        <Ellipse cx={18} cy={17} rx={5} ry={2.5} fill="#FFFFFF" opacity={0.35} />
      </G>
    );
  }
  if (n.startsWith("abóbora") || n.startsWith("abobora")) {
    return (
      <G>
        <Ellipse cx={15} cy={25} rx={11} ry={13} fill={cor.pessegoEscuro} />
        <Ellipse cx={37} cy={25} rx={11} ry={13} fill={cor.pessegoEscuro} />
        <Ellipse cx={26} cy={25} rx={12} ry={14} fill={cor.pessego} />
        <Path d="M 26 11 C 26 6 29 4 32 4" stroke="#7A5A47" strokeWidth={3} fill="none" strokeLinecap="round" />
      </G>
    );
  }
  // pacote de papelão
  return (
    <G>
      <Rect x={6} y={8} width={40} height={30} rx={2} fill="#E2C29A" stroke="#B9935F" strokeWidth={1} />
      <Rect x={22} y={8} width={8} height={30} fill="#D1AE80" />
      <Rect x={10} y={24} width={12} height={9} rx={1} fill="#FFFFFF" />
      <Path d="M 12 27 H 20 M 12 30 H 18" stroke={cor.textoFraco} strokeWidth={1} />
    </G>
  );
}

/** Produto + etiqueta "5 kg" (ou "? kg" para o misterioso). */
export function ProdutoPesado({ nome, kg, escala = 1 }: { nome: string; kg: number | "?"; escala?: number }) {
  const w = 52 * escala;
  return (
    <View style={{ width: w, alignItems: "center" }}>
      <Svg width={w} height={w * (52 / 52)} viewBox="0 0 52 52">
        <Desenho nome={nome} />
        <G transform="translate(30 38)">
          <Rect
            x={0}
            y={0}
            width={21}
            height={12}
            rx={3}
            fill={kg === "?" ? cor.roxo : "#FFFFFF"}
            stroke={kg === "?" ? cor.roxo : cor.bordaForte}
          />
          <SvgText
            x={10.5}
            y={9}
            fontSize={7.5}
            fontWeight="700"
            fill={kg === "?" ? "#FFFFFF" : cor.tinta}
            textAnchor="middle"
          >
            {`${kg} kg`}
          </SvgText>
        </G>
      </Svg>
    </View>
  );
}

/** Toldo listrado da quitanda (topo da cena). */
export function Toldo({ largura }: { largura: number }) {
  const n = Math.ceil(largura / 28);
  return (
    <Svg width={largura} height={22} style={{ position: "absolute", top: 0, left: 0 }}>
      {Array.from({ length: n }, (_, i) => (
        <G key={i}>
          <Rect x={i * 28} y={0} width={28} height={12} fill={i % 2 ? "#FFFFFF" : cor.pessego} />
          <Path d={`M ${i * 28} 12 Q ${i * 28 + 14} 24 ${i * 28 + 28} 12 Z`} fill={i % 2 ? "#FFFFFF" : cor.pessego} />
        </G>
      ))}
    </Svg>
  );
}
