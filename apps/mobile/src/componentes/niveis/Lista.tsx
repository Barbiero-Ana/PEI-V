import { useEffect, useState, type ReactNode } from "react";
import { Animated, Easing, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  NIVEIS,
  constelacaoDoNivel,
  estrelasAcesas,
  mapaConcluido,
  missaoPorId,
  nivelAtual,
  nivelLiberado,
} from "@modolume/core";
import { useAcessibilidade, useFalarAoAbrir } from "@/estado/acessibilidade";
import { useJogador } from "@/estado/jogador";
import { CabecalhoTela, CartaoMissao } from "@/componentes/blocos";
import { Cadeado, Check, Seta } from "@/componentes/Icones";
import { BarraProgresso, Texto, Titulo } from "@/componentes/ui";
import { Ceu } from "@/componentes/Ceu";
import { cor, criarEstilos, fonte, raio } from "@/tema";

/**
 * Trilha de mapas. Cada mapa é um cartão que abre e fecha (fica
 * "comprimido"): por padrão só o mapa atual vem aberto e, ao concluir um mapa,
 * o seguinte passa a ser o aberto. Dá para abrir qualquer um tocando nele.
 */
export function NiveisLista() {
  const insets = useSafeAreaInsets();
  const { progresso, preferencias, pontosPorNivel } = useJogador();
  const atual = nivelAtual(progresso, preferencias.liberarTodos).numero;
  useFalarAoAbrir(`Níveis. Você está no mapa ${atual}. Toque num mapa para ver as missões.`);
  // escolhas do aluno; sem escolha, vale o padrão (só o mapa atual aberto)
  const [escolhas, setEscolhas] = useState<Record<number, boolean>>({});
  const aberto = (n: number) => escolhas[n] ?? n === atual;
  const todosAbertos = NIVEIS.every((nv) => aberto(nv.numero));

  function alternar(n: number) {
    setEscolhas((e) => ({ ...e, [n]: !aberto(n) }));
  }
  function alternarTodos() {
    setEscolhas(Object.fromEntries(NIVEIS.map((nv) => [nv.numero, !todosAbertos])));
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: cor.fundo }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 18, paddingBottom: 28 }}
    >
      <CabecalhoTela
        titulo="Níveis"
        direita={
          <Pressable onPress={alternarTodos} hitSlop={8} style={n.todos}>
            <Texto style={{ fontFamily: fonte.textoForte, color: cor.tinta, fontSize: 13 }}>
              {todosAbertos ? "Recolher todos" : "Abrir todos"}
            </Texto>
          </Pressable>
        }
      />

      {NIVEIS.map((nivel, i) => {
        const liberado = nivelLiberado(nivel.numero, progresso, preferencias.liberarTodos);
        const feitas = nivel.missoes.filter((id) => progresso[id]).length;
        const completo = feitas === nivel.missoes.length;
        const ultimo = i === NIVEIS.length - 1;
        const c = constelacaoDoNivel(nivel.numero);
        const estaAberto = aberto(nivel.numero);
        return (
          <View key={nivel.numero} style={n.linha}>
            <View style={n.trilho}>
              <View
                style={[
                  n.marco,
                  completo
                    ? { backgroundColor: cor.roxo, borderColor: cor.roxo }
                    : liberado
                      ? { borderColor: cor.roxo }
                      : null,
                ]}
              >
                {completo ? (
                  <Check tamanho={16} />
                ) : liberado ? (
                  <Texto style={{ fontFamily: fonte.titulo, color: cor.roxo }}>{nivel.numero}</Texto>
                ) : (
                  <Cadeado tamanho={16} />
                )}
              </View>
              {!ultimo ? <View style={[n.fio, completo && { backgroundColor: cor.roxo }]} /> : null}
            </View>

            <View style={{ flex: 1, paddingBottom: ultimo ? 0 : 16 }}>
              <Pressable
                onPress={() => alternar(nivel.numero)}
                accessibilityRole="button"
                accessibilityState={{ expanded: estaAberto }}
                accessibilityLabel={`Mapa ${nivel.numero}, ${nivel.titulo}. ${estaAberto ? "Recolher" : "Abrir"}`}
                style={({ pressed }) => [n.cartao, estaAberto && n.cartaoAberto, pressed && { opacity: 0.9 }]}
              >
                <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                  <View style={{ flex: 1 }}>
                    <Texto
                      style={{
                        fontFamily: fonte.textoForte,
                        fontSize: 13,
                        color: liberado ? cor.roxo : cor.textoFraco,
                      }}
                    >
                      Mapa {nivel.numero} · {c.nome}
                    </Texto>
                    <Titulo tamanho={18} style={!liberado ? { color: cor.textoSuave } : undefined}>
                      {nivel.titulo}
                    </Titulo>
                  </View>
                  <Pressable
                    onPress={() => router.push({ pathname: "/constelacao/[id]", params: { id: c.id } })}
                    accessibilityLabel={`Ver constelação ${c.nome}`}
                  >
                    <Ceu
                      constelacao={c}
                      acesas={estrelasAcesas(
                        pontosPorNivel[nivel.numero] ?? 0,
                        c,
                        mapaConcluido(nivel.numero, progresso),
                      )}
                      largura={54}
                      altura={54}
                      raio={12}
                    />
                  </Pressable>
                  <Chevron aberto={estaAberto} />
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 }}>
                  <View style={{ flex: 1 }}>
                    <BarraProgresso valor={(feitas / nivel.missoes.length) * 100} altura={6} />
                  </View>
                  <Texto style={{ fontFamily: fonte.titulo, fontSize: 12, color: cor.tinta }}>
                    {feitas}/{nivel.missoes.length}
                  </Texto>
                </View>

                <Recolhivel aberto={estaAberto}>
                  <View style={{ paddingTop: 8 }} collapsable={false}>
                    <Texto style={{ fontSize: 13, color: cor.textoSuave }}>{nivel.descricao}</Texto>
                  </View>
                </Recolhivel>
              </Pressable>

              <Recolhivel aberto={estaAberto}>
                {liberado ? (
                  <View style={{ gap: 10, paddingTop: 10 }}>
                    {nivel.missoes.map((id) => (
                      <CartaoMissao key={id} missao={missaoPorId(id)!} progresso={progresso[id]} bloqueado={false} />
                    ))}
                  </View>
                ) : (
                  <View style={n.aviso}>
                    <Cadeado tamanho={14} cor={cor.textoSuave} />
                    <Texto style={{ fontSize: 12, color: cor.textoSuave, flex: 1 }}>
                      Conclua todas as missões do mapa {nivel.numero - 1} para liberar.
                    </Texto>
                  </View>
                )}
              </Recolhivel>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const CURVA = Easing.bezier(0.2, 0, 0, 1);

/**
 * Conteúdo que abre e fecha animando a altura: o que vem abaixo (os outros
 * mapas) desliza junto, em vez de pular. A altura natural é medida pelo
 * filho e a animação vai de 0 até ela.
 */
function Recolhivel({ aberto, children }: { aberto: boolean; children: ReactNode }) {
  const { animacoesReduzidas } = useAcessibilidade();
  const [altura, setAltura] = useState(0);
  const [v] = useState(() => new Animated.Value(aberto ? 1 : 0));
  useEffect(() => {
    Animated.timing(v, {
      toValue: aberto ? 1 : 0,
      duration: animacoesReduzidas ? 0 : 340,
      easing: CURVA,
      useNativeDriver: false,
    }).start();
  }, [aberto, v, animacoesReduzidas]);
  return (
    <Animated.View
      style={{
        overflow: "hidden",
        height: v.interpolate({ inputRange: [0, 1], outputRange: [0, altura] }),
        opacity: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.6, 1] }),
      }}
      pointerEvents={aberto ? "auto" : "none"}
    >
      <Animated.View
        onLayout={(e) => setAltura(e.nativeEvent.layout.height)}
        // posição absoluta: o conteúdo é medido na altura natural, sem ser
        // espremido pela altura animada (no Android o texto ficava com 1 px)
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }],
        }}
      >
        {children}
      </Animated.View>
    </Animated.View>
  );
}

function Chevron({ aberto }: { aberto: boolean }) {
  const { animacoesReduzidas } = useAcessibilidade();
  const [v] = useState(() => new Animated.Value(aberto ? 1 : 0));
  useEffect(() => {
    Animated.timing(v, {
      toValue: aberto ? 1 : 0,
      duration: animacoesReduzidas ? 0 : 340,
      easing: CURVA,
      useNativeDriver: false,
    }).start();
  }, [aberto, v, animacoesReduzidas]);
  return (
    <Animated.View
      style={{ transform: [{ rotate: v.interpolate({ inputRange: [0, 1], outputRange: ["90deg", "-90deg"] }) }] }}
    >
      <Seta direcao="direita" cor={cor.textoSuave} tamanho={18} />
    </Animated.View>
  );
}

const n = criarEstilos(() => ({
  todos: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: cor.bordaForte,
    backgroundColor: cor.superficie,
  },
  linha: { flexDirection: "row", gap: 12 },
  trilho: { width: 36, alignItems: "center" },
  marco: {
    width: 36,
    height: 36,
    marginTop: 14,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: cor.bordaForte,
    backgroundColor: cor.superficie,
    alignItems: "center",
    justifyContent: "center",
  },
  fio: { flex: 1, width: 2, backgroundColor: cor.trilho, marginTop: 4 },
  cartao: {
    padding: 14,
    borderRadius: raio.g,
    backgroundColor: cor.superficie,
    borderWidth: 1,
    borderColor: cor.borda,
  },
  cartaoAberto: { borderColor: cor.lilas },
  aviso: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: cor.suave,
  },
}));
