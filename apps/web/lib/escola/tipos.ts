import type { PapelEquipe } from "@/lib/painel/sessao";
import type { Segmento } from "@modolume/core";

/** Respostas da API para as áreas do administrador e da coordenação. */

export interface Registro {
  id: string;
  usuarioId: string | null;
  usuarioNome: string | null;
  papel: string | null;
  acao: string;
  alvoTipo: string | null;
  alvoId: string | null;
  detalhe: string | null;
  criadoEm: string;
}

export interface ResumoAdmin {
  instituicao: { id: string; nome: string };
  professores: number;
  coordenacao: number;
  administradores: number;
  desativados: number;
  turmas: number;
  alunos: number;
  registrosRecentes: Registro[];
}

export interface Pessoa {
  id: string;
  nome: string;
  email: string;
  papel: PapelEquipe;
  disciplina: string | null;
  materiaId: string | null;
  segmento: Segmento | null;
  ativo: boolean;
  senhaProvisoria: boolean;
  ultimoAcesso: string | null;
  criadoEm: string;
  turmas: { id: string; nome: string }[];
  eu: boolean;
}

export interface Materia {
  id: string;
  nome: string;
  _count: { professores: number };
}

export interface TurmaAdmin {
  id: string;
  nome: string;
  codigo: string;
  serie: string;
  segmento: Segmento | null;
  periodo: string;
  anoLetivo: number;
  ativa: boolean;
  alunos: number;
  professores: { id: string; nome: string }[];
}

export interface AlunoAdmin {
  id: string;
  nome: string;
  matricula: string;
  turma: { id: string; nome: string };
  ativo: boolean;
  codigoAcesso: string;
  pinCriado: boolean;
  ultimoAcesso: string | null;
}

export interface PaginaRegistros {
  total: number;
  pagina: number;
  porPagina: number;
  registros: Registro[];
}

export interface PorFormato {
  formato: string;
  rotulo: string;
  acertoMedio: number;
  amostra: number;
}

export interface TurmaCoordenacao {
  id: string;
  nome: string;
  serie: string;
  segmento: Segmento | null;
  periodo: string;
  professores: { id: string; nome: string; disciplina: string | null }[];
  alunos: number;
  alunosAtivos7d: number;
  participacao: number;
  jogadas: number;
  acertoMedio: number | null;
  conclusaoMedia: number | null;
  alunosAtencao: number;
  semJogar: number;
  porFormato: PorFormato[];
}

export interface VisaoCoordenacao {
  instituicao: { id: string; nome: string };
  segmento: Segmento | null;
  janelaDias: number;
  escola: {
    turmas: number;
    alunos: number;
    professores: number;
    jogadas: number;
    acertoMedio: number | null;
    participacao: number | null;
    alunosAtencao: number;
    turmasSemProfessor: number;
    porFormato: PorFormato[];
  };
  turmas: TurmaCoordenacao[];
  professores: { id: string; nome: string; disciplina: string | null; turmas: string[] }[];
}

export interface DetalheTurmaCoordenacao {
  id: string;
  nome: string;
  serie: string;
  periodo: string;
  anoLetivo: number;
  janelaDias: number;
  professores: { id: string; nome: string; disciplina: string | null }[];
  acertoMedio: number | null;
  conclusaoMedia: number | null;
  porFormato: PorFormato[];
  semanas: { inicio: string; acertoMedio: number | null; jogadas: number }[];
  alunos: {
    id: string;
    nome: string;
    avatarSvg: string | null;
    jogadas: number;
    acertoMedio: number | null;
    atencao: boolean;
    ultimaJogada: string | null;
    ultimoAcesso: string | null;
  }[];
}

export interface AlunoCoordenacao {
  id: string;
  nome: string;
  matricula: string;
  turma: { id: string; nome: string };
  ativo: boolean;
  avatarSvg: string | null;
  codigoAcesso: string;
  pinCriado: boolean;
  ultimoAcesso: string | null;
  totais: { jogadas: number; acertoMedio: number | null; conclusaoMedia: number | null; dicas: number };
  porFormato: PorFormato[];
  recentes: {
    id: string;
    titulo: string;
    origem: string;
    formato: string;
    acerto: number;
    tentativas: number;
    dicas: number;
    tempoSegundos: number;
    data: string;
  }[];
}

/** Ações do registro em português, para a tela. */
export const ACOES: Record<string, string> = {
  login: "Entrou no painel",
  "login.falhou": "Tentativa de entrada recusada",
  "senha.trocada": "Trocou a própria senha",
  "usuario.criado": "Cadastrou pessoa da equipe",
  "usuario.editado": "Editou dados de pessoa",
  "usuario.papel": "Mudou o papel (permissões)",
  "usuario.ativado": "Reativou acesso",
  "usuario.desativado": "Desativou acesso",
  "usuario.senha_redefinida": "Criou senha provisória",
  "materia.criada": "Cadastrou matéria",
  "turma.criada": "Criou turma",
  "turma.editada": "Editou turma",
  "turma.encerrada": "Encerrou turma",
  "turma.reaberta": "Reabriu turma",
  "turma.vinculo": "Vinculou professor à turma",
  "turma.desvinculo": "Tirou professor da turma",
  "aluno.criado": "Cadastrou aluno",
  "aluno.editado": "Editou aluno",
  "aluno.trocou_turma": "Trocou aluno de turma",
  "aluno.ativado": "Reativou aluno",
  "aluno.desativado": "Desativou aluno",
  "aluno.pin_zerado": "Zerou o PIN do aluno",
  "aluno.novo_codigo": "Gerou novo código do aluno",
  "atividade.criada": "Criou atividade",
  "atividade.enviada": "Enviou atividade ao app",
  "atividade.recolhida": "Voltou atividade para rascunho",
  "atividade.excluida": "Excluiu atividade",
  "plano.criado": "Criou plano de aula",
  "plano.excluido": "Excluiu plano de aula",
};

/** Grupos para o filtro do registro (o prefixo da ação). */
export const GRUPOS_DE_ACAO = [
  { valor: "", rotulo: "Todas as ações" },
  { valor: "login", rotulo: "Entradas no painel" },
  { valor: "usuario", rotulo: "Equipe e permissões" },
  { valor: "materia", rotulo: "Matérias" },
  { valor: "turma", rotulo: "Turmas e vínculos" },
  { valor: "aluno", rotulo: "Alunos e acesso ao app" },
  { valor: "atividade", rotulo: "Atividades" },
  { valor: "plano", rotulo: "Planos de aula" },
  { valor: "senha", rotulo: "Senhas" },
];

export const OPCOES_PAPEL = [
  { valor: "professor", rotulo: "Professor" },
  { valor: "coordenacao", rotulo: "Coordenação" },
  { valor: "admin", rotulo: "Administrador" },
];

export const OPCOES_PERIODO = [
  { valor: "manhã", rotulo: "Manhã" },
  { valor: "tarde", rotulo: "Tarde" },
  { valor: "integral", rotulo: "Integral" },
];
