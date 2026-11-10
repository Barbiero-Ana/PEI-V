import { Modal, Pressable, View } from "react-native";
import { Botao, Texto, Titulo } from "./ui";
import { cor, criarEstilos, raio } from "@/tema";

/** Caixa de confirmação (funciona igual no Android, iOS e web). */
export function Confirmar({
  aberto,
  titulo,
  mensagem,
  textoConfirmar,
  perigoso = false,
  onConfirmar,
  onCancelar,
}: {
  aberto: boolean;
  titulo: string;
  mensagem: string;
  textoConfirmar: string;
  perigoso?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  return (
    <Modal visible={aberto} transparent statusBarTranslucent animationType="fade" onRequestClose={onCancelar}>
      <Pressable style={m.fundo} onPress={onCancelar} accessibilityLabel="Fechar">
        <Pressable style={m.caixa} onPress={() => {}}>
          <Titulo tamanho={19}>{titulo}</Titulo>
          <Texto style={{ color: cor.textoSuave, marginTop: 6 }}>{mensagem}</Texto>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 20 }}>
            <Botao titulo="Cancelar" variante="secundario" style={{ flex: 1 }} onPress={onCancelar} />
            <Botao
              titulo={textoConfirmar}
              variante={perigoso ? "destaque" : "primario"}
              style={{ flex: 1 }}
              onPress={onConfirmar}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const m = criarEstilos(() => ({
  fundo: {
    flex: 1,
    backgroundColor: "rgba(30,42,120,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  caixa: { width: "100%", maxWidth: 420, backgroundColor: cor.superficie, borderRadius: raio.xg, padding: 22 },
}));
