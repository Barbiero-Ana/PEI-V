import { useState } from "react";
import { Platform, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CONSTELACOES, NIVEIS, dataLocal, estrelasAcesas, mapaConcluido, missaoPorId } from "@modolume/core";
import { voltar } from "@/lib/navegacao";
import { useFalarAoAbrir } from "@/estado/acessibilidade";
import { useJogador } from "@/estado/jogador";
import { Avatar } from "@/componentes/Avatar";
import { Ceu } from "@/componentes/Ceu";
import { Estrelas } from "@/componentes/blocos";
import { ESTAGIOS, Lilo, estagioDe, useEstrelasAcesas } from "@/componentes/Lilo";
import { Estrela, Fechar, IconeMissao } from "@/componentes/Icones";
import { svgDoRosto } from "@/componentes/Rosto";
import { Botao, Texto, Titulo } from "@/componentes/ui";
import { compartilharRelatorio } from "@/lib/relatorioPdf";
import { cor, COR_MISSAO, criarEstilos, fonte, raio } from "@/tema";

/**
 * Relatório da semana para a família, numa página clara: o Lilo comenta a
 * semana, a faixa dos 7 dias, os números principais, o que foi jogado (com
 * as estrelas) e o céu em construção. Compartilha como PDF.
 */

const LETRAS = ["D", "S", "T", "Q", "Q", "S", "S"];
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export default function Relatorio() {
  const insets = useSafeAreaInsets();
  const { jogador, dias, resultados, pontosPorNivel, progresso } = useJogador();
  useFalarAoAbrir(`Relatório da semana de ${jogador?.nome ?? ""}.`);
  const acesasTotal = useEstrelasAcesas();
  const [aviso, setAviso] = useState<string | null>(null);
  const [gerando, setGerando] = useState(false);
  if (!jogador) return null;

  const agora = new Date();
  const hojeTxt = dataLocal(agora);
  const inicio = new Date(agora);
  inicio.setDate(agora.getDate() - agora.getDay());
  const semana = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(inicio);
    d.setDate(inicio.getDate() + i);
    return { data: dataLocal(d), dia: d.getDate() };
  });
  const fim = new Date(inicio);
  fim.setDate(inicio.getDate() + 6);
  const periodo = `${inicio.getDate()} ${MESES[inicio.getMonth()]} a ${fim.getDate()} ${MESES[fim.getMonth()]}`;

  const datas = semana.map((s) => s.data);
  const daSemana = resultados.filter((r) => datas.includes(r.data));
  const diasLuz = datas.filter((d) => dias.includes(d)).length;
  const estrelas = daSemana.reduce((s, r) => s + r.estrelas, 0);
  const rodadas = daSemana.reduce((s, r) => s + r.rodadas, 0);
  const dePrimeira = daSemana.reduce((s, r) => s + r.acertosDePrimeira, 0);
  const acertos = rodadas ? Math.round((dePrimeira / rodadas) * 100) : 0;

  // missões da semana: quantas vezes jogou e a melhor nota de cada uma
  const porMissao = new Map<string, { vezes: number; melhor: number }>();
  for (const r of daSemana) {
    const a = porMissao.get(r.missaoId) ?? { vezes: 0, melhor: 0 };
    porMissao.set(r.missaoId, { vezes: a.vezes + 1, melhor: Math.max(a.melhor, r.estrelas) });
  }
  const jogadas = [...porMissao.entries()].map(([id, v]) => ({ m: missaoPorId(id)!, ...v })).filter((x) => x.m);

  const constelacoes = NIVEIS.map((n) => {
    const c = CONSTELACOES.find((x) => x.id === n.constelacao)!;
    return { c, acesas: estrelasAcesas(pontosPorNivel[n.numero] ?? 0, c, mapaConcluido(n.numero, progresso)) };
  }).filter((x) => x.acesas > 0);
  const estagio = ESTAGIOS[estagioDe(acesasTotal)]!;

  const frase =
    diasLuz === 0
      ? "Esta semana ainda não teve missões. Que tal jogar uma juntos?"
      : diasLuz >= 4
        ? "Uma semana cheia de luz! A constância está fazendo diferença."
        : "Cada dia de luz conta. Continue no seu ritmo!";

  async function compartilhar() {
    setAviso(null);
    setGerando(true);
    try {
      await compartilharRelatorio({
        nome: jogador!.nome,
        periodo,
        avatarSvg: jogador!.rosto ? svgDoRosto(jogador!.rosto, 84) : "",
        frase,
        lilo: `Lilo ${estagio.nome} · ${acesasTotal} ${acesasTotal === 1 ? "estrela acesa" : "estrelas acesas"} no céu`,
        semana: semana.map((s, i) => ({
          letra: LETRAS[i]!,
          dia: s.dia,
          aceso: dias.includes(s.data),
          hoje: s.data === hojeTxt,
        })),
        diasLuz,
        missoes: daSemana.length,
        estrelas,
        acertos: rodadas ? acertos : null,
        jogadas: jogadas.map(({ m, vezes, melhor }) => ({ titulo: m.titulo, conteudo: m.conteudo, vezes, melhor })),
        constelacoes,
      });
    } catch (erro) {
      console.warn("Falha ao gerar o PDF do relatório", erro);
      setAviso("Não foi possível gerar o PDF agora. Tente de novo.");
    } finally {
      setGerando(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: cor.fundo }}>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingTop: Platform.OS === "ios" ? 20 : insets.top + 14,
          paddingBottom: 24,
        }}
      >
        <View style={r.topo}>
          <Avatar id={jogador.avatar} rosto={jogador.rosto} tamanho={48} />
          <View style={{ flex: 1 }}>
            <Texto style={{ fontSize: 13, color: cor.textoSuave }}>Semana de {periodo}</Texto>
            <Titulo tamanho={22}>A semana de {jogador.nome}</Titulo>
          </View>
          <Pressable onPress={voltar} hitSlop={12} accessibilityLabel="Fechar" style={r.fechar}>
            <Fechar tamanho={18} />
          </Pressable>
        </View>

        <View style={r.conversa}>
          <Lilo tamanho={64} humor={diasLuz > 0 ? "orgulhoso" : "curioso"} />
          <View style={r.balao}>
            <View style={r.rabo} />
            <Texto style={{ fontSize: 15, lineHeight: 21, color: cor.tinta, fontFamily: fonte.textoMedio }}>
              {frase}
            </Texto>
            <Texto style={{ fontSize: 12, color: cor.textoSuave, marginTop: 4 }}>
              Lilo {estagio.nome} · {acesasTotal} {acesasTotal === 1 ? "estrela acesa" : "estrelas acesas"} no céu
            </Texto>
          </View>
        </View>

        <View style={r.secaoTopo}>
          <Titulo tamanho={17}>Dias de luz</Titulo>
          <Texto style={{ fontSize: 13, color: cor.textoSuave }}>{diasLuz} de 7</Texto>
        </View>
        <View style={r.semana}>
          {semana.map((s, i) => {
            const aceso = dias.includes(s.data);
            const hoje = s.data === hojeTxt;
            return (
              <View key={s.data} style={{ flex: 1, alignItems: "center", gap: 6 }}>
                <Texto style={{ fontSize: 11, color: hoje ? cor.roxo : cor.textoSuave, fontFamily: fonte.textoForte }}>
                  {LETRAS[i]}
                </Texto>
                <View style={[r.dia, aceso && r.diaAceso, hoje && !aceso && r.diaHoje]}>
                  {aceso ? (
                    <Estrela tamanho={18} />
                  ) : (
                    <Texto style={{ fontSize: 12, color: cor.textoFraco }}>{s.dia}</Texto>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <View style={r.numeros}>
          <Numero valor={daSemana.length} rotulo={daSemana.length === 1 ? "missão jogada" : "missões jogadas"} />
          <View style={r.divisa} />
          <Numero valor={estrelas} rotulo="estrelas ganhas" />
          <View style={r.divisa} />
          <Numero valor={rodadas ? `${acertos}%` : "—"} rotulo="de primeira" />
        </View>

        <View style={r.secaoTopo}>
          <Titulo tamanho={17}>O que jogou</Titulo>
        </View>
        <View style={r.lista}>
          {jogadas.length === 0 ? (
            <Texto style={{ color: cor.textoSuave, padding: 14, fontSize: 14 }}>
              As missões desta semana vão aparecer aqui.
            </Texto>
          ) : (
            jogadas.map(({ m, vezes, melhor }, i) => (
              <View key={m.id} style={[r.linha, i > 0 && { borderTopWidth: 1, borderTopColor: cor.borda }]}>
                <View style={[r.icone, { backgroundColor: COR_MISSAO[m.cor].claro }]}>
                  <IconeMissao jogo={m.jogo} tamanho={22} />
                </View>
                <View style={{ flex: 1 }}>
                  <Texto style={{ fontFamily: fonte.textoForte, color: cor.tinta }}>{m.titulo}</Texto>
                  <Texto style={{ fontSize: 12, color: cor.textoSuave }}>
                    {m.conteudo} · {vezes === 1 ? "1 vez" : `${vezes} vezes`}
                  </Texto>
                </View>
                <Estrelas n={melhor} tamanho={15} />
              </View>
            ))
          )}
        </View>

        {constelacoes.length ? (
          <>
            <View style={r.secaoTopo}>
              <Titulo tamanho={17}>Céu em construção</Titulo>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {constelacoes.map(({ c, acesas }) => (
                <View key={c.id} style={{ width: 104, gap: 6 }}>
                  <Ceu constelacao={c} acesas={acesas} largura={104} altura={104} raio={16} />
                  <View>
                    <Texto style={{ fontFamily: fonte.textoForte, fontSize: 13, color: cor.tinta }} numberOfLines={1}>
                      {c.nome}
                    </Texto>
                    <Texto style={{ fontSize: 11, color: cor.textoSuave }}>
                      {acesas} de {c.estrelas.length} estrelas
                    </Texto>
                  </View>
                </View>
              ))}
            </ScrollView>
          </>
        ) : null}

        <Texto style={{ fontSize: 12, color: cor.textoSuave, textAlign: "center", marginTop: 22 }}>
          Os resultados são referências para acompanhar, não uma nota.
        </Texto>
        {aviso ? (
          <Texto style={{ fontSize: 12, color: cor.pessegoEscuro, textAlign: "center", marginTop: 6 }}>{aviso}</Texto>
        ) : null}
      </ScrollView>

      <View style={[r.rodape, { paddingBottom: insets.bottom + 14 }]}>
        <Botao
          titulo={gerando ? "Gerando o PDF…" : "Compartilhar com a família"}
          onPress={compartilhar}
          disabled={gerando}
        />
      </View>
    </View>
  );
}

function Numero({ valor, rotulo }: { valor: number | string; rotulo: string }) {
  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      <Texto style={{ fontFamily: fonte.tituloForte, fontSize: 26, color: cor.tinta, lineHeight: 32 }}>{valor}</Texto>
      <Texto style={{ fontSize: 12, color: cor.textoSuave, textAlign: "center" }}>{rotulo}</Texto>
    </View>
  );
}

const r = criarEstilos(() => ({
  topo: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18 },
  fechar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: cor.borda,
    backgroundColor: cor.superficie,
  },

  conversa: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  balao: { flex: 1, padding: 14, borderRadius: 20, borderTopLeftRadius: 8, backgroundColor: cor.pessegoClaro },
  rabo: {
    position: "absolute",
    left: -6,
    top: 18,
    width: 14,
    height: 14,
    backgroundColor: cor.pessegoClaro,
    transform: [{ rotate: "45deg" }],
  },

  secaoTopo: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 10,
  },
  semana: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: raio.g,
    backgroundColor: cor.superficie,
    borderWidth: 1,
    borderColor: cor.borda,
  },
  dia: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: cor.fundo,
  },
  diaAceso: { backgroundColor: cor.pessegoClaro, borderWidth: 2, borderColor: cor.pessego },
  diaHoje: { borderWidth: 2, borderColor: cor.roxo, borderStyle: "dashed" },

  numeros: { flexDirection: "row", alignItems: "center", marginTop: 14, paddingVertical: 14 },
  divisa: { width: 1, alignSelf: "stretch", backgroundColor: cor.borda },

  lista: {
    borderRadius: raio.g,
    backgroundColor: cor.superficie,
    borderWidth: 1,
    borderColor: cor.borda,
    overflow: "hidden",
  },
  linha: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  icone: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },

  rodape: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: cor.fundo,
    borderTopWidth: 1,
    borderTopColor: cor.borda,
  },
}));
