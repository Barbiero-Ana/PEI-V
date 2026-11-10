import { useEffect, useState, type ReactNode } from "react";
import { Animated, Easing, Platform, Pressable, ScrollView, View, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import Svg, { Circle, G, Path } from "react-native-svg";
import { PONTOS_POR_ESTRELA, proximaMissao, type Missao, type ResultadoJogada } from "@modolume/core";
import { voltar } from "@/lib/navegacao";
import { useAcessibilidade } from "@/estado/acessibilidade";
import { useJogador, type Recompensa } from "@/estado/jogador";
import { Lilo } from "./Lilo";
import { useAbrirMissao } from "./Nuvens";
import { Alvo, IconeMissao, IconeRaio, Lampada, Relogio, Seta, Tentativa } from "./Icones";
import { Montagem } from "./Montagem";
import { Botao, Texto, Titulo } from "./ui";
import { cor, COR_MISSAO, criarEstilos, fonte, raio } from "@/tema";

/**
 * Tela de parabéns no fim da missão, num céu só: a nota em estrelas, a
 * constelação do mapa acendendo as estrelas novas e o Lilo no pódio (ouro,
 * prata ou bronze). Embaixo, o resumo em quatro blocos e as ações fixas no
 * rodapé.
 */

const NATIVO = Platform.OS !== "web";
const CEU = "#1E2A78";

const CONFETE = ["#FFAC7A", "#8FD3FF", "#C9B4FF", "#FF7CA7", "#F6C344", "#FFFFFF"];
const PEDACOS = Array.from({ length: 26 }, (_, i) => ({
  angulo: (i * 360) / 26 + (i % 2 ? 7 : -7),
  distancia: 95 + ((i * 41) % 70),
  estrela: i % 4 === 0,
  cor: CONFETE[i % CONFETE.length]!,
  giro: (i % 2 ? 1 : -1) * (200 + ((i * 59) % 200)),
  atraso: (i % 5) * 40,
}));

/** Entrada com "pop": cresce de leve, sobe e aparece. */
function Pop({ atraso, children }: { atraso: number; children: ReactNode }) {
  const { animacoesReduzidas } = useAcessibilidade();
  const [v] = useState(() => new Animated.Value(animacoesReduzidas ? 1 : 0));
  useEffect(() => {
    if (animacoesReduzidas) return;
    Animated.spring(v, { toValue: 1, friction: 6, tension: 80, delay: atraso, useNativeDriver: NATIVO }).start();
  }, [v, atraso, animacoesReduzidas]);
  return (
    <Animated.View
      style={{
        opacity: v.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1] }),
        transform: [
          { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
          { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] }) },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

/** Raios de luz atrás do Lilo, girando bem devagar. */
function Raios({ lado }: { lado: number }) {
  const { animacoesReduzidas } = useAcessibilidade();
  const [giro] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (animacoesReduzidas) return;
    const l = Animated.loop(
      Animated.timing(giro, { toValue: 1, duration: 24000, easing: Easing.linear, useNativeDriver: NATIVO }),
    );
    l.start();
    return () => l.stop();
  }, [giro, animacoesReduzidas]);
  const c = lado / 2;
  const raios = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 * Math.PI) / 180;
    const b = ((i * 30 + 12) * Math.PI) / 180;
    return `M ${c} ${c} L ${c + Math.cos(a) * c} ${c + Math.sin(a) * c} L ${c + Math.cos(b) * c} ${c + Math.sin(b) * c} Z`;
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        width: lado,
        height: lado,
        transform: [{ rotate: giro.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) }],
      }}
    >
      <Svg width={lado} height={lado}>
        <G opacity={0.1}>
          {raios.map((d, i) => (
            <Path key={i} d={d} fill="#FFFFFF" />
          ))}
        </G>
        <Circle cx={c} cy={c} r={c * 0.42} fill="#C9B4FF" opacity={0.16} />
        <Circle cx={c} cy={c} r={c * 0.3} fill="#C9B4FF" opacity={0.14} />
      </Svg>
    </Animated.View>
  );
}

/** Confete que estoura do centro e cai devagar. */
function Confete({ v }: { v: Animated.Value }) {
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: "50%", top: "50%" }}>
      {PEDACOS.map((p, i) => {
        const a = (p.angulo * Math.PI) / 180;
        const dx = Math.cos(a) * p.distancia;
        const dy = Math.sin(a) * p.distancia * 0.75;
        return (
          <Animated.View
            key={i}
            style={{
              position: "absolute",
              opacity: v.interpolate({ inputRange: [0, 0.08, 0.75, 1], outputRange: [0, 1, 1, 0] }),
              transform: [
                { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, dx] }) },
                // sai rápido e depois cai, como confete de verdade
                { translateY: v.interpolate({ inputRange: [0, 0.45, 1], outputRange: [0, dy, dy + 60] }) },
                { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ["0deg", `${p.giro}deg`] }) },
              ],
            }}
          >
            {p.estrela ? (
              <Svg width={14} height={14} viewBox="0 0 24 24">
                <Path d="M12 2.8l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6L3.2 9.2l6.1-.8z" fill={p.cor} />
              </Svg>
            ) : (
              <View style={{ width: 8, height: 13, borderRadius: 2, backgroundColor: p.cor }} />
            )}
          </Animated.View>
        );
      })}
    </View>
  );
}

/** Estrela da nota: surge girando com uma mola; as não ganhas ficam apagadas. */
function EstrelaNota({ cheia, atraso, grande }: { cheia: boolean; atraso: number; grande: boolean }) {
  const { animacoesReduzidas } = useAcessibilidade();
  const [v] = useState(() => new Animated.Value(animacoesReduzidas ? 1 : 0));
  useEffect(() => {
    if (animacoesReduzidas) return;
    Animated.spring(v, { toValue: 1, friction: 4, tension: 90, delay: atraso, useNativeDriver: NATIVO }).start();
  }, [v, atraso, animacoesReduzidas]);
  const t = grande ? 58 : 46;
  return (
    <Animated.View
      style={{
        marginTop: grande ? 0 : 14,
        opacity: v.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 1] }),
        transform: [
          { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }) },
          { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ["-90deg", "0deg"] }) },
        ],
      }}
    >
      <Svg width={t} height={t} viewBox="0 0 24 24">
        {cheia ? <Circle cx={12} cy={13} r={11} fill="#FFAC7A" opacity={0.22} /> : null}
        <Path
          d="M12 2.8l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6L3.2 9.2l6.1-.8z"
          fill={cheia ? "#FFAC7A" : "rgba(255,255,255,0.16)"}
          stroke={cheia ? "#FFD3B5" : "rgba(255,255,255,0.3)"}
          strokeWidth={0.8}
          strokeLinejoin="round"
        />
      </Svg>
    </Animated.View>
  );
}

/** Número que conta de 0 até o valor. */
function useContagem(alvo: number, atraso: number) {
  const { animacoesReduzidas } = useAcessibilidade();
  const [valor, setValor] = useState(animacoesReduzidas ? alvo : 0);
  useEffect(() => {
    if (animacoesReduzidas) return;
    const v = new Animated.Value(0);
    const id = v.addListener(({ value }) => setValor(Math.round(value)));
    Animated.timing(v, {
      toValue: alvo,
      duration: 900,
      delay: atraso,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => v.removeListener(id);
  }, [alvo, atraso, animacoesReduzidas]);
  return valor;
}

/** Nome do lugar no pódio, conforme as estrelas. */
const PODIO = { 3: "Ouro", 2: "Prata", 1: "Bronze" } as const;

/** Lilo em pé no pódio. */
function Podio({ estrelas, humor }: { estrelas: 1 | 2 | 3; humor: "rindo" | "feliz" }) {
  return (
    <View style={{ alignItems: "center" }}>
      <Lilo humor={humor} tamanho={132} />
      <View style={f.podioTopo} />
      <View style={f.podio}>
        <Texto style={{ fontFamily: fonte.tituloForte, fontSize: 15, color: "#FFFFFF" }}>{PODIO[estrelas]}</Texto>
      </View>
    </View>
  );
}

export function FimDeMissao({
  missao,
  resultado,
  recompensa,
  onDeNovo,
  insetBaixo,
}: {
  missao: Missao;
  resultado: ResultadoJogada;
  recompensa: Recompensa;
  onDeNovo: () => void;
  insetBaixo: number;
}) {
  const { width } = useWindowDimensions();
  const { progresso, preferencias, jogador } = useJogador();
  const { falar, animacoesReduzidas } = useAcessibilidade();
  const abrirMissao = useAbrirMissao();
  const nota = Math.max(1, Math.min(3, resultado.estrelas)) as 1 | 2 | 3;
  const titulo = nota === 3 ? "Missão perfeita!" : nota === 2 ? "Missão concluída!" : "Você chegou lá!";
  const sugerida = proximaMissao(progresso, preferencias.liberarTodos);
  const seguinte = sugerida && sugerida.id !== missao.id ? sugerida : null;
  const m = Math.floor(resultado.tempoSegundos / 60);
  const sgs = resultado.tempoSegundos % 60;
  const c = recompensa.constelacao;
  const totalEstrelas = c.estrelas.length;
  const completa = recompensa.acesasDepois >= totalEstrelas;
  const resto = recompensa.pontosDepois % PONTOS_POR_ESTRELA;
  const novas = recompensa.acesasDepois - recompensa.acesasAntes;
  const pontos = useContagem(recompensa.pontos, 1400);
  const [festa] = useState(() => new Animated.Value(0));
  const largura = Math.min(width, 560) - 32;

  useEffect(() => {
    falar(
      `${titulo} Você ganhou ${resultado.estrelas} ${resultado.estrelas === 1 ? "estrela" : "estrelas"}` +
        (novas > 0 ? ` e acendeu ${novas} ${novas === 1 ? "estrela" : "estrelas"} em ${c.nome}.` : "."),
    );
    if (animacoesReduzidas) return;
    Animated.timing(festa, {
      toValue: 1,
      duration: 1600,
      delay: 1150,
      easing: Easing.out(Easing.quad),
      useNativeDriver: NATIVO,
    }).start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ao completar o mapa, a celebração abre sozinha
  useEffect(() => {
    if (!recompensa.completou) return;
    // espera a montagem terminar antes de abrir a celebração
    const t = setTimeout(
      () => router.push({ pathname: "/constelacao/[id]", params: { id: c.id, celebrar: "1" } }),
      1500 + novas * 1900 + 1600,
    );
    return () => clearTimeout(t);
  }, [recompensa.completou, c.id, novas]);

  const progressoTexto = completa
    ? "Constelação completa! Ela foi para o seu álbum."
    : recompensa.acesasDepois === totalEstrelas - 1
      ? "A última estrela acende ao terminar todas as missões do mapa."
      : `Faltam ${PONTOS_POR_ESTRELA - resto} pontos para a próxima estrela`;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 4, gap: 12 }}>
        {/* o céu da festa: nota, constelação montando e o Lilo no pódio */}
        <View style={f.ceu}>
          {[
            [0.06, 0.04, 2],
            [0.92, 0.06, 1.5],
            [0.04, 0.5, 1.5],
            [0.95, 0.46, 2],
            [0.1, 0.9, 1.2],
            [0.88, 0.94, 1.2],
          ].map(([x, y, r], i) => (
            <View
              key={i}
              style={{
                position: "absolute",
                left: `${x! * 100}%`,
                top: `${y! * 100}%`,
                width: r! * 2,
                height: r! * 2,
                borderRadius: r!,
                backgroundColor: "#FFFFFF",
                opacity: 0.6,
              }}
            />
          ))}

          <Pop atraso={100}>
            <Titulo tamanho={28} style={{ color: "#FFFFFF", textAlign: "center" }}>
              Parabéns{jogador ? `, ${jogador.nome}` : ""}!
            </Titulo>
            <Texto style={{ color: cor.lilasNoEscuro, fontSize: 16, textAlign: "center", marginTop: 2 }}>
              {titulo}
            </Texto>
          </Pop>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 6, marginTop: 8 }}>
            {[1, 2, 3].map((i) => (
              <EstrelaNota key={i} cheia={i <= resultado.estrelas} atraso={300 + i * 200} grande={i === 2} />
            ))}
          </View>

          {/* a constelação do mapa, com as estrelas novas acendendo */}
          <View style={{ marginTop: 14 }}>
            <Montagem
              constelacao={c}
              antes={recompensa.acesasAntes}
              depois={recompensa.acesasDepois}
              largura={largura - 24}
              altura={150}
            />
            <View style={f.etiquetaCeu} pointerEvents="none">
              <Texto style={{ fontFamily: fonte.titulo, fontSize: 13, color: "#FFFFFF" }}>
                {c.nome} · {recompensa.acesasDepois} de {totalEstrelas}
              </Texto>
            </View>
          </View>
          {novas > 0 ? (
            <Texto
              style={{ color: cor.pessegoNoEscuro, fontFamily: fonte.textoForte, marginTop: 8, textAlign: "center" }}
            >
              {novas === 1 ? "Uma nova estrela acendeu!" : `${novas} novas estrelas acenderam!`}
            </Texto>
          ) : null}
          {recompensa.bonusMapa > 0 ? (
            <Texto style={{ color: cor.lilasNoEscuro, fontSize: 13, marginTop: 4, textAlign: "center" }}>
              Mapa concluído! +{recompensa.bonusMapa} pontos de bônus.
            </Texto>
          ) : null}

          {/* pódio com festa em volta */}
          <View style={{ height: 186, width: "100%", alignItems: "center", justifyContent: "flex-end", marginTop: 4 }}>
            <View style={{ position: "absolute", top: -30, left: 0, right: 0, alignItems: "center" }}>
              <Raios lado={240} />
            </View>
            <View style={{ position: "absolute", top: 70, width: 1, height: 1, alignSelf: "center" }}>
              <Confete v={festa} />
            </View>
            <Podio estrelas={nota} humor={nota === 3 ? "rindo" : "feliz"} />
          </View>

          <Pop atraso={1500}>
            <View style={f.pontos}>
              <IconeRaio tamanho={16} cor={CEU} />
              <Texto style={{ fontFamily: fonte.tituloForte, fontSize: 18, color: CEU, lineHeight: 24 }}>
                +{pontos}
              </Texto>
              <Texto style={{ fontFamily: fonte.textoForte, fontSize: 14, color: CEU }}>pontos de luz</Texto>
              {recompensa.desafio ? (
                <View style={f.dobro}>
                  <Texto style={{ fontFamily: fonte.tituloForte, fontSize: 12, color: "#FFFFFF" }}>2×</Texto>
                </View>
              ) : null}
            </View>
          </Pop>
          {!completa || recompensa.completou ? (
            <View style={{ alignSelf: "stretch", gap: 6, marginTop: 14 }}>
              {!completa && recompensa.acesasDepois < totalEstrelas - 1 ? (
                <View style={f.trilho}>
                  <View style={[f.trilhoCheio, { width: `${(resto / PONTOS_POR_ESTRELA) * 100}%` }]} />
                </View>
              ) : null}
              <Texto style={{ color: "rgba(255,255,255,0.78)", fontSize: 13, textAlign: "center" }}>
                {progressoTexto}
              </Texto>
            </View>
          ) : null}
        </View>

        {/* resumo em quatro blocos coloridos */}
        <Pop atraso={1700}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Resumo
              tinta={cor.roxo}
              fundo={cor.roxoClaro}
              icone={<Alvo tamanho={18} cor={cor.roxo} />}
              valor={`${resultado.acertosDePrimeira}/${resultado.rodadas}`}
              rotulo="de primeira"
            />
            <Resumo
              tinta={cor.pessegoEscuro}
              fundo={cor.pessegoClaro}
              icone={<Tentativa tamanho={18} cor={cor.pessegoEscuro} />}
              valor={String(resultado.tentativas)}
              rotulo="tentativas"
            />
            <Resumo
              tinta={cor.azulEscuro}
              fundo={cor.azulClaro}
              icone={<Relogio tamanho={18} cor={cor.azulEscuro} />}
              valor={m > 0 ? `${m}:${String(sgs).padStart(2, "0")}` : `${sgs}s`}
              rotulo={m > 0 ? "minutos" : "de jogo"}
            />
            <Resumo
              tinta={cor.roxo}
              fundo={cor.lilasClaro}
              icone={<Lampada tamanho={18} cor={cor.roxo} />}
              valor={String(resultado.dicas ?? 0)}
              rotulo={(resultado.dicas ?? 0) === 1 ? "dica" : "dicas"}
            />
          </View>
        </Pop>
        {recompensa.completou ? (
          <Botao
            titulo="Ver constelação completa"
            variante="destaque"
            onPress={() => router.push({ pathname: "/constelacao/[id]", params: { id: c.id, celebrar: "1" } })}
          />
        ) : null}
      </ScrollView>

      {/* ações fixas no rodapé */}
      <View style={[f.rodape, { paddingBottom: Math.max(insetBaixo, 12) }]}>
        {seguinte ? (
          <Pressable
            onPress={() => abrirMissao(seguinte.id, { lateral: true })}
            accessibilityRole="button"
            accessibilityLabel={`Próxima missão: ${seguinte.titulo}`}
            style={({ pressed }) => [f.seguinte, pressed && { transform: [{ translateY: 2 }], borderBottomWidth: 2 }]}
          >
            <View style={[f.seguinteIcone, { backgroundColor: COR_MISSAO[seguinte.cor].claro }]}>
              <IconeMissao jogo={seguinte.jogo} tamanho={26} />
            </View>
            <View style={{ flex: 1 }}>
              <Texto style={{ fontSize: 12, color: cor.lilasNoEscuro }}>Próxima missão</Texto>
              <Titulo tamanho={17} style={{ color: "#FFFFFF" }}>
                {seguinte.titulo}
              </Titulo>
            </View>
            <Seta direcao="direita" cor="#FFFFFF" tamanho={20} />
          </Pressable>
        ) : null}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Botao titulo="Jogar de novo" variante="secundario" onPress={onDeNovo} style={{ flex: 1 }} />
          <Botao titulo="Voltar" variante={seguinte ? "secundario" : "primario"} onPress={voltar} style={{ flex: 1 }} />
        </View>
      </View>
    </View>
  );
}

/** Um bloco do resumo: ícone num círculo, número grande e o que ele conta. */
function Resumo({
  tinta,
  fundo,
  icone,
  valor,
  rotulo,
}: {
  tinta: string;
  fundo: string;
  icone: ReactNode;
  valor: string;
  rotulo: string;
}) {
  return (
    <View style={[f.bloco, { backgroundColor: fundo }]}>
      <View style={f.blocoIcone}>{icone}</View>
      <Texto style={{ fontFamily: fonte.tituloForte, fontSize: 20, lineHeight: 26, color: tinta }} numberOfLines={1}>
        {valor}
      </Texto>
      <Texto style={{ fontSize: 13, color: cor.texto }} numberOfLines={1}>
        {rotulo}
      </Texto>
    </View>
  );
}

const f = criarEstilos(() => ({
  ceu: {
    alignItems: "center",
    paddingTop: 18,
    paddingBottom: 18,
    paddingHorizontal: 12,
    borderRadius: raio.xg,
    backgroundColor: CEU,
    overflow: "hidden",
  },
  etiquetaCeu: {
    position: "absolute",
    left: 10,
    top: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(30,42,120,0.85)",
  },
  podioTopo: { width: 170, height: 10, borderRadius: 5, backgroundColor: "#C9B4FF", marginTop: -8 },
  podio: {
    width: 150,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: "#7B61FF",
  },
  pontos: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#FFAC7A",
  },
  dobro: { marginLeft: 2, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999, backgroundColor: CEU },
  trilho: { height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.18)", overflow: "hidden" },
  trilhoCheio: { height: "100%", borderRadius: 4, backgroundColor: "#FFAC7A" },
  bloco: { flex: 1, alignItems: "center", gap: 2, paddingVertical: 12, paddingHorizontal: 4, borderRadius: raio.g },
  blocoIcone: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginBottom: 4,
  },
  rodape: {
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: cor.borda,
    backgroundColor: cor.fundo,
  },
  seguinte: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: raio.g,
    backgroundColor: cor.roxo,
    borderBottomWidth: 4,
    borderBottomColor: cor.roxoEscuro,
  },
  seguinteIcone: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
}));
