import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { calcularResultado, desafioDoDia, type Missao, type ResultadoJogada } from "@modolume/core";
import { voltar } from "@/lib/navegacao";
import { useAcessibilidade } from "@/estado/acessibilidade";
import { hoje, useJogador, type Recompensa } from "@/estado/jogador";
import { useConta } from "@/estado/conta";
import { AreaArraste } from "@/lib/arraste";
import { Lilo, type HumorLilo } from "./Lilo";
import { Fechar, IconeRaio, IconeSom, Lampada } from "./Icones";
import { Retorno } from "./Retorno";
import { FimDeMissao } from "./FimDeMissao";
import { Texto, Titulo } from "./ui";
import { JogoCubos } from "./jogos/cubos";
import { JogoSolidos } from "./jogos/solidos";
import { JogoBalanca } from "./jogos/balanca";
import { JogoReta } from "./jogos/reta";
import { JogoTorre } from "./jogos/torre";
import { JogoTrilha } from "./jogos/trilha";
import { JogoPares } from "./jogos/pares";
import { JogoPizza } from "./jogos/pizza";
import { JogoDinheiro } from "./jogos/dinheiro";
import { JogoPlanificacao } from "./jogos/planificacao";
import { JogoVolume } from "./jogos/volume";
import { JogoRepartir } from "./jogos/repartir";
import { JogoArea } from "./jogos/area";
import { JogoAngulo } from "./jogos/angulo";
import { JogoRelogio } from "./jogos/relogio";
import { JogoJarra } from "./jogos/jarra";
import { JogoGrafico } from "./jogos/grafico";
import { JogoSimetria } from "./jogos/simetria";
import { JogoCaminho } from "./jogos/caminho";
import { JogoPorcento } from "./jogos/porcento";
import { JogoPlano } from "./jogos/plano";
import { JogoMaquina } from "./jogos/maquina";
import { JogoSorteio } from "./jogos/sorteio";
import { JogoMedia } from "./jogos/media";
import { JogoExpressao } from "./jogos/expressao";
import { cor, criarEstilos, fonte, raio } from "@/tema";

type Status = "jogando" | "erro" | "acerto" | "fim";
/** Altura da linha de botões das atividades (botão + espaço acima e abaixo). */
const ALTURA_ACOES = 72;
const ELOGIOS = ["Isso mesmo!", "Mandou bem!", "Perfeito!", "Muito bem!", "Arrasou!", "Certinho!"];
const TENTE = ["Quase!", "Ainda não", "Vamos de novo?"];

export function Partida({
  missao,
  atividadeId,
  publicacaoId,
}: {
  missao: Missao;
  atividadeId?: string;
  publicacaoId?: string;
}) {
  const insets = useSafeAreaInsets();
  const { height: altura } = useWindowDimensions();
  const { vibrar, desafios } = useJogador();
  const { concluirMissao, iniciarAtividade } = useConta();
  const { falar, voz, animacoesReduzidas } = useAcessibilidade();
  const [indice, setIndice] = useState(0);
  const [erros, setErros] = useState<number[]>(() => missao.rodadas.map(() => 0));
  const [status, setStatus] = useState<Status>("jogando");
  const [mensagem, setMensagem] = useState("");
  const [tituloRetorno, setTituloRetorno] = useState("");
  const [rodadaJogo, setRodadaJogo] = useState(0);
  const [resultado, setResultado] = useState<ResultadoJogada | null>(null);
  const [recompensa, setRecompensa] = useState<Recompensa | null>(null);
  const [dicaAberta, setDicaAberta] = useState(false);
  const [fasesComDica, definirFasesComDica] = useState<number[]>([]);
  const inicio = useRef(0);
  const inicioFase = useRef(0);
  const tempos = useRef<number[]>([]);
  const concluindo = useRef(false);
  const [balanco] = useState(() => new Animated.Value(0));
  const [brilhoLampada] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (inicio.current) return;
    inicio.current = inicioFase.current = Date.now();
    if (atividadeId) void iniciarAtividade(atividadeId, publicacaoId).catch(() => {});
  }, [atividadeId, publicacaoId, iniciarAtividade]);

  const total = missao.rodadas.length;
  const ultima = indice === total - 1;
  const rodada = missao.rodadas[indice]!;
  const ehDesafio = desafioDoDia(hoje()).id === missao.id && !desafios[hoje()];
  const enunciado = `${rodada.cenario} ${rodada.instrucao ?? missao.instrucao}`;

  useEffect(() => {
    falar(`Fase ${indice + 1} de ${total}. ${enunciado}`);
  }, [indice, rodadaJogo]); // eslint-disable-line react-hooks/exhaustive-deps

  function onErro(msg?: string) {
    setErros((e) => e.map((v, i) => (i === indice ? v + 1 : v)));
    setTituloRetorno(TENTE[erros[indice]! % TENTE.length]!);
    setMensagem(msg ?? "Confira com calma e tente de novo.");
    setStatus("erro");
    vibrar("erro");
    falar(msg ?? "Ainda não. Tente de novo.");
    if (animacoesReduzidas) return;
    balanco.setValue(0);
    Animated.sequence(
      [8, -8, 5, -5, 0].map((v) => Animated.timing(balanco, { toValue: v, duration: 60, useNativeDriver: true })),
    ).start();
    // depois de um erro, a lâmpada pisca para lembrar que existe dica
    brilhoLampada.setValue(0);
    Animated.sequence([
      Animated.timing(brilhoLampada, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(brilhoLampada, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(brilhoLampada, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(brilhoLampada, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }

  function onAcerto(msg?: string) {
    tempos.current[indice] = (Date.now() - inicioFase.current) / 1000;
    const elogio = ELOGIOS[(indice + erros.reduce((a, b) => a + b, 0)) % ELOGIOS.length]!;
    falar(msg ? `${elogio} ${msg}` : elogio);
    setTituloRetorno(elogio);
    // o título já comemora: tira o "Isso!" do começo da explicação
    setMensagem((msg ?? "").replace(/^(Isso( mesmo)?|Achou|Perfeito)[!,.]\s*/i, ""));
    setStatus("acerto");
    vibrar("acerto");
  }

  // o aviso de erro some sozinho depois de alguns segundos
  useEffect(() => {
    if (status !== "erro") return;
    const t = setTimeout(() => setStatus((s) => (s === "erro" ? "jogando" : s)), 5000);
    return () => clearTimeout(t);
  }, [status, mensagem, erros]);

  function pedirDica() {
    if (!dicaAberta) {
      definirFasesComDica((fases) => (fases.includes(indice) ? fases : [...fases, indice]));
      falar(`Dica do Lilo: ${rodada.dica}`);
    }
    setDicaAberta((v) => !v);
    vibrar("toque");
  }

  async function continuar() {
    setDicaAberta(false);
    if (!ultima) {
      inicioFase.current = Date.now();
      setIndice((i) => i + 1);
      setStatus("jogando");
      setMensagem("");
      return;
    }
    if (concluindo.current) return;
    concluindo.current = true;
    const r = calcularResultado({
      missao,
      errosPorRodada: erros,
      tempoSegundos: (Date.now() - inicio.current) / 1000,
      dicas: fasesComDica.length,
      temposPorRodada: tempos.current,
      fasesComDica,
    });
    try {
      const premio = await concluirMissao(r, {
        publicacaoId,
        origem: atividadeId ? "professor" : "mapa",
        titulo: missao.titulo,
        atividadeId,
      });
      setRecompensa(premio);
      setResultado(r);
      setStatus("fim");
    } catch {
      // O provedor exibe a falha de armazenamento para esta sessão.
    }
  }

  function jogarDeNovo() {
    concluindo.current = false;
    setIndice(0);
    setErros(missao.rodadas.map(() => 0));
    setStatus("jogando");
    setMensagem("");
    setResultado(null);
    setRecompensa(null);
    definirFasesComDica([]);
    setDicaAberta(false);
    setRodadaJogo((n) => n + 1);
    tempos.current = [];
    inicio.current = inicioFase.current = Date.now();
  }

  const humor: HumorLilo = status === "erro" ? "pensativo" : status === "acerto" ? "animado" : "normal";
  const props = { onErro, onAcerto, bloqueado: status === "acerto", dica: dicaAberta };

  return (
    <View style={{ flex: 1, backgroundColor: cor.fundo, paddingTop: insets.top }}>
      <View style={pt.cabecalho}>
        <Pressable onPress={voltar} style={pt.fechar} hitSlop={8} accessibilityLabel="Sair da missão">
          <Fechar tamanho={20} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Titulo tamanho={18} numberOfLines={1}>
            {missao.titulo}
          </Titulo>
        </View>
        {ehDesafio && status !== "fim" ? (
          <View style={pt.selo2x}>
            <IconeRaio tamanho={12} />
            <Texto style={{ fontFamily: fonte.titulo, fontSize: 11, color: cor.pessegoEscuro }}>2×</Texto>
          </View>
        ) : null}
        {status !== "fim" ? (
          <Texto style={{ fontFamily: fonte.titulo, color: cor.textoSuave, fontSize: 13 }}>
            {indice + 1}/{total}
          </Texto>
        ) : null}
      </View>
      {status !== "fim" ? (
        <View style={pt.fases}>
          {missao.rodadas.map((_, i) => (
            <View
              key={i}
              style={[
                pt.fase,
                {
                  backgroundColor:
                    i < indice || (i === indice && status === "acerto")
                      ? cor.roxo
                      : i === indice
                        ? cor.lilas
                        : cor.trilho,
                },
              ]}
            />
          ))}
        </View>
      ) : null}

      {status === "fim" && resultado && recompensa ? (
        <FimDeMissao
          missao={missao}
          resultado={resultado}
          recompensa={recompensa}
          onDeNovo={jogarDeNovo}
          insetBaixo={insets.bottom}
        />
      ) : (
        <AreaArraste>
          {/* situação do dia a dia + lâmpada de dica; com a dica aberta, rola em vez de espremer o jogo */}
          <ScrollView
            style={[pt.situacao, { maxHeight: Math.round(altura * 0.4), flexGrow: 0 }]}
            contentContainerStyle={{ padding: 12 }}
            showsVerticalScrollIndicator={dicaAberta}
          >
            <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
              <View style={{ flex: 1 }}>
                <Texto style={{ fontSize: 19, lineHeight: 27, fontFamily: fonte.textoMedio, color: cor.tinta }}>
                  {rodada.cenario}
                </Texto>
                <Texto style={{ fontSize: 16, lineHeight: 22, color: cor.textoSuave, marginTop: 6 }}>
                  {rodada.instrucao ?? missao.instrucao}
                </Texto>
              </View>
              {voz ? (
                <Pressable
                  onPress={() => falar(enunciado)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Ouvir de novo"
                  style={pt.lampada}
                >
                  <IconeSom tamanho={22} />
                </Pressable>
              ) : null}
              <Pressable
                onPress={pedirDica}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={dicaAberta ? "Esconder dica" : "Pedir dica"}
                style={[pt.lampada, dicaAberta && { backgroundColor: cor.pessegoClaro, borderColor: cor.pessego }]}
              >
                <Animated.View
                  style={{
                    transform: [{ scale: brilhoLampada.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] }) }],
                  }}
                >
                  <Lampada acesa={dicaAberta} tamanho={24} />
                </Animated.View>
              </Pressable>
            </View>
            {dicaAberta ? (
              <View style={pt.dica}>
                <Lilo humor="ideia" tamanho={80} />
                <View style={pt.balaoDica}>
                  <View style={pt.raboDica} />
                  <Texto style={{ fontFamily: fonte.titulo, fontSize: 14, color: cor.pessegoEscuro }}>
                    O Lilo dá uma dica
                  </Texto>
                  <Texto style={{ fontSize: 17, lineHeight: 24, color: cor.tinta }}>{rodada.dica}</Texto>
                </View>
              </View>
            ) : null}
          </ScrollView>

          <Animated.View
            style={{ flex: 1, paddingHorizontal: 16, paddingBottom: 10, transform: [{ translateX: balanco }] }}
          >
            <Jogo key={`${rodadaJogo}-${indice}`} missao={missao} indice={indice} {...props} />
          </Animated.View>

          <View style={{ height: Math.max(insets.bottom, 12) }} />

          {/* retorno por cima do jogo, sem empurrar nada: o acerto fica no rodapé (o jogo
              já está travado) e o erro flutua acima dos botões, que continuam livres */}
          {status === "jogando" ? null : (
            <View
              pointerEvents="box-none"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: status === "acerto" ? 0 : Math.max(insets.bottom, 12) + ALTURA_ACOES,
              }}
            >
              <Retorno
                key={`${indice}-${status}-${mensagem}`}
                status={status === "acerto" ? "acerto" : "erro"}
                titulo={tituloRetorno}
                mensagem={mensagem}
                humor={humor}
                ultima={ultima}
                onContinuar={continuar}
                onFechar={() => setStatus("jogando")}
                insetBaixo={insets.bottom}
              />
            </View>
          )}
        </AreaArraste>
      )}
    </View>
  );
}

function Jogo({
  missao,
  indice,
  ...props
}: {
  missao: Missao;
  indice: number;
  onErro: (m?: string) => void;
  onAcerto: (m?: string) => void;
  bloqueado: boolean;
  dica: boolean;
}) {
  switch (missao.jogo) {
    case "cubos":
      return <JogoCubos rodada={missao.rodadas[indice]!} {...props} />;
    case "solidos":
      return <JogoSolidos rodada={missao.rodadas[indice]!} {...props} />;
    case "balanca":
      return <JogoBalanca rodada={missao.rodadas[indice]!} {...props} />;
    case "reta":
      return <JogoReta rodada={missao.rodadas[indice]!} {...props} />;
    case "torre":
      return <JogoTorre rodada={missao.rodadas[indice]!} {...props} />;
    case "trilha":
      return <JogoTrilha rodada={missao.rodadas[indice]!} {...props} />;
    case "pares":
      return <JogoPares rodada={missao.rodadas[indice]!} {...props} />;
    case "pizza":
      return <JogoPizza rodada={missao.rodadas[indice]!} {...props} />;
    case "dinheiro":
      return <JogoDinheiro rodada={missao.rodadas[indice]!} {...props} />;
    case "planificacao":
      return <JogoPlanificacao rodada={missao.rodadas[indice]!} {...props} />;
    case "volume":
      return <JogoVolume rodada={missao.rodadas[indice]!} {...props} />;
    case "repartir":
      return <JogoRepartir rodada={missao.rodadas[indice]!} {...props} />;
    case "area":
      return <JogoArea rodada={missao.rodadas[indice]!} {...props} />;
    case "angulo":
      return <JogoAngulo rodada={missao.rodadas[indice]!} {...props} />;
    case "relogio":
      return <JogoRelogio rodada={missao.rodadas[indice]!} {...props} />;
    case "jarra":
      return <JogoJarra rodada={missao.rodadas[indice]!} {...props} />;
    case "grafico":
      return <JogoGrafico rodada={missao.rodadas[indice]!} {...props} />;
    case "simetria":
      return <JogoSimetria rodada={missao.rodadas[indice]!} {...props} />;
    case "caminho":
      return <JogoCaminho rodada={missao.rodadas[indice]!} {...props} />;
    case "porcento":
      return <JogoPorcento rodada={missao.rodadas[indice]!} {...props} />;
    case "plano":
      return <JogoPlano rodada={missao.rodadas[indice]!} {...props} />;
    case "maquina":
      return <JogoMaquina rodada={missao.rodadas[indice]!} {...props} />;
    case "sorteio":
      return <JogoSorteio rodada={missao.rodadas[indice]!} {...props} />;
    case "media":
      return <JogoMedia rodada={missao.rodadas[indice]!} {...props} />;
    case "expressao":
      return <JogoExpressao rodada={missao.rodadas[indice]!} {...props} />;
  }
}

const pt = criarEstilos(() => ({
  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 8,
  },
  fechar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: cor.superficie,
    borderWidth: 1,
    borderColor: cor.borda,
  },
  selo2x: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: cor.pessegoClaro,
  },
  fases: { flexDirection: "row", gap: 4, paddingHorizontal: 16, marginBottom: 8 },
  fase: { flex: 1, height: 5, borderRadius: 3 },
  situacao: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: raio.g,
    backgroundColor: cor.superficie,
    borderWidth: 1,
    borderColor: cor.borda,
  },
  lampada: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: cor.suave,
    borderWidth: 1.5,
    borderColor: cor.borda,
  },
  dica: { marginTop: 10, flexDirection: "row", alignItems: "center", gap: 4 },
  balaoDica: { flex: 1, padding: 12, borderRadius: raio.m, backgroundColor: cor.pessegoClaro, gap: 2 },
  raboDica: {
    position: "absolute",
    left: -5,
    top: "50%",
    marginTop: -5,
    width: 10,
    height: 10,
    backgroundColor: cor.pessegoClaro,
    transform: [{ rotate: "45deg" }],
  },
}));
