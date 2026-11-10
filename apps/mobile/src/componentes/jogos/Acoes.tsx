import type { ReactNode } from "react";
import { View } from "react-native";

/**
 * Linha de botões da atividade (Limpar, Conferir…). Fica sempre presa ao
 * pé da tela, seja qual for a altura do conteúdo acima: a margem automática
 * empurra a linha para baixo dentro da coluna flex da atividade.
 */
export function Acoes({ children }: { children: ReactNode }) {
  return (
    <View style={{ flexDirection: "row", gap: 10, alignSelf: "stretch", marginTop: "auto", paddingTop: 10 }}>
      {children}
    </View>
  );
}
