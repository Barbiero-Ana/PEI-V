import type { FormatoId } from "./formats";

/**
 * Missões do aluno: cada missão é um minijogo de Matemática com manipulação
 * direta — arrastar, equilibrar, pintar, girar, traçar e construir em 3D.
 * Nenhuma é "tocar na alternativa certa".
 *
 * Toda fase (rodada) parte de uma SITUAÇÃO DO DIA A DIA (`cenario`) e tem uma
 * DICA (`dica`) que o aluno pode pedir pela lâmpada.
 *
 * O formato de cada missão permite ao professor comparar, depois, em quais
 * tipos de interação cada aluno se sai melhor. O conteúdo fica aqui (e não na
 * tela) para web e app usarem o mesmo material.
 */

interface Situacao {
  /** Problema contextualizado no dia a dia do aluno. */
  cenario: string;
  /** Dica mostrada quando o aluno toca na lâmpada. */
  dica: string;
  /** Instrução própria desta fase (quando difere da instrução da missão). */
  instrucao?: string;
}

export interface RodadaCubos extends Situacao {
  volume: number;
  medidas?: { comprimento: number; largura: number; altura: number };
}

export type Solido = "cubo" | "piramide" | "prisma" | "prismaHexagonal" | "piramidePentagonal";

export interface RodadaSolidos extends Situacao {
  solido: Solido;
  contar: "faces" | "vertices" | "arestas";
  /** O cubo é um dado: as faces pintadas ganham as bolinhas. */
  dado?: boolean;
}

/** Repartir igualmente (divisão, às vezes com resto). */
export interface RodadaRepartir extends Situacao {
  total: number;
  grupos: number;
  item: "figurinha" | "bala" | "lapis" | "biscoito";
  /** Quem recebe: amigos (rostos) ou potes. */
  quem: "amigos" | "potes";
}

/** Cerca da horta: desenhar um retângulo com área e/ou perímetro pedidos. */
export interface RodadaArea extends Situacao {
  colunas: number;
  linhas: number;
  area?: number;
  perimetro?: number;
  /** Com o perímetro pedido, fazer a maior área possível. */
  maiorArea?: boolean;
}

/** Girar até um ângulo (graus, sentido horário). */
export interface RodadaAngulo extends Situacao {
  angulo: number;
  /** O ângulo é a resposta de uma conta do enunciado: não aparece na placa. */
  esconderAlvo?: boolean;
  tema: "robo" | "farol" | "bussola";
}

/** Quadradinho de uma planificação: [coluna, linha]. */
export type Casa = [number, number];

/**
 * Planificação do cubo.
 * - "escolher": entre os moldes, achar o que fecha um cubo (dobrando em 3D).
 * - "dado": completar os números para as faces opostas somarem 7.
 */
export interface RodadaPlanificacao extends Situacao {
  modo: "escolher" | "dado";
  /** Moldes para escolher (modo "escolher"). */
  opcoes?: Casa[][];
  /** Índice do molde que fecha o cubo. */
  correta?: number;
  /** Molde do dado (modo "dado"). */
  rede?: Casa[];
  /** Números já escritos: índice da casa → número. */
  fixos?: Record<number, number>;
}

/**
 * Cubinhos escondidos: pilhas de cubos vistas em 3D.
 * `alturas[linha][coluna]` = quantos cubos empilhados naquele lugar.
 */
export interface RodadaVolume extends Situacao {
  alturas: number[][];
  pergunta: "total" | "faltam";
  /** Bloco completo (modo "faltam"): comprimento × largura × altura. */
  completo?: { c: number; l: number; a: number };
}

export interface RodadaBalanca extends Situacao {
  esquerda: number[];
  /** O que está em cada peso da esquerda (ex.: "Batatas"). */
  itens?: string[];
  misterio?: number;
  /** Nome do objeto misterioso (ex.: "Abóbora"). */
  nomeMisterio?: string;
  bandeja: number[];
}

export interface RodadaReta extends Situacao {
  min: number;
  max: number;
  passo: number;
  alvo: number;
  rotulo?: string;
  /** Unidade mostrada junto dos números (ex.: "m", "km"). */
  unidade?: string;
  /** Cenário desenhado atrás da reta. */
  tema?: "corrida" | "regua" | "estrada" | "trilha";
  /** O alvo é a resposta de uma conta do enunciado: não aparece na placa. */
  esconderAlvo?: boolean;
}

export interface RodadaTorre extends Situacao {
  alvo: number;
  blocos: number[];
}

export interface RodadaTrilha extends Situacao {
  numeros: number[];
  /** Como cada número aparece: camiseta de corrida, porta de armário, senha ou casa. */
  tema?: "corrida" | "armarios" | "senhas" | "casas";
}

export interface RodadaPares extends Situacao {
  quantidades: number[];
  /** O que é contado em cada grupo. */
  objeto?: "laranja" | "ovo" | "carro";
}

export interface RodadaPizza extends Situacao {
  numerador: number;
  denominador: number;
  /** Fração pedida em outra forma (frações equivalentes): ex. pede 3/4 numa pizza de 8 partes. */
  pedido?: { numerador: number; denominador: number };
  forma?: "circulo" | "barra";
  /** Como o todo é desenhado. */
  tema?: "pizza" | "chocolate" | "torta" | "horta";
}

/** Mercadinho: pagar o valor exato com notas e moedas. */
export interface RodadaDinheiro extends Situacao {
  produto: string;
  /** Ilustração do produto na esteira do caixa. */
  item: "suco" | "caderno" | "album" | "picole" | "biscoito";
  /** Preço em reais (pode ter centavos, ex.: 7.5). */
  preco: number;
  /** Notas e moedas disponíveis (quantidade ilimitada de cada). */
  valores: number[];
  /**
   * Fase de troco: a cliente pagou com esta nota e o aluno, ajudando no
   * caixa, separa o troco (pagoCom − preco) com o dinheiro da gaveta.
   */
  pagoCom?: number;
}

/** Relógio: girar os ponteiros até a hora pedida. */
export interface RodadaRelogio extends Situacao {
  hora: number; // 1..12
  minuto: number; // múltiplo de 5
}

/** Jarra medidora: encher até a medida. */
export interface RodadaJarra extends Situacao {
  capacidade: number; // mL
  alvo: number; // mL
  passo: number; // mL entre marquinhas
  recipiente: string;
  liquido: "leite" | "agua" | "suco";
}

/** Votação da turma: montar o gráfico de barras a partir da contagem. */
export interface RodadaGrafico extends Situacao {
  titulo: string;
  categorias: { nome: string; valor: number }[];
  maximo: number;
}

/** Simetria: completar a metade direita espelhando a esquerda. */
export interface RodadaSimetria extends Situacao {
  /** Metade esquerda: "X" = pintado, "." = vazio. Todas as linhas com o mesmo tamanho. */
  esquerda: string[];
  /** Silhueta desenhada em volta da grade. */
  tema?: "borboleta" | "tapete" | "mascara";
}

/** Caminho do entregador: traçar a rota no mapa. */
export interface RodadaCaminho extends Situacao {
  colunas: number;
  linhas: number;
  inicio: [number, number];
  fim: [number, number];
  bloqueios?: [number, number][];
  /** Se informado, o caminho precisa ter exatamente esse número de passos. */
  passos?: number;
  /** Nome do ponto de partida (placa no mapa). */
  origem?: string;
  /** O que fica no destino. */
  destino?: "casa" | "escola" | "parque";
}

/** Porcentagem: pintar quadradinhos numa grade de 100 (cada um vale 1%). */
export interface RodadaPorcento extends Situacao {
  /** Quantos por cento pintar (0 a 100). */
  alvo: number;
  /** Como o pedido aparece: "30%", "3/10", "0,3"… (padrão: a porcentagem). */
  pedido?: string;
  tema?: "ingressos" | "horta" | "bateria";
}

/** Plano cartesiano: tocar no ponto (x, y) da grade. */
export interface RodadaPlano extends Situacao {
  /** Maior valor dos eixos. */
  max: number;
  /** Menor valor dos eixos (negativo = os quatro quadrantes). Padrão: 0. */
  min?: number;
  alvo: [number, number];
  /** Pontos já marcados no mapa, para referência. */
  marcados?: { ponto: [number, number]; nome: string }[];
  /** O que fica escondido no ponto (aparece ao acertar). */
  tesouro?: "bau" | "estrela" | "chave";
}

/** Máquina misteriosa: descobrir a regra saída = entrada × mult + soma. */
export interface RodadaMaquina extends Situacao {
  pares: [number, number][];
  mult: number;
  soma: number;
}

/** Sorteio justo: montar o saco de bolinhas para a chance pedida. */
export interface RodadaSorteio extends Situacao {
  /** Quantas bolinhas o saco deve ter no total. */
  total: number;
  /** Cor que precisa ter a chance pedida. */
  cor: "roxo" | "pessego" | "azul";
  /** Chance pedida, como fração: [quantas, de quantas]. */
  chance: [number, number];
}

/** Nivelando as torres: deixar todas as colunas iguais (a média). */
export interface RodadaMedia extends Situacao {
  colunas: number[];
  /** O que cada cubo representa (ex.: "livros lidos"). */
  unidade: string;
  nomes: string[];
}

/** Calculadora maluca: ordenar cartas para a expressão dar o alvo. */
export interface RodadaExpressao extends Situacao {
  cartas: string[];
  alvo: number;
}

interface MissaoBase {
  id: string;
  titulo: string;
  instrucao: string;
  formato: FormatoId;
  conteudo: string;
  cor: "roxo" | "pessego" | "azul" | "lilas";
}

export type Missao =
  | (MissaoBase & { jogo: "cubos"; rodadas: RodadaCubos[] })
  | (MissaoBase & { jogo: "solidos"; rodadas: RodadaSolidos[] })
  | (MissaoBase & { jogo: "planificacao"; rodadas: RodadaPlanificacao[] })
  | (MissaoBase & { jogo: "repartir"; rodadas: RodadaRepartir[] })
  | (MissaoBase & { jogo: "area"; rodadas: RodadaArea[] })
  | (MissaoBase & { jogo: "angulo"; rodadas: RodadaAngulo[] })
  | (MissaoBase & { jogo: "volume"; rodadas: RodadaVolume[] })
  | (MissaoBase & { jogo: "balanca"; rodadas: RodadaBalanca[] })
  | (MissaoBase & { jogo: "reta"; rodadas: RodadaReta[] })
  | (MissaoBase & { jogo: "torre"; rodadas: RodadaTorre[] })
  | (MissaoBase & { jogo: "trilha"; rodadas: RodadaTrilha[] })
  | (MissaoBase & { jogo: "pares"; rodadas: RodadaPares[] })
  | (MissaoBase & { jogo: "pizza"; rodadas: RodadaPizza[] })
  | (MissaoBase & { jogo: "dinheiro"; rodadas: RodadaDinheiro[] })
  | (MissaoBase & { jogo: "relogio"; rodadas: RodadaRelogio[] })
  | (MissaoBase & { jogo: "jarra"; rodadas: RodadaJarra[] })
  | (MissaoBase & { jogo: "grafico"; rodadas: RodadaGrafico[] })
  | (MissaoBase & { jogo: "simetria"; rodadas: RodadaSimetria[] })
  | (MissaoBase & { jogo: "caminho"; rodadas: RodadaCaminho[] })
  | (MissaoBase & { jogo: "porcento"; rodadas: RodadaPorcento[] })
  | (MissaoBase & { jogo: "plano"; rodadas: RodadaPlano[] })
  | (MissaoBase & { jogo: "maquina"; rodadas: RodadaMaquina[] })
  | (MissaoBase & { jogo: "sorteio"; rodadas: RodadaSorteio[] })
  | (MissaoBase & { jogo: "media"; rodadas: RodadaMedia[] })
  | (MissaoBase & { jogo: "expressao"; rodadas: RodadaExpressao[] });

export type TipoJogo = Missao["jogo"];

export const MISSOES: Missao[] = [
  // ---------------------------------------------------------------- nível 1
  {
    id: "ligue-os-pares",
    titulo: "Ligue os pares",
    instrucao: "Puxe uma linha de cada grupo até o número da quantidade.",
    formato: "associacao-visual",
    conteudo: "Quantidade e número",
    cor: "azul",
    jogo: "pares",
    rodadas: [
      {
        cenario: "Na feira, a Dona Rosa separou caixotes de laranjas. Ligue cada caixote à etiqueta certa.",
        dica: "Conte as laranjas de cada caixote devagar, tocando em cada uma com os olhos.",
        quantidades: [2, 5, 3],
        objeto: "laranja",
      },
      {
        cenario: "As galinhas do sítio botaram ovos, guardados em cartelas. Ligue cada cartela ao número de ovos.",
        dica: "Uma fileira cheia tem 5. Comece contando pelas fileiras cheias.",
        quantidades: [6, 4, 8, 1],
        objeto: "ovo",
      },
      {
        cenario: "No estacionamento da escola, cada fila tem uma quantidade de carros. Ligue cada fila ao número.",
        dica: "10 são duas fileiras cheias de 5. Depois conte o que sobrou.",
        quantidades: [9, 7, 10, 5],
        objeto: "carro",
      },
    ],
  },
  {
    id: "trilha-numerica",
    titulo: "Trilha numérica",
    instrucao: "Arraste cada número para a sua casa, do menor para o maior.",
    formato: "sequencia",
    conteudo: "Ordem crescente",
    cor: "lilas",
    jogo: "trilha",
    rodadas: [
      {
        cenario: "Os corredores da gincana receberam números. Coloque-os na ordem de largada.",
        dica: "Comece pelo menor número. Qual vem logo depois dele?",
        numeros: [1, 3, 5, 7, 9],
        tema: "corrida",
      },
      {
        cenario: "Os armários do vestiário vão de 2 em 2. Organize as plaquinhas.",
        dica: "Conte de 2 em 2: 2, 4, 6...",
        numeros: [2, 4, 6, 8, 10, 12],
        tema: "armarios",
      },
      {
        cenario: "As senhas da fila da padaria pulam de 5 em 5. Coloque em ordem.",
        dica: "Conte de 5 em 5: 5, 10, 15...",
        numeros: [5, 10, 15, 20, 25, 30],
        tema: "senhas",
      },
      {
        cenario: "O carteiro precisa entregar as cartas na ordem das casas da rua. Organize os números.",
        dica: "Compare primeiro as dezenas: os números com 1 na frente vêm antes dos com 2.",
        numeros: [13, 18, 21, 27, 34, 40],
        tema: "casas",
      },
    ],
  },
  {
    id: "monte-a-torre",
    titulo: "Monte a torre",
    instrucao: "Empilhe as caixas até a pilha encostar na prateleira.",
    formato: "montagem",
    conteudo: "Adição",
    cor: "pessego",
    jogo: "torre",
    rodadas: [
      {
        cenario: "No depósito do mercado, a pilha de caixas precisa ter 6 de altura para caber na prateleira.",
        dica: "Some as caixas que já estão na pilha e veja quanto falta para a marca.",
        alvo: 6,
        blocos: [1, 2, 3],
      },
      {
        cenario: "A biblioteca recebeu livros. Empilhe as caixas até a altura 10.",
        dica: "Tente usar a caixa maior primeiro e completar com as menores.",
        alvo: 10,
        blocos: [1, 2, 3, 5],
      },
      {
        cenario: "Para a festa junina, a torre de caixas deve chegar a 13.",
        dica: "13 = 10 + 3. Monte 10 primeiro e depois complete.",
        alvo: 13,
        blocos: [2, 3, 4, 5],
      },
    ],
  },
  {
    id: "mercadinho",
    titulo: "Mercadinho",
    instrucao: "Arraste notas e moedas para a bandeja do caixa e pague o valor exato.",
    formato: "manipulacao",
    conteudo: "Sistema monetário",
    cor: "azul",
    jogo: "dinheiro",
    rodadas: [
      {
        cenario: "No caixa do mercadinho, o suco de laranja deu R$ 5. Pague o valor exato.",
        dica: "Existe uma nota que vale exatamente 5 reais!",
        produto: "Suco de laranja",
        item: "suco",
        preco: 5,
        valores: [1, 2, 5],
      },
      {
        cenario: "O mercadinho tem seção de papelaria: o caderno custa R$ 8.",
        dica: "Comece pela nota de 5. Quanto falta para chegar a 8?",
        produto: "Caderno",
        item: "caderno",
        preco: 8,
        valores: [1, 2, 5],
      },
      {
        cenario: "No caixa, o álbum de figurinhas deu R$ 13. Pague sem precisar de troco.",
        dica: "Use a nota de 10 e complete os 3 que faltam.",
        produto: "Álbum de figurinhas",
        item: "album",
        preco: 13,
        valores: [1, 2, 5, 10],
      },
      {
        cenario: "Calor! O picolé do freezer do mercadinho custa R$ 7,50.",
        dica: "50 centavos é metade de 1 real. Junte 7 reais e uma moeda de 50 centavos.",
        produto: "Picolé",
        item: "picole",
        preco: 7.5,
        valores: [0.5, 1, 2, 5],
      },
      {
        cenario: "Ajude a Lu no caixa: os biscoitos custam R$ 7 e a cliente pagou com R$ 10. Quanto volta?",
        instrucao: "Pegue dinheiro da gaveta e coloque na bandeja até dar o troco.",
        dica: "Conte a partir do preço até chegar no que ela pagou: 7… 8, 9, 10. Quantos passos você deu?",
        produto: "Biscoitos",
        item: "biscoito",
        preco: 7,
        pagoCom: 10,
        valores: [1, 2],
      },
    ],
  },
  // ---------------------------------------------------------------- nível 2
  {
    id: "que-horas-sao",
    titulo: "Que horas são?",
    instrucao: "Gire os ponteiros do relógio arrastando com o dedo.",
    formato: "manipulacao",
    conteudo: "Horas e minutos",
    cor: "roxo",
    jogo: "relogio",
    rodadas: [
      {
        cenario: "A aula de natação começa às 3 horas. Ajuste o relógio para não se atrasar.",
        dica: "Em hora exata, o ponteiro grande aponta para o 12. O pequeno aponta para a hora.",
        hora: 3,
        minuto: 0,
      },
      {
        cenario: "O ônibus escolar passa às 7 e meia. Mostre esse horário.",
        dica: "Meia hora são 30 minutos: o ponteiro grande aponta para o 6.",
        hora: 7,
        minuto: 30,
      },
      {
        cenario: "O recreio começa às 9 e 15. Ajuste o relógio da sala.",
        dica: "Cada número vale 5 minutos para o ponteiro grande. 15 minutos fica no 3.",
        hora: 9,
        minuto: 15,
      },
      {
        cenario: "O jogo de futebol começa às 4 e 45 da tarde.",
        dica: "45 minutos: o ponteiro grande vai no 9. O pequeno fica entre o 4 e o 5.",
        hora: 4,
        minuto: 45,
      },
    ],
  },
  {
    id: "jarra-medidora",
    titulo: "Jarra medidora",
    instrucao: "Arraste o dedo para cima ou para baixo para encher até a medida.",
    formato: "completar",
    conteudo: "Medidas de capacidade",
    cor: "azul",
    jogo: "jarra",
    rodadas: [
      {
        cenario: "A receita de bolo pede 500 mL de leite. Encha a jarra de 1 litro até a medida.",
        dica: "1 litro tem 1000 mL. 500 mL é a metade da jarra.",
        capacidade: 1000,
        alvo: 500,
        passo: 100,
        recipiente: "jarra de 1 L",
        liquido: "leite",
      },
      {
        cenario: "Para fazer o suco, a embalagem manda usar 250 mL de água.",
        dica: "250 mL é um quarto da jarra: divida a jarra em 4 partes iguais.",
        capacidade: 1000,
        alvo: 250,
        passo: 50,
        recipiente: "jarra de 1 L",
        liquido: "suco",
      },
      {
        cenario: "Para a excursão, encha 3/4 da garrafa de 2 litros com água.",
        dica: "2 litros = 2000 mL. Divida em 4 partes de 500 mL e encha 3 delas.",
        capacidade: 2000,
        alvo: 1500,
        passo: 250,
        recipiente: "garrafa de 2 L",
        liquido: "agua",
      },
    ],
  },
  {
    id: "partes-do-todo",
    titulo: "Partes do todo",
    instrucao: "Passe o dedo sobre as partes para pintar a fração.",
    formato: "completar",
    conteudo: "Frações",
    cor: "roxo",
    jogo: "pizza",
    rodadas: [
      {
        cenario: "A Ana e o irmão dividiram uma pizza em 2 partes iguais. Pinte a parte da Ana.",
        dica: "Metade é 1 de 2 partes iguais.",
        numerador: 1,
        denominador: 2,
        tema: "pizza",
      },
      {
        cenario: "Uma barra de chocolate tem 4 pedaços. O Léo comeu 3. Pinte o que ele comeu.",
        dica: "O número de cima diz quantas partes pintar. O de baixo, em quantas a barra foi dividida.",
        numerador: 3,
        denominador: 4,
        forma: "barra",
        tema: "chocolate",
      },
      {
        cenario: "A torta de maçã foi cortada em 3 partes iguais e 2 já foram vendidas. Pinte as vendidas.",
        dica: "Pinte 2 das 3 partes.",
        numerador: 2,
        denominador: 3,
        tema: "torta",
      },
      {
        cenario: "A horta da escola tem 8 canteiros e 5 já foram plantados. Pinte os plantados.",
        dica: "Conte 5 partes, uma de cada vez.",
        numerador: 5,
        denominador: 8,
        forma: "barra",
        tema: "horta",
      },
    ],
  },
  {
    id: "votacao-da-turma",
    titulo: "Votação da turma",
    instrucao: "Conte os votos e puxe cada barra até a altura certa.",
    formato: "associacao-visual",
    conteudo: "Gráficos e tabelas",
    cor: "pessego",
    jogo: "grafico",
    rodadas: [
      {
        cenario: "A turma votou na fruta do lanche. Monte o gráfico com os votos.",
        dica: "Conte os risquinhos de cada fruta. Cada risquinho é 1 voto.",
        titulo: "Fruta preferida",
        categorias: [
          { nome: "Maçã", valor: 4 },
          { nome: "Banana", valor: 6 },
          { nome: "Uva", valor: 3 },
        ],
        maximo: 8,
      },
      {
        cenario: "Qual é o brinquedo favorito do recreio? Mostre no gráfico.",
        dica: "Um grupo de risquinhos com um traço atravessado vale 5.",
        titulo: "Brinquedo favorito",
        categorias: [
          { nome: "Bola", valor: 5 },
          { nome: "Corda", valor: 3 },
          { nome: "Pipa", valor: 7 },
          { nome: "Peteca", valor: 2 },
        ],
        maximo: 8,
      },
      {
        cenario: "A professora perguntou como cada aluno vem para a escola.",
        dica: "Conte primeiro os grupos de 5, depois os risquinhos soltos.",
        titulo: "Como venho para a escola",
        categorias: [
          { nome: "A pé", valor: 6 },
          { nome: "Ônibus", valor: 8 },
          { nome: "Carro", valor: 4 },
          { nome: "Bike", valor: 3 },
        ],
        maximo: 10,
      },
    ],
  },
  // ---------------------------------------------------------------- nível 3
  {
    id: "reta-numerica",
    titulo: "Reta numérica",
    instrucao: "Arraste o marcador até o lugar certo. Conte as marquinhas!",
    formato: "manipulacao",
    conteudo: "Números na reta",
    cor: "lilas",
    jogo: "reta",
    rodadas: [
      {
        cenario: "Na corrida de saco, a Bia já pulou 7 metros. Marque onde ela está.",
        dica: "Cada marquinha é 1 metro. Conte 7 a partir do zero.",
        min: 0,
        max: 10,
        passo: 1,
        alvo: 7,
        unidade: "m",
        tema: "corrida",
      },
      {
        cenario: "O lápis do Davi mede 13 centímetros na régua. Marque onde ele termina.",
        dica: "O 10 fica na marquinha maior do meio. Depois conte mais 3.",
        min: 0,
        max: 20,
        passo: 1,
        alvo: 13,
        unidade: "cm",
        tema: "regua",
      },
      {
        cenario: "A viagem até a praia tem 100 km. Já andamos 40 km. Onde está o carro?",
        dica: "Aqui cada marquinha vale 10 km. Conte de 10 em 10.",
        min: 0,
        max: 100,
        passo: 10,
        alvo: 40,
        unidade: "km",
        tema: "estrada",
      },
      {
        cenario: "A trilha do parque tem 1 km. Você já andou 3/4 dela. Marque onde você está.",
        dica: "A reta está dividida em 4 partes iguais. Ande 3 delas.",
        min: 0,
        max: 1,
        passo: 0.25,
        alvo: 0.75,
        rotulo: "3/4",
        unidade: "km",
        tema: "trilha",
      },
    ],
  },
  {
    id: "balanca-equilibrada",
    titulo: "Balança equilibrada",
    instrucao: "Arraste pesos para o prato da direita até a balança ficar reta.",
    formato: "manipulacao",
    conteudo: "Igualdade e adição",
    cor: "pessego",
    jogo: "balanca",
    rodadas: [
      {
        cenario:
          "Na quitanda, o freguês levou 5 kg de batatas e 3 kg de cebolas. Equilibre a balança para conferir o peso.",
        dica: "Do lado esquerdo há 5 + 3. Quanto isso dá?",
        esquerda: [5, 3],
        itens: ["Batatas", "Cebolas"],
        bandeja: [1, 2, 4, 6],
      },
      {
        cenario: "O carteiro precisa pesar dois pacotes: um de 7 kg e outro de 4 kg.",
        dica: "7 + 4 = 11. Que pesos juntos fazem 11?",
        esquerda: [7, 4],
        itens: ["Pacote", "Pacote"],
        bandeja: [2, 3, 5, 6, 1],
      },
      {
        cenario: "Na feira, uma caixa de melancias pesa 9 kg e outra 6 kg. Equilibre a balança.",
        dica: "Some o lado esquerdo e procure pesos que deem o mesmo total.",
        esquerda: [9, 6],
        itens: ["Melancias", "Melancias"],
        bandeja: [3, 4, 5, 7, 8],
      },
      {
        cenario:
          "Uma abóbora misteriosa está junto com um peso de 2 kg. Descubra quanto a abóbora pesa equilibrando a balança!",
        dica: "Coloque pesos até ficar reto. A abóbora pesa o total da direita menos 2.",
        esquerda: [2],
        misterio: 7,
        nomeMisterio: "Abóbora",
        bandeja: [1, 2, 3, 4, 5],
      },
    ],
  },
  {
    id: "caminho-do-entregador",
    titulo: "Caminho do entregador",
    instrucao: "Passe o dedo pelos quarteirões para traçar o caminho.",
    formato: "sequencia",
    conteudo: "Localização e direção",
    cor: "roxo",
    jogo: "caminho",
    rodadas: [
      {
        cenario: "Leve a pizza até a casa da vovó: siga 3 quarteirões para a direita e 2 para cima.",
        dica: "Primeiro ande para o lado da mão direita. Depois suba.",
        colunas: 5,
        linhas: 4,
        inicio: [0, 3],
        fim: [3, 1],
        origem: "Pizzaria",
        destino: "casa",
      },
      {
        cenario: "O carteiro está na agência. A escola fica 2 quarteirões para baixo e 4 para a direita.",
        dica: "Desça 2 quarteirões e depois ande 4 para a direita.",
        colunas: 5,
        linhas: 4,
        inicio: [0, 0],
        fim: [4, 2],
        origem: "Correio",
        destino: "escola",
      },
      {
        cenario: "Há obras na rua! Leve o lanche até o parque pelo caminho mais curto, desviando dos cones.",
        dica: "Procure um caminho sem voltar. Desvie das obras pelo lado onde há espaço.",
        colunas: 5,
        linhas: 5,
        inicio: [0, 4],
        fim: [4, 0],
        origem: "Lanchonete",
        destino: "parque",
        bloqueios: [
          [1, 3],
          [2, 2],
          [1, 1],
          [3, 1],
        ],
      },
    ],
  },
  // ---------------------------------------------------------------- nível 4
  {
    id: "construtor-de-cubos",
    titulo: "Construtor de cubos",
    instrucao: "Arraste para girar a cena e toque para colocar ou tirar cubos.",
    formato: "exploracao-3d",
    conteudo: "Volume",
    cor: "roxo",
    jogo: "cubos",
    rodadas: [
      {
        cenario: "Monte uma caixa de presente com 2 cubos de comprimento, 2 de largura e 1 de altura.",
        dica: "Faça uma camada de 2 por 2 no chão. Ela já tem a altura certa!",
        volume: 4,
        medidas: { comprimento: 2, largura: 2, altura: 1 },
      },
      {
        cenario: "Arrume os blocos de montar numa base de 3 por 2 para guardar na gaveta.",
        dica: "3 cubos numa fileira, e duas fileiras lado a lado.",
        volume: 6,
        medidas: { comprimento: 3, largura: 2, altura: 1 },
      },
      {
        cenario: "Monte um cubo mágico com 2 cubinhos em cada lado.",
        dica: "Faça uma camada de 2 por 2 e depois outra igual em cima.",
        volume: 8,
        medidas: { comprimento: 2, largura: 2, altura: 2 },
      },
      {
        cenario: "O caminhão de mudança leva 12 caixas iguais. Arrume todas num bloco retangular.",
        dica: "Pense em multiplicações que dão 12: 3 × 4, 2 × 6, 2 × 2 × 3...",
        volume: 12,
      },
    ],
  },
  {
    id: "explorador-de-solidos",
    titulo: "Explorador de sólidos",
    instrucao: "Gire o sólido e toque para marcar. Não esqueça dos escondidos!",
    formato: "exploracao-3d",
    conteudo: "Geometria espacial",
    cor: "azul",
    jogo: "solidos",
    rodadas: [
      {
        cenario: "O dado do jogo de tabuleiro é um cubo. Pinte todas as faces dele.",
        dica: "Um dado tem números de 1 a 6, um em cada face.",
        solido: "cubo",
        contar: "faces",
        dado: true,
      },
      {
        cenario: "O telhado da casinha do cachorro tem forma de pirâmide. Pinte todas as faces.",
        dica: "Não esqueça da base, a face de baixo!",
        solido: "piramide",
        contar: "faces",
      },
      {
        cenario: "A barraca de acampamento parece um prisma. Pinte todas as faces.",
        dica: "Há 2 triângulos (frente e fundo) e retângulos nos lados e embaixo.",
        solido: "prisma",
        contar: "faces",
      },
      {
        cenario: "A caixa de sapatos tem pontas nos cantos. Marque todos os vértices.",
        dica: "São 4 pontas em cima e 4 embaixo.",
        solido: "cubo",
        contar: "vertices",
      },
    ],
  },
  {
    id: "espelho-magico",
    titulo: "Espelho mágico",
    instrucao: "Pinte a metade direita para ficar igual ao reflexo da esquerda.",
    formato: "completar",
    conteudo: "Simetria",
    cor: "lilas",
    jogo: "simetria",
    rodadas: [
      {
        cenario: "A borboleta só tem uma asa pintada. Complete a outra asa para ela ficar simétrica.",
        dica: "Imagine um espelho na linha do meio: o que está colado na linha continua colado do outro lado.",
        esquerda: ["X..", "XX.", "XXX", "XX.", "X.."],
        tema: "borboleta",
      },
      {
        cenario: "A vovó está fazendo um tapete de crochê. Termine o desenho do outro lado.",
        dica: "Confira linha por linha, de cima para baixo.",
        esquerda: ["...X", "..XX", ".X.X", "XXXX"],
        tema: "tapete",
      },
      {
        cenario: "Complete a máscara de carnaval para os dois lados ficarem iguais.",
        dica: "Os olhos ficam à mesma distância da linha do meio.",
        esquerda: ["XXXX", "X..X", "XXXX", ".XXX"],
        tema: "mascara",
      },
    ],
  },
  // ---------------------------------------------------------------- nível 5
  {
    id: "planificacao-do-dado",
    titulo: "Planificação do dado",
    instrucao: "Escolha um molde e toque em Dobrar para ver se ele fecha.",
    formato: "exploracao-3d",
    conteudo: "Planificação de sólidos",
    cor: "roxo",
    jogo: "planificacao",
    rodadas: [
      {
        cenario: "A fábrica de dados recortou 3 moldes de papelão. Só um deles fecha um cubo perfeito. Qual?",
        dica: "Num cubo, cada face tem uma face oposta. Se duas faces caírem no mesmo lugar, o molde não serve.",
        modo: "escolher",
        opcoes: [
          [
            [0, 0],
            [1, 0],
            [2, 0],
            [0, 1],
            [1, 1],
            [2, 1],
          ],
          [
            [0, 0],
            [0, 1],
            [0, 2],
            [0, 3],
            [1, 2],
            [1, 3],
          ],
          [
            [1, 0],
            [0, 1],
            [1, 1],
            [2, 1],
            [1, 2],
            [1, 3],
          ],
        ],
        correta: 2,
      },
      {
        cenario: "Agora os moldes estão mais parecidos. Qual deles vira a caixa do dado?",
        dica: "Uma fileira de 5 quadrados nunca fecha: a 5ª face cai em cima da 1ª.",
        modo: "escolher",
        opcoes: [
          [
            [0, 0],
            [1, 0],
            [2, 0],
            [3, 0],
            [4, 0],
            [2, 1],
          ],
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [2, 1],
            [2, 2],
            [3, 2],
          ],
          [
            [0, 0],
            [1, 0],
            [2, 0],
            [3, 0],
            [1, 1],
            [2, 1],
          ],
        ],
        correta: 1,
      },
      {
        cenario: "Num dado de verdade, as faces opostas sempre somam 7. Complete os números do molde.",
        instrucao: "Toque nas faces vazias para escolher o número. Depois dobre para conferir.",
        dica: "O 1 fica de frente para o 6, o 2 para o 5 e o 3 para o 4. Dobre o molde para descobrir quem fica de frente para quem.",
        modo: "dado",
        rede: [
          [1, 0],
          [0, 1],
          [1, 1],
          [2, 1],
          [1, 2],
          [1, 3],
        ],
        fixos: { 0: 1, 1: 2, 2: 3 },
      },
      {
        cenario: "Este molde de dado tem outro formato. Complete os números para as faces opostas somarem 7.",
        instrucao: "Toque nas faces vazias para escolher o número. Depois dobre para conferir.",
        dica: "Comece pelo 1: dobre o molde e veja qual face fica de frente para ele. Ali vai o 6.",
        modo: "dado",
        rede: [
          [0, 0],
          [1, 0],
          [2, 0],
          [1, 1],
          [1, 2],
          [1, 3],
        ],
        fixos: { 0: 1, 3: 5 },
      },
    ],
  },
  {
    id: "cubinhos-escondidos",
    titulo: "Cubinhos escondidos",
    instrucao: "Gire, separe as camadas e conte. Alguns cubinhos estão escondidos!",
    formato: "exploracao-3d",
    conteudo: "Volume e multiplicação",
    cor: "pessego",
    jogo: "volume",
    rodadas: [
      {
        cenario: "O fardo de sucos do mercado vem embalado assim. Quantas caixinhas de suco tem o fardo?",
        dica: "Conte as caixinhas de uma camada e multiplique pelo número de camadas.",
        alturas: [
          [2, 2, 2],
          [2, 2, 2],
        ],
        pergunta: "total",
      },
      {
        cenario: "A arquibancada da quadra foi feita com blocos iguais. Quantos blocos foram usados?",
        dica: "Separe as camadas: a de baixo é a maior. Some as três camadas.",
        alturas: [
          [3, 2, 1],
          [3, 2, 1],
        ],
        pergunta: "total",
      },
      {
        cenario:
          "O cubo mágico gigante da feira de ciências está incompleto. Quantos cubinhos faltam para completar o cubo 3 × 3 × 3?",
        dica: "O cubo inteiro tem 3 × 3 × 3 = 27 cubinhos. Conte quantos já estão lá e tire de 27.",
        alturas: [
          [3, 3, 2],
          [3, 2, 1],
          [2, 1, 0],
        ],
        pergunta: "faltam",
        completo: { c: 3, l: 3, a: 3 },
      },
      {
        cenario: "Na caixa de presentes cabem 4 × 3 × 2 caixinhas. Algumas já foram guardadas. Quantas ainda cabem?",
        dica: "Primeiro calcule quantas cabem ao todo: 4 × 3 × 2. Depois tire as que já estão na caixa.",
        alturas: [
          [2, 2, 2, 1],
          [2, 1, 1, 0],
          [1, 1, 0, 0],
        ],
        pergunta: "faltam",
        completo: { c: 4, l: 3, a: 2 },
      },
    ],
  },
  {
    id: "ficha-dos-solidos",
    titulo: "Ficha dos sólidos",
    instrucao: "Gire o sólido e toque para marcar. Conte com cuidado: alguns estão escondidos!",
    formato: "exploracao-3d",
    conteudo: "Faces, vértices e arestas",
    cor: "azul",
    jogo: "solidos",
    rodadas: [
      {
        cenario: "A estrutura do brinquedo do parquinho é um cubo feito de canos. Marque cada cano (aresta).",
        dica: "Aresta é a linha onde duas faces se encontram. O cubo tem 4 em cima, 4 embaixo e 4 em pé.",
        solido: "cubo",
        contar: "arestas",
      },
      {
        cenario: "O lápis sextavado tem a forma de um prisma de base hexagonal. Marque todos os vértices.",
        dica: "Cada base tem 6 pontas. São duas bases.",
        solido: "prismaHexagonal",
        contar: "vertices",
      },
      {
        cenario: "O telhado do coreto da praça é uma pirâmide de base pentagonal. Marque todas as arestas.",
        dica: "São 5 arestas na base e mais 5 subindo até a ponta.",
        solido: "piramidePentagonal",
        contar: "arestas",
      },
      {
        cenario: "A caixa de presente tem forma de prisma hexagonal. Pinte todas as faces para embrulhar.",
        dica: "São 2 bases hexagonais e 6 faces retangulares nos lados.",
        solido: "prismaHexagonal",
        contar: "faces",
      },
    ],
  },
  // ---------------------------------------------------------------- nível 6
  {
    id: "dividir-em-partes",
    titulo: "Dividir em partes iguais",
    instrucao: "Dê um para cada até não dar mais. O que não dá para dividir igual é o resto.",
    formato: "manipulacao",
    conteudo: "Divisão e resto",
    cor: "roxo",
    jogo: "repartir",
    rodadas: [
      {
        cenario: "A Ana tem 12 figurinhas repetidas para dar a 3 amigos. Cada um precisa ganhar o mesmo tanto.",
        dica: "Use “Um para cada” várias vezes. Pare quando não der mais para todos.",
        total: 12,
        grupos: 3,
        item: "figurinha",
        quem: "amigos",
      },
      {
        cenario: "A doceira vai dividir 17 balas em 4 potes iguais para a festa. O que sobrar fica para ela.",
        dica: "17 não dá certinho em 4. Distribua e veja quantas sobram no meio.",
        total: 17,
        grupos: 4,
        item: "bala",
        quem: "potes",
      },
      {
        cenario: "A professora tem 26 lápis novos para 4 grupos da turma. Quantos cada grupo recebe e quantos sobram?",
        dica: "4 × 6 = 24. Quanto falta para 26?",
        total: 26,
        grupos: 4,
        item: "lapis",
        quem: "amigos",
      },
      {
        cenario: "Na merenda, 35 biscoitos serão divididos igualmente entre 6 crianças.",
        dica: "6 × 5 = 30 e 6 × 6 = 36. Qual cabe em 35?",
        total: 35,
        grupos: 6,
        item: "biscoito",
        quem: "amigos",
      },
    ],
  },
  {
    id: "cerca-da-horta",
    titulo: "Cerca da horta",
    instrucao: "Arraste o dedo no terreno para desenhar o canteiro. A cerca fica em volta.",
    formato: "montagem",
    conteudo: "Área e perímetro",
    cor: "azul",
    jogo: "area",
    rodadas: [
      {
        cenario: "A turma vai plantar alface. O canteiro precisa ter área 12 e a cerca (perímetro) 14 metros.",
        dica: "Área conta os quadradinhos de dentro; perímetro conta os lados de fora. Tente 3 por 4.",
        colunas: 8,
        linhas: 6,
        area: 12,
        perimetro: 14,
      },
      {
        cenario: "O canteiro de cenouras deve ser um quadrado com área 16.",
        dica: "Num quadrado, os lados são iguais. Que número vezes ele mesmo dá 16?",
        colunas: 8,
        linhas: 6,
        area: 16,
        perimetro: 16,
      },
      {
        cenario: "Só há 20 metros de cerca. Faça um canteiro com área 24 usando toda a cerca.",
        dica: "Perímetro 20 quer dizer que dois lados juntos somam 10. Quais dois números somam 10 e multiplicados dão 24?",
        colunas: 8,
        linhas: 7,
        area: 24,
        perimetro: 20,
      },
      {
        cenario: "Com 18 metros de cerca, faça a MAIOR horta possível.",
        dica: "Os dois lados somam 9. Compare 1 × 8, 2 × 7, 3 × 6 e 4 × 5: qual dá mais área?",
        colunas: 8,
        linhas: 7,
        perimetro: 18,
        maiorArea: true,
      },
    ],
  },
  {
    id: "gire-na-medida",
    titulo: "Gire na medida",
    instrucao: "Gire com o dedo até o ângulo pedido. Use as marcas do transferidor.",
    formato: "manipulacao",
    conteudo: "Ângulos e giros",
    cor: "pessego",
    jogo: "angulo",
    rodadas: [
      {
        cenario: "O robô aspirador está virado para a porta. Ele precisa virar um quarto de volta para a direita.",
        dica: "Um quarto de volta é um ângulo reto: 90 graus, como o canto de um caderno.",
        angulo: 90,
        tema: "robo",
      },
      {
        cenario: "A luz do farol precisa dar meia-volta para iluminar o barco que está atrás.",
        dica: "Meia-volta é metade de uma volta inteira (360°).",
        angulo: 180,
        tema: "farol",
      },
      {
        cenario: "Na trilha, a bússola indica para virar meio ângulo reto à direita.",
        dica: "Metade de 90° é 45°.",
        angulo: 45,
        tema: "bussola",
      },
      {
        cenario: "O robô precisa girar três quartos de volta para chegar à tomada.",
        dica: "Uma volta inteira tem 360°. Três quartos são 3 × 90°.",
        angulo: 270,
        tema: "robo",
      },
      {
        cenario: "O farol deve girar 135° para seguir o navio.",
        dica: "135° = 90° + 45°: um ângulo reto e mais meio.",
        angulo: 135,
        tema: "farol",
      },
    ],
  },
  // ---------------------------------------------------------------- nível 7
  {
    id: "termometro-maluco",
    titulo: "Termômetro maluco",
    instrucao: "Arraste o marcador até a temperatura certa. Abaixo do zero, os números são negativos.",
    formato: "manipulacao",
    conteudo: "Números negativos",
    cor: "azul",
    jogo: "reta",
    rodadas: [
      {
        cenario: "De manhã, a cidade na serra marcava 3 graus. À noite esfriou 5 graus. Que temperatura ficou?",
        dica: "Saia do 3 e ande 5 casas para a esquerda. Depois do zero, os números ganham o sinal de menos.",
        min: -10,
        max: 10,
        passo: 1,
        alvo: -2,
        rotulo: "−2",
        esconderAlvo: true,
        unidade: "°C",
        tema: "regua",
      },
      {
        cenario: "O freezer da sorveteria fica a −6 graus. Coloque o marcador nessa temperatura.",
        dica: "−6 fica seis marquinhas à esquerda do zero.",
        min: -10,
        max: 10,
        passo: 1,
        alvo: -6,
        rotulo: "−6",
        unidade: "°C",
        tema: "regua",
      },
      {
        cenario: "Estava −4 graus na madrugada. Até o meio-dia, esquentou 9 graus. Quanto marcou ao meio-dia?",
        dica: "De −4 até 0 são 4 graus. Faltam mais 5 depois do zero.",
        min: -10,
        max: 10,
        passo: 1,
        alvo: 5,
        rotulo: "+5",
        esconderAlvo: true,
        unidade: "°C",
        tema: "regua",
      },
      {
        cenario: "Num dia frio, a mínima foi −7 e a máxima foi 2. Marque a mínima no termômetro.",
        dica: "A mínima é a menor temperatura: a que está mais à esquerda.",
        min: -10,
        max: 10,
        passo: 1,
        alvo: -7,
        rotulo: "−7",
        unidade: "°C",
        tema: "regua",
      },
    ],
  },
  {
    id: "pizza-equivalente",
    titulo: "Pizza equivalente",
    instrucao: "A fração pedida está escrita de outro jeito. Pinte a mesma quantidade de pizza.",
    formato: "completar",
    conteudo: "Frações equivalentes",
    cor: "pessego",
    jogo: "pizza",
    rodadas: [
      {
        cenario: "A Bia comeu metade da pizza. Essa pizza foi cortada em 8 pedaços. Pinte o que ela comeu.",
        dica: "Metade de 8 pedaços é 4 pedaços: 1/2 = 4/8.",
        numerador: 4,
        denominador: 8,
        pedido: { numerador: 1, denominador: 2 },
        tema: "pizza",
      },
      {
        cenario: "O Davi pediu 3/4 da torta, mas ela foi cortada em 8 fatias. Pinte a parte dele.",
        dica: "Cada quarto da torta virou 2 fatias. Então 3 quartos são 3 × 2 fatias.",
        numerador: 6,
        denominador: 8,
        pedido: { numerador: 3, denominador: 4 },
        tema: "torta",
      },
      {
        cenario: "A receita usa 2/3 da barra de chocolate, que tem 6 quadradinhos. Pinte o que vai na receita.",
        dica: "Cada terço da barra são 2 quadradinhos. 2 terços são 2 × 2.",
        numerador: 4,
        denominador: 6,
        pedido: { numerador: 2, denominador: 3 },
        forma: "barra",
        tema: "chocolate",
      },
      {
        cenario: "A pizza grande tem 12 pedaços. A turma comeu 5/6 dela. Pinte o que foi comido.",
        dica: "12 pedaços divididos em 6 partes dão 2 pedaços por sexto. 5 sextos são 5 × 2.",
        numerador: 10,
        denominador: 12,
        pedido: { numerador: 5, denominador: 6 },
        tema: "pizza",
      },
    ],
  },
  {
    id: "promocao-da-loja",
    titulo: "Promoção da loja",
    instrucao: "A grade tem 100 quadradinhos: cada um é 1%. Pinte a porcentagem pedida.",
    formato: "completar",
    conteudo: "Porcentagem",
    cor: "roxo",
    jogo: "porcento",
    rodadas: [
      {
        cenario: "O cinema vendeu 30% dos ingressos da sessão. Pinte os ingressos vendidos.",
        dica: "30% quer dizer 30 de cada 100. Três fileiras de 10 completam 30.",
        alvo: 30,
        tema: "ingressos",
      },
      {
        cenario: "Um quarto da horta já foi plantado. Que porcentagem é essa? Pinte a parte plantada.",
        dica: "1/4 de 100 é 100 ÷ 4 = 25. Então 1/4 = 25%.",
        alvo: 25,
        pedido: "1/4",
        tema: "horta",
      },
      {
        cenario: "A bateria do tablet está em 0,6 da carga. Pinte quanto de bateria ainda tem.",
        dica: "0,6 é o mesmo que 6/10, ou 60 de cada 100: 60%.",
        alvo: 60,
        pedido: "0,6",
        tema: "bateria",
      },
      {
        cenario: "Dos 20 lugares do ônibus da excursão, 15 já estão ocupados. Pinte a porcentagem ocupada.",
        dica: "15 de 20 é o mesmo que 75 de 100 (multiplique os dois por 5).",
        alvo: 75,
        pedido: "15 de 20",
        tema: "ingressos",
      },
    ],
  },
  {
    id: "caca-ao-tesouro",
    titulo: "Caça ao tesouro",
    instrucao: "Ache o ponto: primeiro ande no eixo x (para o lado), depois no eixo y (para cima).",
    formato: "associacao-visual",
    conteudo: "Plano cartesiano",
    cor: "lilas",
    jogo: "plano",
    rodadas: [
      {
        cenario: "O mapa do pirata diz: o baú está no ponto (3, 2). Toque onde ele está escondido.",
        dica: "O primeiro número é o x: ande 3 para a direita. O segundo é o y: suba 2.",
        max: 6,
        alvo: [3, 2],
        tesouro: "bau",
      },
      {
        cenario: "A estrela caiu no ponto (5, 4). A árvore está em (1, 4). Ache a estrela.",
        dica: "A estrela está na mesma altura da árvore (y = 4), só que mais para a direita.",
        max: 6,
        alvo: [5, 4],
        marcados: [{ ponto: [1, 4], nome: "árvore" }],
        tesouro: "estrela",
      },
      {
        cenario: "A chave está em (0, 5). Cuidado: x = 0 quer dizer em cima do eixo vertical.",
        dica: "Não ande nada para o lado. Só suba 5.",
        max: 6,
        alvo: [0, 5],
        tesouro: "chave",
      },
      {
        cenario: "O tesouro está 2 casas à direita e 3 acima da pedra, que fica em (2, 1). Onde ele está?",
        dica: "Some no x e no y: (2 + 2, 1 + 3).",
        max: 6,
        alvo: [4, 4],
        marcados: [{ ponto: [2, 1], nome: "pedra" }],
        tesouro: "bau",
      },
    ],
  },
  // ---------------------------------------------------------------- nível 8
  {
    id: "maquina-misteriosa",
    titulo: "Máquina misteriosa",
    instrucao: "Gire os mostradores × e + e teste a máquina até todos os cartões darem certo.",
    formato: "montagem",
    conteudo: "Funções e padrões",
    cor: "roxo",
    jogo: "maquina",
    rodadas: [
      {
        cenario: "A máquina de sucos transforma laranjas em copos. Entrou 1 e saíram 3; entrou 2, saíram 5.",
        dica: "De um para o outro, a saída aumenta 2 quando a entrada aumenta 1. Então multiplica por 2. E depois?",
        pares: [
          [1, 3],
          [2, 5],
          [4, 9],
        ],
        mult: 2,
        soma: 1,
      },
      {
        cenario: "A máquina de figurinhas: cada pacote vira figurinhas. 1 pacote dá 5, 3 pacotes dão 15.",
        dica: "Aqui não precisa somar nada: é só multiplicar. Quantas figurinhas por pacote?",
        pares: [
          [1, 5],
          [3, 15],
          [6, 30],
        ],
        mult: 5,
        soma: 0,
      },
      {
        cenario: "No parque, cada volta no brinquedo custa fichas, mais uma entrada. 1 volta: 7 fichas. 2 voltas: 10.",
        dica: "A cada volta a mais, são 3 fichas a mais. Multiplique por 3 e veja quanto falta para chegar no 7.",
        pares: [
          [1, 7],
          [2, 10],
          [5, 19],
        ],
        mult: 3,
        soma: 4,
      },
      {
        cenario: "A máquina do robô: 2 vira 11, 3 vira 15, 5 vira 23. Descubra a regra.",
        dica: "De 2 para 3 a saída cresce 4. Multiplique por 4: 2 × 4 = 8. Quanto falta para 11?",
        pares: [
          [2, 11],
          [3, 15],
          [5, 23],
        ],
        mult: 4,
        soma: 3,
      },
    ],
  },
  {
    id: "sorteio-justo",
    titulo: "Sorteio justo",
    instrucao: "Coloque bolinhas no pote até a chance de tirar a cor pedida ficar certinha.",
    formato: "manipulacao",
    conteudo: "Probabilidade",
    cor: "pessego",
    jogo: "sorteio",
    rodadas: [
      {
        cenario: "No sorteio da gincana, o pote tem 4 bolinhas. A chance de sair roxa precisa ser 1 em 4.",
        dica: "1 em 4 quer dizer: das 4 bolinhas, só 1 é roxa.",
        total: 4,
        cor: "roxo",
        chance: [1, 4],
      },
      {
        cenario: "Agora o pote tem 6 bolinhas e metade da chance precisa ser de azul.",
        dica: "Metade de 6 é 3. Então 3 azuis e 3 de outra cor.",
        total: 6,
        cor: "azul",
        chance: [1, 2],
      },
      {
        cenario: "Com 8 bolinhas, a chance de tirar pêssego precisa ser 3 em 8.",
        dica: "Coloque exatamente 3 pêssegos. As outras 5 são de outras cores.",
        total: 8,
        cor: "pessego",
        chance: [3, 8],
      },
      {
        cenario: "O pote terá 10 bolinhas e a chance de sair roxa deve ser 2 em 5.",
        dica: "2 em 5 é o mesmo que 4 em 10. Multiplique os dois números por 2.",
        total: 10,
        cor: "roxo",
        chance: [2, 5],
      },
    ],
  },
  {
    id: "nivelando-torres",
    titulo: "Nivelando as torres",
    instrucao: "Arraste o livro de cima de uma pilha para outra até todas ficarem da mesma altura.",
    formato: "manipulacao",
    conteudo: "Média",
    cor: "azul",
    jogo: "media",
    rodadas: [
      {
        cenario: "Três amigos leram livros nas férias: 2, 4 e 6. Se todos tivessem lido o mesmo tanto, quanto seria?",
        dica: "Tire da pilha mais alta e coloque na mais baixa até ficarem iguais.",
        colunas: [2, 4, 6],
        unidade: "livros",
        nomes: ["Bia", "Davi", "Lia"],
      },
      {
        cenario: "Gols de quatro times no campeonato: 5, 1, 3 e 3. Qual a média de gols?",
        dica: "No total são 12 gols. Dividindo igual entre 4 times, quantos fica para cada?",
        colunas: [5, 1, 3, 3],
        unidade: "gols",
        nomes: ["Azul", "Verde", "Roxo", "Laranja"],
      },
      {
        cenario: "A turma juntou latinhas em cinco dias: 6, 2, 7, 1 e 4. Qual foi a média por dia?",
        dica: "Some tudo (20) e divida igual pelos 5 dias.",
        colunas: [6, 2, 7, 1, 4],
        unidade: "latinhas",
        nomes: ["Seg", "Ter", "Qua", "Qui", "Sex"],
      },
      {
        cenario: "Pontos de três jogadores: 8, 3 e 7. Qual é a média de pontos?",
        dica: "8 + 3 + 7 = 18. Dividindo por 3, cada um ficaria com quanto?",
        colunas: [8, 3, 7],
        unidade: "pontos",
        nomes: ["Ana", "Léo", "Mia"],
      },
    ],
  },
  {
    id: "calculadora-maluca",
    titulo: "Calculadora maluca",
    instrucao: "Aperte as teclas na ordem certa para a conta dar o resultado. Lembre: × e ÷ são feitos antes de + e −.",
    formato: "sequencia",
    conteudo: "Ordem das operações",
    cor: "lilas",
    jogo: "expressao",
    rodadas: [
      {
        cenario: "A calculadora quebrou e embaralhou as teclas. Monte uma conta que dê 14.",
        dica: "Tente 2 + 3 × 4: primeiro 3 × 4 = 12, depois + 2.",
        cartas: ["2", "+", "3", "×", "4"],
        alvo: 14,
      },
      {
        cenario: "Com as mesmas cartas, agora a conta precisa dar 11.",
        dica: "Troque quem é multiplicado: 2 × 4 = 8. Quanto falta para chegar em 11?",
        cartas: ["2", "+", "3", "×", "4"],
        alvo: 11,
      },
      {
        cenario: "Monte uma conta que dê 17 com estas cartas.",
        dica: "Multiplique os dois números maiores e depois some ou tire o outro.",
        cartas: ["5", "×", "4", "−", "3"],
        alvo: 17,
      },
      {
        cenario: "Desafio: use todas as cartas para chegar em 10.",
        dica: "A divisão também vem antes: 8 ÷ 2 = 4. Junte com o resto.",
        cartas: ["8", "÷", "2", "+", "6"],
        alvo: 10,
      },
    ],
  },
];

export function missaoPorId(id: string): Missao | undefined {
  return MISSOES.find((m) => m.id === id);
}

/** Resultado de uma jogada, no mesmo formato que alimenta os indicadores do professor. */
export interface ResultadoJogada {
  missaoId: string;
  formato: FormatoId;
  rodadas: number;
  acertosDePrimeira: number;
  tentativas: number;
  percentualConclusao: number;
  percentualAcerto: number;
  tempoSegundos: number;
  estrelas: 1 | 2 | 3;
  /** Quantas vezes o aluno pediu dica (dado útil para o professor, não pune). */
  dicas?: number;
  data: string;
}

export function calcularResultado(input: {
  /** Missão do mapa ou atividade do professor: só o id e o formato entram no resultado. */
  missao: Pick<Missao, "id" | "formato">;
  errosPorRodada: number[];
  tempoSegundos: number;
  dicas?: number;
}): ResultadoJogada {
  const rodadas = input.errosPorRodada.length;
  const acertosDePrimeira = input.errosPorRodada.filter((e) => e === 0).length;
  const erros = input.errosPorRodada.reduce((s, e) => s + e, 0);
  const percentualAcerto = rodadas === 0 ? 0 : Math.round((acertosDePrimeira / rodadas) * 100);
  const estrelas: 1 | 2 | 3 = percentualAcerto >= 90 ? 3 : percentualAcerto >= 60 ? 2 : 1;
  return {
    missaoId: input.missao.id,
    formato: input.missao.formato,
    rodadas,
    acertosDePrimeira,
    tentativas: rodadas + erros,
    percentualConclusao: 100,
    percentualAcerto,
    tempoSegundos: Math.round(input.tempoSegundos),
    estrelas,
    dicas: input.dicas ?? 0,
    data: dataLocal(),
  };
}

/** Data de hoje no fuso do aparelho, no formato YYYY-MM-DD. */
export function dataLocal(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${dia}`;
}

// Níveis = mapas do céu. Cada nível monta uma constelação (ver constelacoes.ts).

export interface Nivel {
  numero: number;
  titulo: string;
  descricao: string;
  /** Constelação montada neste mapa. */
  constelacao: string;
  missoes: string[];
}

export const NIVEIS: Nivel[] = [
  {
    numero: 1,
    titulo: "Primeiros passos",
    descricao: "Quantidades, ordem, adição e dinheiro.",
    constelacao: "orion",
    missoes: ["ligue-os-pares", "trilha-numerica", "monte-a-torre", "mercadinho"],
  },
  {
    numero: 2,
    titulo: "No dia a dia",
    descricao: "Horas, medidas, frações e gráficos.",
    constelacao: "escorpiao",
    missoes: ["que-horas-sao", "jarra-medidora", "partes-do-todo", "votacao-da-turma"],
  },
  {
    numero: 3,
    titulo: "Pensar e equilibrar",
    descricao: "Posição na reta, igualdade e caminhos.",
    constelacao: "cruzeiro-do-sul",
    missoes: ["reta-numerica", "balanca-equilibrada", "caminho-do-entregador"],
  },
  {
    numero: 4,
    titulo: "Espaço e formas",
    descricao: "Volume, sólidos em 3D e simetria.",
    constelacao: "cassiopeia",
    missoes: ["construtor-de-cubos", "explorador-de-solidos", "espelho-magico"],
  },
  {
    numero: 5,
    titulo: "Construir no espaço",
    descricao: "Planificações, volume em camadas e arestas dos sólidos.",
    constelacao: "pleiades",
    missoes: ["planificacao-do-dado", "cubinhos-escondidos", "ficha-dos-solidos"],
  },
  {
    numero: 6,
    titulo: "Desafios de mestre",
    descricao: "Divisão com resto, área e perímetro, ângulos e giros.",
    constelacao: "cao-maior",
    missoes: ["dividir-em-partes", "cerca-da-horta", "gire-na-medida"],
  },
  {
    numero: 7,
    titulo: "Além dos números",
    descricao: "Números negativos, frações equivalentes, porcentagem e plano cartesiano.",
    constelacao: "lira",
    missoes: ["termometro-maluco", "pizza-equivalente", "promocao-da-loja", "caca-ao-tesouro"],
  },
  {
    numero: 8,
    titulo: "Mestre dos números",
    descricao: "Funções, probabilidade, média e ordem das operações.",
    constelacao: "aguia",
    missoes: ["maquina-misteriosa", "sorteio-justo", "nivelando-torres", "calculadora-maluca"],
  },
];

export function nivelDaMissao(missaoId: string): Nivel | undefined {
  return NIVEIS.find((n) => n.missoes.includes(missaoId));
}

/** Missões concluídas = com pelo menos uma jogada registrada. */
type Concluidas = Record<string, unknown>;

export function nivelLiberado(numero: number, concluidas: Concluidas, liberarTodos = false): boolean {
  if (liberarTodos || numero <= 1) return true;
  const anterior = NIVEIS.find((n) => n.numero === numero - 1);
  return anterior ? anterior.missoes.every((id) => Boolean(concluidas[id])) : true;
}

/** Nível em que o aluno está agora (o primeiro liberado ainda incompleto). */
export function nivelAtual(concluidas: Concluidas, liberarTodos = false): Nivel {
  return (
    NIVEIS.find((n) => nivelLiberado(n.numero, concluidas, liberarTodos) && !n.missoes.every((id) => concluidas[id])) ??
    NIVEIS[NIVEIS.length - 1]!
  );
}

/** Próxima missão sugerida: a primeira não concluída de um nível liberado. */
export function proximaMissao(concluidas: Concluidas, liberarTodos = false): Missao | null {
  for (const n of NIVEIS) {
    if (!nivelLiberado(n.numero, concluidas, liberarTodos)) break;
    const id = n.missoes.find((m) => !concluidas[m]);
    if (id) return missaoPorId(id) ?? null;
  }
  return null;
}
