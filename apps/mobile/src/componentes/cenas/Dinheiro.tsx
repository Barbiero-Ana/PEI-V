import Svg, { Circle, Ellipse, G, Line, Path, Rect, Text as SvgText } from "react-native-svg";

/**
 * Dinheiro brasileiro estilizado: cores das cédulas do Real (R$ 2 azul,
 * R$ 5 lilás, R$ 10 vermelha, R$ 20 amarela), efígie, valor e o animal de cada
 * nota. Moedas: R$ 1 bimetálica e 50 centavos prateada. Desenhos didáticos,
 * não reproduções das cédulas.
 */

const NOTA: Record<
  number,
  { fundo: string; escuro: string; claro: string; bicho: "tartaruga" | "garca" | "arara" | "mico" }
> = {
  2: { fundo: "#9DB8D2", escuro: "#3F6289", claro: "#CADAE9", bicho: "tartaruga" },
  5: { fundo: "#B9A1CF", escuro: "#674789", claro: "#DCCDEA", bicho: "garca" },
  10: { fundo: "#DDA195", escuro: "#9E4A3E", claro: "#F0CFC7", bicho: "arara" },
  20: { fundo: "#EBC57F", escuro: "#A8721F", claro: "#F6E1B8", bicho: "mico" },
};

function Bicho({ tipo, cor }: { tipo: "tartaruga" | "garca" | "arara" | "mico"; cor: string }) {
  switch (tipo) {
    case "tartaruga":
      return (
        <G>
          <Ellipse cx={0} cy={0} rx={9} ry={6} fill={cor} />
          <Path d="M -4 -4 L 0 0 L 4 -4 M -4 4 L 0 0 L 4 4" stroke="#fff" strokeOpacity={0.5} strokeWidth={1} />
          <Circle cx={10.5} cy={-1} r={2.6} fill={cor} />
          <Ellipse cx={-6} cy={6} rx={2.5} ry={1.5} fill={cor} />
          <Ellipse cx={6} cy={6} rx={2.5} ry={1.5} fill={cor} />
        </G>
      );
    case "garca":
      return (
        <G>
          <Ellipse cx={-2} cy={4} rx={7} ry={4} fill={cor} />
          <Path d="M 3 2 C 6 -4 2 -8 6 -10" stroke={cor} strokeWidth={2.2} fill="none" strokeLinecap="round" />
          <Path d="M 6 -10 L 12 -9" stroke={cor} strokeWidth={1.6} strokeLinecap="round" />
          <Path d="M -3 8 V 13 M 0 8 V 13" stroke={cor} strokeWidth={1.2} />
        </G>
      );
    case "arara":
      return (
        <G>
          <Ellipse cx={0} cy={-1} rx={5} ry={7} fill={cor} />
          <Circle cx={1} cy={-8} r={3.4} fill={cor} />
          <Path d="M 3.5 -8 Q 7 -7 5 -4" stroke={cor} strokeWidth={1.8} fill="none" />
          <Path d="M -1 5 L -6 14 M 1 5 L -1 15" stroke={cor} strokeWidth={2} strokeLinecap="round" />
        </G>
      );
    case "mico":
      return (
        <G>
          <Circle cx={0} cy={0} r={8} fill={cor} />
          <Circle cx={0} cy={1} r={4.5} fill="#fff" fillOpacity={0.45} />
          <Circle cx={-1.6} cy={0} r={0.9} fill={cor} />
          <Circle cx={1.6} cy={0} r={0.9} fill={cor} />
        </G>
      );
  }
}

export function Nota({ valor, largura = 120 }: { valor: number; largura?: number }) {
  const n = NOTA[valor] ?? NOTA[2]!;
  const h = largura * 0.47;
  return (
    <Svg width={largura} height={h} viewBox="0 0 140 66">
      <Rect x={1} y={1} width={138} height={64} rx={6} fill={n.fundo} stroke={n.escuro} strokeWidth={1.5} />
      {/* textura de segurança (linhas finas) */}
      {Array.from({ length: 9 }, (_, i) => (
        <Path
          key={i}
          d={`M ${8 + i * 15} 4 C ${20 + i * 15} 20 ${-2 + i * 15} 44 ${10 + i * 15} 62`}
          stroke={n.claro}
          strokeWidth={0.8}
          fill="none"
        />
      ))}
      <Rect
        x={5}
        y={5}
        width={130}
        height={56}
        rx={4}
        fill="none"
        stroke={n.escuro}
        strokeOpacity={0.45}
        strokeWidth={1}
      />
      {/* efígie */}
      <Circle cx={30} cy={33} r={20} fill={n.claro} stroke={n.escuro} strokeOpacity={0.5} strokeWidth={1} />
      <Path
        d="M 24 47 C 24 40 22 37 23 32 C 24 24 30 20 35 22 C 39 24 40 29 38 33 L 40 36 L 37 37 C 37 40 35 42 32 42 L 32 47 Z"
        fill={n.escuro}
        fillOpacity={0.75}
      />
      {/* valor */}
      <SvgText x={112} y={34} fontSize={26} fontWeight="800" fill={n.escuro} textAnchor="middle">
        {valor}
      </SvgText>
      <SvgText x={112} y={46} fontSize={8} fontWeight="700" fill={n.escuro} textAnchor="middle" letterSpacing={1}>
        REAIS
      </SvgText>
      <SvgText x={70} y={15} fontSize={6.5} fontWeight="700" fill={n.escuro} textAnchor="middle" letterSpacing={0.6}>
        BANCO DO BRINCAR
      </SvgText>
      {/* animal */}
      <G transform="translate(72 40)">
        <Circle cx={0} cy={0} r={13} fill={n.claro} />
        <Bicho tipo={n.bicho} cor={n.escuro} />
      </G>
      <SvgText x={14} y={60} fontSize={6} fill={n.escuro} fillOpacity={0.8}>
        {valor}
      </SvgText>
    </Svg>
  );
}

export function Moeda({ valor, diametro = 52 }: { valor: number; diametro?: number }) {
  const umReal = valor >= 1;
  return (
    <Svg width={diametro} height={diametro} viewBox="0 0 60 60">
      {umReal ? (
        <>
          <Circle cx={30} cy={30} r={29} fill="#D6A43B" stroke="#A97A1E" strokeWidth={1.5} />
          <Circle cx={30} cy={30} r={25} fill="none" stroke="#F0CE7A" strokeWidth={1} />
          <Circle cx={30} cy={30} r={18} fill="#C9CED6" stroke="#8E949E" strokeWidth={1.2} />
          <Circle cx={30} cy={30} r={15.5} fill="none" stroke="#E6E9EE" strokeWidth={0.8} />
          <SvgText x={30} y={34} fontSize={14} fontWeight="800" fill="#5A606B" textAnchor="middle">
            1
          </SvgText>
          <SvgText x={30} y={42} fontSize={5} fontWeight="700" fill="#5A606B" textAnchor="middle">
            REAL
          </SvgText>
        </>
      ) : (
        <>
          <Circle cx={30} cy={30} r={29} fill="#BFC5CD" stroke="#8C939C" strokeWidth={1.5} />
          <Circle cx={30} cy={30} r={25} fill="none" stroke="#E2E6EB" strokeWidth={1} />
          {Array.from({ length: 24 }, (_, i) => {
            const a = (i / 24) * Math.PI * 2;
            return (
              <Line
                key={i}
                x1={30 + 27 * Math.cos(a)}
                y1={30 + 27 * Math.sin(a)}
                x2={30 + 29 * Math.cos(a)}
                y2={30 + 29 * Math.sin(a)}
                stroke="#9AA1AA"
                strokeWidth={1}
              />
            );
          })}
          <SvgText x={30} y={34} fontSize={15} fontWeight="800" fill="#5F666F" textAnchor="middle">
            50
          </SvgText>
          <SvgText x={30} y={42} fontSize={5} fontWeight="700" fill="#5F666F" textAnchor="middle">
            CENTAVOS
          </SvgText>
        </>
      )}
      {/* brilho metálico */}
      <Path
        d="M 12 18 A 22 22 0 0 1 26 8"
        stroke="#fff"
        strokeOpacity={0.55}
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Nota ou moeda, conforme o valor. */
export function Dinheiro({ valor, tamanho = "normal" }: { valor: number; tamanho?: "normal" | "medio" | "pequeno" }) {
  if (valor <= 1) return <Moeda valor={valor} diametro={{ normal: 52, medio: 46, pequeno: 38 }[tamanho]} />;
  return <Nota valor={valor} largura={{ normal: 112, medio: 100, pequeno: 86 }[tamanho]} />;
}
