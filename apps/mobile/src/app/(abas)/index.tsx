import { useConta } from "@/estado/conta";
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  PONTOS_POR_ESTRELA,
  desafioDoDia,
  missaoPorId,
  nivelAtual,
  nivelLiberado,
  proximaMissao,
  type Missao,
  type Nivel,
} from "@modolume/core";
import { useFalarAoAbrir } from "@/estado/acessibilidade";
import { hoje, useJogador } from "@/estado/jogador";
import { Avatar } from "@/componentes/Avatar";
import { Ceu } from "@/componentes/Ceu";
import { Cadeado, Check, IconeMissao, Seta } from "@/componentes/Icones";
import { Lilo } from "@/componentes/Lilo";
import { useAbrirMissao } from "@/componentes/Nuvens";
import { useMapa } from "@/componentes/gamificacao";
import { Botao, Texto, Titulo } from "@/componentes/ui";
import { cor, COR_MISSAO, criarEstilos, fonte } from "@/tema";
import { EsqueletoTela, useMontagemAdiada } from "@/componentes/Esqueleto";

/**
 * Início: o céu que o aluno está montando, a trilha do mapa atual (missões
 * ligadas como pontos), o Lilo contando a próxima missão num balão e o
 * desafio de hoje como um bilhete.
 */

const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const MESES = [
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

export default function Inicio() {
  const { conta, avisos, avaliacoes } = useConta();
  const insets = useSafeAreaInsets();
  const { jogador, progresso, preferencias, luzes, pronto } = useJogador();
  const montada = useMontagemAdiada();
  const sugerida = proximaMissao(progresso, preferencias.liberarTodos);
  useFalarAoAbrir(
    `Início. Oi, ${jogador?.nome ?? ""}. Você tem ${luzes} luzes.` +
      (sugerida ? ` Sua próxima missão é ${sugerida.titulo}.` : ""),
  );
  if (!pronto || !montada || !jogador) return <EsqueletoTela formato="inicio" />;

  const agora = new Date();
  const proxima = proximaMissao(progresso, preferencias.liberarTodos);
  const nivel = nivelAtual(progresso, preferencias.liberarTodos);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: cor.fundo }}
      contentContainerStyle={{ paddingTop: insets.top + 14, paddingHorizontal: 18, paddingBottom: 32 }}
    >
      <View style={e.topo}>
        <Pressable onPress={() => router.navigate("/perfil")} accessibilityLabel="Abrir perfil" hitSlop={8}>
          <Avatar id={jogador.avatar} rosto={jogador.rosto} tamanho={48} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Texto style={e.data}>
            {DIAS[agora.getDay()]}, {agora.getDate()} de {MESES[agora.getMonth()]}
          </Texto>
          <Titulo tamanho={24} style={{ lineHeight: 30 }}>
            Oi, {jogador.nome}.
          </Titulo>
        </View>
        <Pressable
          onPress={() => router.push("/loja")}
          accessibilityRole="button"
          accessibilityLabel={`${luzes} luzes. Abrir a loja`}
          hitSlop={6}
          style={({ pressed }) => [e.luzes, pressed && { opacity: 0.8 }]}
        >
          <Texto style={{ fontFamily: fonte.tituloForte, fontSize: 15, color: cor.pessegoEscuro, lineHeight: 20 }}>
            ✦
          </Texto>
          <Texto style={{ fontFamily: fonte.titulo, fontSize: 14, color: cor.tinta, lineHeight: 20 }}>{luzes}</Texto>
        </Pressable>
      </View>

      {conta ? (
        <View style={{ marginTop: 18, gap: 10 }}>
          <Botao
            titulo={`Seus avisos${avisos.some((a) => !a.lida) ? ` (${avisos.filter((a) => !a.lida).length} novos)` : ""}`}
            onPress={() => router.push("/avisos")}
          />
          {avaliacoes[0] ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push({ pathname: "/feedback/[id]", params: { id: avaliacoes[0]!.id } })}
              style={{ backgroundColor: cor.roxoClaro, borderRadius: 18, padding: 16, gap: 6 }}
            >
              <Titulo tamanho={17}>Seu professor deixou uma orientação</Titulo>
              <Texto numberOfLines={2}>{avaliacoes[0].feedback}</Texto>
              <Texto>Ler devolutiva →</Texto>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      <MeuCeu numero={nivel.numero} />

      <TrilhaDoMapa nivel={nivel} proxima={proxima?.id} />

      <ConversaLilo missao={proxima} />

      <Bilhete />
    </ScrollView>
  );
}

/** O céu do mapa atual, grande, com as estrelas como contador. */
function MeuCeu({ numero }: { numero: number }) {
  const { width } = useWindowDimensions();
  const { constelacao, acesas, total, completa, resto, esperaMapa } = useMapa(numero);
  const largura = Math.min(width, 560) - 36;
  const faltam = total - acesas;
  return (
    <Pressable
      onPress={() => router.push({ pathname: "/constelacao/[id]", params: { id: constelacao.id } })}
      style={({ pressed }) => [e.ceu, pressed && { opacity: 0.94 }]}
      accessibilityRole="button"
      accessibilityLabel={`Seu céu: ${constelacao.nome}, ${acesas} de ${total} estrelas`}
    >
      <Ceu constelacao={constelacao} acesas={acesas} largura={largura} altura={168} modo="vivo" raio={0} />
      <View style={e.ceuTexto}>
        <View style={{ flex: 1 }}>
          <Titulo tamanho={21} style={{ color: "#fff" }}>
            {constelacao.nome}
          </Titulo>
          <Texto style={{ color: "rgba(255,255,255,0.72)", fontSize: 13, marginTop: 2 }}>
            {completa
              ? "Você completou esta constelação."
              : esperaMapa
                ? "Falta 1 estrela. Ela acende quando você terminar todas as missões deste mapa."
                : faltam === 1
                  ? `Falta 1 estrela. Mais ${PONTOS_POR_ESTRELA - resto} pontos de luz e ela acende.`
                  : `Faltam ${faltam} estrelas. A próxima acende com mais ${PONTOS_POR_ESTRELA - resto} pontos.`}
          </Texto>
        </View>
        <View style={e.contador}>
          <Texto style={{ fontFamily: fonte.tituloForte, fontSize: 20, color: "#fff", lineHeight: 24 }}>{acesas}</Texto>
          <Texto style={{ fontSize: 11, color: cor.lilasNoEscuro, lineHeight: 13 }}>de {total}</Texto>
        </View>
      </View>
    </Pressable>
  );
}

/**
 * As missões do mapa atual como pontos numa linha: as feitas ficam roxas com
 * um visto, a próxima ganha um anel e as outras esperam. Tocar abre a missão.
 */
function TrilhaDoMapa({ nivel, proxima }: { nivel: Nivel; proxima?: string }) {
  const jogar = useAbrirMissao();
  const { progresso, preferencias } = useJogador();
  const liberado = nivelLiberado(nivel.numero, progresso, preferencias.liberarTodos);
  const feitas = nivel.missoes.filter((id) => progresso[id]).length;
  const n = nivel.missoes.length;
  return (
    <View style={e.secao}>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10 }}>
        <Titulo tamanho={19} style={{ flex: 1 }}>
          {nivel.titulo}
        </Titulo>
        <Pressable
          onPress={() => router.navigate("/niveis")}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Ver todos os mapas"
        >
          <Texto style={{ fontSize: 13, color: cor.textoSuave }}>
            {feitas} de {nivel.missoes.length} feitas
          </Texto>
        </Pressable>
      </View>

      <View style={e.trilha}>
        {/* fio entre pontos vizinhos: fica roxo quando os dois estão feitos */}
        {nivel.missoes.slice(1).map((id, i) => (
          <View
            key={`fio${id}`}
            style={[
              e.fio,
              { left: `${((i + 0.5) / n) * 100}%`, right: `${100 - ((i + 1.5) / n) * 100}%` },
              Boolean(progresso[nivel.missoes[i]!] && progresso[id]) && e.fioFeito,
            ]}
          />
        ))}
        {nivel.missoes.map((id) => {
          const m = missaoPorId(id)!;
          const feita = Boolean(progresso[id]);
          const agora = id === proxima;
          return (
            <Pressable
              key={id}
              onPress={() => liberado && jogar(id)}
              accessibilityRole="button"
              accessibilityLabel={`${m.titulo}${feita ? ", feita" : agora ? ", próxima" : ""}`}
              style={e.ponto}
            >
              <View style={[e.bola, feita && e.bolaFeita, agora && e.bolaAgora, !liberado && { opacity: 0.6 }]}>
                {feita ? (
                  <Check tamanho={18} />
                ) : !liberado ? (
                  <Cadeado tamanho={16} cor={cor.textoSuave} />
                ) : (
                  <IconeMissao jogo={m.jogo} tamanho={agora ? 30 : 24} />
                )}
              </View>
              <Texto
                style={[e.nomePonto, agora && { color: cor.tinta, fontFamily: fonte.textoForte }]}
                numberOfLines={2}
              >
                {m.titulo}
              </Texto>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** O Lilo conta a próxima missão num balão de fala, com o começo da história. */
function ConversaLilo({ missao }: { missao: Missao | null | undefined }) {
  const jogar = useAbrirMissao();
  if (!missao)
    return (
      <View style={[e.secao, e.conversa]}>
        <Lilo humor="orgulhoso" tamanho={64} />
        <View style={[e.balao, { flex: 1 }]}>
          <View style={e.rabo} />
          <Titulo tamanho={17}>Você fez todas as missões!</Titulo>
          <Texto style={{ fontSize: 14, color: cor.textoSuave }}>Jogue de novo para ganhar mais estrelas.</Texto>
        </View>
      </View>
    );
  const c = COR_MISSAO[missao.cor];
  const situacao = missao.rodadas[0]?.cenario;
  return (
    <View style={[e.secao, e.conversa]}>
      <Lilo humor="curioso" tamanho={64} />
      <View style={[e.balao, { flex: 1 }]}>
        <View style={e.rabo} />
        <Texto style={{ fontSize: 12, fontFamily: fonte.textoForte, color: c.texto }}>
          Próxima missão · {missao.conteudo}
        </Texto>
        <Titulo tamanho={19}>{missao.titulo}</Titulo>
        {situacao ? (
          <Texto style={{ fontSize: 14, lineHeight: 20, color: cor.texto, marginTop: 4 }}>{situacao}</Texto>
        ) : null}
        <Botao
          titulo="Começar"
          onPress={() => jogar(missao.id)}
          icone={<Seta direcao="direita" cor="#fff" tamanho={16} />}
          style={{ marginTop: 12 }}
        />
      </View>
    </View>
  );
}

/** Estrelinhas fixas do fundo do desafio: [x %, y %, tamanho]. */
const ESTRELAS_DESAFIO: [number, number, number][] = [
  [3, 8, 1.5],
  [62, 8, 1.5],
  [76, 18, 2.5],
  [90, 10, 1.5],
  [96, 34, 2],
  [88, 44, 1.5],
  [2, 92, 1.5],
  [30, 94, 2],
  [58, 92, 1.5],
];

/** Desafio de hoje: um pedacinho de céu noturno com a missão do dia e o selo de pontos em dobro. */
function Bilhete() {
  const jogar = useAbrirMissao();
  const { desafios } = useJogador();
  const dia = hoje();
  const missao = desafioDoDia(dia);
  const feito = Boolean(desafios[dia]);
  const horasRestantes = 24 - new Date().getHours();
  return (
    <Pressable
      onPress={() => jogar(missao.id)}
      style={({ pressed }) => [e.desafio, pressed && { opacity: 0.94 }]}
      accessibilityRole="button"
      accessibilityLabel={`Desafio de hoje: ${missao.titulo}. ${feito ? "Já feito" : "Pontos de luz em dobro"}`}
    >
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {ESTRELAS_DESAFIO.map(([x, y, t], i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: t * 2,
              height: t * 2,
              borderRadius: t,
              backgroundColor: i % 3 === 0 ? cor.lilas : "#FFFFFF",
              opacity: 0.35 + (i % 3) * 0.2,
            }}
          />
        ))}
        <Texto style={[e.brilho, { right: "30%", top: 6 }]}>✦</Texto>
        <Texto style={[e.brilho, { left: "40%", bottom: 4, fontSize: 10 }]}>✦</Texto>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={[e.selo, feito && { backgroundColor: cor.lilas }]}>
          {feito ? (
            <Check tamanho={18} cor={DESAFIO_FUNDO} />
          ) : (
            <Texto style={{ fontFamily: fonte.tituloForte, fontSize: 17, color: DESAFIO_FUNDO, lineHeight: 22 }}>
              2×
            </Texto>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Texto style={{ fontSize: 12, fontFamily: fonte.textoForte, color: cor.lilasNoEscuro }}>
            {feito ? "Desafio de hoje · feito" : `Desafio de hoje · termina em ${horasRestantes} h`}
          </Texto>
          <Titulo tamanho={19} style={{ color: "#FFFFFF" }}>
            {missao.titulo}
          </Titulo>
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
        <Texto style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", flex: 1 }}>
          {feito ? "Amanhã tem outro." : "Pontos de luz em dobro."}
        </Texto>
        <View style={[e.jogar, feito && { backgroundColor: "rgba(255,255,255,0.14)" }]}>
          <Texto style={{ fontFamily: fonte.titulo, fontSize: 14, color: feito ? "#FFFFFF" : DESAFIO_FUNDO }}>
            {feito ? "Jogar de novo" : "Jogar"}
          </Texto>
          <Seta direcao="direita" cor={feito ? "#FFFFFF" : DESAFIO_FUNDO} tamanho={14} />
        </View>
      </View>
    </Pressable>
  );
}

const DESAFIO_FUNDO = "#2A3488";

const e = criarEstilos(() => ({
  topo: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  luzes: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: cor.bordaForte,
    backgroundColor: cor.superficie,
  },
  data: { fontSize: 13, color: cor.textoSuave, fontFamily: fonte.textoMedio },
  secao: { marginTop: 24 },

  ceu: { borderRadius: 24, overflow: "hidden", backgroundColor: "#141B57" },
  ceuTexto: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 2,
  },
  contador: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    borderColor: "rgba(201,180,255,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },

  trilha: { flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
  fio: { position: "absolute", top: 27, height: 3, borderRadius: 2, backgroundColor: cor.trilho },
  fioFeito: { backgroundColor: cor.roxo },
  ponto: { flex: 1, alignItems: "center", gap: 6 },
  bola: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: cor.superficie,
    borderWidth: 2,
    borderColor: cor.borda,
  },
  bolaFeita: { backgroundColor: cor.roxo, borderColor: cor.roxo },
  bolaAgora: { borderColor: cor.roxo, borderWidth: 3, backgroundColor: cor.roxoClaro },
  nomePonto: { fontSize: 11, lineHeight: 14, color: cor.textoSuave, textAlign: "center", paddingHorizontal: 2 },

  conversa: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  balao: {
    padding: 16,
    borderRadius: 22,
    borderTopLeftRadius: 8,
    backgroundColor: cor.superficie,
    borderWidth: 1,
    borderColor: cor.borda,
  },
  rabo: {
    position: "absolute",
    left: -7,
    top: 18,
    width: 14,
    height: 14,
    backgroundColor: cor.superficie,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: cor.borda,
    transform: [{ rotate: "45deg" }],
  },

  desafio: { marginTop: 22, padding: 16, borderRadius: 22, backgroundColor: DESAFIO_FUNDO, overflow: "hidden" },
  selo: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: cor.pessego,
    borderWidth: 3,
    borderColor: "rgba(255,172,122,0.35)",
  },
  brilho: { position: "absolute", fontSize: 13, color: cor.pessegoNoEscuro, lineHeight: 16 },
  jogar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: cor.pessego,
  },
}));
