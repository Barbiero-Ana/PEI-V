import { useEffect, useImperativeHandle, useMemo, useRef, useState, type Ref } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  calcularResultado,
  esquemaQuestao,
  respostasDeCompletar,
  type Questao,
  type ResultadoJogada,
} from "@modolume/core";
import { voltar } from "@/lib/navegacao";
import { embaralhar, sementeDe } from "@/lib/embaralhar";
import { useAcessibilidade, useFalarAoAbrir } from "@/estado/acessibilidade";
import { useConta, type AtividadeDoProfessor } from "@/estado/conta";
import { useJogador } from "@/estado/jogador";
import { Estrelas } from "@/componentes/blocos";
import { Fechar } from "@/componentes/Icones";
import { Acoes } from "@/componentes/jogos/Acoes";
import { Lilo, type HumorLilo } from "@/componentes/Lilo";
import { Retorno as PainelLilo } from "@/componentes/Retorno";
import { EsqueletoTela } from "@/componentes/Esqueleto";
import { Botao, Texto, Titulo } from "@/componentes/ui";
import { cor, criarEstilos, fonte, raio } from "@/tema";

/**
 * Atividade enviada pelo professor, com as questões que ele montou no painel:
 * objetiva, completar lacunas, associação ou sequência. Tudo funciona por
 * toque (sem arrastar). Cada questão é uma rodada: errar mostra o retorno e
 * deixa tentar de novo, sem tirar pontos. No fim, o resultado vai para o
 * professor (ou fica na fila até a internet voltar).
 */

/** Compara respostas sem diferença de maiúsculas, espaços, acentos e vírgula/ponto decimal. */
const igual = (a: string, b: string) => {
  const n = (s: string) =>
    s
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/,/g, ".");
  return n(a) === n(b);
};

type Retorno = { tipo: "acerto" | "incompleta" | "erro"; texto: string };
type Conferir = () => Retorno;
const ACERTO: Retorno = { tipo: "acerto", texto: "Isso mesmo!" };

/* ---------------------------------- objetiva ---------------------------------- */
function Objetiva({ q, conferencia }: { q: Extract<Questao, { tipo: "objetiva" }>; conferencia: Ref<Conferir> }) {
  const [escolha, setEscolha] = useState<number | null>(null);
  const [erradas, setErradas] = useState<number[]>([]);
  useImperativeHandle(conferencia, () => () => {
    if (escolha === null) return { tipo: "incompleta", texto: "Escolha uma alternativa." };
    if (escolha === q.correta) return ACERTO;
    setErradas((e) => [...e, escolha]);
    setEscolha(null);
    return { tipo: "erro", texto: "Essa não é a resposta. Leia de novo e escolha outra." };
  });
  return (
    <View style={{ gap: 10 }} accessibilityRole="radiogroup">
      <Texto style={e.enunciado}>{q.enunciado}</Texto>
      {q.alternativas.map((alt, i) => {
        const sel = escolha === i;
        const errada = erradas.includes(i);
        return (
          <Pressable
            key={i}
            disabled={errada}
            onPress={() => setEscolha(i)}
            accessibilityRole="radio"
            accessibilityState={{ selected: sel, disabled: errada }}
            style={[e.opcao, sel && e.opcaoSel, errada && e.opcaoErrada]}
          >
            <Texto style={[e.letra, sel && { color: "#fff", backgroundColor: cor.roxo }]}>{"ABCDE"[i]}</Texto>
            <Texto style={[e.opcaoTexto, errada && { textDecorationLine: "line-through", color: cor.textoFraco }]}>
              {alt}
            </Texto>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ---------------------------------- completar ---------------------------------- */
function Completar({ q, conferencia }: { q: Extract<Questao, { tipo: "completar" }>; conferencia: Ref<Conferir> }) {
  const respostas = respostasDeCompletar(q.texto);
  const partes = q.texto.split(/\[[^\]]+\]/);
  const [valores, setValores] = useState<string[]>(() => respostas.map(() => ""));
  const [erradas, setErradas] = useState<number[]>([]);
  useImperativeHandle(conferencia, () => () => {
    if (valores.some((v) => !v.trim())) return { tipo: "incompleta", texto: "Preencha todos os espaços." };
    const err = respostas.map((r, i) => (igual(r, valores[i]!) ? -1 : i)).filter((i) => i >= 0);
    setErradas(err);
    return err.length === 0
      ? ACERTO
      : {
          tipo: "erro",
          texto: err.length === 1 ? "Um espaço ainda não está certo." : "Alguns espaços ainda não estão certos.",
        };
  });
  return (
    <View style={e.frase}>
      {partes.map((p, i) => (
        <View key={i} style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center" }}>
          {p ? <Texto style={e.enunciado}>{p}</Texto> : null}
          {i < respostas.length ? (
            <TextInput
              value={valores[i]}
              onChangeText={(t) => {
                setValores((v) => v.map((x, j) => (j === i ? t : x)));
                setErradas((er) => er.filter((x) => x !== i));
              }}
              accessibilityLabel={`Espaço ${i + 1}`}
              autoCorrect={false}
              autoCapitalize="none"
              style={[e.lacuna, erradas.includes(i) && { borderColor: cor.pessegoEscuro }]}
            />
          ) : null}
        </View>
      ))}
    </View>
  );
}

/* ---------------------------------- associação ---------------------------------- */
function Associacao({
  q,
  semente,
  conferencia,
}: {
  q: Extract<Questao, { tipo: "associacao-visual" }>;
  semente: number;
  conferencia: Ref<Conferir>;
}) {
  const direita = useMemo(
    () =>
      embaralhar(
        q.pares.map((_, i) => i),
        semente,
      ),
    [q, semente],
  );
  const [ligacoes, setLigacoes] = useState<Record<number, number>>({});
  const [aberto, setAberto] = useState<number | null>(null);
  useImperativeHandle(conferencia, () => () => {
    if (Object.keys(ligacoes).length < q.pares.length) return { tipo: "incompleta", texto: "Ligue todos os pares." };
    const erradas = Object.entries(ligacoes).filter(([a, b]) => Number(a) !== b);
    if (erradas.length === 0) return ACERTO;
    // desfaz só as ligações erradas
    setLigacoes((l) => Object.fromEntries(Object.entries(l).filter(([a, b]) => Number(a) === b)));
    return {
      tipo: "erro",
      texto: `${erradas.length === 1 ? "Um par não combina" : "Alguns pares não combinam"}. Tente de novo.`,
    };
  });
  const numeroDe = (a: number) => Object.keys(ligacoes).map(Number).sort().indexOf(a) + 1;
  return (
    <View style={{ gap: 8 }}>
      <Texto style={e.ajuda}>Toque num item da esquerda e depois no par dele à direita.</Texto>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1, gap: 8 }}>
          {q.pares.map((p, i) => {
            const ligado = ligacoes[i] !== undefined;
            return (
              <Pressable
                key={i}
                onPress={() => (ligado ? setLigacoes(({ [i]: _, ...resto }) => resto) : setAberto(i))}
                accessibilityRole="button"
                accessibilityState={{ selected: aberto === i }}
                accessibilityLabel={`${p.a}${ligado ? ", ligado. Toque para desfazer" : ""}`}
                style={[e.item, aberto === i && e.opcaoSel, ligado && e.itemLigado]}
              >
                {ligado ? <Texto style={e.selo}>{numeroDe(i)}</Texto> : null}
                <Texto style={e.itemTexto}>{p.a}</Texto>
              </Pressable>
            );
          })}
        </View>
        <View style={{ flex: 1, gap: 8 }}>
          {direita.map((j) => {
            const de = Object.entries(ligacoes).find(([, b]) => b === j)?.[0];
            return (
              <Pressable
                key={j}
                disabled={aberto === null || de !== undefined}
                onPress={() => {
                  if (aberto === null) return;
                  setLigacoes((l) => ({ ...l, [aberto]: j }));
                  setAberto(null);
                }}
                accessibilityRole="button"
                accessibilityLabel={q.pares[j]!.b}
                style={[e.item, de !== undefined && e.itemLigado]}
              >
                {de !== undefined ? <Texto style={e.selo}>{numeroDe(Number(de))}</Texto> : null}
                <Texto style={e.itemTexto}>{q.pares[j]!.b}</Texto>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

/* ---------------------------------- sequência ---------------------------------- */
function Sequencia({
  q,
  semente,
  conferencia,
}: {
  q: Extract<Questao, { tipo: "sequencia" }>;
  semente: number;
  conferencia: Ref<Conferir>;
}) {
  const soltos = useMemo(
    () =>
      embaralhar(
        q.itens.map((_, i) => i),
        semente,
      ),
    [q, semente],
  );
  const [ordem, setOrdem] = useState<number[]>([]);
  useImperativeHandle(conferencia, () => () => {
    if (ordem.length < q.itens.length) return { tipo: "incompleta", texto: "Coloque todos os itens na ordem." };
    const primeiraErrada = ordem.findIndex((v, i) => v !== i);
    if (primeiraErrada < 0) return ACERTO;
    setOrdem(ordem.slice(0, primeiraErrada));
    return { tipo: "erro", texto: `A posição ${primeiraErrada + 1} não está certa. Continue dali.` };
  });
  return (
    <View style={{ gap: 12 }}>
      <Texto style={e.ajuda}>Toque nos itens na ordem certa. Toque de novo num item da sua ordem para tirar.</Texto>
      <View style={e.trilha}>
        {ordem.length === 0 ? <Texto style={{ color: cor.textoFraco }}>Sua ordem aparece aqui.</Texto> : null}
        {ordem.map((i, pos) => (
          <Pressable
            key={i}
            onPress={() => setOrdem((o) => o.filter((x) => x !== i))}
            accessibilityRole="button"
            accessibilityLabel={`${pos + 1}º: ${q.itens[i]}. Toque para tirar.`}
            style={[e.item, e.itemLigado]}
          >
            <Texto style={e.selo}>{pos + 1}</Texto>
            <Texto style={e.itemTexto}>{q.itens[i]}</Texto>
          </Pressable>
        ))}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {soltos
          .filter((i) => !ordem.includes(i))
          .map((i) => (
            <Pressable
              key={i}
              onPress={() => setOrdem((o) => [...o, i])}
              accessibilityRole="button"
              accessibilityLabel={q.itens[i]}
              style={e.chip}
            >
              <Texto style={e.itemTexto}>{q.itens[i]}</Texto>
            </Pressable>
          ))}
      </View>
    </View>
  );
}

/* ---------------------------------- tela ---------------------------------- */
export default function Atividade() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AbrirAtividade key={id} id={id} />;
}

function AbrirAtividade({ id }: { id: string }) {
  const insets = useSafeAreaInsets();
  const { atividades, pronto, carregandoAtividades } = useConta();
  const encontrada = atividades.find((a) => a.id === id);
  const [copia, guardarCopia] = useState<AtividadeDoProfessor | null>(null);
  const atividade = copia ?? encontrada;
  const questoes = useMemo(() => {
    const lidas = esquemaQuestao.array().safeParse(atividade?.questoes);
    if (!lidas.success || lidas.data.length === 0) return null;
    return lidas.data.every(
      (q) => q.tipo === atividade?.formato && (q.tipo !== "objetiva" || q.correta < q.alternativas.length),
    )
      ? lidas.data
      : null;
  }, [atividade]);
  // Uma atualização da lista não altera as perguntas de uma partida em andamento.
  if (atividade && questoes && !copia) guardarCopia(atividade);
  if (atividade && questoes) return <ResponderAtividade atividade={atividade} questoes={questoes} />;
  if (!pronto || carregandoAtividades) return <EsqueletoTela formato="jogo" />;

  return (
    <View style={[e.centro, { paddingTop: insets.top + 40 }]}>
      <Lilo humor="triste" tamanho={110} />
      <Titulo tamanho={20} style={{ textAlign: "center" }}>
        Não foi possível abrir esta atividade
      </Titulo>
      <Texto style={{ textAlign: "center", color: cor.textoSuave }}>Volte e atualize a lista do professor.</Texto>
      <Botao titulo="Voltar" onPress={voltar} style={{ alignSelf: "stretch" }} />
    </View>
  );
}

function ResponderAtividade({ atividade, questoes }: { atividade: AtividadeDoProfessor; questoes: Questao[] }) {
  const insets = useSafeAreaInsets();
  const { registrarJogada, online } = useConta();
  const { vibrar } = useJogador();
  const { falar } = useAcessibilidade();
  useFalarAoAbrir(`${atividade.titulo}. ${atividade.instrucao}`);

  const [indice, setIndice] = useState(0);
  const [erros, setErros] = useState<number[]>(() => questoes.map(() => 0));
  const [retorno, setRetorno] = useState<Retorno | null>(null);
  const [resultado, setResultado] = useState<ResultadoJogada | null>(null);
  const inicio = useRef(0);
  const concluiu = useRef(false);
  const conferirAtual = useRef<Conferir>(null);
  useEffect(() => {
    inicio.current = Date.now();
  }, []);

  const total = questoes.length;
  const q = questoes[indice]!;
  const comando = ("comando" in q && q.comando) || atividade.instrucao;

  function conferir() {
    if (retorno?.tipo === "acerto") return;
    const r = conferirAtual.current?.();
    if (!r) return;
    const texto = r.tipo === "erro" ? q.feedbackErro || r.texto : r.texto;
    if (r.tipo === "acerto") {
      Keyboard.dismiss();
      vibrar("acerto");
    } else if (r.tipo === "erro") {
      vibrar("erro");
      setErros((x) => x.map((v, i) => (i === indice ? v + 1 : v)));
    }
    falar(texto);
    setRetorno({ tipo: r.tipo, texto });
  }

  async function continuar() {
    if (indice + 1 < total) {
      setRetorno(null);
      setIndice(indice + 1);
      return;
    }
    if (concluiu.current) return;
    concluiu.current = true;
    const r = calcularResultado({
      missao: { id: atividade.id, formato: q.tipo },
      errosPorRodada: erros,
      tempoSegundos: (Date.now() - inicio.current) / 1000,
    });
    try {
      await registrarJogada(r, { origem: "professor", titulo: atividade.titulo, atividadeId: atividade.id });
      setResultado(r);
    } catch {
      // O provedor exibe a falha de armazenamento para esta sessão.
    }
  }

  if (resultado) {
    const humor: HumorLilo = resultado.estrelas === 3 ? "orgulhoso" : resultado.estrelas === 2 ? "feliz" : "animado";
    return (
      <View style={[e.centro, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 20 }]}>
        <Lilo humor={humor} tamanho={130} />
        <Titulo tamanho={24} style={{ textAlign: "center" }}>
          Atividade concluída!
        </Titulo>
        <Estrelas n={resultado.estrelas} tamanho={28} />
        <Texto style={{ textAlign: "center", color: cor.texto }}>
          Acertou de primeira {resultado.acertosDePrimeira} de {resultado.rodadas}{" "}
          {resultado.rodadas === 1 ? "questão" : "questões"}.
        </Texto>
        <Texto style={{ textAlign: "center", color: cor.textoSuave }}>
          {online === false
            ? "Sem internet agora: o resultado vai para o professor quando a conexão voltar."
            : "Resultado concluído. Acompanhe o envio na aba Professor."}
        </Texto>
        <Botao titulo="Voltar às atividades" onPress={voltar} style={{ alignSelf: "stretch", marginTop: "auto" }} />
      </View>
    );
  }

  const semente = sementeDe([indice + 1, atividade.titulo.length, total]);
  const acertou = retorno?.tipo === "acerto";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: cor.fundo, paddingTop: insets.top }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={e.cabecalho}>
        <Pressable onPress={voltar} style={e.fechar} hitSlop={8} accessibilityLabel="Sair da atividade">
          <Fechar tamanho={20} />
        </Pressable>
        <Titulo tamanho={18} numberOfLines={1} style={{ flex: 1 }}>
          {atividade.titulo}
        </Titulo>
        <Texto style={{ fontFamily: fonte.titulo, color: cor.textoSuave, fontSize: 13 }}>
          {indice + 1}/{total}
        </Texto>
      </View>
      <View style={e.fases}>
        {questoes.map((_, i) => (
          <View
            key={i}
            style={[e.fase, { backgroundColor: i < indice ? cor.roxo : i === indice ? cor.lilas : cor.trilho }]}
          />
        ))}
      </View>

      <ScrollView
        key={indice}
        pointerEvents={acertou ? "none" : "auto"}
        contentContainerStyle={{ padding: 20, gap: 14 }}
        keyboardShouldPersistTaps="handled"
      >
        {comando ? <Texto style={e.comando}>{comando}</Texto> : null}
        {q.tipo === "objetiva" ? (
          <Objetiva q={q} conferencia={conferirAtual} />
        ) : q.tipo === "completar" ? (
          <Completar q={q} conferencia={conferirAtual} />
        ) : q.tipo === "associacao-visual" ? (
          <Associacao q={q} semente={semente} conferencia={conferirAtual} />
        ) : (
          <Sequencia q={q} semente={semente} conferencia={conferirAtual} />
        )}
      </ScrollView>

      {acertou ? (
        <PainelLilo
          status="acerto"
          titulo={retorno.texto}
          mensagem=""
          humor="animado"
          ultima={indice === total - 1}
          onContinuar={continuar}
          insetBaixo={insets.bottom + 16}
        />
      ) : (
        <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 16, gap: 8 }}>
          {retorno ? (
            <View accessibilityLiveRegion="polite" style={e.retorno}>
              {retorno.tipo === "erro" && q.feedbackErro ? (
                <Texto style={{ color: cor.textoSuave }}>Dica do professor</Texto>
              ) : null}
              <Texto style={{ fontFamily: fonte.textoForte, color: cor.tinta }}>{retorno.texto}</Texto>
            </View>
          ) : null}
          <Acoes>
            <Botao titulo="Conferir" onPress={conferir} style={{ flex: 1 }} />
          </Acoes>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const e = criarEstilos(() => ({
  centro: { flex: 1, alignItems: "center", gap: 12, paddingHorizontal: 24, backgroundColor: cor.fundo },
  cabecalho: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 10 },
  fechar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: cor.superficie,
  },
  fases: { flexDirection: "row", gap: 4, paddingHorizontal: 16 },
  fase: { flex: 1, height: 6, borderRadius: 3 },
  comando: { fontSize: 16, lineHeight: 22, color: cor.textoSuave },
  enunciado: { fontSize: 19, lineHeight: 27, fontFamily: fonte.textoMedio, color: cor.tinta },
  ajuda: { fontSize: 14, color: cor.textoSuave },
  opcao: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 56,
    padding: 12,
    borderRadius: raio.m,
    borderWidth: 2,
    borderColor: cor.borda,
    backgroundColor: cor.superficie,
  },
  opcaoSel: { borderColor: cor.roxo, backgroundColor: cor.roxoClaro },
  opcaoErrada: { opacity: 0.6 },
  letra: {
    width: 32,
    height: 32,
    borderRadius: 16,
    textAlign: "center",
    lineHeight: 32,
    fontFamily: fonte.titulo,
    color: cor.roxoEscuro,
    backgroundColor: cor.roxoClaro,
    overflow: "hidden",
  },
  opcaoTexto: { flex: 1, fontSize: 17, color: cor.tinta },
  frase: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 },
  lacuna: {
    minWidth: 72,
    minHeight: 48,
    paddingHorizontal: 10,
    borderRadius: raio.p,
    borderWidth: 2,
    borderColor: cor.roxo,
    backgroundColor: cor.superficie,
    fontSize: 19,
    fontFamily: fonte.textoForte,
    color: cor.tinta,
    textAlign: "center",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 52,
    paddingHorizontal: 12,
    borderRadius: raio.m,
    borderWidth: 2,
    borderColor: cor.borda,
    backgroundColor: cor.superficie,
  },
  itemLigado: { borderColor: cor.lilas, backgroundColor: cor.lilasClaro },
  itemTexto: { flexShrink: 1, fontSize: 17, color: cor.tinta, fontFamily: fonte.textoMedio },
  selo: {
    width: 26,
    height: 26,
    borderRadius: 13,
    textAlign: "center",
    lineHeight: 26,
    fontFamily: fonte.titulo,
    fontSize: 13,
    color: "#fff",
    backgroundColor: cor.roxo,
    overflow: "hidden",
  },
  trilha: {
    gap: 8,
    minHeight: 60,
    padding: 10,
    borderRadius: raio.m,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: cor.bordaForte,
  },
  chip: {
    minHeight: 48,
    paddingHorizontal: 14,
    justifyContent: "center",
    borderRadius: raio.m,
    borderWidth: 2,
    borderColor: cor.bordaForte,
    backgroundColor: cor.superficie,
  },
  retorno: { borderRadius: raio.m, padding: 12, backgroundColor: cor.pessegoClaro },
}));
