import { MISSOES, NIVEIS, type Missao, type ResultadoJogada } from "./missoes";

/**
 * Gamificação "o céu que se ilumina".
 *
 * - Cada NÍVEL é um MAPA do céu com uma constelação para montar.
 * - Cada missão concluída gera PONTOS DE LUZ.
 * - A cada 5 pontos, 1 estrela da constelação do nível se acende.
 * - A última estrela só acende quando todas as missões do mapa estão
 *   concluídas: aí a constelação se completa e vai para o álbum.
 * - O DESAFIO DO DIA vale pontos em dobro.
 *
 * Posições das estrelas em coordenadas 0–100 (desenho simplificado).
 */

export interface EstrelaCeu {
  x: number;
  y: number;
  nome?: string;
  /** 1 (fraca) a 3 (muito brilhante). */
  brilho: 1 | 2 | 3;
  /** Curiosidade curta, mostrada quando o aluno toca na estrela. */
  curiosidade?: string;
}

export interface Constelacao {
  id: string;
  nome: string;
  apelido: string;
  historia: string;
  estrelas: EstrelaCeu[];
  /** Pares de índices de estrelas ligadas por linhas. */
  ligacoes: [number, number][];
  /** Como e quando encontrar a constelação no céu do Brasil. */
  explicacao: string;
  /** Meses (1 a 12) em que ela aparece melhor no céu do Brasil, à noite. */
  meses: number[];
  /** Fatos curiosos mostrados na página da constelação. */
  curiosidades: string[];
}

export const PONTOS_POR_ESTRELA = 5;

export const CONSTELACOES: Constelacao[] = [
  {
    id: "orion",
    nome: "Órion",
    explicacao:
      "Procure três estrelas bem alinhadas e com o mesmo brilho: são as Três Marias. Em volta delas, quatro estrelas mais fortes formam um retângulo, que são os ombros e os pés do caçador. Ela aparece melhor no verão, de dezembro a março.",
    meses: [12, 1, 2, 3],
    curiosidades: [
      "Betelgeuse, no ombro do caçador, é avermelhada; Rigel, no pé, é azulada. Dá para ver a diferença de cor a olho nu.",
      "Logo abaixo das Três Marias existe uma nuvem onde estrelas novas estão nascendo: a Nebulosa de Órion.",
    ],
    apelido: "O Caçador",
    historia:
      "Uma das constelações mais fáceis de achar. As três estrelas alinhadas no meio formam o cinturão do caçador, que no Brasil chamamos de Três Marias.",
    estrelas: [
      {
        x: 28,
        y: 14,
        nome: "Betelgeuse",
        brilho: 3,
        curiosidade: "É tão grande que, se estivesse no lugar do Sol, passaria da órbita de Marte.",
      },
      { x: 72, y: 18, nome: "Bellatrix", brilho: 2, curiosidade: "Seu nome quer dizer “a guerreira” em latim." },
      { x: 40, y: 50, nome: "Alnitak", brilho: 2, curiosidade: "É uma das Três Marias, o cinturão do caçador." },
      { x: 50, y: 47, nome: "Alnilam", brilho: 2, curiosidade: "É a Maria do meio, a mais brilhante das três." },
      {
        x: 60,
        y: 44,
        nome: "Mintaka",
        brilho: 2,
        curiosidade: "Das Três Marias, é a primeira a aparecer no horizonte.",
      },
      { x: 32, y: 86, nome: "Saiph", brilho: 2, curiosidade: "Seu nome vem do árabe e quer dizer “espada”." },
      { x: 74, y: 82, nome: "Rigel", brilho: 3, curiosidade: "É azulada e muito mais quente que o nosso Sol." },
    ],
    ligacoes: [
      [0, 1],
      [0, 2],
      [1, 4],
      [2, 3],
      [3, 4],
      [2, 5],
      [4, 6],
    ],
  },
  {
    id: "escorpiao",
    nome: "Escorpião",
    explicacao:
      "É uma das poucas constelações que parecem mesmo com o que representam: uma linha curva de estrelas forma a cauda e o ferrão. Fica alta no céu nas noites de inverno, de junho a agosto.",
    meses: [6, 7, 8],
    curiosidades: [
      "Antares, o coração do escorpião, é tão grande que caberiam centenas de milhões de sóis dentro dela.",
      "Na lenda grega, o escorpião e Órion são inimigos: por isso, quando um nasce no céu, o outro se põe.",
    ],
    apelido: "O Guardião do Inverno",
    historia:
      "No coração do Escorpião brilha Antares, uma estrela gigante e avermelhada. Nas noites de inverno, ele aparece bem alto no céu do Brasil.",
    estrelas: [
      { x: 16, y: 14, brilho: 1 },
      { x: 14, y: 36, brilho: 1 },
      { x: 30, y: 24, brilho: 2 },
      {
        x: 44,
        y: 38,
        nome: "Antares",
        brilho: 3,
        curiosidade: "É vermelha. O nome quer dizer “rival de Marte”, por causa da cor.",
      },
      { x: 56, y: 56, brilho: 2 },
      { x: 66, y: 74, brilho: 2 },
      { x: 84, y: 66, nome: "Shaula", brilho: 3, curiosidade: "Fica na ponta do ferrão do escorpião." },
    ],
    ligacoes: [
      [0, 2],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
    ],
  },
  {
    id: "cruzeiro-do-sul",
    nome: "Cruzeiro do Sul",
    explicacao:
      "É a menor das 88 constelações. Quatro estrelas formam uma cruz, e esticando o braço maior da cruz umas quatro vezes e meia você chega perto do Polo Sul celeste. É visível o ano todo no Brasil, mais alta no outono.",
    meses: [3, 4, 5, 6],
    curiosidades: [
      "Ela está na bandeira do Brasil, representando o céu do Rio de Janeiro na manhã de 15 de novembro de 1889.",
      "Navegadores usavam o Cruzeiro do Sul para achar a direção do Sul antes de existir bússola eletrônica.",
    ],
    apelido: "A Cruz que aponta o Sul",
    historia:
      "Aparece na bandeira do Brasil e ajuda a encontrar o Sul. A estrelinha menor, fora da cruz, tem um apelido divertido: Intrometida.",
    estrelas: [
      { x: 48, y: 12, nome: "Gacrux", brilho: 2, curiosidade: "É a estrela do topo da cruz e tem cor alaranjada." },
      {
        x: 22,
        y: 44,
        nome: "Mimosa",
        brilho: 2,
        curiosidade: "É a segunda estrela mais brilhante do Cruzeiro do Sul.",
      },
      {
        x: 76,
        y: 40,
        nome: "Pálida",
        brilho: 1,
        curiosidade: "Ganhou esse apelido no Brasil por brilhar menos que as outras.",
      },
      {
        x: 62,
        y: 58,
        nome: "Intrometida",
        brilho: 1,
        curiosidade: "Fica fora do lugar, entre os braços da cruz. Daí o apelido!",
      },
      {
        x: 52,
        y: 88,
        nome: "Estrela de Magalhães",
        brilho: 3,
        curiosidade: "A mais brilhante do Cruzeiro do Sul. Ela está na bandeira do Brasil.",
      },
    ],
    ligacoes: [
      [0, 4],
      [1, 2],
    ],
  },
  {
    id: "cassiopeia",
    nome: "Cassiopeia",
    explicacao:
      "Cinco estrelas formam um W (ou um M). No Brasil ela aparece baixinha, perto do horizonte norte, nas noites de primavera, de outubro a dezembro.",
    meses: [10, 11, 12],
    curiosidades: [
      "Como fica perto do Polo Norte celeste, no hemisfério norte a Cassiopeia nunca se põe: gira a noite inteira.",
      "Em 1572, uma estrela 'nova' explodiu ali e brilhou tanto que podia ser vista até de dia.",
    ],
    apelido: "A Rainha",
    historia:
      "Tem o formato de um W (ou de um M, dependendo da hora da noite). Nas histórias gregas, Cassiopeia era uma rainha sentada no seu trono.",
    estrelas: [
      { x: 10, y: 32, nome: "Caph", brilho: 2, curiosidade: "Seu brilho muda um pouquinho a cada poucas horas." },
      { x: 30, y: 70, nome: "Schedar", brilho: 3, curiosidade: "É alaranjada e uma das mais brilhantes do W." },
      { x: 50, y: 42, nome: "Navi", brilho: 3, curiosidade: "Ganhou esse nome em homenagem a um astronauta." },
      {
        x: 70,
        y: 72,
        nome: "Ruchbah",
        brilho: 2,
        curiosidade: "O nome quer dizer “joelho”: o joelho da rainha sentada.",
      },
      { x: 90, y: 30, nome: "Segin", brilho: 2, curiosidade: "Fica na ponta do W, bem longe daqui." },
    ],
    ligacoes: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
  },
  {
    id: "pleiades",
    nome: "Plêiades",
    explicacao:
      "Não é uma constelação inteira, e sim um aglomerado: várias estrelas juntinhas, que lembram uma pequena concha ou nuvem azulada. Aparecem no céu do Brasil de novembro a março, perto de Órion.",
    meses: [11, 12, 1, 2, 3],
    curiosidades: [
      "A olho nu dá para ver 6 ou 7 estrelas, mas o grupo tem mais de mil.",
      "Muitos povos usavam as Plêiades como calendário: quando elas surgiam no céu antes do amanhecer, era hora de plantar.",
    ],
    apelido: "O Sete-Estrelo",
    historia:
      "Um aglomerado de estrelas jovens que parece uma pequena concha. No Brasil é o Sete-Estrelo, e povos indígenas usavam a chegada dele no céu para saber a hora de plantar.",
    estrelas: [
      {
        x: 30,
        y: 16,
        nome: "Taígeta",
        brilho: 2,
        curiosidade: "Brilha em azul, como quase todas as irmãs do aglomerado.",
      },
      { x: 42, y: 32, nome: "Maia", brilho: 2, curiosidade: "Está cercada por uma nuvem de poeira que reflete a luz." },
      { x: 20, y: 54, nome: "Electra", brilho: 2, curiosidade: "Na mitologia grega, era uma das sete irmãs." },
      {
        x: 46,
        y: 64,
        nome: "Mérope",
        brilho: 2,
        curiosidade: "Tem perto dela uma nebulosa azul muito bonita nas fotos.",
      },
      { x: 58, y: 46, nome: "Alcíone", brilho: 3, curiosidade: "É a mais brilhante do Sete-Estrelo." },
      { x: 82, y: 42, nome: "Atlas", brilho: 2, curiosidade: "Na mitologia, era o pai das sete irmãs." },
      { x: 86, y: 26, nome: "Pleione", brilho: 1, curiosidade: "A mãe das irmãs. Gira tão rápido que fica achatada." },
    ],
    ligacoes: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 1],
      [4, 5],
      [5, 6],
    ],
  },
  {
    id: "cao-maior",
    nome: "Cão Maior",
    explicacao:
      "Fica logo abaixo e à esquerda de Órion. Siga a linha das Três Marias para baixo e você chega a Sirius, a estrela mais brilhante do céu. Aparece melhor no verão, de janeiro a abril.",
    meses: [1, 2, 3, 4],
    curiosidades: [
      "Sirius está a cerca de 8,6 anos-luz: a luz que você vê hoje saiu dela há uns 8 anos.",
      "Sirius tem uma companheira pequenininha, uma anã branca do tamanho da Terra.",
    ],
    apelido: "O Cão do Caçador",
    historia:
      "Representa um cão que acompanha o caçador Órion pelo céu. Nela está Sirius, a estrela mais brilhante de toda a noite.",
    estrelas: [
      { x: 38, y: 12, nome: "Muliphein", brilho: 1, curiosidade: "Fica na cabeça do cão, pertinho de Sirius." },
      {
        x: 56,
        y: 22,
        nome: "Sirius",
        brilho: 3,
        curiosidade: "A estrela mais brilhante do céu noturno! Fica bem perto da Terra.",
      },
      {
        x: 82,
        y: 18,
        nome: "Mirzam",
        brilho: 2,
        curiosidade: "O nome quer dizer “a que anuncia”: ela nasce logo antes de Sirius.",
      },
      { x: 52, y: 58, nome: "Wezen", brilho: 2, curiosidade: "Uma supergigante, dezenas de vezes maior que o Sol." },
      {
        x: 28,
        y: 80,
        nome: "Adhara",
        brilho: 2,
        curiosidade: "Há milhões de anos, ela já foi a estrela mais brilhante do céu.",
      },
      { x: 80, y: 74, nome: "Aludra", brilho: 2, curiosidade: "Fica na ponta da cauda do cão." },
    ],
    ligacoes: [
      [0, 1],
      [1, 2],
      [1, 3],
      [3, 4],
      [3, 5],
    ],
  },
  {
    id: "lira",
    nome: "Lira",
    explicacao:
      "É pequena: um losango de estrelas fracas com Vega, muito brilhante, no topo. No Brasil ela aparece baixa no horizonte norte, nas noites de julho a setembro.",
    meses: [7, 8, 9],
    curiosidades: [
      "Vega foi a primeira estrela fotografada da história, em 1850.",
      "Vega, Deneb e Altair formam o 'Triângulo de Verão', famoso no hemisfério norte.",
    ],
    apelido: "A Harpa",
    historia:
      "Uma constelação pequena com uma das estrelas mais brilhantes do céu, Vega. Lembra uma harpa antiga, a lira.",
    estrelas: [
      {
        x: 50,
        y: 12,
        nome: "Vega",
        brilho: 3,
        curiosidade: "Daqui a uns 12 mil anos, Vega vai ser a nossa estrela polar.",
      },
      { x: 62, y: 34, nome: "Zeta Lyrae", brilho: 1, curiosidade: "É uma estrela dupla: de perto, são duas." },
      {
        x: 40,
        y: 38,
        nome: "Épsilon",
        brilho: 1,
        curiosidade: "Chamada de “dupla dupla”: são quatro estrelas juntas.",
      },
      { x: 34, y: 76, nome: "Sheliak", brilho: 2, curiosidade: "Seu brilho muda: ela fica mais forte e mais fraca." },
      { x: 70, y: 82, nome: "Sulafat", brilho: 2, curiosidade: "O nome quer dizer “a tartaruga”, em árabe." },
    ],
    ligacoes: [
      [0, 1],
      [0, 2],
      [1, 2],
      [2, 3],
      [1, 4],
      [3, 4],
    ],
  },
  {
    id: "aguia",
    nome: "Águia",
    apelido: "A Ave de Zeus",
    historia:
      "Uma águia de asas abertas voando pela Via Láctea. No meio dela brilha Altair, uma das estrelas mais próximas que vemos a olho nu.",
    explicacao:
      "Procure três estrelas em linha reta, com a do meio mais forte: é Altair com suas duas vizinhas. As asas se abrem para os lados. Aparece alta no céu do Brasil nas noites de julho a outubro.",
    meses: [7, 8, 9, 10],
    curiosidades: [
      "Altair gira tão rápido que dá uma volta em menos de 9 horas, e por isso fica achatada nos polos.",
      "Altair, Vega (da Lira) e Deneb formam o Triângulo de Inverno do Brasil, fácil de achar no céu.",
    ],
    estrelas: [
      {
        x: 50,
        y: 40,
        nome: "Altair",
        brilho: 3,
        curiosidade: "Fica a 17 anos-luz: é uma das estrelas brilhantes mais próximas.",
      },
      { x: 58, y: 28, nome: "Tarazed", brilho: 2, curiosidade: "É uma gigante alaranjada, bem maior que Altair." },
      {
        x: 43,
        y: 52,
        nome: "Alshain",
        brilho: 1,
        curiosidade: "Forma, com Altair e Tarazed, a linha reta do corpo da águia.",
      },
      { x: 16, y: 32, nome: "Asa esquerda", brilho: 1, curiosidade: "A ponta de uma das asas da águia." },
      { x: 86, y: 58, nome: "Asa direita", brilho: 1, curiosidade: "A ponta da outra asa." },
      { x: 38, y: 86, nome: "Cauda", brilho: 2, curiosidade: "Marca a cauda da águia, apontando para a Via Láctea." },
    ],
    ligacoes: [
      [1, 0],
      [0, 2],
      [0, 3],
      [0, 4],
      [2, 5],
    ],
  },
];

export function constelacaoPorId(id: string): Constelacao | undefined {
  return CONSTELACOES.find((c) => c.id === id);
}

export function constelacaoDoNivel(numero: number): Constelacao {
  const nivel = NIVEIS.find((n) => n.numero === numero) ?? NIVEIS[0]!;
  return constelacaoPorId(nivel.constelacao)!;
}

export function pontosNecessarios(c: Constelacao): number {
  return c.estrelas.length * PONTOS_POR_ESTRELA;
}

/** Verdadeiro quando todas as missões do mapa já foram concluídas. */
export function mapaConcluido(numero: number, concluidas: Record<string, unknown>): boolean {
  const nivel = NIVEIS.find((n) => n.numero === numero);
  return Boolean(nivel) && nivel!.missoes.every((id) => Boolean(concluidas[id]));
}

/**
 * Estrelas acesas da constelação. Os pontos acendem até a penúltima; a última
 * fica reservada para quando o mapa inteiro estiver concluído.
 */
export function estrelasAcesas(pontos: number, c: Constelacao, concluido: boolean): number {
  if (concluido) return c.estrelas.length;
  return Math.min(c.estrelas.length - 1, Math.floor(pontos / PONTOS_POR_ESTRELA));
}

/**
 * Pontos de luz de uma missão concluída:
 * 1 por fase + 1 por acerto de primeira + 3 por terminar a missão.
 * Desafio do dia: em dobro.
 */
export function pontosDaJogada(r: Pick<ResultadoJogada, "rodadas" | "acertosDePrimeira">, desafio = false): number {
  const base = r.rodadas + r.acertosDePrimeira + 3;
  return desafio ? base * 2 : base;
}

/** Desafio do dia: a mesma missão para todos os alunos na mesma data. */
export function desafioDoDia(dataISO: string): Missao {
  let h = 0;
  for (const ch of dataISO) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return MISSOES[h % MISSOES.length]!;
}
