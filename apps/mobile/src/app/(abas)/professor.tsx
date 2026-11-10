import { useCallback } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SOBRE_FORMATOS } from "@modolume/core";
import { useFalarAoAbrir } from "@/estado/acessibilidade";
import { useConta, type AtividadeDoProfessor } from "@/estado/conta";
import { CabecalhoTela } from "@/componentes/blocos";
import { Check, IconeProfessor, Seta } from "@/componentes/Icones";
import { Lilo } from "@/componentes/Lilo";
import { Botao, Texto, Titulo } from "@/componentes/ui";
import { cor, criarEstilos, fonte, raio } from "@/tema";

/**
 * Atividades que o professor enviou para a turma, separadas das missões dos
 * mapas (que seguem como o mapeamento padrão da aprendizagem). A lista fica
 * guardada no aparelho: sem internet, o aluno vê a última versão, e o que ele
 * fizer é enviado quando a conexão voltar.
 */

const dataCurta = (iso: string) => iso.split("-").reverse().slice(0, 2).join("/");

function abrir(a: AtividadeDoProfessor) {
  if (a.formato === "pronta") router.push({ pathname: "/jogar/[id]", params: { id: a.missaoId, atividade: a.id } });
  else router.push({ pathname: "/atividade/[id]", params: { id: a.id } });
}

function Cartao({ a }: { a: AtividadeDoProfessor }) {
  const feita = a.feita;
  return (
    <Pressable
      onPress={() => abrir(a)}
      accessibilityRole="button"
      accessibilityLabel={`${a.titulo}. ${feita ? `Feita, ${feita.percentualAcerto}% de acerto` : "Nova"}. Abrir.`}
      style={({ pressed }) => [e.cartao, pressed && { opacity: 0.9 }]}
    >
      <View style={[e.icone, feita && { backgroundColor: cor.roxoClaro }]}>
        {feita ? <Check tamanho={18} cor={cor.roxoEscuro} /> : <IconeProfessor tamanho={22} cor={cor.pessegoEscuro} />}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Texto style={e.tipo}>
          {SOBRE_FORMATOS[a.formato]?.nome ?? "Atividade"} · desde {dataCurta(a.liberarEm)}
        </Texto>
        <Texto style={e.titulo}>{a.titulo}</Texto>
        {a.instrucao ? (
          <Texto style={e.instrucao} numberOfLines={2}>
            {a.instrucao}
          </Texto>
        ) : null}
        <Texto style={[e.situacao, feita ? { color: cor.roxoEscuro } : { color: cor.pessegoEscuro }]}>
          {feita ? `Feita · ${feita.percentualAcerto}% de acerto` : "Nova · toque para fazer"}
        </Texto>
      </View>
      <Seta tamanho={18} cor={cor.textoFraco} direcao="direita" />
    </Pressable>
  );
}

export default function Professor() {
  const insets = useSafeAreaInsets();
  const {
    temServidor,
    conta,
    atividades,
    carregandoAtividades,
    estadoAtividades,
    atualizarAtividades,
    pendentes,
    recusadas,
  } = useConta();
  useFalarAoAbrir("Atividades do professor.");

  // ao abrir a aba, busca a lista mais nova
  useFocusEffect(
    useCallback(() => {
      atualizarAtividades();
    }, [atualizarAtividades]),
  );

  const novas = atividades.filter((a) => !a.feita);
  const feitas = atividades.filter((a) => a.feita);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: cor.fundo }}
      contentContainerStyle={[e.tela, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 110 }]}
      refreshControl={
        conta ? (
          <RefreshControl refreshing={carregandoAtividades} onRefresh={atualizarAtividades} tintColor={cor.roxo} />
        ) : undefined
      }
    >
      <CabecalhoTela rotulo={conta ? conta.turma.nome : undefined} titulo="Do professor" />

      {!temServidor || !conta ? (
        <View style={e.vazio}>
          <Lilo humor="curioso" tamanho={110} />
          <Titulo tamanho={20} style={{ textAlign: "center" }}>
            Entre na sua turma
          </Titulo>
          <Texto style={e.centro}>
            Com seu código pessoal, as atividades que o seu professor mandar aparecem aqui. As missões dos mapas
            continuam valendo do mesmo jeito.
          </Texto>
          {temServidor ? (
            <Botao titulo="Entrar na turma" onPress={() => router.push("/entrar")} style={{ alignSelf: "stretch" }} />
          ) : null}
          {recusadas > 0 && (
            <View style={e.aviso} accessibilityLiveRegion="polite">
              <Texto style={e.avisoTexto}>
                {recusadas}{" "}
                {recusadas === 1
                  ? "resultado não pôde ser enviado e ficou guardado"
                  : "resultados não puderam ser enviados e ficaram guardados"}{" "}
                neste aparelho. Fale com seu professor.
              </Texto>
            </View>
          )}
        </View>
      ) : (
        <>
          {pendentes > 0 ? (
            <View style={e.aviso} accessibilityLiveRegion="polite">
              <Texto style={e.avisoTexto}>
                {pendentes} {pendentes === 1 ? "jogada aguarda envio" : "jogadas aguardam envio"}.
              </Texto>
            </View>
          ) : null}

          {estadoAtividades === "erro" ? (
            <View style={e.aviso} accessibilityLiveRegion="polite">
              <Texto style={e.avisoTexto}>
                {atividades.length > 0
                  ? "Não foi possível atualizar. Mostrando as atividades guardadas."
                  : "Não foi possível carregar as atividades. Confira a conexão e tente novamente."}
              </Texto>
              <Botao titulo="Tentar novamente" onPress={atualizarAtividades} carregando={carregandoAtividades} />
            </View>
          ) : null}

          {estadoAtividades === "aguardando" && atividades.length === 0 ? (
            <Texto style={e.centro}>Carregando atividades…</Texto>
          ) : null}

          {estadoAtividades === "atualizadas" && atividades.length === 0 ? (
            <View style={e.vazio}>
              <Lilo humor="feliz" tamanho={100} />
              <Texto style={e.centro}>
                Nenhuma atividade do professor por enquanto. Enquanto isso, as missões dos mapas esperam por você!
              </Texto>
            </View>
          ) : null}

          {novas.length > 0 ? (
            <View style={{ gap: 10 }}>
              <Titulo tamanho={18}>Para fazer</Titulo>
              {novas.map((a) => (
                <Cartao key={a.id} a={a} />
              ))}
            </View>
          ) : null}
          {feitas.length > 0 ? (
            <View style={{ gap: 10 }}>
              <Titulo tamanho={18}>Feitas</Titulo>
              {feitas.map((a) => (
                <Cartao key={a.id} a={a} />
              ))}
            </View>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

const e = criarEstilos(() => ({
  tela: { paddingHorizontal: 20, gap: 18 },
  vazio: { alignItems: "center", gap: 12, paddingVertical: 24 },
  centro: { textAlign: "center", color: cor.textoSuave },
  aviso: { backgroundColor: cor.pessegoClaro, borderRadius: raio.m, padding: 12 },
  avisoTexto: { color: cor.tinta, fontFamily: fonte.textoMedio },
  cartao: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 72,
    padding: 14,
    borderRadius: raio.g,
    backgroundColor: cor.superficie,
    borderWidth: 1,
    borderColor: cor.borda,
  },
  icone: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: cor.pessegoClaro,
  },
  tipo: { fontSize: 12, color: cor.textoSuave, fontFamily: fonte.textoMedio },
  titulo: { fontFamily: fonte.titulo, color: cor.tinta, fontSize: 16 },
  instrucao: { color: cor.texto, fontSize: 14 },
  situacao: { fontFamily: fonte.textoForte, fontSize: 13, marginTop: 2 },
}));
