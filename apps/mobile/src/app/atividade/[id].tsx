import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { calcularResultado, respostasDeCompletar, type Questao, type ResultadoJogada } from "@modolume/core";
import { voltar } from "@/lib/navegacao";
import { embaralhar, sementeDe } from "@/lib/embaralhar";
import { useAcessibilidade, useFalarAoAbrir } from "@/estado/acessibilidade";
import { useConta } from "@/estado/conta";
import { useJogador } from "@/estado/jogador";
import { Estrelas } from "@/componentes/blocos";
import { Fechar } from "@/componentes/Icones";
import { Acoes } from "@/componentes/jogos/Acoes";
import { Lilo, type HumorLilo } from "@/componentes/Lilo";
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

type Retorno = { tipo: "acerto" | "erro"; texto: string } | null;
type Conferir = () => { certo: boolean; dica?: string };

/* ---------------------------------- objetiva ---------------------------------- */
function Objetiva({ q, registrar }: { q: Extract<Questao, { tipo: "objetiva" }>; registrar: (c: Conferir) => void }) {
  const [escolha, setEscolha] = useState<number | null>(null);
  const [erradas, setErradas] = useState<number[]>([]);
  registrar(() => {
    if (escolha === null) return { certo: false, dica: "Escolha uma alternativa." };
    if (escolha === q.correta) return { certo: true };
    setErradas((e) => [...e, escolha]);
    setEscolha(null);
    return { certo: false, dica: "Essa não é a resposta. Leia de novo e escolha outra." };
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
function Completar({ q, registrar }: { q: Extract<Questao, { tipo: "completar" }>; registrar: (c: Conferir) => void }) {
  const respostas = respostasDeCompletar(q.texto);
  const partes = q.texto.split(/\[[^\]]+\]/);
  const [valores, setValores] = useState<string[]>(() => respostas.map(() => ""));
  const [erradas, setErradas] = useState<number[]>([]);
  registrar(() => {
    if (valores.some((v) => !v.trim())) return { certo: false, dica: "Preencha todos os espaços." };
    const err = respostas.map((r, i) => (igual(r, valores[i]!) ? -1 : i)).filter((i) => i >= 0);
    setErradas(err);
    return err.length === 0
      ? { certo: true }
      : {
          certo: false,
          dica: err.length === 1 ? "Um espaço ainda não está certo." : "Alguns espaços ainda não estão certos.",
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
  registrar,
}: {
  q: Extract<Questao, { tipo: "associacao-visual" }>;
  semente: number;
  registrar: (c: Conferir) => void;
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
  registrar(() => {
    if (Object.keys(ligacoes).length < q.pares.length) return { certo: false, dica: "Ligue todos os pares." };
    const erradas = Object.entries(ligacoes).filter(([a, b]) => Number(a) !== b);
    if (erradas.length === 0) return { certo: true };
    // desfaz só as ligações erradas
    setLigacoes((l) => Object.fromEntries(Object.entries(l).filter(([a, b]) => Number(a) === b)));
    return {
      certo: false,
      dica: `${erradas.length === 1 ? "Um par não combina" : "Alguns pares não combinam"}. Tente de novo.`,
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
  registrar,
}: {
  q: Extract<Questao, { tipo: "sequencia" }>;
  semente: number;
  registrar: (c: Conferir) => void;
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
  registrar(() => {
    if (ordem.length < q.itens.length) return { certo: false, dica: "Coloque todos os itens na ordem." };
    const primeiraErrada = ordem.findIndex((v, i) => v !== i);
    if (primeiraErrada < 0) return { certo: true };
    setOrdem(ordem.slice(0, primeiraErrada));
    return { certo: false, dica: `A posição ${primeiraErrada + 1} não está certa. Continue dali.` };
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
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { atividades, registrarJogada, online } = useConta();
  const { vibrar } = useJogador();
  const { falar } = useAcessibilidade();
  const atividade = atividades.find((a) => a.id === id);
  useFalarAoAbrir(atividade ? `${atividade.titulo}. ${atividade.instrucao}` : "Atividade não encontrada.");

  const [indice, setIndice] = useState(0);
  const [erros, setErros] = useState<number[]>(() => atividade?.questoes.map(() => 0) ?? []);
  const [retorno, setRetorno] = useState<Retorno>(null);
  const [resultado, setResultado] = useState<ResultadoJogada | null>(null);
  const inicio = useRef(0);
  useEffect(() => {
    inicio.current = Date.now();
  }, []);
  const conferirAtual = useRef<Conferir>(() => ({ certo: false }));

  if (!atividade || atividade.formato === "pronta" || atividade.questoes.length === 0) {
    return (
      <View style={[e.centro, { paddingTop: insets.top + 40 }]}>
        <Lilo humor="triste" tamanho={110} />
        <Titulo tamanho={20} style={{ textAlign: "center" }}>
          Atividade não encontrada
        </Titulo>
        <Texto style={{ textAlign: "center", color: cor.textoSuave }}>Volte e atualize a lista do professor.</Texto>
        <Botao titulo="Voltar" onPress={voltar} style={{ alignSelf: "stretch" }} />
      </View>
    );
  }

  const total = atividade.questoes.length;
  const q = atividade.questoes[indice]!;
  const comando = ("comando" in q && q.comando) || atividade.instrucao;

  function conferir() {
    const r = conferirAtual.current();
    if (r.certo) {
      vibrar("acerto");
      falar("Isso mesmo!");
      setRetorno({ tipo: "acerto", texto: "Isso mesmo!" });
    } else {
      vibrar("erro");
      const texto = r.dica ?? "Ainda não. Confira e tente de novo.";
      falar(texto);
      // pedir para completar algo não conta como erro; resposta errada conta
      if (!/^(Escolha|Preencha|Ligue|Coloque)/.test(texto))
        setErros((x) => x.map((v, i) => (i === indice ? v + 1 : v)));
      setRetorno({ tipo: "erro", texto });
    }
  }

  function continuar() {
    setRetorno(null);
    if (indice + 1 < total) return setIndice((i) => i + 1);
    const r = calcularResultado({
      missao: { id: atividade!.id, formato: atividade!.formato as ResultadoJogada["formato"] },
      errosPorRodada: erros,
      tempoSegundos: (Date.now() - inicio.current) / 1000,
    });
    registrarJogada(r, { origem: "professor", titulo: atividade!.titulo, atividadeId: atividade!.id });
    setResultado(r);
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
            : "O seu resultado foi para o professor."}
        </Texto>
        <Botao titulo="Voltar às atividades" onPress={voltar} style={{ alignSelf: "stretch", marginTop: "auto" }} />
      </View>
    );
  }

  const semente = sementeDe([indice + 1, atividade.titulo.length, total]);
  const registrar = (c: Conferir) => {
    conferirAtual.current = c;
  };

  return (
    <View style={{ flex: 1, backgroundColor: cor.fundo, paddingTop: insets.top }}>
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
        {atividade.questoes.map((_, i) => (
          <View
            key={i}
            style={[e.fase, { backgroundColor: i < indice ? cor.roxo : i === indice ? cor.lilas : cor.trilho }]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }} keyboardShouldPersistTaps="handled">
        {comando ? <Texto style={e.comando}>{comando}</Texto> : null}
        {q.tipo === "objetiva" ? (
          <Objetiva key={indice} q={q} registrar={registrar} />
        ) : q.tipo === "completar" ? (
          <Completar key={indice} q={q} registrar={registrar} />
        ) : q.tipo === "associacao-visual" ? (
          <Associacao key={indice} q={q} semente={semente} registrar={registrar} />
        ) : (
          <Sequencia key={indice} q={q} semente={semente} registrar={registrar} />
        )}
      </ScrollView>

      <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 16, gap: 8 }}>
        {retorno ? (
          <View
            accessibilityLiveRegion="polite"
            style={[e.retorno, { backgroundColor: retorno.tipo === "acerto" ? cor.roxoClaro : cor.pessegoClaro }]}
          >
            <Texto style={{ fontFamily: fonte.textoForte, color: cor.tinta }}>{retorno.texto}</Texto>
          </View>
        ) : null}
        <Acoes>
          {retorno?.tipo === "acerto" ? (
            <Botao
              titulo={indice + 1 < total ? "Continuar" : "Ver resultado"}
              onPress={continuar}
              style={{ flex: 1 }}
            />
          ) : (
            <Botao titulo="Conferir" onPress={conferir} style={{ flex: 1 }} />
          )}
        </Acoes>
      </View>
    </View>
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
  retorno: { borderRadius: raio.m, padding: 12 },
}));
