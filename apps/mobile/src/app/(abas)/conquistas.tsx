import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Ellipse, G, Line, Path, Polygon, Rect, Text as SvgText } from "react-native-svg";
import {
  CONSTELACOES,
  MISSOES,
  NIVEIS,
  analisarAprendizagem,
  missaoPorId,
  type AnaliseAprendizagem,
} from "@modolume/core";
import { useFalarAoAbrir } from "@/estado/acessibilidade";
import { useJogador, useResumo } from "@/estado/jogador";
import { CabecalhoTela } from "@/componentes/blocos";
import { CalendarioDeLuz } from "@/componentes/gamificacao";
import { Check, IconeMissao, Seta } from "@/componentes/Icones";
import { useAbrirMissao } from "@/componentes/Nuvens";
import { Lilo } from "@/componentes/Lilo";
import { BarraProgresso, Texto, Titulo } from "@/componentes/ui";
import { cor, COR_MISSAO, criarEstilos, fonte, porTema, raio } from "@/tema";
import { EsqueletoTela, useMontagemAdiada } from "@/componentes/Esqueleto";

/**
 * Conquistas: um resumo com a próxima meta, as medalhas agrupadas por tema
 * (cada uma mostra quanto falta) e, abaixo, dias de luz e o seu jeito de aprender.
 */

type Simbolo = "luz" | "perfeito" | "mapa" | "constelacao" | "ceu" | "estrelas" | "missoes" | "semana";

interface Marco {
  nome: string;
  desc: string;
  atual: number;
  meta: number;
  simbolo: Simbolo;
}

/** Desenho do centro de cada medalha (caixa de 24, centrada em 0,0). */
function Glifo({ tipo, tinta }: { tipo: Simbolo; tinta: string }) {
  const traco = {
    stroke: tinta,
    strokeWidth: 2.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };
  const estrela = (x: number, y: number, r: number) =>
    `M ${x} ${y - r} L ${x + r * 0.3} ${y - r * 0.3} L ${x + r} ${y - r * 0.2} L ${x + r * 0.45} ${y + r * 0.25} L ${x + r * 0.6} ${y + r} L ${x} ${y + r * 0.6} L ${x - r * 0.6} ${y + r} L ${x - r * 0.45} ${y + r * 0.25} L ${x - r} ${y - r * 0.2} L ${x - r * 0.3} ${y - r * 0.3} Z`;
  switch (tipo) {
    case "luz":
      return (
        <G>
          <Circle cx={0} cy={0} r={5} fill={tinta} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((g) => {
            const a = (g * Math.PI) / 180;
            return (
              <Line
                key={g}
                x1={Math.cos(a) * 8}
                y1={Math.sin(a) * 8}
                x2={Math.cos(a) * 11}
                y2={Math.sin(a) * 11}
                {...traco}
              />
            );
          })}
        </G>
      );
    case "perfeito":
      return (
        <G>
          <Path d={estrela(-8, 3, 5)} fill={tinta} />
          <Path d={estrela(0, -4, 6.5)} fill={tinta} />
          <Path d={estrela(8, 3, 5)} fill={tinta} />
        </G>
      );
    case "mapa":
      return (
        <G>
          <Path d="M -10 -7 L -3.5 -9.5 L 3.5 -7 L 10 -9.5 V 7 L 3.5 9.5 L -3.5 7 L -10 9.5 Z" {...traco} />
          <Path d="M -3.5 -9.5 V 7 M 3.5 -7 V 9.5" {...traco} strokeWidth={1.6} />
        </G>
      );
    case "constelacao":
      return (
        <G>
          <Path d="M -9 6 L -3 -4 L 5 1 L 9 -8" {...traco} strokeWidth={1.8} />
          {[
            [-9, 6],
            [-3, -4],
            [5, 1],
            [9, -8],
          ].map(([x, y], i) => (
            <Circle key={i} cx={x} cy={y} r={2.8} fill={tinta} />
          ))}
        </G>
      );
    case "ceu":
      return (
        <G>
          <Path d="M 2 -9 A 9 9 0 1 0 9 4 A 7 7 0 1 1 2 -9 Z" fill={tinta} />
          <Path d={estrela(7, -6, 3.5)} fill={tinta} />
        </G>
      );
    case "estrelas":
      return (
        <G>
          <Path d={estrela(0, 1, 10)} fill={tinta} />
        </G>
      );
    case "missoes":
      return (
        <G>
          <Path d="M -6 10 V -10" {...traco} />
          <Path d="M -6 -9 H 8 L 5 -4 L 8 1 H -6 Z" fill={tinta} />
        </G>
      );
    case "semana":
      return (
        <G>
          <Rect x={-9} y={-7} width={18} height={16} rx={3} {...traco} />
          <Path d="M -9 -2 H 9 M -4 -10 V -5 M 4 -10 V -5" {...traco} />
          <Path d={estrela(0, 4, 3.2)} fill={tinta} />
        </G>
      );
  }
}

/**
 * Medalha de verdade: fita, aro e disco com o símbolo. Conquistada, fica
 * colorida e com brilho; ainda não, fica clara com um anel de progresso.
 */
function Medalha({ marco, tom, tamanho = 72 }: { marco: Marco; tom: string; tamanho?: number }) {
  const ok = marco.atual >= marco.meta;
  const fracao = Math.min(1, marco.atual / marco.meta);
  const R = 27;
  const volta = 2 * Math.PI * R;
  return (
    <Svg width={tamanho} height={tamanho * 1.18} viewBox="0 0 72 85">
      {/* fita */}
      <Path d="M 24 50 L 18 82 L 26 77 L 31 84 L 34 54 Z" fill={ok ? cor.pessego : cor.borda} />
      <Path d="M 48 50 L 54 82 L 46 77 L 41 84 L 38 54 Z" fill={ok ? cor.roxo : cor.borda} />
      {/* aro com anel de progresso */}
      <Circle cx={36} cy={33} r={R} fill={ok ? tom : cor.superficie} stroke={ok ? tom : cor.borda} strokeWidth={5} />
      {!ok && fracao > 0 ? (
        <Circle
          cx={36}
          cy={33}
          r={R}
          fill="none"
          stroke={tom}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={`${volta * fracao} ${volta}`}
          transform="rotate(-90 36 33)"
        />
      ) : null}
      <Circle
        cx={36}
        cy={33}
        r={21}
        fill={ok ? tom : cor.suave}
        stroke={ok ? "#FFFFFF" : "none"}
        strokeOpacity={0.4}
        strokeWidth={1.5}
      />
      {ok ? (
        <Ellipse cx={28} cy={22} rx={7} ry={4} fill="#FFFFFF" opacity={0.25} transform="rotate(-30 28 22)" />
      ) : null}
      <G transform="translate(36 33)">
        <Glifo tipo={marco.simbolo} tinta={ok ? "#FFFFFF" : cor.inativo} />
      </G>
    </Svg>
  );
}

/** Uma estante por tema: as medalhas ficam lado a lado; tocar mostra os detalhes. */
function Estante({ titulo, tom, marcos }: { titulo: string; tom: string; marcos: Marco[] }) {
  const ganhas = marcos.filter((m) => m.atual >= m.meta).length;
  // começa mostrando a primeira ainda não conquistada (ou a primeira)
  const [aberta, setAberta] = useState(() =>
    Math.max(
      0,
      marcos.findIndex((m) => m.atual < m.meta),
    ),
  );
  const sel = marcos[aberta]!;
  const ok = sel.atual >= sel.meta;
  return (
    <View style={c.secao}>
      <View style={c.secaoTopo}>
        <Titulo tamanho={17}>{titulo}</Titulo>
        <Texto style={{ fontSize: 13, color: cor.textoSuave }}>
          {ganhas} de {marcos.length}
        </Texto>
      </View>
      <View style={c.estante}>
        <View style={c.medalhas}>
          {marcos.map((m, i) => (
            <Pressable
              key={m.nome}
              onPress={() => setAberta(i)}
              accessibilityRole="button"
              accessibilityState={{ selected: i === aberta }}
              accessibilityLabel={`${m.nome}${m.atual >= m.meta ? ", conquistada" : `, ${m.atual} de ${m.meta}`}`}
              style={({ pressed }) => [c.vaga, pressed && { transform: [{ scale: 0.95 }] }]}
            >
              <Medalha marco={m} tom={tom} />
              <Texto
                style={[
                  c.nomeMedalha,
                  { color: m.atual >= m.meta ? cor.tinta : cor.textoSuave },
                  i === aberta && { fontFamily: fonte.titulo, color: cor.tinta },
                ]}
                numberOfLines={2}
              >
                {m.nome}
              </Texto>
            </Pressable>
          ))}
        </View>
        <View style={c.prateleira} />
        {/* detalhes da medalha escolhida */}
        <View style={[c.detalhe, { borderColor: ok ? tom : cor.borda }]}>
          <View style={{ flex: 1, gap: 2 }}>
            <Texto style={{ fontFamily: fonte.titulo, fontSize: 15, color: cor.tinta }}>{sel.nome}</Texto>
            <Texto style={{ fontSize: 13, color: cor.textoSuave }}>{sel.desc}</Texto>
            {!ok && sel.meta > 1 ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 }}>
                <View style={{ flex: 1 }}>
                  <BarraProgresso valor={(sel.atual / sel.meta) * 100} altura={6} cor={tom} />
                </View>
                <Texto style={{ fontSize: 12, color: cor.textoSuave, fontFamily: fonte.textoForte }}>
                  {sel.atual}/{sel.meta}
                </Texto>
              </View>
            ) : null}
          </View>
          {ok ? (
            <View style={[c.check, { backgroundColor: tom }]}>
              <Check tamanho={13} />
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export default function Conquistas() {
  const insets = useSafeAreaInsets();
  const { progresso, resultados, pronto } = useJogador();
  const montada = useMontagemAdiada();
  const resumo = useResumo();
  useFalarAoAbrir(`Conquistas. ${resumo.concluidas} missões jogadas e ${resumo.estrelas} estrelas ganhas.`);

  const feitasNoMapa = (n: number) => NIVEIS.find((x) => x.numero === n)!.missoes.filter((id) => progresso[id]).length;
  const totalNoMapa = (n: number) => NIVEIS.find((x) => x.numero === n)!.missoes.length;

  const grupos: { titulo: string; tom: string; marcos: Marco[] }[] = [
    {
      titulo: "Primeiros passos",
      tom: cor.roxo,
      marcos: [
        { nome: "Primeira luz", simbolo: "luz", desc: "Concluir uma missão", atual: resumo.concluidas, meta: 1 },
        {
          nome: "Sem tropeços",
          simbolo: "perfeito",
          desc: "Ganhar 3 estrelas numa missão",
          atual: resumo.perfeitas,
          meta: 1,
        },
      ],
    },
    {
      titulo: "Mapas e constelações",
      tom: cor.azulEscuro,
      marcos: [
        {
          nome: "Mapa 1 completo",
          simbolo: "mapa",
          desc: "Todas as missões de Primeiros passos",
          atual: feitasNoMapa(1),
          meta: totalNoMapa(1),
        },
        {
          nome: "Mapa 2 completo",
          simbolo: "mapa",
          desc: "Todas as missões de No dia a dia",
          atual: feitasNoMapa(2),
          meta: totalNoMapa(2),
        },
        {
          nome: "Primeira constelação",
          simbolo: "constelacao",
          desc: "Acender todas as estrelas de um mapa",
          atual: resumo.constelacoes,
          meta: 1,
        },
        {
          nome: "Céu completo",
          simbolo: "ceu",
          desc: `Montar as ${CONSTELACOES.length} constelações`,
          atual: resumo.constelacoes,
          meta: CONSTELACOES.length,
        },
      ],
    },
    {
      titulo: "Constância",
      tom: cor.pessegoEscuro,
      marcos: [
        { nome: "Dez estrelas", simbolo: "estrelas", desc: "Juntar 10 estrelas", atual: resumo.estrelas, meta: 10 },
        {
          nome: "Todas as missões",
          simbolo: "missoes",
          desc: `Jogar as ${MISSOES.length} missões`,
          atual: resumo.concluidas,
          meta: MISSOES.length,
        },
        {
          nome: "Uma semana de luz",
          simbolo: "semana",
          desc: "Jogar em 7 dias diferentes",
          atual: resumo.dias,
          meta: 7,
        },
      ],
    },
  ];

  const todos = grupos.flatMap((g) => g.marcos);
  const ganhos = todos.filter((m) => m.atual >= m.meta).length;
  // próxima meta: a não conquistada mais perto de terminar
  const proxima = todos.filter((m) => m.atual < m.meta).sort((a, b) => b.atual / b.meta - a.atual / a.meta)[0];

  const analise = analisarAprendizagem(resultados);
  if (!pronto || !montada) return <EsqueletoTela formato="lista" />;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: cor.fundo }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 18, paddingBottom: 32 }}
    >
      <CabecalhoTela titulo="Conquistas" />

      <View style={c.resumo}>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
          <Texto style={{ fontFamily: fonte.tituloForte, fontSize: 34, color: "#FFFFFF", lineHeight: 40 }}>
            {ganhos}
          </Texto>
          <Texto style={{ fontFamily: fonte.titulo, fontSize: 16, color: cor.lilasNoEscuro }}>
            de {todos.length} medalhas
          </Texto>
        </View>
        <View style={c.segmentos}>
          {todos.map((m, i) => (
            <View key={i} style={[c.segmento, m.atual >= m.meta && { backgroundColor: cor.pessego }]} />
          ))}
        </View>
        {proxima ? (
          <Texto style={{ color: "rgba(255,255,255,0.78)", fontSize: 13, marginTop: 10 }}>
            Mais perto:{" "}
            <Texto style={{ color: "#FFFFFF", fontFamily: fonte.textoForte, fontSize: 13 }}>{proxima.nome}</Texto>,
            faltam {proxima.meta - proxima.atual}.
          </Texto>
        ) : (
          <Texto style={{ color: "#FFFFFF", fontSize: 13, marginTop: 10 }}>Você ganhou todas as medalhas!</Texto>
        )}
      </View>

      {grupos.map((g) => (
        <Estante key={g.titulo} titulo={g.titulo} tom={g.tom} marcos={g.marcos} />
      ))}

      <View style={c.secao}>
        <View style={c.secaoTopo}>
          <Titulo tamanho={17}>Dias de luz</Titulo>
        </View>
        <Texto style={{ fontSize: 13, color: cor.textoSuave, marginBottom: 10, marginTop: -4 }}>
          Cada dia em que você joga vira uma estrela. Pular um dia não apaga nada.
        </Texto>
        <CalendarioDeLuz />
      </View>

      <View style={c.secao}>
        <View style={c.secaoTopo}>
          <Titulo tamanho={17}>Seus jeitos de aprender</Titulo>
        </View>
        <Texto style={{ fontSize: 13, color: cor.textoSuave, marginBottom: 10, marginTop: -4 }}>
          Como você vai em cada tipo de atividade.
        </Texto>
        <JeitosDeAprender analise={analise} />
      </View>
    </ScrollView>
  );
}

/** Nomes curtos dos tipos de atividade. */
const CURTO: Record<string, string> = {
  "associacao-visual": "Associar",
  montagem: "Montar",
  sequencia: "Ordenar",
  completar: "Completar",
  manipulacao: "Manipular",
  "exploracao-3d": "Explorar 3D",
};

/** Cor de cada nível da análise. */
const NIVEL = porTema(() => ({
  forte: { nome: "Vai muito bem", tinta: cor.roxo, fundo: cor.roxoClaro },
  crescendo: { nome: "Está crescendo", tinta: cor.azulEscuro, fundo: cor.azulClaro },
  treinar: { nome: "Vale treinar", tinta: cor.pessegoEscuro, fundo: cor.pessegoClaro },
  novo: { nome: "Novo", tinta: cor.textoSuave, fundo: cor.suave },
}));

/** Uma missão de cada tipo, para o ícone e para abrir direto. */
const missaoDoTipo = (formato: string) => MISSOES.find((m) => m.formato === formato)!;

/** Seta de evolução desenhada (sobe, segue, desce). */
function SetaEvolucao({ tendencia, tinta }: { tendencia: "subindo" | "estavel" | "caindo"; tinta: string }) {
  const d =
    tendencia === "subindo"
      ? "M4 14 L10 8 L13 11 L18 6 M13 6 H18 V11"
      : tendencia === "caindo"
        ? "M4 6 L10 12 L13 9 L18 14 M13 14 H18 V9"
        : "M4 10 H17 M13 6 L17 10 L13 14";
  return (
    <Svg width={18} height={18} viewBox="0 0 22 20">
      <Path d={d} stroke={tinta} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Medidor circular: um anel que enche até a porcentagem, com o número no meio. */
function Medidor({ valor, tinta, fundo, rotulo }: { valor: number; tinta: string; fundo: string; rotulo: string }) {
  const lado = 74;
  const r = 31;
  const volta = 2 * Math.PI * r;
  return (
    <View style={[c.medidor, { backgroundColor: fundo }]}>
      <View style={{ width: lado, height: lado, alignItems: "center", justifyContent: "center" }}>
        <Svg width={lado} height={lado} style={{ position: "absolute" }}>
          <Circle cx={lado / 2} cy={lado / 2} r={r} stroke="#FFFFFF" strokeWidth={7} fill="none" />
          <Circle
            cx={lado / 2}
            cy={lado / 2}
            r={r}
            stroke={tinta}
            strokeWidth={7}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${(volta * Math.max(2, valor)) / 100} ${volta}`}
            transform={`rotate(-90 ${lado / 2} ${lado / 2})`}
          />
        </Svg>
        <Texto style={{ fontFamily: fonte.tituloForte, fontSize: 15, lineHeight: 19, color: cor.tinta }}>
          {valor}%
        </Texto>
      </View>
      <View style={{ flex: 1 }}>
        <Texto style={{ fontSize: 15, lineHeight: 19, fontFamily: fonte.textoForte, color: cor.tinta }}>{rotulo}</Texto>
      </View>
    </View>
  );
}

/**
 * Radar dos tipos de atividade: cada ponta é um tipo e a forma roxa mostra o
 * domínio (acerto de primeira, autonomia e precisão juntos).
 */
function Radar({ formatos }: { formatos: AnaliseAprendizagem["formatos"] }) {
  const [largura, setLargura] = useState(320);
  const W = largura - 28;
  const H = Math.min(300, W * 0.85);
  const cx = W / 2;
  const cy = H / 2;
  // sobra espaço em cima, embaixo e dos lados para os rótulos
  const R = Math.min(H / 2 - 40, W / 2 - 70);
  const n = formatos.length;
  const ponto = (i: number, f: number) => {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + Math.cos(a) * R * f, y: cy + Math.sin(a) * R * f };
  };
  const anel = (f: number) =>
    formatos
      .map((_, i) => ponto(i, f))
      .map((p) => `${p.x},${p.y}`)
      .join(" ");
  const forma = formatos
    .map((fm, i) => ponto(i, Math.max(0.04, (fm.dominio ?? 0) / 100)))
    .map((p) => `${p.x},${p.y}`)
    .join(" ");
  return (
    <View style={[c.lista, { padding: 14 }]} onLayout={(e) => setLargura(e.nativeEvent.layout.width)}>
      <Svg width={W} height={H}>
        {/* anéis de 25 em 25% e os eixos */}
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <Polygon key={f} points={anel(f)} fill={f === 1 ? cor.fundo : "none"} stroke={cor.borda} strokeWidth={1.2} />
        ))}
        {formatos.map((_, i) => {
          const p = ponto(i, 1);
          return <Line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={cor.borda} strokeWidth={1.2} />;
        })}
        <Polygon
          points={forma}
          fill={cor.roxo}
          fillOpacity={0.22}
          stroke={cor.roxo}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        {formatos.map((fm, i) => {
          const p = ponto(i, Math.max(0.04, (fm.dominio ?? 0) / 100));
          const l = ponto(i, 1.2);
          const ancora = Math.abs(l.x - cx) < 8 ? "middle" : l.x < cx ? "end" : "start";
          const jogou = fm.dominio !== null;
          return (
            <G key={fm.formato}>
              {jogou ? <Circle cx={p.x} cy={p.y} r={5} fill="#FFFFFF" stroke={cor.roxo} strokeWidth={2.5} /> : null}
              <SvgText
                x={l.x}
                y={l.y - 2}
                fontSize={14}
                fontWeight="700"
                fill={jogou ? cor.tinta : cor.textoFraco}
                textAnchor={ancora}
              >
                {CURTO[fm.formato] ?? fm.rotulo}
              </SvgText>
              <SvgText
                x={l.x}
                y={l.y + 14}
                fontSize={13}
                fontWeight="700"
                fill={jogou ? cor.roxo : cor.textoFraco}
                textAnchor={ancora}
              >
                {jogou ? `${fm.dominio}%` : "—"}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

/** Cartão de um tipo de atividade: fechado mostra o resumo; aberto, os medidores. */
function CartaoTipo({ f, largura }: { f: AnaliseAprendizagem["formatos"][number]; largura: number }) {
  const [aberto, setAberto] = useState(false);
  const n = NIVEL[f.nivel];
  return (
    <Pressable
      onPress={() => setAberto((v) => !v)}
      accessibilityRole="button"
      accessibilityState={{ expanded: aberto }}
      accessibilityLabel={`${f.rotulo}, ${n.nome}, ${f.dominio}%`}
      style={[c.lista, c.tipo, { width: largura }]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={[c.iconeTipo, { backgroundColor: n.fundo }]}>
          <IconeMissao jogo={missaoDoTipo(f.formato).jogo} tamanho={28} />
        </View>
        <View style={{ flex: 1 }}>
          <Titulo tamanho={17}>{CURTO[f.formato] ?? f.rotulo}</Titulo>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Texto style={{ fontSize: 14, color: n.tinta, fontFamily: fonte.textoForte }}>{n.nome}</Texto>
            {f.tendencia === "subindo" || f.tendencia === "caindo" ? (
              <SetaEvolucao tendencia={f.tendencia} tinta={n.tinta} />
            ) : null}
          </View>
        </View>
        <Texto style={{ fontFamily: fonte.tituloForte, fontSize: 24, lineHeight: 30, color: n.tinta }}>
          {f.dominio}%
        </Texto>
      </View>
      <View style={c.trilho}>
        <View style={[c.cheio, { width: `${Math.max(4, f.dominio ?? 0)}%`, backgroundColor: n.tinta }]} />
      </View>
      {aberto ? (
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Medidor valor={f.acerto ?? 0} tinta={cor.roxo} fundo={cor.roxoClaro} rotulo="de primeira" />
          <Medidor valor={f.autonomia ?? 0} tinta={cor.pessegoEscuro} fundo={cor.pessegoClaro} rotulo="sem dica" />
        </View>
      ) : null}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <Texto style={{ fontSize: 14, fontFamily: fonte.textoForte, color: cor.roxo }}>
          {aberto ? "Fechar detalhes" : "Ver detalhes"}
        </Texto>
        <View style={{ transform: [{ rotate: aberto ? "90deg" : "-90deg" }] }}>
          <Seta cor={cor.roxo} tamanho={16} />
        </View>
      </View>
    </Pressable>
  );
}

/** Carrossel dos tipos jogados: passa para o lado, com bolinhas mostrando onde está. */
function CarrosselTipos({ tipos }: { tipos: AnaliseAprendizagem["formatos"] }) {
  const [largura, setLargura] = useState(320);
  const [atual, setAtual] = useState(0);
  const GAP = 10;
  // com mais de um tipo, o cartão deixa ver a beirada do próximo
  const cartao = tipos.length > 1 ? largura - 34 : largura;
  return (
    <View style={{ gap: 10 }} onLayout={(e) => setLargura(e.nativeEvent.layout.width)}>
      <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
        <Titulo tamanho={16}>Por tipo de atividade</Titulo>
        {tipos.length > 1 ? (
          <Texto style={{ fontSize: 14, color: cor.textoSuave }}>
            {atual + 1} de {tipos.length}
          </Texto>
        ) : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cartao + GAP}
        decelerationRate="fast"
        contentContainerStyle={{ gap: GAP, alignItems: "flex-start" }}
        scrollEventThrottle={32}
        onScroll={(e) => setAtual(Math.round(e.nativeEvent.contentOffset.x / (cartao + GAP)))}
      >
        {tipos.map((f) => (
          <CartaoTipo key={f.formato} f={f} largura={cartao} />
        ))}
      </ScrollView>
      {tipos.length > 1 ? (
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 6 }}>
          {tipos.map((f, i) => (
            <View key={f.formato} style={[c.pontinho, i === atual && c.pontinhoAtivo]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

/**
 * Seu jeito de aprender, bem visual: o jeito mais forte em destaque, um
 * cartão para cada tipo de atividade (barra de domínio e medidores de acerto
 * de primeira e de fases sem dica), convites para os tipos ainda não jogados
 * e a missão sugerida.
 */
function JeitosDeAprender({ analise }: { analise: AnaliseAprendizagem }) {
  const abrirMissao = useAbrirMissao();
  const jogados = [...analise.fortes, ...analise.crescendo, ...analise.treinar];
  const principal = analise.jeitoPrincipal;
  const exemploPrincipal = principal ? jogados.find((f) => f.jeito === principal.jeito) : undefined;
  const sugerida = analise.sugestao ? missaoPorId(analise.sugestao.missaoId) : undefined;

  if (!jogados.length) {
    return (
      <View style={{ gap: 12 }}>
        <View style={[c.lista, { padding: 18, flexDirection: "row", alignItems: "center", gap: 14 }]}>
          <Lilo humor="curioso" tamanho={84} />
          <Texto style={{ flex: 1, fontSize: 16, lineHeight: 23, color: cor.texto }}>
            Jogue algumas missões e eu mostro aqui o seu jeito de aprender.
          </Texto>
        </View>
        <Radar formatos={analise.formatos} />
      </View>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      {/* 1. o jeito mais forte, em destaque */}
      <View style={c.destaque}>
        <View style={{ flex: 1, gap: 6 }}>
          {principal && exemploPrincipal ? (
            <>
              <View style={c.iconeGrande}>
                <IconeMissao jogo={missaoDoTipo(exemploPrincipal.formato).jogo} tamanho={34} />
              </View>
              <Texto style={{ fontSize: 14, color: cor.lilasNoEscuro, marginTop: 4 }}>Seu jeito mais forte</Texto>
              <Titulo tamanho={26} style={{ color: "#FFFFFF" }}>
                {principal.jeito}
              </Titulo>
              <Texto style={{ fontSize: 16, lineHeight: 22, color: "rgba(255,255,255,0.85)" }}>
                Você aprende muito bem {principal.frase}.
              </Texto>
            </>
          ) : (
            <>
              <Texto style={{ fontSize: 14, color: cor.lilasNoEscuro }}>Seu jeito de aprender</Texto>
              <Titulo tamanho={22} style={{ color: "#FFFFFF" }}>
                Ainda descobrindo
              </Titulo>
              <Texto style={{ fontSize: 16, lineHeight: 22, color: "rgba(255,255,255,0.85)" }}>
                Jogue mais missões de cada tipo para eu ter certeza.
              </Texto>
            </>
          )}
        </View>
        <Lilo humor={principal ? "orgulhoso" : "pensativo"} tamanho={104} />
      </View>

      {/* 2. o radar com todos os tipos */}
      <Radar formatos={analise.formatos} />

      {/* 3. um cartão por tipo jogado, passando para o lado */}
      <CarrosselTipos tipos={jogados} />

      {/* 4. tipos ainda não jogados: convites */}
      {analise.novos.length ? (
        <View style={{ gap: 8 }}>
          <Titulo tamanho={16}>Para experimentar</Titulo>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {analise.novos.map((f) => {
              const m = missaoDoTipo(f.formato);
              return (
                <Pressable
                  key={f.formato}
                  onPress={() => abrirMissao(m.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Experimentar ${f.rotulo}: ${m.titulo}`}
                  style={({ pressed }) => [c.convite, pressed && { backgroundColor: cor.roxoClaro }]}
                >
                  <View style={[c.iconeTipo, { backgroundColor: COR_MISSAO[m.cor].claro }]}>
                    <IconeMissao jogo={m.jogo} tamanho={28} />
                  </View>
                  <Titulo tamanho={15}>{CURTO[f.formato] ?? f.rotulo}</Titulo>
                  <Texto style={{ fontSize: 14, color: cor.textoSuave }} numberOfLines={1}>
                    {m.titulo}
                  </Texto>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      {/* 5. missão sugerida para treinar */}
      {sugerida && analise.sugestao && analise.treinar.length + analise.crescendo.length > 0 ? (
        <Pressable
          onPress={() => abrirMissao(sugerida.id)}
          accessibilityRole="button"
          style={({ pressed }) => [c.sugestao, pressed && { opacity: 0.92 }]}
        >
          <View style={[c.iconeTipo, { backgroundColor: "#FFFFFF" }]}>
            <IconeMissao jogo={sugerida.jogo} tamanho={28} />
          </View>
          <View style={{ flex: 1 }}>
            <Texto style={{ fontSize: 14, color: cor.lilasNoEscuro }}>Treinar agora</Texto>
            <Titulo tamanho={18} style={{ color: "#FFFFFF" }}>
              {sugerida.titulo}
            </Titulo>
          </View>
          <Seta direcao="direita" cor="#FFFFFF" tamanho={20} />
        </Pressable>
      ) : null}
    </View>
  );
}

const c = criarEstilos(() => ({
  destaque: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 18,
    borderRadius: raio.xg,
    backgroundColor: "#1E2A78",
  },
  iconeGrande: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  tipo: { gap: 12, padding: 16 },
  pontinho: { width: 7, height: 7, borderRadius: 4, backgroundColor: cor.inativo },
  pontinhoAtivo: { width: 20, backgroundColor: cor.roxo },
  medidor: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderRadius: raio.g },
  iconeTipo: { width: 48, height: 48, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  trilho: { height: 14, borderRadius: 7, backgroundColor: cor.trilho, overflow: "hidden" },
  cheio: { height: "100%", borderRadius: 7 },
  selo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  convite: {
    width: 150,
    gap: 6,
    padding: 14,
    borderRadius: raio.g,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: cor.bordaForte,
    backgroundColor: cor.superficie,
  },
  sugestao: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: raio.g,
    backgroundColor: cor.roxo,
  },

  estante: {
    paddingTop: 14,
    paddingHorizontal: 8,
    paddingBottom: 10,
    borderRadius: raio.g,
    backgroundColor: cor.superficie,
    borderWidth: 1,
    borderColor: cor.borda,
  },
  medalhas: { flexDirection: "row", justifyContent: "space-around" },
  vaga: { width: 78, alignItems: "center", gap: 6 },
  nomeMedalha: { fontSize: 12, lineHeight: 15, textAlign: "center" },
  prateleira: { height: 8, marginTop: 10, marginHorizontal: 4, borderRadius: 4, backgroundColor: cor.lilasClaro },
  detalhe: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    marginHorizontal: 6,
    padding: 12,
    borderRadius: raio.m,
    borderWidth: 1.5,
    backgroundColor: cor.fundo,
  },
  resumo: { marginTop: 14, padding: 18, borderRadius: raio.xg, backgroundColor: "#1E2A78" },
  segmentos: { flexDirection: "row", gap: 4, marginTop: 12 },
  segmento: { flex: 1, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.16)" },
  secao: { marginTop: 24 },
  secaoTopo: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  lista: {
    borderRadius: raio.g,
    backgroundColor: cor.superficie,
    borderWidth: 1,
    borderColor: cor.borda,
    overflow: "hidden",
  },
  divisa: { borderTopWidth: 1, borderTopColor: cor.borda },
  check: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
}));
