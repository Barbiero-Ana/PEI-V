import { View } from "react-native";
import { missaoPorId, nivelDaMissao, nivelLiberado } from "@modolume/core";
import { useLocalSearchParams } from "expo-router";
import { voltar } from "@/lib/navegacao";
import { useJogador } from "@/estado/jogador";
import { Partida } from "@/componentes/Partida";
import { Lilo } from "@/componentes/Lilo";
import { Botao, Texto, Titulo } from "@/componentes/ui";
import { cor } from "@/tema";
import { EsqueletoTela } from "@/componentes/Esqueleto";

export default function Jogar() {
  // "atividade": a missão foi enviada pelo professor como atividade pronta do app
  const { id, atividade } = useLocalSearchParams<{ id: string; atividade?: string }>();
  const { pronto, jogador, progresso, preferencias } = useJogador();
  const missao = missaoPorId(id);

  if (!pronto || !jogador) return <EsqueletoTela formato="jogo" />;

  const nivel = missao ? nivelDaMissao(missao.id) : undefined;
  // atividade do professor abre mesmo com o mapa ainda bloqueado
  const liberado =
    Boolean(atividade) || (nivel ? nivelLiberado(nivel.numero, progresso, preferencias.liberarTodos) : false);

  if (!missao || !liberado) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          gap: 10,
          backgroundColor: cor.fundo,
        }}
      >
        <Lilo humor="triste" tamanho={110} />
        <Titulo tamanho={20} style={{ textAlign: "center" }}>
          {missao ? "Missão bloqueada" : "Missão não encontrada"}
        </Titulo>
        <Texto style={{ textAlign: "center", color: cor.textoSuave }}>
          {missao ? `Conclua o mapa ${(nivel?.numero ?? 2) - 1} para liberar.` : "Volte e escolha outra missão."}
        </Texto>
        <Botao titulo="Voltar" onPress={voltar} style={{ marginTop: 8, alignSelf: "stretch" }} />
      </View>
    );
  }

  return <Partida key={missao.id} missao={missao} atividadeId={atividade} />;
}
