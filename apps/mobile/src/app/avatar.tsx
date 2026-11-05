import { useState, type ReactNode } from "react";
import { Platform, Pressable, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { voltar } from "@/lib/navegacao";
import { useJogador } from "@/estado/jogador";
import {
  ACESSORIOS,
  BOCAS,
  CABELOS,
  CORES_CABELO,
  DesenhoRosto,
  FUNDOS,
  OLHOS,
  PELES,
  ROSTO_PADRAO,
  itemDe,
  normalizar,
  rostoAleatorio,
  type Rosto,
  type Slot,
} from "@/componentes/Rosto";
import { Cadeado, Fechar } from "@/componentes/Icones";
import { Botao, Texto, Titulo } from "@/componentes/ui";
import { cor, criarEstilos, fonte, raio } from "@/tema";

/**
 * Editor de avatar: só o rosto. Prévia grande no topo, abas por parte e, em
 * cada aba, as opções desenhadas no próprio rosto do aluno. Itens da loja
 * aparecem com cadeado e preço: dá para provar e comprar com luzes.
 */

type Aba = "pele" | "cabelo" | "olhos" | "boca" | "acessorio" | "fundo";

const ABAS: { id: Aba; nome: string }[] = [
  { id: "pele", nome: "Pele" },
  { id: "cabelo", nome: "Cabelo" },
  { id: "olhos", nome: "Olhos" },
  { id: "boca", nome: "Boca" },
  { id: "acessorio", nome: "Acessório" },
  { id: "fundo", nome: "Fundo" },
];

const NOMES: Record<string, string> = {
  shortHair: "Curto",
  bangs: "Franja",
  straightHair: "Liso",
  wavyBob: "Ondulado",
  curlyBob: "Cacheado",
  curlyShortHair: "Cachinhos",
  braids: "Tranças",
  bunHair: "Coque",
  froBun: "Black",
  bowlCutHair: "Tigelinha",
  mohawk: "Moicano",
  halfShavedHead: "Lateral",
  shavedHead: "Raspado",
  normal: "Normal",
  cheery: "Alegre",
  starstruck: "Encantado",
  winking: "Piscando",
  sleepy: "Sonolento",
  confused: "Confuso",
  sad: "Triste",
  angry: "Bravo",
  openedSmile: "Sorriso",
  teethSmile: "Dentinhos",
  gapSmile: "Banguela",
  kawaii: "Fofo",
  awkwardSmile: "Sem graça",
  braces: "Aparelho",
  unimpressed: "Sério",
  openSad: "Tristinho",
  nenhum: "Nenhum",
  glasses: "Óculos",
  sunglasses: "Óculos escuros",
  sailormoonCrown: "Coroa",
  catEars: "Gatinho",
  clownNose: "Palhaço",
  mustache: "Bigode",
  sleepMask: "Dormir",
  faceMask: "Máscara",
};

/** Só abre o editor depois que o perfil carregou (para começar com o rosto salvo). */
export default function TelaAvatar() {
  const { pronto, jogador } = useJogador();
  if (!pronto || !jogador) return null;
  return <EditorAvatar />;
}

function EditorAvatar() {
  const insets = useSafeAreaInsets();
  const { jogador, editarPerfil, compras, luzes, comprar } = useJogador();
  const [rosto, setRosto] = useState<Rosto>(() => normalizar(jogador?.rosto ?? ROSTO_PADRAO));
  const [aba, setAba] = useState<Aba>("pele");
  if (!jogador) return null;

  const mudar = (parte: Partial<Rosto>) => setRosto((r) => ({ ...r, ...parte }));
  const travado = (slot: Slot, valor: string | number) => {
    const item = itemDe(slot, valor);
    return item && !compras.includes(item.id) ? item : undefined;
  };

  // itens da loja que estão no rosto mas ainda não foram comprados
  const aComprar = [travado("acessorio", rosto.acessorio), travado("fundo", rosto.fundo)].filter(
    (i) => i !== undefined,
  );
  const custo = aComprar.reduce((s, i) => s + i.preco, 0);

  function salvar() {
    if (custo > luzes) return;
    aComprar.forEach((i) => comprar(i.id, i.preco));
    editarPerfil({ rosto });
    voltar();
  }

  /** Opção desenhada no rosto, com cadeado e preço se for da loja. */
  const opcao = (
    slot: Slot | null,
    valor: string | number,
    ativa: boolean,
    parte: Partial<Rosto>,
    nome?: string,
    tamanho = 58,
  ) => {
    const item = slot ? travado(slot, valor) : undefined;
    return (
      <Opcao key={String(valor)} nome={nome} ativa={ativa} onPress={() => mudar(parte)} preco={item?.preco}>
        <DesenhoRosto rosto={{ ...rosto, ...parte }} tamanho={tamanho} />
      </Opcao>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: cor.fundo }}>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingTop: Platform.OS === "ios" ? 20 : insets.top + 14,
          paddingBottom: 24,
        }}
      >
        <View style={e.topo}>
          <Titulo tamanho={22}>Seu avatar</Titulo>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Pressable
              onPress={() => router.push("/loja")}
              style={e.saldo}
              accessibilityLabel={`${luzes} luzes. Abrir loja`}
            >
              <Texto style={{ color: cor.pessegoEscuro, fontFamily: fonte.titulo, fontSize: 13 }}>
                ✦ {luzes} luzes
              </Texto>
            </Pressable>
            <Pressable onPress={voltar} hitSlop={12} accessibilityLabel="Fechar">
              <Fechar />
            </Pressable>
          </View>
        </View>

        <View style={e.previa}>
          <DesenhoRosto rosto={rosto} tamanho={156} />
          <Pressable
            onPress={() => setRosto(rostoAleatorio(compras))}
            style={({ pressed }) => [e.sortear, pressed && { opacity: 0.8 }]}
          >
            <Texto style={{ fontFamily: fonte.textoForte, color: cor.roxo, fontSize: 13 }}>Sortear um rosto</Texto>
          </Pressable>
        </View>

        <View style={e.abas}>
          {ABAS.map((a) => {
            const ativa = a.id === aba;
            return (
              <Pressable
                key={a.id}
                onPress={() => setAba(a.id)}
                accessibilityRole="tab"
                accessibilityState={{ selected: ativa }}
                style={[e.aba, ativa && e.abaAtiva]}
              >
                <Texto
                  style={{
                    fontFamily: fonte.textoForte,
                    fontSize: 13,
                    color: ativa ? "#FFFFFF" : cor.texto,
                    textAlign: "center",
                  }}
                >
                  {a.nome}
                </Texto>
              </Pressable>
            );
          })}
        </View>

        <View style={e.painel}>
          {aba === "pele" ? (
            <Secao titulo="Tom de pele">
              <Grade colunas={4}>
                {PELES.map((_, i) => opcao(null, i, rosto.pele === i, { pele: i }, undefined, 58))}
              </Grade>
            </Secao>
          ) : null}

          {aba === "cabelo" ? (
            <>
              <Secao titulo="Cor do cabelo">
                <Amostras
                  cores={CORES_CABELO.map((c) => `#${c}`)}
                  escolhida={rosto.corCabelo}
                  onEscolher={(i) => mudar({ corCabelo: i })}
                />
              </Secao>
              <Secao titulo="Estilo">
                <Grade>{CABELOS.map((c) => opcao(null, c, rosto.cabelo === c, { cabelo: c }, NOMES[c]))}</Grade>
              </Secao>
            </>
          ) : null}

          {aba === "olhos" ? (
            <Secao titulo="Olhos">
              <Grade colunas={4}>
                {OLHOS.map((o) => opcao(null, o, rosto.olhos === o, { olhos: o }, NOMES[o], 54))}
              </Grade>
            </Secao>
          ) : null}

          {aba === "boca" ? (
            <Secao titulo="Boca">
              <Grade colunas={4}>{BOCAS.map((b) => opcao(null, b, rosto.boca === b, { boca: b }, NOMES[b], 54))}</Grade>
            </Secao>
          ) : null}

          {aba === "acessorio" ? (
            <Secao titulo="Acessórios">
              <Grade colunas={3}>
                {ACESSORIOS.map((a) => opcao("acessorio", a, rosto.acessorio === a, { acessorio: a }, NOMES[a], 58))}
              </Grade>
            </Secao>
          ) : null}

          {aba === "fundo" ? (
            <Secao titulo="Cor do fundo">
              <Grade>{FUNDOS.map((_, i) => opcao("fundo", i, rosto.fundo === i, { fundo: i }, undefined, 64))}</Grade>
            </Secao>
          ) : null}
        </View>
      </ScrollView>

      <View style={[e.rodape, { paddingBottom: insets.bottom + 14 }]}>
        {custo > 0 ? (
          <Texto
            style={{
              fontSize: 12,
              color: custo > luzes ? cor.pessegoEscuro : cor.textoSuave,
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            {custo > luzes
              ? `Faltam ${custo - luzes} luzes. Jogue missões para ganhar mais!`
              : `${aComprar.map((i) => i.nome).join(", ")}: ${custo} luzes`}
          </Texto>
        ) : null}
        <Botao
          titulo={custo > 0 ? `Comprar e usar (✦ ${custo})` : "Salvar avatar"}
          onPress={salvar}
          disabled={custo > luzes}
        />
      </View>
    </View>
  );
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <View style={{ gap: 10 }}>
      <Texto style={{ fontFamily: fonte.titulo, fontSize: 15, color: cor.tinta }}>{titulo}</Texto>
      {children}
    </View>
  );
}

function Grade({ children, colunas = 3 }: { children: ReactNode; colunas?: 3 | 4 }) {
  const lista = Array.isArray(children) ? children : [children];
  return (
    <View style={e.grade}>
      {lista.map((c, i) => (
        <View key={i} style={{ width: `${100 / colunas}%`, padding: 4 }}>
          {c}
        </View>
      ))}
    </View>
  );
}

function Opcao({
  nome,
  ativa,
  onPress,
  preco,
  children,
}: {
  nome?: string;
  ativa: boolean;
  onPress: () => void;
  preco?: number;
  children: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: ativa }}
      accessibilityLabel={preco ? `${nome ?? "Item"}, ${preco} luzes` : nome}
      style={({ pressed }) => [e.opcao, ativa && e.opcaoAtiva, pressed && { opacity: 0.85 }]}
    >
      {children}
      {nome ? (
        <Texto
          style={{
            fontSize: 11,
            fontFamily: fonte.textoForte,
            color: ativa ? cor.roxo : cor.textoSuave,
            textAlign: "center",
          }}
          numberOfLines={1}
        >
          {nome}
        </Texto>
      ) : null}
      {preco ? (
        <View style={e.preco}>
          <Cadeado tamanho={10} cor={cor.pessegoEscuro} />
          <Texto style={{ fontSize: 10, fontFamily: fonte.titulo, color: cor.pessegoEscuro }}>{preco}</Texto>
        </View>
      ) : null}
    </Pressable>
  );
}

function Amostras({
  cores,
  escolhida,
  onEscolher,
}: {
  cores: readonly string[];
  escolhida: number;
  onEscolher: (i: number) => void;
}) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
      {cores.map((c, i) => {
        const ativa = i === escolhida;
        return (
          <Pressable
            key={c}
            onPress={() => onEscolher(i)}
            accessibilityRole="radio"
            accessibilityState={{ selected: ativa }}
            accessibilityLabel={`Cor ${i + 1}`}
            style={[e.anel, ativa && { borderColor: cor.roxo }]}
          >
            <View style={[e.amostra, { backgroundColor: c }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const e = criarEstilos(() => ({
  topo: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  saldo: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: cor.pessegoClaro },
  previa: { alignItems: "center", gap: 10, paddingVertical: 6 },
  sortear: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: cor.roxoClaro },
  abas: { flexDirection: "row", flexWrap: "wrap", gap: 6, paddingVertical: 14 },
  aba: {
    width: "31%",
    flexGrow: 1,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: cor.superficie,
    borderWidth: 1,
    borderColor: cor.borda,
  },
  abaAtiva: { backgroundColor: cor.roxo, borderColor: cor.roxo },
  painel: { gap: 18, padding: 14, borderRadius: raio.g, backgroundColor: cor.superficie },
  grade: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -4 },
  opcao: {
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: raio.m,
    borderWidth: 2,
    borderColor: cor.borda,
    backgroundColor: cor.fundo,
  },
  opcaoAtiva: { borderColor: cor.roxo, backgroundColor: cor.roxoClaro },
  preco: {
    position: "absolute",
    top: 4,
    right: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 999,
    backgroundColor: cor.pessegoClaro,
  },
  anel: { padding: 3, borderRadius: 999, borderWidth: 2.5, borderColor: "transparent" },
  amostra: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: "rgba(30,42,120,0.12)" },
  rodape: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: cor.fundo,
    borderTopWidth: 1,
    borderTopColor: cor.borda,
  },
}));
