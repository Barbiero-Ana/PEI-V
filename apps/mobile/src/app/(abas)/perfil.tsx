import { useCallback, useState, type ReactNode } from "react";
import { Modal, Pressable, ScrollView, View, useWindowDimensions } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import Svg, { Path, Rect } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CONSTELACOES, MISSOES, NIVEIS, estrelasAcesas, mapaConcluido } from "@modolume/core";
import { useFalarAoAbrir } from "@/estado/acessibilidade";
import { useJogador, useResumo } from "@/estado/jogador";
import { useConta } from "@/estado/conta";
import { useIdentidade } from "@/estado/identidade";
import { Avatar } from "@/componentes/Avatar";
import { ESTAGIOS, Lilo, estagioDe, useEstrelasAcesas } from "@/componentes/Lilo";
import { Ceu } from "@/componentes/Ceu";
import { CAPAS, Capa, compraDaCapa } from "@/componentes/Capa";
import { Confirmar } from "@/componentes/Confirmar";
import { Interruptor } from "@/componentes/Interruptor";
import {
  IconeAcessibilidade,
  IconeProfessor,
  IconeCalendario,
  IconeChave,
  IconeInfo,
  IconeLapis,
  IconeLixeira,
  IconeSair,
  IconeVibrar,
  Seta,
} from "@/componentes/Icones";
import { Botao, Texto, Titulo } from "@/componentes/ui";
import { cor, criarEstilos, fonte, raio } from "@/tema";
import { EsqueletoTela, useMontagemAdiada } from "@/componentes/Esqueleto";

/**
 * Perfil: topo com a capa animada e o avatar, atalhos (avatar, loja,
 * relatório), o Lilo e a evolução dele, o céu em carrossel, números da
 * jornada e, no fim, as configurações.
 */
export default function Perfil() {
  const { legadoPreservado } = useIdentidade();
  const insets = useSafeAreaInsets();
  const {
    jogador,
    preferencias,
    mudarPreferencia,
    apagarProgresso,
    vibrar,
    luzes,
    compras,
    comprar,
    pontosPorNivel,
    progresso,
    constelacoes,
    editarPerfil,
    pronto,
  } = useJogador();
  const montada = useMontagemAdiada();
  useFalarAoAbrir(`Perfil de ${jogador?.nome ?? ""}. Você tem ${luzes} luzes.`);
  const resumo = useResumo();
  const acesas = useEstrelasAcesas();
  const [apagar, setApagar] = useState(false);
  const { temServidor, conta, pendentes, sairDaTurma } = useConta();
  const [sairTurma, setSairTurma] = useState(false);
  const [sobreAberto, setSobreAberto] = useState(false);
  const [escolherCapa, setEscolherCapa] = useState(false);
  // capa paga tocada, esperando a compra
  const [capaAVenda, setCapaAVenda] = useState<number | null>(null);
  const [ceuVisivel, setCeuVisivel] = useState(0);
  const { width } = useWindowDimensions();
  // cabem dois cartões e meio: o terceiro fica cortado na borda
  const ladoCeu = Math.round((Math.min(width, 560) - 36 - GAP_CEU * 2) / 2.4);
  // ícones da barra de status claros sobre capa escura (só enquanto o perfil está na tela)
  const capaEscura = CAPAS[jogador?.capa ?? 0]?.escura ?? true;
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle(capaEscura ? "light" : "dark");
      return () => setStatusBarStyle("dark");
    }, [capaEscura]),
  );
  if (!pronto || !montada || !jogador) return <EsqueletoTela formato="perfil" />;

  const estagio = estagioDe(acesas);
  const proximo = ESTAGIOS[estagio + 1];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: cor.fundo }} contentContainerStyle={{ paddingBottom: 32 }}>
      {legadoPreservado ? (
        <Texto style={{ padding: 16 }}>
          Os dados da versão anterior continuam guardados neste aparelho. O progresso sem identificação de conta não foi
          misturado à sua conta atual. Peça ajuda à equipe para recuperar esses dados com segurança.
        </Texto>
      ) : null}
      <View style={[p.faixa, { height: 150 + insets.top }]}>
        <Capa indice={jogador.capa ?? 0} />
        <Pressable
          onPress={() => setEscolherCapa(true)}
          accessibilityRole="button"
          accessibilityLabel="Trocar a capa do perfil"
          hitSlop={8}
          style={({ pressed }) => [p.botaoCapa, { top: insets.top + 12 }, pressed && { opacity: 0.8 }]}
        >
          <IconeLapis tamanho={13} cor="#FFFFFF" />
          <Texto style={{ fontFamily: fonte.textoForte, fontSize: 12, color: "#FFFFFF" }}>Capa</Texto>
        </Pressable>
      </View>
      <View style={p.identidade}>
        <Pressable
          onPress={() => router.push("/avatar")}
          accessibilityRole="button"
          accessibilityLabel="Personalizar avatar"
          style={p.molduraAvatar}
        >
          <Avatar id={jogador.avatar} rosto={jogador.rosto} tamanho={108} />
          <View style={p.lapis}>
            <IconeLapis tamanho={14} cor="#FFFFFF" />
          </View>
        </Pressable>
        <Titulo tamanho={26} style={{ marginTop: 8 }}>
          {jogador.nome}
        </Titulo>
      </View>

      <View style={{ paddingHorizontal: 18, gap: 22 }}>
        <View style={p.atalhos}>
          <Atalho titulo="Personalizar" detalhe="seu avatar" onPress={() => router.push("/avatar")}>
            <IconeLapis tamanho={22} cor={cor.roxo} />
          </Atalho>
          <Atalho titulo="Loja" detalhe={`${luzes} luzes`} onPress={() => router.push("/loja")}>
            <Texto style={{ fontFamily: fonte.tituloForte, fontSize: 22, color: cor.roxo, lineHeight: 26 }}>✦</Texto>
          </Atalho>
          <Atalho titulo="Relatório" detalhe="da semana" onPress={() => router.push("/relatorio")}>
            <IconeCalendario tamanho={22} cor={cor.roxo} />
          </Atalho>
        </View>

        <View style={p.lilo}>
          <Lilo tamanho={84} humor="feliz" />
          <View style={{ flex: 1, gap: 2 }}>
            <Texto style={{ fontSize: 12, color: cor.lilasNoEscuro }}>Seu Lilo</Texto>
            <Titulo tamanho={19} style={{ color: "#FFFFFF" }}>
              {ESTAGIOS[estagio]!.nome}
            </Titulo>
            <Texto style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>{ESTAGIOS[estagio]!.descricao}</Texto>
            {proximo ? (
              <>
                <View style={p.trilhaLilo}>
                  <View
                    style={[
                      p.trilhaLiloCheia,
                      {
                        width: `${Math.min(100, ((acesas - ESTAGIOS[estagio]!.desde) / (proximo.desde - ESTAGIOS[estagio]!.desde)) * 100)}%`,
                      },
                    ]}
                  />
                </View>
                <Texto style={{ fontSize: 12, color: cor.pessegoNoEscuro }}>
                  Mais {proximo.desde - acesas} {proximo.desde - acesas === 1 ? "estrela" : "estrelas"} para virar{" "}
                  {proximo.nome}
                </Texto>
              </>
            ) : (
              <Texto style={{ fontSize: 12, color: cor.pessegoNoEscuro }}>Evolução completa!</Texto>
            )}
          </View>
        </View>

        <View>
          <View style={p.secaoTopo}>
            <Titulo tamanho={18}>Meu céu</Titulo>
            <Texto style={{ fontSize: 13, color: cor.textoSuave }}>
              {resumo.constelacoes} de {CONSTELACOES.length} completas
            </Texto>
          </View>
          {/* o próximo cartão aparece cortado na borda: sinal de que dá para arrastar */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: GAP_CEU, paddingRight: 18 }}
            style={{ marginRight: -18 }}
            snapToInterval={ladoCeu + GAP_CEU}
            decelerationRate="fast"
            scrollEventThrottle={32}
            onScroll={(ev) => setCeuVisivel(Math.round(ev.nativeEvent.contentOffset.x / (ladoCeu + GAP_CEU)))}
          >
            {NIVEIS.map((nv) => {
              const c = CONSTELACOES.find((x) => x.id === nv.constelacao)!;
              const acesasC = estrelasAcesas(pontosPorNivel[nv.numero] ?? 0, c, mapaConcluido(nv.numero, progresso));
              const completa = Boolean(constelacoes[c.id]);
              return (
                <Pressable
                  key={c.id}
                  onPress={() => router.push({ pathname: "/constelacao/[id]", params: { id: c.id } })}
                  style={({ pressed }) => [{ width: ladoCeu, gap: 6 }, pressed && { opacity: 0.85 }]}
                  accessibilityLabel={`${c.nome}, ${acesasC} de ${c.estrelas.length} estrelas`}
                >
                  <View>
                    <Ceu constelacao={c} acesas={acesasC} largura={ladoCeu} altura={ladoCeu} raio={18} />
                    <View style={[p.contador, completa && { backgroundColor: cor.pessego }]}>
                      <Texto
                        style={{ fontSize: 11, fontFamily: fonte.textoForte, color: completa ? cor.tinta : "#FFFFFF" }}
                      >
                        {completa ? "completa" : `${acesasC}/${c.estrelas.length}`}
                      </Texto>
                    </View>
                  </View>
                  <Texto style={{ fontFamily: fonte.titulo, fontSize: 14, color: cor.tinta }} numberOfLines={1}>
                    {c.nome}
                  </Texto>
                  <Texto style={{ fontSize: 11, color: cor.textoSuave, marginTop: -4 }}>Mapa {nv.numero}</Texto>
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={p.pontos} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            {NIVEIS.map((nv, i) => (
              <View key={nv.numero} style={[p.ponto, i === Math.min(ceuVisivel, NIVEIS.length - 1) && p.pontoAtivo]} />
            ))}
          </View>
        </View>

        <View style={p.numeros}>
          <Numero valor={resumo.estrelas} rotulo="estrelas de missão" />
          <View style={p.divisor} />
          <Numero valor={`${resumo.concluidas}/${MISSOES.length}`} rotulo="missões jogadas" />
          <View style={p.divisor} />
          <Numero valor={acesas} rotulo="estrelas no céu" />
        </View>

        <View>
          <Titulo tamanho={18} style={{ marginBottom: 10 }}>
            Configurações
          </Titulo>
          <View style={p.lista}>
            {conta ? (
              <Item
                icone={<IconeProfessor tamanho={20} cor={cor.roxo} />}
                titulo={`Turma ${conta.turma.nome}`}
                detalhe={pendentes > 0 ? `${pendentes} para enviar ao professor` : "Tudo enviado ao professor"}
              />
            ) : temServidor ? (
              <Item
                icone={<IconeProfessor tamanho={20} cor={cor.roxo} />}
                titulo="Entrar na turma"
                detalhe="Com o código que o professor passou"
                onPress={() => router.push("/entrar")}
              />
            ) : null}
            <Item
              icone={<IconeAcessibilidade />}
              titulo="Acessibilidade"
              detalhe="Texto, voz, contraste e animações"
              onPress={() => router.push("/acessibilidade")}
            />
            <Item
              icone={<IconeLapis />}
              titulo="Editar nome"
              detalhe={jogador.nome}
              onPress={() => router.push("/editar-perfil")}
            />
            <Item
              icone={<IconeVibrar />}
              titulo="Vibração"
              detalhe="Vibrar ao acertar ou errar"
              direita={
                <Interruptor
                  rotulo="Vibração"
                  valor={preferencias.vibracao}
                  onMudar={(v) => {
                    mudarPreferencia("vibracao", v);
                    if (v) vibrar("toque");
                  }}
                />
              }
            />
            <Item
              icone={<IconeChave />}
              titulo="Liberar todos os mapas"
              detalhe="Modo apresentação"
              direita={
                <Interruptor
                  rotulo="Liberar todos os mapas"
                  valor={preferencias.liberarTodos}
                  onMudar={(v) => mudarPreferencia("liberarTodos", v)}
                />
              }
            />
            <Item
              icone={<IconeInfo />}
              titulo="Sobre o Modolume"
              onPress={() => setSobreAberto((v) => !v)}
              aberto={sobreAberto}
            />
            {sobreAberto ? (
              <View style={{ paddingHorizontal: 16, paddingBottom: 14, gap: 8 }}>
                <Texto style={{ fontSize: 13, color: cor.textoSuave, lineHeight: 19 }}>
                  Modolume: ideias que se iluminam. Uma ponte entre aluno e professor: enquanto você joga atividades em
                  formatos diferentes, o Modolume descobre como você aprende melhor. Assim, seu professor pode preparar
                  aulas e provas do jeito que funciona para você. Os resultados são referências, não um diagnóstico.
                </Texto>
                <Texto style={{ fontSize: 12, color: cor.textoFraco, lineHeight: 17 }}>
                  Avatares: estilo “Big Smile”, de Ashley Seo, via DiceBear (licença CC BY 4.0).
                </Texto>
              </View>
            ) : null}
            {conta ? (
              <Item
                icone={<IconeSair />}
                titulo="Sair da conta"
                detalhe="Para entrar de novo, use seu código e seu PIN"
                onPress={() => setSairTurma(true)}
              />
            ) : null}
            {!conta ? (
              <Item icone={<IconeLixeira />} titulo="Recomeçar do zero" perigoso onPress={() => setApagar(true)} />
            ) : null}
          </View>
        </View>

        <Texto style={{ textAlign: "center", fontSize: 12, color: cor.textoFraco }}>Modolume · versão 1.0</Texto>
      </View>

      <Confirmar
        aberto={sairTurma}
        titulo="Sair da conta?"
        mensagem={
          pendentes > 0
            ? "Ainda há atividades para enviar ao professor. Elas ficam guardadas e vão quando você entrar de novo."
            : "Seu progresso continua neste aparelho. Para voltar, use seu código e seu PIN."
        }
        textoConfirmar="Sair"
        onCancelar={() => setSairTurma(false)}
        onConfirmar={() => {
          setSairTurma(false);
          sairDaTurma();
        }}
      />
      <Confirmar
        aberto={apagar}
        titulo="Recomeçar do zero?"
        mensagem="Estrelas, constelações, luzes e histórico serão apagados deste aparelho."
        textoConfirmar="Recomeçar"
        perigoso
        onCancelar={() => setApagar(false)}
        onConfirmar={() => {
          apagarProgresso();
          setApagar(false);
        }}
      />

      <Modal
        visible={escolherCapa}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={() => setEscolherCapa(false)}
      >
        <Pressable style={p.vela} onPress={() => setEscolherCapa(false)} accessibilityLabel="Fechar">
          <Pressable style={[p.folha, { paddingBottom: insets.bottom + 18 }]} onPress={() => {}}>
            <Titulo tamanho={19}>Capa do perfil</Titulo>
            <Texto style={{ color: cor.textoSuave, fontSize: 13, marginTop: 2 }}>
              Escolha o fundo que fica atrás do seu avatar. As com cadeado são compradas com luzes.
            </Texto>
            <View style={p.capas}>
              {CAPAS.map((c, i) => {
                const ativa = (jogador.capa ?? 0) === i;
                const travada = c.preco !== undefined && !compras.includes(compraDaCapa(c.id));
                const vendo = capaAVenda === i;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => {
                      if (travada) return setCapaAVenda(i);
                      setCapaAVenda(null);
                      editarPerfil({ capa: i });
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: ativa }}
                    accessibilityLabel={travada ? `Capa ${c.nome}, ${c.preco} luzes` : `Capa ${c.nome}`}
                    style={p.opcaoCapa}
                  >
                    <View style={[p.miniCapa, (ativa || vendo) && { borderColor: cor.roxo }]}>
                      <Capa indice={i} style={{ borderRadius: 13 }} />
                      {travada ? (
                        <View style={p.preco}>
                          <Cadeado />
                          <Texto style={{ fontSize: 12, fontFamily: fonte.titulo, color: "#FFFFFF" }}>{c.preco}</Texto>
                        </View>
                      ) : null}
                    </View>
                    <Texto
                      style={{
                        fontSize: 12,
                        fontFamily: ativa ? fonte.textoForte : fonte.texto,
                        color: ativa ? cor.roxo : cor.textoSuave,
                      }}
                    >
                      {c.nome}
                    </Texto>
                  </Pressable>
                );
              })}
            </View>
            {capaAVenda !== null && CAPAS[capaAVenda] ? (
              <View style={p.venda}>
                <View style={{ flex: 1 }}>
                  <Titulo tamanho={16}>{CAPAS[capaAVenda]!.nome}</Titulo>
                  <Texto
                    style={{
                      fontSize: 13,
                      color: luzes >= CAPAS[capaAVenda]!.preco! ? cor.textoSuave : cor.pessegoEscuro,
                    }}
                  >
                    {luzes >= CAPAS[capaAVenda]!.preco!
                      ? `Você tem ✦ ${luzes} luzes`
                      : `Faltam ${CAPAS[capaAVenda]!.preco! - luzes} luzes. Jogue mais missões!`}
                  </Texto>
                </View>
                <Botao
                  titulo={`Comprar ✦ ${CAPAS[capaAVenda]!.preco}`}
                  disabled={luzes < CAPAS[capaAVenda]!.preco!}
                  onPress={() => {
                    const c = CAPAS[capaAVenda]!;
                    if (!comprar(compraDaCapa(c.id), c.preco!)) return;
                    editarPerfil({ capa: capaAVenda });
                    setCapaAVenda(null);
                  }}
                />
              </View>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

/** Cadeado pequeno das capas pagas. */
function Cadeado() {
  return (
    <Svg width={11} height={12} viewBox="0 0 11 12">
      <Path d="M3 5 V3.6 A2.5 2.5 0 0 1 8 3.6 V5" stroke="#FFFFFF" strokeWidth={1.6} fill="none" />
      <Rect x={1.2} y={5} width={8.6} height={6.4} rx={1.6} fill="#FFFFFF" />
    </Svg>
  );
}

function Atalho({
  titulo,
  detalhe,
  onPress,
  children,
}: {
  titulo: string;
  detalhe: string;
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [p.atalho, pressed && { opacity: 0.85 }]}
    >
      <View style={p.atalhoIcone}>{children}</View>
      <Texto style={{ fontFamily: fonte.titulo, fontSize: 14, color: cor.tinta }}>{titulo}</Texto>
      <Texto style={{ fontSize: 11, color: cor.textoSuave }}>{detalhe}</Texto>
    </Pressable>
  );
}

function Numero({ valor, rotulo }: { valor: string | number; rotulo: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Texto style={{ fontFamily: fonte.tituloForte, fontSize: 22, color: cor.tinta, lineHeight: 28 }}>{valor}</Texto>
      <Texto style={{ fontSize: 11, color: cor.textoSuave, textAlign: "center" }}>{rotulo}</Texto>
    </View>
  );
}

function Item({
  icone,
  titulo,
  detalhe,
  direita,
  onPress,
  perigoso = false,
  aberto,
}: {
  icone: ReactNode;
  titulo: string;
  detalhe?: string;
  direita?: ReactNode;
  onPress?: () => void;
  perigoso?: boolean;
  aberto?: boolean;
}) {
  const conteudo = (
    <>
      <View style={[p.itemIcone, { backgroundColor: perigoso ? cor.pessegoClaro : cor.roxoClaro }]}>{icone}</View>
      <View style={{ flex: 1 }}>
        <Texto style={{ fontFamily: fonte.textoForte, color: perigoso ? cor.pessegoEscuro : cor.tinta }}>
          {titulo}
        </Texto>
        {detalhe ? <Texto style={{ fontSize: 12, color: cor.textoSuave }}>{detalhe}</Texto> : null}
      </View>
      {direita ??
        (onPress ? (
          <View style={aberto ? { transform: [{ rotate: "90deg" }] } : undefined}>
            <Seta direcao="direita" cor={cor.textoFraco} tamanho={18} />
          </View>
        ) : null)}
    </>
  );
  if (!onPress) return <View style={p.item}>{conteudo}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [p.item, pressed && { backgroundColor: cor.suave }]}
    >
      {conteudo}
    </Pressable>
  );
}

const GAP_CEU = 12;

const p = criarEstilos(() => ({
  pontos: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 12 },
  ponto: { width: 6, height: 6, borderRadius: 3, backgroundColor: cor.inativo },
  pontoAtivo: { width: 18, backgroundColor: cor.roxo },
  faixa: { overflow: "hidden" },
  botaoCapa: {
    position: "absolute",
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(30,42,120,0.35)",
  },
  vela: { flex: 1, backgroundColor: "rgba(30,42,120,0.35)", justifyContent: "flex-end" },
  folha: { backgroundColor: cor.superficie, borderTopLeftRadius: raio.xg, borderTopRightRadius: raio.xg, padding: 20 },
  capas: { flexDirection: "row", flexWrap: "wrap", columnGap: 10, rowGap: 14, marginTop: 16 },
  opcaoCapa: { width: "30.5%", alignItems: "center", gap: 6 },
  preco: {
    position: "absolute",
    right: 5,
    bottom: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "rgba(20,19,74,0.75)",
  },
  venda: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
    padding: 12,
    borderRadius: raio.g,
    backgroundColor: cor.roxoClaro,
  },
  miniCapa: {
    width: "100%",
    height: 64,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "transparent",
    overflow: "hidden",
  },
  identidade: { alignItems: "center", marginTop: -62, marginBottom: 20, paddingHorizontal: 18 },
  molduraAvatar: { padding: 5, borderRadius: 999, backgroundColor: cor.fundo },
  lapis: {
    position: "absolute",
    right: 2,
    bottom: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: cor.fundo,
    backgroundColor: cor.roxo,
    alignItems: "center",
    justifyContent: "center",
  },
  atalhos: { flexDirection: "row", gap: 10 },
  atalho: {
    flex: 1,
    backgroundColor: cor.roxoClaro,
    borderRadius: raio.g,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 2,
  },
  atalhoIcone: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  lilo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: raio.xg,
    backgroundColor: "#1E2A78",
  },
  trilhaLilo: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginTop: 8,
    marginBottom: 4,
    overflow: "hidden",
  },
  trilhaLiloCheia: { height: 6, borderRadius: 3, backgroundColor: cor.pessego },
  secaoTopo: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 },
  contador: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  numeros: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: raio.g,
    backgroundColor: cor.superficie,
    borderWidth: 1,
    borderColor: cor.borda,
  },
  divisor: { width: 1, height: 30, backgroundColor: cor.borda },
  lista: {
    backgroundColor: cor.superficie,
    borderRadius: raio.g,
    borderWidth: 1,
    borderColor: cor.borda,
    overflow: "hidden",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 60,
  },
  itemIcone: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
}));
