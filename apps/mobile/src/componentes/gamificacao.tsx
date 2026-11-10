import { useState } from "react";
import { Pressable, View, useWindowDimensions } from "react-native";
import { PONTOS_POR_ESTRELA, constelacaoDoNivel, estrelasAcesas, mapaConcluido } from "@modolume/core";
import { useJogador } from "@/estado/jogador";
import Svg, { Circle, G, Line, Path } from "react-native-svg";
import { Seta } from "./Icones";
import { Texto, Titulo } from "./ui";
import { cor, criarEstilos, fonte } from "@/tema";

/** Dados do mapa (nível) e da constelação dele. */
export function useMapa(numero: number) {
  const { pontosPorNivel, progresso } = useJogador();
  const constelacao = constelacaoDoNivel(numero);
  const pontos = pontosPorNivel[numero] ?? 0;
  const concluido = mapaConcluido(numero, progresso);
  const acesas = estrelasAcesas(pontos, constelacao, concluido);
  const total = constelacao.estrelas.length;
  return {
    constelacao,
    pontos,
    acesas,
    total,
    completa: acesas >= total,
    resto: pontos % PONTOS_POR_ESTRELA,
    /** Só falta a última estrela, que depende de terminar as missões do mapa. */
    esperaMapa: !concluido && acesas === total - 1 && Math.floor(pontos / PONTOS_POR_ESTRELA) >= total - 1,
  };
}

const SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

/** Maior sequência de dias seguidos na lista (datas YYYY-MM-DD). */
function maiorSequencia(dias: string[]) {
  const ordenados = [...new Set(dias)].sort();
  let melhor = 0;
  let atual = 0;
  let anterior: number | null = null;
  for (const d of ordenados) {
    const [a, m, dia] = d.split("-").map(Number);
    const t = Date.UTC(a!, m! - 1, dia!) / 86400000;
    atual = anterior !== null && t - anterior === 1 ? atual + 1 : 1;
    melhor = Math.max(melhor, atual);
    anterior = t;
  }
  return melhor;
}

/**
 * Calendário dos dias de luz como uma constelação do mês: céu escuro, cada
 * dia jogado vira uma estrela e os dias seguidos se ligam por linhas.
 */
export function CalendarioDeLuz() {
  const { dias } = useJogador();
  const { width } = useWindowDimensions();
  const agora = new Date();
  const [deslocamento, setDeslocamento] = useState(0);
  const [larguraGrade, setLarguraGrade] = useState(0);
  const ref = new Date(agora.getFullYear(), agora.getMonth() + deslocamento, 1);
  const ano = ref.getFullYear();
  const mes = ref.getMonth();
  const primeiro = ref.getDay();
  const nDias = new Date(ano, mes + 1, 0).getDate();
  const prefixo = `${ano}-${String(mes + 1).padStart(2, "0")}`;
  const aceso = (n: number) => n >= 1 && n <= nDias && dias.includes(`${prefixo}-${String(n).padStart(2, "0")}`);
  const noMes = dias.filter((d) => d.startsWith(prefixo)).length;
  const sequencia = maiorSequencia(dias.filter((d) => d.startsWith(prefixo)));
  const ehMesAtual = deslocamento === 0;
  const hoje = ehMesAtual ? agora.getDate() : -1;

  // geometria da grade (largura medida na tela, para nada sair do eixo)
  const largura = Math.max(1, larguraGrade || Math.min(width, 560) - 36 - 28);
  const coluna = largura / 7;
  const linhaAlt = 42;
  const semanas = Math.ceil((primeiro + nDias) / 7);
  const altura = semanas * linhaAlt;
  const pos = (n: number) => {
    const i = primeiro + n - 1;
    return { x: (i % 7) * coluna + coluna / 2, y: Math.floor(i / 7) * linhaAlt + linhaAlt / 2 };
  };
  const estrela = (x: number, y: number, r: number) =>
    `M${x} ${y - r} L${x + r * 0.3} ${y - r * 0.3} L${x + r} ${y} L${x + r * 0.3} ${y + r * 0.3} L${x} ${y + r} L${x - r * 0.3} ${y + r * 0.3} L${x - r} ${y} L${x - r * 0.3} ${y - r * 0.3} Z`;

  return (
    <View style={g.calCeu}>
      <View style={g.navMes}>
        <Pressable
          onPress={() => setDeslocamento((d) => d - 1)}
          hitSlop={10}
          style={g.seta}
          accessibilityLabel="Mês anterior"
        >
          <Seta direcao="esquerda" cor="#FFFFFF" tamanho={16} />
        </Pressable>
        <View style={{ alignItems: "center" }}>
          <Titulo tamanho={17} style={{ color: "#FFFFFF" }}>
            {MESES[mes]} de {ano}
          </Titulo>
          <Texto style={{ fontSize: 12, color: cor.lilasNoEscuro }}>
            {noMes === 0 ? "nenhuma estrela ainda" : `${noMes} ${noMes === 1 ? "estrela acesa" : "estrelas acesas"}`}
          </Texto>
        </View>
        <Pressable
          onPress={() => setDeslocamento((d) => Math.min(0, d + 1))}
          hitSlop={10}
          disabled={ehMesAtual}
          style={[g.seta, ehMesAtual && { opacity: 0.25 }]}
          accessibilityLabel="Próximo mês"
        >
          <Seta direcao="direita" cor="#FFFFFF" tamanho={16} />
        </Pressable>
      </View>

      <View style={{ flexDirection: "row" }}>
        {SEMANA.map((d, i) => (
          <Texto key={i} style={[g.cabecaDia, { color: "rgba(201,180,255,0.7)" }]}>
            {d}
          </Texto>
        ))}
      </View>

      <View
        style={{ alignSelf: "stretch", height: altura }}
        onLayout={(e) => setLarguraGrade(e.nativeEvent.layout.width)}
      >
        <Svg width={largura} height={altura}>
          {/* linhas da constelação: dias seguidos */}
          {Array.from({ length: nDias - 1 }, (_, k) => k + 1).map((n) =>
            aceso(n) && aceso(n + 1) ? (
              <Line
                key={`l${n}`}
                x1={pos(n).x}
                y1={pos(n).y}
                x2={pos(n + 1).x}
                y2={pos(n + 1).y}
                stroke={cor.lilas}
                strokeOpacity={0.7}
                strokeWidth={3}
                strokeLinecap="round"
              />
            ) : null,
          )}
          {Array.from({ length: nDias }, (_, k) => k + 1).map((n) => {
            const { x, y } = pos(n);
            if (!aceso(n)) {
              return n === hoje ? (
                <Circle
                  key={n}
                  cx={x}
                  cy={y}
                  r={15}
                  fill="none"
                  stroke={cor.pessego}
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                />
              ) : null;
            }
            // dia aceso: halo, círculo claro com o número e um brilho no canto
            return (
              <G key={n}>
                <Circle cx={x} cy={y} r={18} fill={cor.pessego} opacity={0.16} />
                <Circle cx={x} cy={y} r={14} fill="#FFF6E8" />
                <Path d={estrela(x + 11, y - 11, 5)} fill={cor.pessego} />
              </G>
            );
          })}
        </Svg>
        {/* números dos dias (por cima, para ficarem nítidos) */}
        {Array.from({ length: nDias }, (_, k) => k + 1).map((n) => {
          const { x, y } = pos(n);
          const luz = aceso(n);
          return (
            <Texto
              key={n}
              style={[
                g.numeroDia,
                { left: x - coluna / 2, top: y - 9, width: coluna },
                luz
                  ? { color: cor.tinta, fontFamily: fonte.titulo }
                  : {
                      color:
                        n === hoje
                          ? cor.pessego
                          : n > hoje && ehMesAtual
                            ? "rgba(255,255,255,0.22)"
                            : "rgba(255,255,255,0.5)",
                    },
              ]}
            >
              {n}
            </Texto>
          );
        })}
      </View>

      <View style={g.resumoMes}>
        <Texto style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", flex: 1 }}>
          {sequencia > 1
            ? `Maior sequência: ${sequencia} dias seguidos`
            : noMes
              ? "Jogue em dias seguidos para ligar as estrelas."
              : "Cada dia que você joga vira uma estrela."}
        </Texto>
        <Texto style={{ fontSize: 12, color: cor.lilasNoEscuro }}>{dias.length} no total</Texto>
      </View>
    </View>
  );
}

const g = criarEstilos(() => ({
  calCeu: { padding: 14, borderRadius: 20, backgroundColor: "#141B57" },
  navMes: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  seta: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  cabecaDia: { width: `${100 / 7}%`, textAlign: "center", fontSize: 11, fontFamily: fonte.textoForte, marginBottom: 4 },
  numeroDia: { position: "absolute", textAlign: "center", fontSize: 13, lineHeight: 18 },
  resumoMes: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  cadeadoAlbum: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
}));
