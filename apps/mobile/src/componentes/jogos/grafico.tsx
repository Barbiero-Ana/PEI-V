import { useMemo, useState } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Svg, { Line } from "react-native-svg";
import type { RodadaGrafico } from "@modolume/core";
import { useUltimo } from "@/lib/useUltimo";
import { Botao, Texto } from "../ui";
import { cor, criarEstilos, fonte, porTema, raio } from "@/tema";
import type { PropsJogo } from "./tipos";
import { Acoes } from "./Acoes";

/**
 * Votação da turma (associação visual): lê a contagem em risquinhos de giz na
 * lousa e puxa cada barra do cartaz até o número de votos.
 */

const GIZ = "#F4F1FF";

const CORES = porTema(() => [cor.roxo, cor.pessego, cor.azul, cor.lilas]);

/** Risquinhos agrupados de 5 em 5 (o 5º atravessado), como no quadro da sala. */
function Risquinhos({ n, contar = false }: { n: number; contar?: boolean }) {
  const grupos = Math.floor(n / 5);
  const resto = n % 5;
  const blocos = [...Array.from({ length: grupos }, () => 5), ...(resto ? [resto] : [])];
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      {blocos.map((q, i) => (
        <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          {contar && i > 0 ? (
            <Texto style={{ color: cor.pessego, fontSize: 13, fontFamily: fonte.titulo }}>+</Texto>
          ) : null}
          <Svg width={q === 5 ? 34 : q * 7} height={22}>
            {Array.from({ length: Math.min(q, 4) }, (_, k) => (
              <Line
                key={k}
                x1={4 + k * 7}
                y1={2 + (k % 2)}
                x2={4 + k * 7 + (k % 2 ? 0.8 : -0.6)}
                y2={20}
                stroke={GIZ}
                strokeWidth={2.4}
                strokeLinecap="round"
              />
            ))}
            {q === 5 ? (
              <Line x1={0} y1={17} x2={30} y2={5} stroke={cor.pessego} strokeWidth={2.4} strokeLinecap="round" />
            ) : null}
          </Svg>
          {/* dica: quanto vale cada grupo */}
          {contar ? (
            <View style={g.vale}>
              <Texto style={{ fontFamily: fonte.titulo, fontSize: 12, color: "#26336F", lineHeight: 16 }}>{q}</Texto>
            </View>
          ) : null}
        </View>
      ))}
      {contar && blocos.length > 1 ? (
        <Texto style={{ color: GIZ, fontSize: 13, fontFamily: fonte.titulo }}>= {n}</Texto>
      ) : null}
    </View>
  );
}

function Barra({
  indice,
  valor,
  maximo,
  bloqueado,
  onMudar,
}: {
  indice: number;
  valor: number;
  maximo: number;
  bloqueado: boolean;
  onMudar: (v: number) => void;
}) {
  const [altura, setAltura] = useState(200);
  const estado = useUltimo({ altura, bloqueado, onMudar });
  const gesto = useMemo(() => {
    const em = (y: number) => Math.max(0, Math.min(maximo, Math.round((1 - y / estado.current.altura) * maximo)));
    return Gesture.Pan()
      .runOnJS(true)
      .minDistance(0)
      .onBegin((e) => !estado.current.bloqueado && estado.current.onMudar(em(e.y)))
      .onUpdate((e) => !estado.current.bloqueado && estado.current.onMudar(em(e.y)));
  }, [maximo, estado]);

  const tinta = CORES[indice % CORES.length]!;
  const pct = `${(valor / maximo) * 100}%` as const;
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <GestureDetector gesture={gesto}>
        <View style={g.coluna} collapsable={false} onLayout={(e) => setAltura(e.nativeEvent.layout.height)}>
          {/* trilho clarinho: mostra até onde a barra pode subir */}
          <View style={[g.trilho, { backgroundColor: tinta + "1A" }]} />
          <View style={[g.barra, { height: pct, backgroundColor: tinta }]} />
          {/* puxador redondo no topo da barra, com o número de votos */}
          <View style={[g.puxador, { bottom: pct, borderColor: tinta }]}>
            <Texto style={{ fontFamily: fonte.tituloForte, fontSize: 14, color: cor.tinta, lineHeight: 18 }}>
              {valor}
            </Texto>
          </View>
        </View>
      </GestureDetector>
    </View>
  );
}

export function JogoGrafico({ rodada, onErro, onAcerto, bloqueado, dica = false }: PropsJogo<RodadaGrafico>) {
  const [valores, setValores] = useState(() => rodada.categorias.map(() => 0));

  function conferir() {
    const errada = rodada.categorias.findIndex((c, i) => valores[i] !== c.valor);
    if (errada < 0) return onAcerto("Gráfico pronto! Agora dá para ver o resultado da votação.");
    onErro(`A barra de "${rodada.categorias[errada]!.nome}" ainda não está certa. Conte os risquinhos de novo.`);
  }

  return (
    <View style={{ flex: 1, gap: 10 }}>
      {/* lousa com a contagem em giz */}
      <View style={g.moldura}>
        <View style={g.lousa}>
          <Texto style={{ fontFamily: fonte.titulo, color: GIZ, marginBottom: 6 }}>{rodada.titulo}</Texto>
          {rodada.categorias.map((c, i) => (
            <View key={c.nome} style={g.linhaContagem}>
              <View style={[g.ponto, { backgroundColor: CORES[i % CORES.length] }]} />
              <Texto style={{ width: 70, fontSize: 13, color: GIZ }}>{c.nome}</Texto>
              <Risquinhos n={c.valor} contar={dica} />
            </View>
          ))}
        </View>
        {/* aparador com giz e apagador */}
        <View style={g.aparador}>
          <View style={[g.giz, { backgroundColor: "#FFFFFF" }]} />
          <View style={[g.giz, { backgroundColor: cor.pessego, width: 12 }]} />
          <View style={g.apagador} />
        </View>
      </View>

      <View style={g.grafico}>
        <Texto style={g.tituloCartaz}>Votos de cada opção</Texto>
        <View style={g.regiao}>
          {/* grade de 1 em 1, alinhada à altura das barras: ajuda a contar */}
          {Array.from({ length: rodada.maximo + 1 }, (_, i) => (
            <View key={i} style={[g.grade, i === 0 && g.base, { bottom: `${(i / rodada.maximo) * 100}%` }]}>
              <Texto style={[g.eixo, i % 2 === 1 && { fontSize: 9 }]}>{i}</Texto>
            </View>
          ))}
          <View style={{ flex: 1, flexDirection: "row", gap: 14 }}>
            {rodada.categorias.map((c, i) => (
              <Barra
                key={c.nome}
                indice={i}
                valor={valores[i]!}
                maximo={rodada.maximo}
                bloqueado={bloqueado}
                onMudar={(v) => setValores((vs) => vs.map((x, k) => (k === i ? v : x)))}
              />
            ))}
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 14, marginLeft: 26, marginTop: 24 }}>
          {rodada.categorias.map((c, i) => (
            <View
              key={c.nome}
              style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 }}
            >
              <View style={[g.ponto, { backgroundColor: CORES[i % CORES.length] }]} />
              <Texto
                style={{ fontFamily: fonte.textoForte, fontSize: 12, color: cor.tinta, flexShrink: 1 }}
                numberOfLines={1}
              >
                {c.nome}
              </Texto>
            </View>
          ))}
        </View>
      </View>

      <Texto style={{ textAlign: "center", fontSize: 12, color: cor.textoSuave }}>
        Puxe a bolinha de cada barra até o número de votos.
      </Texto>
      <Acoes>
        <Botao
          titulo="Zerar"
          variante="secundario"
          onPress={() => setValores(rodada.categorias.map(() => 0))}
          disabled={bloqueado}
        />
        <Botao titulo="Conferir" onPress={conferir} disabled={bloqueado} style={{ flex: 1 }} />
      </Acoes>
    </View>
  );
}

const g = criarEstilos(() => ({
  vale: { minWidth: 20, paddingHorizontal: 5, borderRadius: 999, backgroundColor: cor.pessego, alignItems: "center" },
  moldura: { borderRadius: 10, borderWidth: 6, borderColor: "#C9A07A", backgroundColor: "#C9A07A" },
  lousa: { padding: 12, paddingBottom: 10, borderRadius: 4, backgroundColor: "#26336F", gap: 4 },
  aparador: { flexDirection: "row", alignItems: "center", gap: 6, height: 10, paddingHorizontal: 10, marginBottom: -4 },
  giz: { width: 18, height: 5, borderRadius: 2 },
  apagador: {
    marginLeft: "auto",
    width: 30,
    height: 8,
    borderRadius: 2,
    backgroundColor: cor.tinta,
    borderTopWidth: 3,
    borderTopColor: "#8E86BD",
  },
  linhaContagem: { flexDirection: "row", alignItems: "center", gap: 8 },
  ponto: { width: 10, height: 10, borderRadius: 5 },
  grafico: {
    flex: 1,
    minHeight: 220,
    maxHeight: 420,
    paddingTop: 12,
    paddingBottom: 12,
    paddingRight: 14,
    paddingLeft: 4,
    borderRadius: raio.g,
    borderWidth: 1,
    borderColor: cor.borda,
    backgroundColor: cor.superficie,
  },
  tituloCartaz: { fontFamily: fonte.titulo, fontSize: 14, color: cor.tinta, marginLeft: 12, marginBottom: 18 },
  regiao: { flex: 1, marginLeft: 26, marginTop: 6 },
  grade: { position: "absolute", left: -4, right: 0, borderTopWidth: 1, borderTopColor: "#EEEAF8" },
  base: { borderTopWidth: 2, borderTopColor: cor.bordaForte },
  eixo: {
    position: "absolute",
    left: -22,
    top: -9,
    width: 16,
    textAlign: "right",
    fontSize: 11,
    color: cor.textoFraco,
  },
  coluna: { flex: 1, width: "100%", justifyContent: "flex-end", alignItems: "center" },
  trilho: { position: "absolute", top: 0, bottom: 0, width: "72%", borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  barra: { width: "72%", borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  puxador: {
    position: "absolute",
    marginBottom: -16,
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 3,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
}));
