import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { voltar } from "@/lib/navegacao";
import { useJogador } from "@/estado/jogador";
import { FormPerfil } from "@/componentes/FormPerfil";
import { Fechar } from "@/componentes/Icones";
import { Titulo } from "@/componentes/ui";
import { cor } from "@/tema";

export default function EditarPerfil() {
  const insets = useSafeAreaInsets();
  const { jogador, editarPerfil } = useJogador();
  if (!jogador) return null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: cor.fundo }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          padding: 20,
          paddingTop: Platform.OS === "ios" ? 20 : insets.top + 16,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <Titulo tamanho={22}>Editar nome</Titulo>
          <Pressable onPress={voltar} hitSlop={12} accessibilityLabel="Fechar">
            <Fechar />
          </Pressable>
        </View>
        <FormPerfil
          inicial={jogador}
          textoBotao="Salvar"
          onSalvar={(dados) => {
            editarPerfil(dados);
            voltar();
          }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
