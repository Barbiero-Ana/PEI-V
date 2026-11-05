import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Animated, Easing, Platform, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";
import {
  NIVEIS,
  constelacaoDoNivel,
  estrelasAcesas,
  mapaConcluido,
  missaoPorId,
  nivelAtual,
  nivelLiberado,
  proximaMissao,
  type Missao,
  type Nivel,
} from "@modolume/core";
import { useAcessibilidade, useFalarAoAbrir } from "@/estado/acessibilidade";
import { useJogador } from "@/estado/jogador";
import { CabecalhoTela, Estrelas } from "@/componentes/blocos";
import { Cadeado, Check, IconeMissao } from "@/componentes/Icones";
import { Nuvem, useAbrirMissao } from "@/componentes/Nuvens";
import { BarraProgresso, Texto, Titulo } from "@/componentes/ui";
import { Ceu } from "@/componentes/Ceu";
import { cor, criarEstilos, fonte, sombra } from "@/tema";
import { EsqueletoTela, useMontagemAdiada } from "@/componentes/Esqueleto";

/**
 * Níveis como uma viagem de barco por uma paisagem contínua. Um único rio
 * atravessa todos os mapas; cada mapa começa numa placa (que serve de
 * divisor), passa pelas missões (boias) e chega a uma ilhota com bandeira.
 */

const PASSO = 118; // distância vertical entre paradas
const BOIA = 64;
const PLACA_TOPO = 20;
const PLACA_FIM = 150; // base da placa do mapa
const NATIVO = Platform.OS !== "web";

const TERRA = "#B4DB9F";
const TERRA_CLARA = "#C6E5B4";
const TERRA_ESCURA = "#98CC82";
const AREIA = "#EBC584";
const AGUA = "#38A3E2";
const AGUA_CLARA = "#86CBF4";
const FOLHA = "#4FA34C";
const FOLHA_CLARA = "#A6D79A";
const PINHO = "#3A8752";
const TRONCO = "#B98F5A";
const MADEIRA = "#C99A62";

type Ponto = { x: number; y: number };

/** Curva com tangentes verticais entre dois pontos (o rio sempre "desce"). */
const trecho = (a: Ponto, b: Ponto) => {
  const m = (a.y + b.y) / 2;
  return ` C ${a.x} ${m}, ${b.x} ${m}, ${b.x} ${b.y}`;
};
const curva = (pts: Ponto[]) => pts.reduce((d, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : d + trecho(pts[i - 1]!, p)), "");

/** Ponto da curva entre a e b, com t de 0 a 1. */
function naCurva(a: Ponto, b: Ponto, t: number): Ponto {
  const m = (a.y + b.y) / 2;
  const u = 1 - t;
  return {
    x: u * u * u * a.x + 3 * u * u * t * a.x + 3 * u * t * t * b.x + t * t * t * b.x,
    y: u * u * u * a.y + 3 * u * u * t * m + 3 * u * t * t * m + t * t * t * b.y,
  };
}

/** Gerador pseudoaleatório fixo por mapa (a paisagem não muda a cada render). */
function sorteio(semente: number) {
  let s = semente * 7919 + 17;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function montar(n: number, w: number, ultimo: boolean) {
  const cx = w / 2;
  const xDe = (i: number) => w * (i % 2 === 0 ? 0.27 : 0.73);
  const inicio = PLACA_FIM + 100; // espaço para o barquinho entre a placa e a primeira parada
  const paradas = Array.from({ length: n }, (_, i) => ({ x: xDe(i), y: inicio + i * PASSO }));
  const chegada = { x: xDe(n), y: inicio + n * PASSO };
  const altura = chegada.y + (ultimo ? 96 : 104);
  const placa = { x: cx, y: (PLACA_TOPO + PLACA_FIM) / 2 };
  const pontos = [{ x: cx, y: 0 }, placa, ...paradas, chegada, ...(ultimo ? [] : [{ x: cx, y: altura }])];
  return { paradas, chegada, altura, placa, pontos };
}

export function NiveisTrilha() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const w = Math.min(width, 600);
  const { progresso, preferencias, pronto } = useJogador();
  const montada = useMontagemAdiada();
  const atual = nivelAtual(progresso, preferencias.liberarTodos).numero;
  const proxima = proximaMissao(progresso, preferencias.liberarTodos);
  useFalarAoAbrir(
    `Níveis. Você está no mapa ${atual}.` + (proxima ? ` O barquinho está indo para ${proxima.titulo}.` : ""),
  );
  if (!pronto || !montada) return <EsqueletoTela formato="niveis" />;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: cor.fundo }}
      contentContainerStyle={{ paddingTop: insets.top + 16, alignItems: "center" }}
    >
      <View style={{ alignSelf: "stretch", paddingHorizontal: 18 }}>
        <CabecalhoTela titulo="Níveis" />
      </View>
      {NIVEIS.map((nivel, i) => (
        <Trecho
          key={nivel.numero}
          nivel={nivel}
          w={w}
          primeiro={i === 0}
          ultimo={i === NIVEIS.length - 1}
          proxima={proxima?.id}
        />
      ))}
    </ScrollView>
  );
}

function Trecho({
  nivel,
  w,
  primeiro,
  ultimo,
  proxima,
}: {
  nivel: Nivel;
  w: number;
  primeiro: boolean;
  ultimo: boolean;
  proxima?: string;
}) {
  const abrir = useAbrirMissao();
  const { progresso, preferencias, pontosPorNivel } = useJogador();
  const liberado = nivelLiberado(nivel.numero, progresso, preferencias.liberarTodos);
  const missoes = nivel.missoes.map((id) => missaoPorId(id)!);
  const feitas = missoes.filter((m) => progresso[m.id]).length;
  const completo = feitas === missoes.length;
  const c = constelacaoDoNivel(nivel.numero);
  const L = useMemo(() => montar(missoes.length, w, ultimo), [missoes.length, w, ultimo]);

  // trecho já navegado: até a última missão feita em sequência
  let seguidas = 0;
  while (seguidas < missoes.length && progresso[missoes[seguidas]!.id]) seguidas += 1;
  const rastro = liberado && seguidas > 0 ? L.pontos.slice(0, 2 + seguidas + (completo ? (ultimo ? 1 : 2) : 0)) : null;

  // o barquinho navega no trecho que leva à próxima missão
  const ip = missoes.findIndex((m) => m.id === proxima);
  const barco =
    !liberado || ip < 0
      ? null
      : ip === 0
        ? naCurva(L.placa, L.paradas[0]!, 0.75)
        : naCurva(L.paradas[ip - 1]!, L.paradas[ip]!, 0.5);

  return (
    <View style={{ width: w, height: L.altura, backgroundColor: TERRA }}>
      <Svg width={w} height={L.altura} style={StyleSheet.absoluteFill}>
        <Paisagem nivel={nivel.numero} w={w} L={L} primeiro={primeiro} ultimo={ultimo} />
        {rastro ? (
          <Path
            d={curva(rastro)}
            stroke={cor.pessego}
            strokeWidth={3.5}
            strokeDasharray="9 8"
            fill="none"
            strokeLinecap="round"
          />
        ) : null}
        <Ilhota x={L.chegada.x} y={L.chegada.y} completo={completo} />
      </Svg>

      {missoes.map((m, i) => (
        <Parada
          key={m.id}
          missao={m}
          ponto={L.paradas[i]!}
          w={w}
          feita={Boolean(progresso[m.id])}
          estrelas={progresso[m.id]?.estrelas ?? 0}
          numero={i + 1}
          agora={m.id === proxima}
          liberado={liberado}
          onAbrir={() => abrir(m.id)}
        />
      ))}
      <RotuloChegada ponto={L.chegada} w={w} completo={completo} constelacao={c.nome} />
      {barco ? <Barquinho x={barco.x} y={barco.y} /> : null}

      {!liberado ? <Neblina w={w} numero={nivel.numero} /> : null}

      <Placa
        nivel={nivel}
        nome={c.nome}
        feitas={feitas}
        total={missoes.length}
        completo={completo}
        liberado={liberado}
        ceu={
          <Ceu
            constelacao={c}
            acesas={estrelasAcesas(pontosPorNivel[nivel.numero] ?? 0, c, mapaConcluido(nivel.numero, progresso))}
            largura={58}
            altura={58}
            raio={14}
          />
        }
        onPress={() => router.push({ pathname: "/constelacao/[id]", params: { id: c.id } })}
      />
    </View>
  );
}

function Paisagem({
  nivel,
  w,
  L,
  primeiro,
  ultimo,
}: {
  nivel: number;
  w: number;
  L: ReturnType<typeof montar>;
  primeiro: boolean;
  ultimo: boolean;
}) {
  const r = sorteio(nivel);
  const rio = curva(L.pontos);
  const linhas = [...L.paradas, L.chegada];

  // manchas de grama que quebram o fundo liso
  // (longe das bordas do trecho, para não aparecer corte na emenda entre mapas)
  const faixa = L.altura - 2 * 60;
  const manchas = Array.from({ length: 6 }, (_, i) => ({
    x: r() * w,
    y: 60 + (i + r()) * (faixa / 6),
    rx: 50 + r() * 70,
    ry: 20 + r() * 20,
    tom: i % 2 ? TERRA_CLARA : TERRA_ESCURA,
  }));

  // enfeites: ao lado de cada boia (no lado oposto à etiqueta) e entre as linhas
  const enfeites: { x: number; y: number; tipo: number }[] = [];
  linhas.forEach((p, i) => {
    const esquerda = p.x < w / 2;
    enfeites.push({
      x: esquerda ? Math.max(24, p.x - 76) : Math.min(w - 24, p.x + 76),
      y: p.y + 14,
      tipo: Math.floor(r() * 5),
    });
    const prox = linhas[i + 1] ?? (ultimo ? null : { x: w / 2, y: L.altura });
    if (prox) {
      const meio = (p.y + prox.y) / 2 + 4;
      enfeites.push({ x: w * 0.09, y: meio, tipo: 2 + Math.floor(r() * 3) });
      enfeites.push({ x: w * 0.91, y: meio + 10, tipo: 2 + Math.floor(r() * 3) });
    }
  });
  // um bosque entre a placa e a primeira parada
  enfeites.push({ x: 26, y: PLACA_FIM + 40, tipo: 1 }, { x: w - 26, y: PLACA_FIM + 34, tipo: 1 });

  // vitórias-régias na água, entre as boias
  const regias = linhas.slice(0, -1).map((p, i) => {
    const q = naCurva(p, linhas[i + 1]!, 0.28);
    return { x: q.x + (i % 2 ? 9 : -9), y: q.y, flor: i % 3 === 1 };
  });

  return (
    <G>
      {manchas.map((m, i) => (
        <Ellipse key={`m${i}`} cx={m.x} cy={m.y} rx={m.rx} ry={m.ry} fill={m.tom} />
      ))}

      <Path d={rio} stroke={AREIA} strokeWidth={58} fill="none" strokeLinecap="round" />
      <Path d={rio} stroke={AGUA} strokeWidth={40} fill="none" strokeLinecap="round" />
      <Path d={rio} stroke={AGUA_CLARA} strokeWidth={12} fill="none" strokeLinecap="round" strokeOpacity={0.75} />
      <Path
        d={rio}
        stroke="#FFFFFF"
        strokeWidth={2.4}
        strokeDasharray="7 24"
        fill="none"
        strokeLinecap="round"
        opacity={0.8}
      />

      {regias.map((g, i) => (
        <G key={`r${i}`}>
          <Path
            d={`M ${g.x} ${g.y} L ${g.x + 7} ${g.y - 2} A 7 7 0 1 1 ${g.x + 6} ${g.y + 4} Z`}
            fill={FOLHA}
            stroke="#5F9F5C"
            strokeWidth={0.8}
          />
          {g.flor ? <Circle cx={g.x - 1} cy={g.y - 1} r={2.6} fill="#FFB3C7" /> : null}
        </G>
      ))}

      {/* postes da placa do mapa */}
      {[46, w - 46].map((x) => (
        <G key={`p${x}`}>
          <Ellipse cx={x} cy={PLACA_FIM + 18} rx={10} ry={3.5} fill={TERRA_ESCURA} />
          <Rect x={x - 3.5} y={PLACA_FIM - 6} width={7} height={24} rx={2} fill={MADEIRA} />
        </G>
      ))}

      {enfeites.map((e, i) => (
        <Enfeite key={`e${i}`} {...e} />
      ))}

      {/* bordas onduladas no começo e no fim da trilha */}
      {primeiro ? (
        <Path
          d={`M 0 0 H ${w} V 12 C ${w * 0.82} 24, ${w * 0.66} 2, ${w * 0.46} 14 S ${w * 0.14} 22, 0 10 Z`}
          fill={cor.fundo}
        />
      ) : null}
      {ultimo ? (
        <Path
          d={`M 0 ${L.altura} H ${w} V ${L.altura - 12} C ${w * 0.8} ${L.altura - 24}, ${w * 0.6} ${L.altura - 2}, ${w * 0.4} ${L.altura - 14} S ${w * 0.12} ${L.altura - 20}, 0 ${L.altura - 8} Z`}
          fill={cor.fundo}
        />
      ) : null}
    </G>
  );
}

/** Enfeites da paisagem: 0 árvore, 1 pinheiro, 2 arbusto, 3 flores, 4 pedras. */
function Enfeite({ x, y, tipo }: { x: number; y: number; tipo: number }) {
  if (tipo === 0)
    return (
      <G>
        <Ellipse cx={x} cy={y + 14} rx={11} ry={3.5} fill={TERRA_ESCURA} />
        <Rect x={x - 2.5} y={y + 2} width={5} height={12} rx={2} fill={TRONCO} />
        <Circle cx={x} cy={y - 6} r={13} fill={FOLHA} />
        <Circle cx={x - 7} cy={y} r={8} fill={FOLHA} />
        <Circle cx={x + 7} cy={y - 1} r={8} fill={FOLHA} />
        <Circle cx={x - 4} cy={y - 10} r={4.5} fill={FOLHA_CLARA} />
      </G>
    );
  if (tipo === 1)
    return (
      <G>
        <Ellipse cx={x} cy={y + 16} rx={10} ry={3.5} fill={TERRA_ESCURA} />
        <Rect x={x - 2.5} y={y + 6} width={5} height={10} rx={2} fill={TRONCO} />
        <Path d={`M ${x} ${y - 22} L ${x + 11} ${y - 6} H ${x - 11} Z`} fill={PINHO} />
        <Path d={`M ${x} ${y - 14} L ${x + 14} ${y + 7} H ${x - 14} Z`} fill={PINHO} />
      </G>
    );
  if (tipo === 2)
    return (
      <G>
        <Circle cx={x - 7} cy={y + 2} r={7} fill={FOLHA} />
        <Circle cx={x + 7} cy={y + 2} r={7} fill={FOLHA} />
        <Circle cx={x} cy={y - 3} r={8.5} fill={FOLHA_CLARA} />
      </G>
    );
  if (tipo === 3) {
    const flores: [number, number, string][] = [
      [-8, 2, cor.pessego],
      [0, -4, "#FFFFFF"],
      [8, 3, cor.lilas],
    ];
    return (
      <G>
        {flores.map(([dx, dy, tom], i) => (
          <G key={i}>
            <Path
              d={`M ${x + dx} ${y + dy + 3} V ${y + 10}`}
              stroke="#6FAE6C"
              strokeWidth={1.4}
              strokeLinecap="round"
            />
            {[0, 90, 180, 270].map((g) => (
              <Circle
                key={g}
                cx={x + dx + 2.6 * Math.cos((g * Math.PI) / 180)}
                cy={y + dy + 2.6 * Math.sin((g * Math.PI) / 180)}
                r={2.3}
                fill={tom}
              />
            ))}
            <Circle cx={x + dx} cy={y + dy} r={1.5} fill="#F6C344" />
          </G>
        ))}
      </G>
    );
  }
  return (
    <G>
      <Ellipse cx={x - 4} cy={y + 3} rx={9} ry={6} fill="#C9C3D9" />
      <Ellipse cx={x + 6} cy={y + 5} rx={6} ry={4} fill="#B6B0C9" />
      <Ellipse cx={x - 6} cy={y + 1} rx={3} ry={1.6} fill="#FFFFFF" opacity={0.5} />
    </G>
  );
}

/** Ilhota de chegada com bandeira; completa, a bandeira fica pêssego e ganha um visto. */
function Ilhota({ x, y, completo }: { x: number; y: number; completo: boolean }) {
  const mastro = completo ? cor.tinta : "#6E7299";
  return (
    <G>
      <Ellipse cx={x} cy={y + 8} rx={54} ry={30} fill={AREIA} />
      <Ellipse cx={x} cy={y + 4} rx={44} ry={23} fill={FOLHA_CLARA} />
      <Circle cx={x - 28} cy={y + 2} r={6} fill={FOLHA} />
      <Circle cx={x + 30} cy={y + 6} r={5} fill={FOLHA} />
      <Rect x={x - 1.6} y={y - 34} width={3.2} height={48} rx={1.6} fill={mastro} />
      {[0, 1, 2].map((l) =>
        [0, 1, 2, 3, 4].map((k) => (
          <Rect
            key={`${l}${k}`}
            x={x + 1.6 + k * 5}
            y={y - 33 + l * 5}
            width={5}
            height={5}
            fill={(l + k) % 2 ? "#FFFFFF" : completo ? cor.pessegoEscuro : mastro}
          />
        )),
      )}
      {completo ? (
        <G>
          <Circle cx={x + 30} cy={y - 34} r={11} fill={cor.roxo} stroke="#FFFFFF" strokeWidth={2.5} />
          <Path
            d={`M ${x + 25} ${y - 34} l 3.5 3.5 l 6.5 -7`}
            stroke="#FFFFFF"
            strokeWidth={2.4}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>
      ) : null}
    </G>
  );
}

/** Placa de início do mapa: é o que separa um mapa do outro na trilha. */
function Placa({
  nivel,
  nome,
  feitas,
  total,
  completo,
  liberado,
  ceu,
  onPress,
}: {
  nivel: Nivel;
  nome: string;
  feitas: number;
  total: number;
  completo: boolean;
  liberado: boolean;
  ceu: ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Mapa ${nivel.numero}, ${nivel.titulo}. ${feitas} de ${total} missões. Ver constelação ${nome}`}
      style={({ pressed }) => [t.placa, pressed && { transform: [{ scale: 0.99 }] }]}
    >
      <View
        style={[t.numero, completo && { backgroundColor: cor.pessego }, !liberado && { backgroundColor: cor.suave }]}
      >
        {completo ? (
          <Check tamanho={22} />
        ) : !liberado ? (
          <Cadeado tamanho={20} cor={cor.textoSuave} />
        ) : (
          <Texto style={{ fontFamily: fonte.tituloForte, fontSize: 22, color: "#FFFFFF", lineHeight: 28 }}>
            {nivel.numero}
          </Texto>
        )}
      </View>
      <View style={{ flex: 1, gap: 1 }}>
        <Texto style={{ fontFamily: fonte.textoForte, fontSize: 12, color: liberado ? cor.roxo : cor.textoSuave }}>
          Mapa {nivel.numero} · {nome}
        </Texto>
        <Titulo tamanho={18} numberOfLines={1} style={!liberado ? { color: cor.textoSuave } : undefined}>
          {nivel.titulo}
        </Titulo>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 }}>
          <View style={{ flex: 1 }}>
            <BarraProgresso valor={(feitas / total) * 100} altura={6} cor={completo ? cor.pessego : cor.roxo} />
          </View>
          <Texto style={{ fontFamily: fonte.titulo, fontSize: 12, color: cor.tinta }}>
            {feitas}/{total}
          </Texto>
        </View>
      </View>
      {ceu}
    </Pressable>
  );
}

/** Neblina com nuvens sobre um mapa ainda fechado. */
function Neblina({ w, numero }: { w: number; numero: number }) {
  return (
    <View style={[t.neblina, { top: PLACA_FIM + 6 }]} pointerEvents="none">
      <View style={{ position: "absolute", left: -w * 0.2, top: 40 }}>
        <Nuvem largura={w * 0.75} />
      </View>
      <View style={{ position: "absolute", right: -w * 0.25, top: 220 }}>
        <Nuvem largura={w * 0.8} />
      </View>
      <View style={{ position: "absolute", left: -w * 0.1, top: 400 }}>
        <Nuvem largura={w * 0.7} />
      </View>
      <View style={t.trancado}>
        <Cadeado tamanho={16} cor={cor.tinta} />
        <Texto style={{ fontFamily: fonte.textoForte, fontSize: 13, color: cor.tinta }}>
          Conclua o mapa {numero - 1} para abrir este trecho
        </Texto>
      </View>
    </View>
  );
}

const ladoDe = (x: number, w: number) => (x < w / 2 ? "direita" : "esquerda");

function Parada({
  missao,
  ponto,
  w,
  feita,
  estrelas,
  numero,
  agora,
  liberado,
  onAbrir,
}: {
  missao: Missao;
  ponto: Ponto;
  w: number;
  feita: boolean;
  estrelas: number;
  numero: number;
  agora: boolean;
  liberado: boolean;
  onAbrir: () => void;
}) {
  const { x, y } = ponto;
  return (
    <>
      {agora ? <Halo x={x} y={y} /> : null}
      {/* píer redondo: topo na cor da missão e uma borda mais escura embaixo, que dá volume */}
      <Pressable
        onPress={onAbrir}
        disabled={!liberado}
        accessibilityRole="button"
        accessibilityLabel={`Fase ${numero}: ${missao.titulo}${feita ? `, feita com ${estrelas} estrelas` : agora ? ", próxima missão" : ""}`}
        style={({ pressed }) => [
          t.pier,
          { left: x - BOIA / 2, top: y - BOIA / 2 },
          pressed && { transform: [{ translateY: 3 }] },
        ]}
      >
        {({ pressed }) => {
          const topo = !liberado ? "#C9C5DB" : feita ? cor.roxo : TOPO_MISSAO[missao.cor];
          const lado = !liberado ? "#A29DB9" : feita ? "#4A31C9" : SOMBRA_MISSAO[missao.cor];
          return (
            <>
              <View style={[t.pierLado, { backgroundColor: lado }]} />
              <View style={[t.pierTopo, { backgroundColor: topo, top: pressed ? 3 : 0 }]}>
                <View style={[t.pierMiolo, feita && { backgroundColor: "rgba(255,255,255,0.18)" }]}>
                  {!liberado ? (
                    <Cadeado tamanho={20} cor={cor.textoSuave} />
                  ) : feita ? (
                    <Check tamanho={26} />
                  ) : (
                    <IconeMissao jogo={missao.jogo} tamanho={30} />
                  )}
                </View>
              </View>
              <View style={[t.numeroFase, { borderColor: topo }]}>
                <Texto style={{ fontFamily: fonte.tituloForte, fontSize: 12, lineHeight: 15, color: cor.tinta }}>
                  {numero}
                </Texto>
              </View>
            </>
          );
        }}
      </Pressable>
      <Etiqueta ponto={ponto} w={w} destaque={agora}>
        <Texto style={{ fontFamily: fonte.titulo, fontSize: 16, color: cor.tinta }} numberOfLines={2}>
          {missao.titulo}
        </Texto>
        {feita ? (
          <Estrelas n={estrelas} tamanho={16} />
        ) : agora ? (
          <Texto style={{ fontSize: 14, color: cor.roxo, fontFamily: fonte.textoForte }}>Próxima parada</Texto>
        ) : (
          <Texto style={{ fontSize: 14, color: cor.textoSuave }}>{missao.rodadas.length} fases</Texto>
        )}
      </Etiqueta>
    </>
  );
}

function RotuloChegada({
  ponto,
  w,
  completo,
  constelacao,
}: {
  ponto: Ponto;
  w: number;
  completo: boolean;
  constelacao: string;
}) {
  return (
    <Etiqueta ponto={ponto} w={w} folgaExtra={18}>
      <Texto style={{ fontFamily: fonte.titulo, fontSize: 16, color: completo ? cor.pessegoEscuro : cor.tinta }}>
        {completo ? "Chegada!" : "Chegada"}
      </Texto>
      <Texto style={{ fontSize: 14, color: cor.textoSuave }}>
        {completo ? `${constelacao} completa` : `Termine o mapa para completar ${constelacao}`}
      </Texto>
    </Etiqueta>
  );
}

/** Etiqueta branca ao lado da boia, com uma pontinha apontando para ela. */
function Etiqueta({
  ponto,
  w,
  destaque = false,
  folgaExtra = 0,
  children,
}: {
  ponto: Ponto;
  w: number;
  destaque?: boolean;
  folgaExtra?: number;
  children: ReactNode;
}) {
  const lado = ladoDe(ponto.x, w);
  const folga = BOIA / 2 + 14 + folgaExtra;
  return (
    <View
      pointerEvents="none"
      style={[
        t.etiqueta,
        { top: ponto.y - 30 },
        lado === "direita"
          ? { left: ponto.x + folga, maxWidth: w - ponto.x - folga - 14 }
          : { right: w - ponto.x + folga, maxWidth: ponto.x - folga - 14, alignItems: "flex-end" },
        destaque && { borderColor: cor.roxo },
      ]}
    >
      <View
        style={[
          t.ponta,
          lado === "direita"
            ? { left: -7, borderLeftWidth: 1.5, borderBottomWidth: 1.5 }
            : { right: -7, borderRightWidth: 1.5, borderTopWidth: 1.5 },
          destaque && { borderColor: cor.roxo },
        ]}
      />
      {children}
    </View>
  );
}

/** Anel que pulsa devagar em volta da próxima missão. */
function Halo({ x, y }: { x: number; y: number }) {
  const { animacoesReduzidas } = useAcessibilidade();
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (animacoesReduzidas) return;
    const l = Animated.loop(
      Animated.timing(v, { toValue: 1, duration: 1800, easing: Easing.out(Easing.quad), useNativeDriver: NATIVO }),
    );
    l.start();
    return () => l.stop();
  }, [v, animacoesReduzidas]);
  const d = BOIA + 18;
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: x - d / 2,
        top: y - d / 2,
        width: d,
        height: d,
        borderRadius: d / 2,
        borderWidth: 3,
        borderColor: cor.roxo,
        opacity: animacoesReduzidas ? 0.35 : v.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
        transform: [
          { scale: animacoesReduzidas ? 1 : v.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.28] }) },
        ],
      }}
    />
  );
}

/** Barquinho a vela navegando: sobe, desce e balança com a água. */
function Barquinho({ x, y }: { x: number; y: number }) {
  const { animacoesReduzidas } = useAcessibilidade();
  const [balanco] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (animacoesReduzidas) return;
    const l = Animated.loop(
      Animated.sequence([
        Animated.timing(balanco, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: NATIVO,
        }),
        Animated.timing(balanco, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: NATIVO,
        }),
      ]),
    );
    l.start();
    return () => l.stop();
  }, [balanco, animacoesReduzidas]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: x - 24,
        top: y - 40,
        transform: [
          { translateY: balanco.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) },
          { rotate: balanco.interpolate({ inputRange: [0, 1], outputRange: ["-5deg", "5deg"] }) },
        ],
      }}
    >
      <Svg width={48} height={54} viewBox="0 0 48 54">
        <Ellipse cx={24} cy={49} rx={20} ry={3.5} fill="#FFFFFF" opacity={0.6} />
        <Path d="M24 3 L24 33 L7 33 Z" fill="#FFFFFF" stroke={cor.tinta} strokeWidth={1.8} strokeLinejoin="round" />
        <Path
          d="M26.5 9 L26.5 33 L40 33 Z"
          fill={cor.lilas}
          stroke={cor.tinta}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <Rect x={23} y={1} width={3} height={34} rx={1.5} fill={cor.tinta} />
        <Path d="M26 1 L33 4 L26 7 Z" fill={cor.pessegoEscuro} />
        <Path
          d="M4 35 H44 L38 46 Q37 48 34 48 H14 Q11 48 10 46 Z"
          fill={cor.pessego}
          stroke={cor.tinta}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <Circle cx={18} cy={41} r={1.8} fill="#FFFFFF" />
        <Circle cx={24} cy={41} r={1.8} fill="#FFFFFF" />
        <Circle cx={30} cy={41} r={1.8} fill="#FFFFFF" />
      </Svg>
    </Animated.View>
  );
}

/** Tom mais escuro de cada cor de missão, para a lateral do píer. */
/** Topo do píer: os tons da marca um pouco mais fortes, para destacar sobre o verde. */
const TOPO_MISSAO: Record<Missao["cor"], string> = {
  roxo: "#7B61FF",
  pessego: "#FF9A5E",
  azul: "#6CC1F5",
  lilas: "#B39BFF",
};

const SOMBRA_MISSAO: Record<Missao["cor"], string> = {
  roxo: "#4A31C9",
  pessego: "#C9612E",
  azul: "#2F8FCF",
  lilas: "#7D62E0",
};

const t = criarEstilos(() => ({
  pier: { position: "absolute", width: BOIA, height: BOIA + 7 },
  pierLado: { position: "absolute", left: 0, top: 7, width: BOIA, height: BOIA, borderRadius: BOIA / 2 },
  pierTopo: {
    position: "absolute",
    left: 0,
    width: BOIA,
    height: BOIA,
    borderRadius: BOIA / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  pierMiolo: {
    width: BOIA - 18,
    height: BOIA - 18,
    borderRadius: (BOIA - 18) / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  numeroFase: {
    position: "absolute",
    right: -4,
    top: -4,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 4,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
  },
  placa: {
    position: "absolute",
    left: 16,
    right: 16,
    top: PLACA_TOPO,
    height: PLACA_FIM - PLACA_TOPO,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    borderRadius: 24,
    backgroundColor: cor.superficie,
    borderWidth: 1,
    borderColor: cor.borda,
    ...sombra,
  },
  numero: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: cor.roxo,
    transform: [{ rotate: "-4deg" }],
  },
  etiqueta: {
    position: "absolute",
    minHeight: 64,
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: cor.superficie,
    borderWidth: 2,
    borderColor: "rgba(30,42,120,0.16)",
    shadowColor: "#1E2A78",
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  ponta: {
    position: "absolute",
    top: 24,
    width: 12,
    height: 12,
    backgroundColor: cor.superficie,
    borderColor: "#FFFFFF",
    transform: [{ rotate: "45deg" }],
  },
  neblina: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
    backgroundColor: "rgba(244,243,251,0.82)",
  },
  trancado: {
    position: "absolute",
    left: 20,
    right: 20,
    top: 120,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: cor.borda,
  },
}));
