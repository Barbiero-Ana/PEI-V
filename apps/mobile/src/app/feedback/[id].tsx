import { useCallback, useEffect } from "react";
import { ScrollView } from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useConta } from "@/estado/conta";
import { Botao, Texto, Titulo } from "@/componentes/ui";
import { voltar } from "@/lib/navegacao";
import { cor } from "@/tema";

export default function Feedback() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { avaliacoes, avisos, marcarAvisosLidos, atualizarAtividades, carregandoAtividades } = useConta();
  useFocusEffect(
    useCallback(() => {
      void atualizarAtividades();
    }, [atualizarAtividades]),
  );
  useEffect(() => {
    const ids = avisos.filter((a) => a.avaliacaoId === id && !a.lida).map((a) => a.id);
    if (ids.length) marcarAvisosLidos(ids);
  }, [id, avisos, marcarAvisosLidos]);
  const avaliacao = avaliacoes.find((a) => a.id === id);
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: cor.fundo }}
      contentContainerStyle={{ padding: 22, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 30, gap: 18 }}
    >
      <Botao titulo="Voltar" onPress={voltar} />
      <Titulo tamanho={25}>Orientação do professor</Titulo>
      {avaliacao ? (
        <>
          <Titulo tamanho={20}>{avaliacao.atividade.titulo}</Titulo>
          <Texto style={{ color: cor.textoSuave }}>
            {avaliacao.professor.nome} · {new Date(avaliacao.criadaEm).toLocaleDateString("pt-BR")}
          </Texto>
          <Texto style={{ fontSize: 18, lineHeight: 28 }}>{avaliacao.feedback}</Texto>
          {avaliacao.percepcao ? <Texto>Habilidade: {avaliacao.percepcao}</Texto> : null}
        </>
      ) : (
        <>
          <Texto>
            {carregandoAtividades
              ? "Buscando sua orientação…"
              : "Esta orientação ainda não está no aparelho. Conecte-se e tente atualizar."}
          </Texto>
          <Botao titulo="Atualizar" onPress={atualizarAtividades} />
        </>
      )}
    </ScrollView>
  );
}
