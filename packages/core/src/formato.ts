/**
 * Catálogo de formatos de atividade trabalhados pela instituição.
 *
 * Os formatos do MVP foram definidos na fase de descoberta com professores.
 * Novos formatos entram aqui sem migração de banco — o conteúdo de cada
 * atividade fica em campo JSON livre (ver `Atividade.conteudo`).
 */

export const FORMATOS_ATIVIDADE = [
  {
    id: "associacao-visual",
    rotulo: "Associação visual",
    descricao: "Ligar imagens, símbolos ou cores a conceitos correspondentes.",
    interacao: "arrastar-e-ligar",
  },
  {
    id: "montagem",
    rotulo: "Montagem de elementos",
    descricao: "Compor uma resposta juntando peças, blocos ou etapas.",
    interacao: "arrastar-e-soltar",
  },
  {
    id: "sequencia",
    rotulo: "Sequência / ordenação",
    descricao: "Colocar itens na ordem correta (temporal, lógica ou numérica).",
    interacao: "reordenar",
  },
  {
    id: "objetiva",
    rotulo: "Questão objetiva",
    descricao: "Escolher uma alternativa entre opções pré-definidas.",
    interacao: "selecao-unica",
  },
  {
    id: "completar",
    rotulo: "Completar lacunas",
    descricao: "Preencher espaços em um texto, expressão ou tabela.",
    interacao: "entrada-de-texto",
  },
  {
    id: "manipulacao",
    rotulo: "Manipulação",
    descricao: "Arrastar, posicionar e equilibrar objetos até chegar à resposta.",
    interacao: "arrastar-e-posicionar",
  },
  {
    id: "exploracao-3d",
    rotulo: "Exploração 3D",
    descricao: "Girar, construir e marcar objetos em três dimensões.",
    interacao: "manipulacao-espacial",
  },
] as const;

export type FormatoId = (typeof FORMATOS_ATIVIDADE)[number]["id"];

export const FORMATO_IDS = [
  "associacao-visual",
  "montagem",
  "sequencia",
  "objetiva",
  "completar",
  "manipulacao",
  "exploracao-3d",
] as const satisfies readonly FormatoId[];

export function formatoPorId(id: FormatoId) {
  const formato = FORMATOS_ATIVIDADE.find((f) => f.id === id);
  if (!formato) throw new Error(`Formato de atividade desconhecido: ${id}`);
  return formato;
}

export function rotuloFormato(id: FormatoId): string {
  return formatoPorId(id).rotulo;
}
