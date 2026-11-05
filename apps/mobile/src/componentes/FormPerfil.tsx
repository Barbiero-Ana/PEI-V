import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { router } from "expo-router";
import type { Rosto } from "./Rosto";
import { Avatar, type AvatarId } from "./Avatar";
import { Botao, Texto } from "./ui";
import { cor, criarEstilos, fonte, raio } from "@/tema";

/** Nome do aluno (o avatar é montado no editor de rosto). */
export function FormPerfil({
  inicial,
  textoBotao,
  onSalvar,
}: {
  inicial?: { nome: string; avatar: AvatarId; rosto?: Rosto };
  textoBotao: string;
  onSalvar: (dados: { nome: string; avatar: AvatarId }) => void;
}) {
  const [nome, setNome] = useState(inicial?.nome ?? "");
  const avatar: AvatarId = inicial?.avatar ?? "lume";
  const ok = nome.trim().length >= 2;

  return (
    <View style={{ gap: 22 }}>
      <View style={{ alignItems: "center", gap: 10 }}>
        <Avatar id={avatar} rosto={inicial?.rosto} tamanho={88} />
        <Pressable onPress={() => router.push("/avatar")} hitSlop={8}>
          <Texto style={{ fontFamily: fonte.textoForte, color: cor.roxo }}>Personalizar avatar</Texto>
        </Pressable>
      </View>

      <View>
        <Texto style={f.legenda}>Seu nome</Texto>
        <TextInput
          value={nome}
          onChangeText={setNome}
          placeholder="Como você quer ser chamado"
          placeholderTextColor={cor.textoFraco}
          maxLength={24}
          autoCapitalize="words"
          autoComplete="given-name"
          returnKeyType="done"
          onSubmitEditing={() => ok && onSalvar({ nome: nome.trim(), avatar })}
          style={f.campo}
        />
      </View>

      <Botao titulo={textoBotao} disabled={!ok} onPress={() => onSalvar({ nome: nome.trim(), avatar })} />
    </View>
  );
}

const f = criarEstilos(() => ({
  legenda: { fontFamily: fonte.textoForte, color: cor.tinta, marginBottom: 10 },
  grade: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  opcao: {
    width: "31%",
    flexGrow: 1,
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: raio.g,
    borderWidth: 1.5,
    borderColor: cor.borda,
    backgroundColor: cor.superficie,
  },
  opcaoAtiva: { borderColor: cor.roxo, backgroundColor: cor.roxoClaro },
  campo: {
    minHeight: 52,
    borderRadius: raio.m,
    borderWidth: 1.5,
    borderColor: cor.bordaForte,
    backgroundColor: cor.superficie,
    paddingHorizontal: 16,
    fontFamily: fonte.textoMedio,
    fontSize: 17,
    color: cor.tinta,
  },
}));
