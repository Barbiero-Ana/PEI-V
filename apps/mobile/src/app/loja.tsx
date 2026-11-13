import { useState } from "react";
import { Platform, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { voltar } from "@/lib/navegacao";
import { useFalarAoAbrir } from "@/estado/acessibilidade";
import { useJogador } from "@/estado/jogador";
import { DesenhoRosto, ITENS_LOJA, ROSTO_PADRAO, normalizar, vestir, type ItemLoja } from "@/componentes/Rosto";
import { Lilo } from "@/componentes/Lilo";
import { Check, Fechar } from "@/componentes/Icones";
import { Botao, Texto, Titulo } from "@/componentes/ui";
import { cor, criarEstilos, fonte, raio } from "@/tema";

/**
 * Loja do avatar: gasta as luzes ganhas nas missões em peças novas.
 * Cada item aparece no rosto do próprio aluno. Comprar já veste o item.
 */

const GRUPOS: { titulo: string; slots: ItemLoja["slot"][] }[] = [
  { titulo: "Acessórios", slots: ["acessorio"] },
  { titulo: "Fundos especiais", slots: ["fundo"] },
];

export default function Loja() {
  const insets = useSafeAreaInsets();
  const { avisoSincronizacao, jogador, luzes, compras, comprar, editarPerfil } = useJogador();
  useFalarAoAbrir(`Loja. Você tem ${luzes} luzes para gastar.`);
  const [escolhido, setEscolhido] = useState<ItemLoja>(ITENS_LOJA[0]!);
  const [recemComprado, setRecemComprado] = useState<string | null>(null);
  if (!jogador) return null;

  const base = normalizar(jogador.rosto ?? ROSTO_PADRAO);
  const tem = compras.includes(escolhido.id);
  const usando = (jogador.rosto ? normalizar(jogador.rosto) : base)[escolhido.slot] === escolhido.valor;

  function comprarEUsar() {
    if (!tem && !comprar(escolhido.id, escolhido.preco)) return;
    editarPerfil({ rosto: vestir(base, escolhido) });
    setRecemComprado(escolhido.id);
  }

  return (
    <View style={{ flex: 1, backgroundColor: cor.fundo }}>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingTop: Platform.OS === "ios" ? 20 : insets.top + 14,
          paddingBottom: 24,
        }}
      >
        {avisoSincronizacao ? (
          <Texto accessibilityRole="alert" style={{ marginBottom: 14, color: cor.pessegoEscuro }}>
            {avisoSincronizacao}
          </Texto>
        ) : null}
        <View style={l.topo}>
          <Titulo tamanho={22}>Loja do avatar</Titulo>
          <Pressable onPress={voltar} hitSlop={12} accessibilityLabel="Fechar">
            <Fechar />
          </Pressable>
        </View>

        <View style={l.vitrine}>
          <DesenhoRosto rosto={vestir(base, escolhido)} tamanho={128} />
          <View style={{ flex: 1, gap: 4 }}>
            <Texto style={{ fontSize: 12, color: cor.lilasNoEscuro }}>Provando</Texto>
            <Titulo tamanho={18} style={{ color: "#FFFFFF" }}>
              {escolhido.nome}
            </Titulo>
            <Texto style={{ color: cor.pessegoNoEscuro, fontFamily: fonte.titulo }}>
              {tem ? "Já é seu" : `✦ ${escolhido.preco} luzes`}
            </Texto>
          </View>
        </View>

        <View style={l.saldo}>
          <Lilo humor={recemComprado === escolhido.id ? "rindo" : "curioso"} tamanho={48} />
          <View style={{ flex: 1 }}>
            <Texto style={{ fontFamily: fonte.titulo, color: cor.tinta, fontSize: 15 }}>Você tem ✦ {luzes} luzes</Texto>
            <Texto style={{ fontSize: 12, color: cor.textoSuave }}>Cada missão concluída dá mais luzes.</Texto>
          </View>
        </View>

        {GRUPOS.map((g) => (
          <View key={g.titulo} style={{ marginTop: 18 }}>
            <Titulo tamanho={16} style={{ marginBottom: 8 }}>
              {g.titulo}
            </Titulo>
            <View style={l.grade}>
              {ITENS_LOJA.filter((i) => g.slots.includes(i.slot)).map((item) => {
                const ativo = item.id === escolhido.id;
                const meu = compras.includes(item.id);
                return (
                  <View key={item.id} style={{ width: "33.33%", padding: 4 }}>
                    <Pressable
                      onPress={() => setEscolhido(item)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: ativo }}
                      accessibilityLabel={`${item.nome}, ${meu ? "já é seu" : `${item.preco} luzes`}`}
                      style={({ pressed }) => [l.item, ativo && l.itemAtivo, pressed && { opacity: 0.85 }]}
                    >
                      <DesenhoRosto rosto={vestir(base, item)} tamanho={62} />
                      <Texto
                        style={{ fontSize: 11, fontFamily: fonte.textoForte, color: cor.tinta, textAlign: "center" }}
                        numberOfLines={1}
                      >
                        {item.nome}
                      </Texto>
                      {meu ? (
                        <View style={l.meu}>
                          <Check tamanho={10} />
                        </View>
                      ) : (
                        <Texto
                          style={{
                            fontSize: 11,
                            fontFamily: fonte.titulo,
                            color: luzes >= item.preco ? cor.pessegoEscuro : cor.textoFraco,
                          }}
                        >
                          ✦ {item.preco}
                        </Texto>
                      )}
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[l.rodape, { paddingBottom: insets.bottom + 14 }]}>
        {!tem && luzes < escolhido.preco ? (
          <Texto style={{ fontSize: 12, color: cor.pessegoEscuro, textAlign: "center", marginBottom: 8 }}>
            Faltam {escolhido.preco - luzes} luzes para este item.
          </Texto>
        ) : null}
        <Botao
          titulo={usando ? "Você está usando" : tem ? "Usar no avatar" : `Comprar e usar (✦ ${escolhido.preco})`}
          onPress={comprarEUsar}
          disabled={usando || (!tem && luzes < escolhido.preco)}
        />
      </View>
    </View>
  );
}

const l = criarEstilos(() => ({
  topo: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  vitrine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
    borderRadius: raio.xg,
    backgroundColor: "#1E2A78",
  },
  saldo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    padding: 12,
    borderRadius: raio.g,
    backgroundColor: cor.pessegoClaro,
  },
  grade: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -4 },
  item: {
    alignItems: "center",
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: raio.m,
    borderWidth: 2,
    borderColor: cor.borda,
    backgroundColor: cor.superficie,
  },
  itemAtivo: { borderColor: cor.roxo, backgroundColor: cor.roxoClaro },
  meu: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: cor.roxo,
    alignItems: "center",
    justifyContent: "center",
  },
  rodape: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: cor.fundo,
    borderTopWidth: 1,
    borderTopColor: cor.borda,
  },
}));
