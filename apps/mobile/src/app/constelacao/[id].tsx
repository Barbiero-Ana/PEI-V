import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Platform, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  NIVEIS,
  PONTOS_POR_ESTRELA,
  constelacaoPorId,
  estrelasAcesas,
  mapaConcluido,
  pontosNecessarios,
  type Constelacao,
} from "@modolume/core";
import { useLocalSearchParams } from "expo-router";
import { voltar } from "@/lib/navegacao";
import { useAcessibilidade, useFalarAoAbrir } from "@/estado/acessibilidade";
import { useJogador } from "@/estado/jogador";
import { Ceu } from "@/componentes/Ceu";
import { Fechar, Seta } from "@/componentes/Icones";
import { Lilo } from "@/componentes/Lilo";
import { Botao, Texto, Titulo } from "@/componentes/ui";
import { cor, criarEstilos, fonte, raio } from "@/tema";

/**
 * Constelação (álbum e celebração), apresentada como uma viagem de câmera:
 *   1. o céu chega de longe, girando e crescendo;
 *   2. a câmera mergulha em cada estrela conquistada, que acende com uma onda de luz;
 *   3. a câmera se afasta e revela o desenho inteiro.
 * Tocar numa estrela abre a estrela em tela cheia, com a explicação embaixo e
 * botões para voltar ou seguir para a próxima. No fim, como encontrá-la no céu e curiosidades.
 */

const NATIVO = Platform.OS !== "web";
const ZOOM_ESTRELA = 2.2;

const esperar = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const rodar = (a: Animated.CompositeAnimation) => new Promise<void>((r) => a.start(() => r()));

/** Câmera (posição e zoom) sobre um céu. */
function useCamera() {
  const [x] = useState(() => new Animated.Value(0));
  const [y] = useState(() => new Animated.Value(0));
  const [zoom] = useState(() => new Animated.Value(1));
  return { x, y, zoom };
}
type Camera = ReturnType<typeof useCamera>;

function desvio(c: Constelacao, i: number, largura: number, altura: number) {
  const e = c.estrelas[i]!;
  const m = Math.min(largura, altura) * 0.1;
  return {
    dx: m + (e.x / 100) * (largura - 2 * m) - largura / 2,
    dy: m + (e.y / 100) * (altura - 2 * m) - altura / 2,
  };
}

function focar(cam: Camera, d: { dx: number; dy: number }, zoom: number, duracao: number) {
  const ease = Easing.inOut(Easing.cubic);
  return Animated.parallel([
    Animated.timing(cam.zoom, { toValue: zoom, duration: duracao, easing: ease, useNativeDriver: NATIVO }),
    Animated.timing(cam.x, { toValue: -d.dx * zoom, duration: duracao, easing: ease, useNativeDriver: NATIVO }),
    Animated.timing(cam.y, { toValue: -d.dy * zoom, duration: duracao, easing: ease, useNativeDriver: NATIVO }),
  ]);
}

function afastar(cam: Camera) {
  return Animated.parallel([
    Animated.spring(cam.zoom, { toValue: 1, friction: 6, tension: 30, useNativeDriver: NATIVO }),
    Animated.spring(cam.x, { toValue: 0, friction: 7, tension: 30, useNativeDriver: NATIVO }),
    Animated.spring(cam.y, { toValue: 0, friction: 7, tension: 30, useNativeDriver: NATIVO }),
  ]);
}

const transformCamera = (cam: Camera) => [{ translateX: cam.x }, { translateY: cam.y }, { scale: cam.zoom }];

/**
 * Brilho das estrelas acesas no tour: um halo que respira e um reflexo em cruz
 * que cintila, cada estrela no seu ritmo. A estrela aberta brilha mais forte.
 */
function Cintilar({
  constelacao,
  acesas,
  largura,
  altura,
  destaque,
}: {
  constelacao: Constelacao;
  acesas: number;
  largura: number;
  altura: number;
  destaque: number | null;
}) {
  const margem = Math.min(largura, altura) * 0.1;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {constelacao.estrelas.slice(0, acesas).map((e, i) => (
        <Brilho
          key={i}
          x={margem + (e.x / 100) * (largura - 2 * margem)}
          y={margem + (e.y / 100) * (altura - 2 * margem)}
          tamanho={(4 + e.brilho * 1.6) * (destaque === i ? 1.25 : 1)}
          atraso={(i * 530) % 1700}
        />
      ))}
    </View>
  );
}

function Brilho({ x, y, tamanho, atraso }: { x: number; y: number; tamanho: number; atraso: number }) {
  const { animacoesReduzidas } = useAcessibilidade();
  const [v] = useState(() => new Animated.Value(0.5));
  useEffect(() => {
    if (animacoesReduzidas) return;
    const l = Animated.loop(
      Animated.sequence([
        Animated.delay(atraso),
        Animated.timing(v, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: NATIVO }),
        Animated.timing(v, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: NATIVO }),
      ]),
    );
    l.start();
    return () => l.stop();
  }, [v, atraso, animacoesReduzidas]);
  const halo = tamanho * 3;
  const cruz = tamanho * 4;
  return (
    <>
      <Animated.View
        style={{
          position: "absolute",
          left: x - halo / 2,
          top: y - halo / 2,
          width: halo,
          height: halo,
          borderRadius: halo / 2,
          backgroundColor: "#FFE9C7",
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.04, 0.16] }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1.15] }) }],
        }}
      />
      <Animated.View
        style={{
          position: "absolute",
          left: x - cruz / 2,
          top: y - cruz / 2,
          width: cruz,
          height: cruz,
          alignItems: "center",
          justifyContent: "center",
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] }),
          transform: [
            { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }) },
            { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "20deg"] }) },
          ],
        }}
      >
        <View style={{ position: "absolute", width: cruz, height: 1.2, borderRadius: 1, backgroundColor: "#FFF6E8" }} />
        <View style={{ position: "absolute", width: 1.2, height: cruz, borderRadius: 1, backgroundColor: "#FFF6E8" }} />
        <View
          style={{
            width: tamanho * 0.7,
            height: tamanho * 0.7,
            borderRadius: tamanho,
            backgroundColor: "#FFFFFF",
          }}
        />
      </Animated.View>
    </>
  );
}

export default function TelaConstelacao() {
  const { id, celebrar } = useLocalSearchParams<{ id: string; celebrar?: string }>();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { pontosPorNivel, constelacoes, progresso, pronto } = useJogador();
  const { animacoesReduzidas, falar } = useAcessibilidade();
  const c = constelacaoPorId(id);
  useFalarAoAbrir(c ? `${c.nome}, ${c.apelido}. ${c.historia}` : "");

  const nivel = c ? NIVEIS.find((n) => n.constelacao === c.id) : undefined;
  const pontos = nivel ? (pontosPorNivel[nivel.numero] ?? 0) : 0;
  const acesas = c && nivel ? estrelasAcesas(pontos, c, mapaConcluido(nivel.numero, progresso)) : 0;
  const completa = c ? acesas === c.estrelas.length : false;
  const lado = Math.min(width - 32, 460);

  const cam = useCamera();
  const [giro] = useState(() => new Animated.Value(-1));
  const [chegada] = useState(() => new Animated.Value(0));
  const [flash] = useState(() => new Animated.Value(0));
  const [onda] = useState(() => new Animated.Value(0));
  const [textos] = useState(() => [0, 1, 2, 3, 4].map(() => new Animated.Value(0)));
  const [brilhoTitulo] = useState(() => new Animated.Value(0));

  const [mostradas, setMostradas] = useState(0);
  const [nomeAtual, setNomeAtual] = useState<string | null>(null);
  const [etiqueta] = useState(() => new Animated.Value(0));
  const [livre, setLivre] = useState(false);
  const [estrela, setEstrela] = useState<number | null>(null);
  const execucao = useRef({ parar: false });

  // estrela aberta em tela cheia
  const camTela = useCamera();
  const [tela] = useState(() => new Animated.Value(0));
  const [explicacao] = useState(() => new Animated.Value(0));
  const alturaTela = height * 0.6;

  const mostrarTextos = () =>
    Animated.stagger(
      220,
      textos.map((v) =>
        Animated.timing(v, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: NATIVO }),
      ),
    ).start();

  const ondaDeLuz = () => {
    onda.setValue(0);
    Animated.timing(onda, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: NATIVO,
    }).start();
  };

  // a viagem de abertura (só depois que o progresso do aluno carregou)
  useEffect(() => {
    if (!c || !pronto) return;
    const run = { parar: false };
    execucao.current = run;
    if (animacoesReduzidas) {
      chegada.setValue(1);
      cam.zoom.setValue(1);
      giro.setValue(0);
    } else cam.zoom.setValue(0.3);
    (async () => {
      if (animacoesReduzidas) {
        setMostradas(acesas);
        setLivre(true);
        mostrarTextos();
        return;
      }
      await rodar(
        Animated.parallel([
          Animated.timing(chegada, { toValue: 1, duration: 700, useNativeDriver: NATIVO }),
          Animated.timing(cam.zoom, {
            toValue: 1,
            duration: 1300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: NATIVO,
          }),
          Animated.timing(giro, {
            toValue: 0,
            duration: 1300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: NATIVO,
          }),
        ]),
      );
      await esperar(250);
      for (let i = 0; i < acesas; i += 1) {
        if (run.parar) return;
        await rodar(focar(cam, desvio(c, i, lado, lado), ZOOM_ESTRELA, i === 0 ? 850 : 520));
        if (run.parar) return;
        setMostradas(i + 1);
        setNomeAtual(c.estrelas[i]!.nome ?? "Estrela");
        etiqueta.setValue(0);
        Animated.timing(etiqueta, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: NATIVO,
        }).start();
        ondaDeLuz();
        await esperar(520);
      }
      if (run.parar) return;
      Animated.timing(etiqueta, { toValue: 0, duration: 250, useNativeDriver: NATIVO }).start();
      await rodar(afastar(cam));
      if (run.parar) return;
      if (completa) {
        await rodar(
          Animated.sequence([
            Animated.timing(flash, { toValue: 1, duration: 160, useNativeDriver: NATIVO }),
            Animated.timing(flash, { toValue: 0, duration: 700, useNativeDriver: NATIVO }),
          ]),
        );
      }
      setLivre(true);
      mostrarTextos();
    })();
    const l = Animated.loop(
      Animated.sequence([
        Animated.timing(brilhoTitulo, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: NATIVO,
        }),
        Animated.timing(brilhoTitulo, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: NATIVO,
        }),
      ]),
    );
    l.start();
    return () => {
      run.parar = true;
      l.stop();
    };
  }, [c?.id, pronto]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!c) return null;
  const data = constelacoes[c.id];
  const sel = estrela !== null ? c.estrelas[estrela] : undefined;
  // próxima estrela da ordem: só se estiver acesa (ou a constelação completa)
  const proxima =
    estrela !== null && estrela + 1 < c.estrelas.length && (completa || estrela + 1 < acesas) ? estrela + 1 : null;

  function pular() {
    execucao.current.parar = true;
    [cam.x, cam.y, cam.zoom, giro, chegada].forEach((v) => v.stopAnimation());
    chegada.setValue(1);
    giro.setValue(0);
    afastar(cam).start();
    etiqueta.setValue(0);
    setMostradas(acesas);
    setLivre(true);
    mostrarTextos();
  }

  /** Abre a estrela em tela cheia: zoom nela e explicação surgindo embaixo. */
  function abrirEstrela(i: number) {
    if (!livre) return;
    setEstrela(i);
    const e = c?.estrelas[i];
    if (e) falar(`${e.nome ?? "Estrela"}. ${e.curiosidade ?? ""}`);
    camTela.zoom.setValue(1);
    camTela.x.setValue(0);
    camTela.y.setValue(0);
    explicacao.setValue(0);
    Animated.sequence([
      Animated.timing(tela, { toValue: 1, duration: 260, useNativeDriver: NATIVO }),
      focar(camTela, desvio(c!, i, width, alturaTela), 2.6, 900),
      Animated.timing(explicacao, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: NATIVO,
      }),
    ]).start();
  }

  function irPara(i: number) {
    setEstrela(i);
    explicacao.setValue(0);
    Animated.sequence([
      focar(camTela, desvio(c!, i, width, alturaTela), 2.6, 750),
      Animated.timing(explicacao, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: NATIVO,
      }),
    ]).start();
  }

  function fecharEstrela() {
    Animated.parallel([
      Animated.timing(explicacao, { toValue: 0, duration: 200, useNativeDriver: NATIVO }),
      afastar(camTela),
      Animated.sequence([
        Animated.delay(380),
        Animated.timing(tela, { toValue: 0, duration: 300, useNativeDriver: NATIVO }),
      ]),
    ]).start(() => setEstrela(null));
  }

  const subir = (v: Animated.Value) => ({
    opacity: v,
    transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
  });

  return (
    <View style={[t.tela, { paddingTop: insets.top + 8 }]}>
      <StatusBar style="light" />
      <View style={t.topo}>
        <Pressable onPress={voltar} hitSlop={12} style={t.fechar} accessibilityLabel="Fechar">
          <Fechar cor="#fff" tamanho={18} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ alignItems: "center", paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }}
      >
        {celebrar && completa ? (
          <Animated.Text
            style={[
              t.celebra,
              {
                opacity: textos[0],
                transform: [{ scale: brilhoTitulo.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) }],
              },
            ]}
          >
            Constelação completa!
          </Animated.Text>
        ) : null}

        <Animated.View style={[t.resumo, { opacity: chegada }]}>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "baseline",
              columnGap: 8,
              justifyContent: "center",
            }}
          >
            <Titulo tamanho={26} style={{ color: "#fff" }}>
              {c.nome}
            </Titulo>
            <Titulo tamanho={26} style={{ color: cor.lilasNoEscuro }}>
              {c.apelido}
            </Titulo>
          </View>
          <Texto style={t.resumoTexto}>{c.historia.split(". ")[0]!.replace(/\.$/, "")}.</Texto>
        </Animated.View>

        {/* moldura fixa; dentro dela a câmera aproxima, afasta e gira */}
        <Animated.View style={[t.moldura, { width: lado, height: lado, marginTop: 12, opacity: chegada }]}>
          <Animated.View
            style={{
              transform: [
                ...transformCamera(cam),
                { rotate: giro.interpolate({ inputRange: [-1, 0], outputRange: ["-35deg", "0deg"] }) },
              ],
            }}
          >
            <Ceu
              constelacao={c}
              acesas={mostradas}
              largura={lado}
              altura={lado}
              modo="vivo"
              raio={0}
              onTocarEstrela={abrirEstrela}
              selecionada={null}
            />
          </Animated.View>
          {/* onda de luz quando uma estrela acende (ela está no centro) */}
          <Animated.View
            pointerEvents="none"
            style={[
              t.onda,
              {
                left: lado / 2 - 40,
                top: lado / 2 - 40,
                opacity: onda.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.8, 0] }),
                transform: [{ scale: onda.interpolate({ inputRange: [0, 1], outputRange: [0.3, 2.6] }) }],
              },
            ]}
          />
          {nomeAtual ? (
            <Animated.View
              pointerEvents="none"
              style={[
                t.etiqueta,
                {
                  top: lado / 2 + 34,
                  opacity: etiqueta,
                  transform: [{ translateY: etiqueta.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
                },
              ]}
            >
              <Texto style={{ color: "#FFF6E8", fontFamily: fonte.titulo, fontSize: 14 }}>{nomeAtual}</Texto>
            </Animated.View>
          ) : null}
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: "#FFF6E8",
                opacity: flash.interpolate({ inputRange: [0, 1], outputRange: [0, 0.35] }),
              },
            ]}
          />
          {!livre ? (
            <Pressable onPress={pular} style={t.pular} hitSlop={8} accessibilityLabel="Pular animação">
              <Texto style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, fontFamily: fonte.textoForte }}>
                Pular
              </Texto>
            </Pressable>
          ) : null}
          {!livre && mostradas < acesas ? (
            <View style={t.contador} pointerEvents="none">
              <Texto style={{ color: "#FFF6E8", fontFamily: fonte.titulo, fontSize: 13 }}>
                {mostradas} de {acesas} {acesas === 1 ? "estrela" : "estrelas"}
              </Texto>
            </View>
          ) : null}
        </Animated.View>

        <View style={{ alignSelf: "stretch", marginTop: 20, gap: 12 }}>
          <Animated.View style={subir(textos[0]!)}>
            <Pressable onPress={() => abrirEstrela(0)} style={({ pressed }) => [t.tour, pressed && { opacity: 0.85 }]}>
              <Texto style={{ color: cor.tinta, fontFamily: fonte.titulo, fontSize: 15 }}>
                Fazer o tour pelas estrelas
              </Texto>
              <Seta direcao="direita" cor={cor.tinta} tamanho={16} />
            </Pressable>
          </Animated.View>

          <Animated.View style={subir(textos[1]!)}>
            {completa ? (
              <Texto style={t.historia}>{c.historia}</Texto>
            ) : (
              <View style={t.progresso}>
                <Texto style={{ color: "#fff", fontFamily: fonte.titulo, fontSize: 18, textAlign: "center" }}>
                  {acesas} de {c.estrelas.length} estrelas acesas
                </Texto>
                <Texto style={{ color: "rgba(255,255,255,0.7)", textAlign: "center", marginTop: 4 }}>
                  {pontos >= pontosNecessarios(c) - PONTOS_POR_ESTRELA
                    ? "A última estrela acende quando você terminar todas as missões deste mapa."
                    : `A cada ${PONTOS_POR_ESTRELA} pontos de luz, uma estrela acende. A última acende quando você terminar todas as missões deste mapa.`}
                </Texto>
              </View>
            )}
          </Animated.View>

          <Animated.View style={subir(textos[2]!)}>
            <Texto style={t.dica}>Toque numa estrela para viajar até ela.</Texto>
            {completa && data ? (
              <Texto style={t.data}>Guardada no seu álbum em {data.split("-").reverse().join("/")}</Texto>
            ) : null}
          </Animated.View>

          <Animated.View style={subir(textos[3]!)}>
            <SobreConstelacao constelacao={c} />
          </Animated.View>

          <Animated.View style={subir(textos[4]!)}>
            <Botao
              titulo={celebrar ? "Continuar" : "Voltar"}
              variante="destaque"
              onPress={voltar}
              style={{ marginTop: 4 }}
            />
          </Animated.View>
        </View>
      </ScrollView>

      {/* estrela em tela cheia */}
      {sel ? (
        <Animated.View style={[StyleSheet.absoluteFill, t.telaCheia, { opacity: tela }]}>
          <View style={{ height: alturaTela, overflow: "hidden" }}>
            <Animated.View style={{ transform: transformCamera(camTela) }}>
              <Ceu
                constelacao={c}
                acesas={acesas}
                largura={width}
                altura={alturaTela}
                modo="vivo"
                raio={0}
                selecionada={estrela}
              />
              <Cintilar constelacao={c} acesas={acesas} largura={width} altura={alturaTela} destaque={estrela} />
            </Animated.View>
            <View style={[t.barraTour, { top: insets.top + 10 }]}>
              <View style={{ flexDirection: "row", gap: 5, flex: 1 }}>
                {c.estrelas.map((_, i) => (
                  <View
                    key={i}
                    style={[t.pontoTour, i === estrela && t.pontoTourAtivo, i >= acesas && { opacity: 0.35 }]}
                  />
                ))}
              </View>
              <Pressable onPress={fecharEstrela} hitSlop={12} style={t.fechar} accessibilityLabel="Fechar estrela">
                <Fechar cor="#fff" tamanho={16} />
              </Pressable>
            </View>
          </View>
          <Animated.View
            style={[
              t.explicacao,
              { paddingBottom: insets.bottom + 16 },
              {
                opacity: explicacao,
                transform: [{ translateY: explicacao.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
              },
            ]}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={[t.bolinha, { backgroundColor: estrela! < acesas ? "#FFF6E8" : "transparent" }]} />
              <Titulo tamanho={24} style={{ color: "#FFFFFF", flex: 1 }}>
                {sel.nome ?? "Estrela sem nome"}
              </Titulo>
              <Texto style={{ color: cor.lilasNoEscuro, fontSize: 12 }}>
                {estrela! + 1} de {c.estrelas.length}
              </Texto>
            </View>
            <View style={{ flexDirection: "row", gap: 4, alignItems: "center", marginTop: 6 }}>
              <Texto style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginRight: 4 }}>Brilho</Texto>
              {[1, 2, 3].map((b) => (
                <View key={b} style={[t.brilho, b <= sel.brilho && { backgroundColor: cor.pessego }]} />
              ))}
            </View>
            <Texto style={{ color: "rgba(255,255,255,0.88)", fontSize: 15, lineHeight: 22, marginTop: 10 }}>
              {sel.curiosidade ?? "Uma estrela mais discreta, mas sem ela o desenho da constelação não fecha."}
            </Texto>
            <Texto
              style={{
                color: estrela! < acesas ? cor.pessego : cor.lilas,
                fontSize: 12,
                marginTop: 8,
                fontFamily: fonte.textoForte,
              }}
            >
              {estrela! < acesas ? "Acesa por você" : `Ainda apagada: jogue o mapa ${nivel?.numero} para acendê-la`}
            </Texto>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
              {estrela! > 0 ? (
                <Pressable
                  onPress={() => irPara(estrela! - 1)}
                  style={({ pressed }) => [t.navBotao, pressed && { opacity: 0.8 }]}
                >
                  <Seta direcao="esquerda" cor="#FFFFFF" tamanho={16} />
                  <Texto style={t.navTexto}>Anterior</Texto>
                </Pressable>
              ) : (
                <Pressable onPress={fecharEstrela} style={({ pressed }) => [t.navBotao, pressed && { opacity: 0.8 }]}>
                  <Seta direcao="esquerda" cor="#FFFFFF" tamanho={16} />
                  <Texto style={t.navTexto}>Voltar</Texto>
                </Pressable>
              )}
              {proxima !== null ? (
                <Pressable
                  onPress={() => irPara(proxima)}
                  style={({ pressed }) => [t.navBotao, t.navProxima, pressed && { opacity: 0.85 }]}
                >
                  <Texto style={[t.navTexto, { color: cor.tinta }]}>Próxima</Texto>
                  <Seta direcao="direita" cor={cor.tinta} tamanho={16} />
                </Pressable>
              ) : (
                <Pressable
                  onPress={fecharEstrela}
                  style={({ pressed }) => [t.navBotao, t.navProxima, pressed && { opacity: 0.85 }]}
                >
                  <Texto style={[t.navTexto, { color: cor.tinta }]}>Ver a constelação</Texto>
                </Pressable>
              )}
            </View>
          </Animated.View>
        </Animated.View>
      ) : null}
    </View>
  );
}

const LETRAS_MES = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const NOMES_MES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

/** "dezembro a março", seguindo a ordem em que os meses aparecem (pode virar o ano). */
function periodo(meses: number[]) {
  if (meses.length === 0) return "";
  return meses.length === 1
    ? NOMES_MES[meses[0]! - 1]!
    : `${NOMES_MES[meses[0]! - 1]} a ${NOMES_MES[meses[meses.length - 1]! - 1]}`;
}

/**
 * Sobre a constelação: quando ela aparece (calendário dos 12 meses), como
 * encontrá-la e uma curiosidade por vez.
 */
function SobreConstelacao({ constelacao }: { constelacao: Constelacao }) {
  const mesAtual = new Date().getMonth() + 1;
  const visivelAgora = constelacao.meses.includes(mesAtual);
  return (
    <View style={{ gap: 22 }}>
      {/* quando ver */}
      <View style={t.bloco}>
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
          <Titulo tamanho={18} style={{ color: "#FFFFFF" }}>
            Quando aparece
          </Titulo>
          <Texto style={{ fontSize: 13, color: visivelAgora ? cor.pessego : cor.lilas, fontFamily: fonte.textoForte }}>
            {visivelAgora ? "Dá para ver agora!" : `Melhor de ${periodo(constelacao.meses)}`}
          </Texto>
        </View>
        <View style={t.meses}>
          {LETRAS_MES.map((l, i) => {
            const ativo = constelacao.meses.includes(i + 1);
            const hoje = i + 1 === mesAtual;
            return (
              <View key={i} style={{ flex: 1, alignItems: "center", gap: 6 }}>
                <View style={[t.mes, ativo && t.mesAtivo, hoje && t.mesHoje]}>
                  {ativo ? <View style={t.mesEstrela} /> : null}
                </View>
                <Texto
                  style={{
                    fontSize: 11,
                    color: hoje ? "#FFFFFF" : ativo ? cor.pessego : "rgba(255,255,255,0.45)",
                    fontFamily: hoje || ativo ? fonte.textoForte : fonte.texto,
                  }}
                >
                  {l}
                </Texto>
              </View>
            );
          })}
        </View>
      </View>

      {/* como encontrar */}
      <View style={t.bloco}>
        <Titulo tamanho={18} style={{ color: "#FFFFFF" }}>
          Como encontrar
        </Titulo>
        <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
          <View style={t.trilhoTexto} />
          <Texto style={{ flex: 1, color: "rgba(255,255,255,0.88)", fontSize: 15, lineHeight: 23 }}>
            {constelacao.explicacao}
          </Texto>
        </View>
      </View>

      {/* curiosidades: um cartão claro, uma de cada vez */}
      <Curiosidades lista={constelacao.curiosidades} />
    </View>
  );
}

/** Uma curiosidade por vez, num cartão claro com o Lilo; o botão troca para a próxima. */
function Curiosidades({ lista }: { lista: string[] }) {
  const { animacoesReduzidas } = useAcessibilidade();
  const [atual, setAtual] = useState(0);
  const [v] = useState(() => new Animated.Value(1));
  function proxima() {
    const seguinte = (atual + 1) % lista.length;
    if (animacoesReduzidas) return setAtual(seguinte);
    Animated.timing(v, { toValue: 0, duration: 160, useNativeDriver: NATIVO }).start(() => {
      setAtual(seguinte);
      Animated.timing(v, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: NATIVO,
      }).start();
    });
  }
  return (
    <View style={t.cartaoCuriosidade}>
      <View style={t.liloEspia}>
        <Lilo tamanho={58} humor="ideia" />
      </View>
      <Texto style={{ fontFamily: fonte.titulo, fontSize: 18, color: cor.tinta }}>Você sabia?</Texto>
      <Animated.View
        style={{
          opacity: v,
          transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
        }}
      >
        <Texto style={{ fontSize: 16, lineHeight: 24, color: cor.texto, marginTop: 8 }}>{lista[atual]}</Texto>
      </Animated.View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
        <View style={{ flexDirection: "row", gap: 6 }}>
          {lista.map((_, i) => (
            <View key={i} style={[t.pontoCuriosidade, i === atual && t.pontoCuriosidadeAtivo]} />
          ))}
        </View>
        {lista.length > 1 ? (
          <Pressable
            onPress={proxima}
            accessibilityRole="button"
            style={({ pressed }) => [t.outraCuriosidade, pressed && { opacity: 0.85 }]}
          >
            <Texto style={{ fontFamily: fonte.titulo, fontSize: 14, color: "#FFFFFF" }}>Outra curiosidade</Texto>
            <Seta direcao="direita" cor="#FFFFFF" tamanho={14} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const t = criarEstilos(() => ({
  tela: { flex: 1, backgroundColor: "#0D1240" },
  topo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  fechar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  moldura: { borderRadius: raio.xg, overflow: "hidden", backgroundColor: "#141B57" },
  onda: { position: "absolute", width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: cor.pessego },
  pular: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  contador: {
    position: "absolute",
    bottom: 12,
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(13,18,64,0.6)",
  },
  celebra: {
    fontFamily: fonte.tituloForte,
    fontSize: 26,
    color: cor.pessegoNoEscuro,
    marginTop: 6,
    textAlign: "center",
  },
  historia: { color: "rgba(255,255,255,0.85)", textAlign: "center", fontSize: 15, lineHeight: 22 },
  dica: { color: cor.lilasNoEscuro, textAlign: "center", fontSize: 13 },
  data: { color: "rgba(255,255,255,0.55)", textAlign: "center", fontSize: 12, marginTop: 4 },
  progresso: { padding: 14, borderRadius: raio.g, backgroundColor: "rgba(255,255,255,0.07)" },
  telaCheia: { backgroundColor: "#0D1240", zIndex: 10 },
  resumo: { alignSelf: "stretch", gap: 4, marginTop: 4 },
  resumoTexto: { color: "rgba(255,255,255,0.82)", textAlign: "center", fontSize: 14, lineHeight: 20 },
  etiqueta: {
    position: "absolute",
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(13,18,64,0.7)",
  },
  tour: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: raio.m,
    backgroundColor: cor.lilas,
  },
  barraTour: { position: "absolute", left: 20, right: 20, flexDirection: "row", alignItems: "center", gap: 12 },
  pontoTour: { flex: 1, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.35)" },
  pontoTourAtivo: { backgroundColor: cor.pessego },
  explicacao: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#141B57",
    marginTop: -20,
  },
  bolinha: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: "#FFF6E8" },
  brilho: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.18)" },
  navBotao: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: raio.m,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  navProxima: { backgroundColor: cor.pessego },
  navTexto: { color: "#FFFFFF", fontFamily: fonte.titulo, fontSize: 15 },
  bloco: { paddingHorizontal: 4 },
  meses: { flexDirection: "row", gap: 4, marginTop: 14 },
  mes: {
    width: "100%",
    maxWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  mesAtivo: { backgroundColor: "rgba(255,172,122,0.22)", borderWidth: 1.5, borderColor: cor.pessego },
  mesHoje: { borderWidth: 2, borderColor: "#FFFFFF" },
  mesEstrela: { width: 7, height: 7, borderRadius: 4, backgroundColor: cor.pessego },
  trilhoTexto: { width: 3, borderRadius: 2, backgroundColor: cor.pessego },
  cartaoCuriosidade: {
    marginTop: 18,
    marginHorizontal: 2,
    paddingTop: 22,
    paddingHorizontal: 18,
    paddingBottom: 16,
    borderRadius: 24,
    backgroundColor: "#FFF6E8",
  },
  liloEspia: { position: "absolute", right: 12, top: -34 },
  pontoCuriosidade: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#E7D5BE" },
  pontoCuriosidadeAtivo: { width: 20, backgroundColor: cor.pessegoEscuro },
  outraCuriosidade: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: cor.roxo,
  },
}));
