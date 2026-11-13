import { useCallback } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { dataEscolar } from "@modolume/core";
import { useConta } from "@/estado/conta";
import { Botao, Texto, Titulo } from "@/componentes/ui";
import { voltar } from "@/lib/navegacao";
import { cor } from "@/tema";

export default function Avisos() {
  const insets = useSafeAreaInsets();
  const { conta, avisos, atividades, atualizarAtividades, marcarAvisosLidos, carregandoAtividades, estadoAtividades } =
    useConta();
  useFocusEffect(
    useCallback(() => {
      void atualizarAtividades();
    }, [atualizarAtividades]),
  );
  const naoLidos = avisos.filter((a) => !a.lida);
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: cor.fundo }}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 30, gap: 16 }}
      refreshControl={<RefreshControl refreshing={carregandoAtividades} onRefresh={atualizarAtividades} />}
    >
      <Botao titulo="Voltar" onPress={voltar} />
      <Titulo tamanho={26}>Seus avisos</Titulo>
      {estadoAtividades === "erro" ? (
        <Texto>
          Não foi possível atualizar. Os avisos guardados continuam aqui. Puxe a tela para tentar novamente.
        </Texto>
      ) : null}
      {!conta ? <Texto>Entre com seu código para receber os avisos da escola.</Texto> : null}
      {naoLidos.length ? (
        <Botao titulo="Marcar todos como lidos" onPress={() => marcarAvisosLidos(naoLidos.map((a) => a.id))} />
      ) : null}
      {conta && !avisos.length ? <Texto>Você está em dia. Os próximos avisos aparecerão aqui.</Texto> : null}
      {avisos.map((a) => (
        <Pressable
          key={a.id}
          accessibilityRole="button"
          accessibilityLabel={`${a.lida ? "Lido" : "Não lido"}. ${a.titulo}. ${a.texto}`}
          onPress={() => {
            marcarAvisosLidos([a.id]);
            if (a.avaliacaoId) router.push({ pathname: "/feedback/[id]", params: { id: a.avaliacaoId } });
            else if (a.atividadeId) {
              const atividade = atividades.find((v) => v.id === a.atividadeId);
              if (!atividade || (atividade.prazo && atividade.prazo < dataEscolar())) router.push("/professor");
              else if (atividade.formato === "pronta")
                router.push({ pathname: "/jogar/[id]", params: { id: atividade.missaoId, atividade: atividade.id } });
              else router.push({ pathname: "/atividade/[id]", params: { id: atividade.id } });
            }
          }}
          style={{ borderRadius: 18, padding: 18, backgroundColor: a.lida ? cor.superficie : cor.roxoClaro, gap: 6 }}
        >
          <Titulo tamanho={17}>{a.titulo}</Titulo>
          <Texto>{a.texto}</Texto>
          <Texto style={{ color: cor.textoSuave }}>
            {a.lida ? "Lido" : "Novo"} · {a.data.split("-").reverse().join("/")}
          </Texto>
        </Pressable>
      ))}
      <View style={{ height: 12 }} />
    </ScrollView>
  );
}
