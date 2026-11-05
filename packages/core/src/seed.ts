import { FORMATO_IDS, type FormatoId } from "./formats";
import type {
  Aluno,
  Aplicacao,
  Atividade,
  Instituicao,
  ObjetivoPedagogico,
  Professor,
  DadosModolume,
  Resultado,
  Turma,
} from "./types";

/**
 * Dados de exemplo para a demonstração do painel do professor.
 *
 * NÃO são dados reais de alunos. São gerados de forma determinística
 * (mesma saída a cada execução) para que a demo conte sempre a mesma história:
 * alguns alunos rendem mais em formatos visuais, outros em questões objetivas,
 * e há evolução ao longo de ~4 meses.
 */

// --- gerador pseudoaleatório determinístico (mulberry32) ---
function rng(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = rng(20260908);
const entre = (min: number, max: number) => min + rand() * (max - min);
const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));
const round = (n: number) => Math.round(n);

const instituicao: Instituicao = {
  id: "inst-demo",
  nome: "Escola Demonstração",
  contato: "coordenacao@escola.example",
};

const professor: Professor = {
  id: "prof-1",
  instituicaoId: instituicao.id,
  nome: "Prof.ª Marina Alves",
  email: "marina.alves@escola.example",
  disciplina: "Matemática",
};

const turmas: Turma[] = [
  { id: "turma-6a", professorId: professor.id, nome: "6º Ano A", serie: "6º ano", periodo: "manhã" },
  { id: "turma-6b", professorId: professor.id, nome: "6º Ano B", serie: "6º ano", periodo: "tarde" },
];

const nomes6A = [
  "Ana Beatriz Rocha",
  "Bernardo Lima",
  "Caio Mendes",
  "Duda Nascimento",
  "Enzo Ferreira",
  "Helena Prado",
  "Igor Santana",
  "Júlia Correia",
  "Lucas Almeida",
  "Manuela Dias",
  "Nicolas Barros",
  "Sophia Ramos",
];
const nomes6B = [
  "Arthur Teixeira",
  "Bianca Moraes",
  "Davi Cardoso",
  "Elisa Fonseca",
  "Gabriel Nunes",
  "Isadora Pires",
  "João Pedro Cunha",
  "Laura Vieira",
  "Miguel Antunes",
  "Rafaela Gomes",
  "Théo Batista",
  "Valentina Reis",
];

/** Perfil oculto de cada aluno: em quais formatos rende mais (só para gerar dados plausíveis). */
type Perfil = { forte: FormatoId[]; baseline: number; ganhoMensal: number };

const alunos: Aluno[] = [];
const perfis = new Map<string, Perfil>();

function criarAlunos(turmaId: string, nomes: string[], offset: number) {
  nomes.forEach((nome, i) => {
    const id = `${turmaId}-al${i + 1}`;
    alunos.push({ id, turmaId, nome, codigo: String(offset + i + 1).padStart(5, "0") });
    // distribui perfis: ~40% visual, ~30% objetiva, ~30% equilibrado
    const dado = rand();
    let forte: FormatoId[];
    if (dado < 0.4) forte = ["associacao-visual", "montagem"];
    else if (dado < 0.7) forte = ["objetiva", "completar"];
    else forte = ["sequencia"];
    perfis.set(id, {
      forte,
      baseline: entre(48, 72),
      ganhoMensal: entre(1.5, 5),
    });
  });
}
criarAlunos("turma-6a", nomes6A, 0);
criarAlunos("turma-6b", nomes6B, 100);

// --- atividades (uma por formato x alguns conteúdos) ---
const conteudosMat = [
  "Frações equivalentes",
  "Números decimais",
  "Múltiplos e divisores",
  "Perímetro e área",
  "Ângulos",
  "Sequências numéricas",
  "Porcentagem simples",
  "Operações com naturais",
];

const atividades: Atividade[] = [];
let ativN = 0;
for (const conteudo of conteudosMat) {
  // cada conteúdo é trabalhado em 2 formatos diferentes
  const formatosDoConteudo = pick(FORMATO_IDS, 2);
  for (const formato of formatosDoConteudo) {
    ativN += 1;
    atividades.push({
      id: `ativ-${ativN}`,
      professorId: professor.id,
      titulo: `${conteudo} — ${rotuloCurto(formato)}`,
      disciplina: "Matemática",
      formato,
      objetivo: `Consolidar ${conteudo.toLowerCase()} com o 6º ano.`,
      conteudo: { tema: conteudo, itens: round(entre(5, 10)) },
      criadaEm: "2026-04-15",
    });
  }
}

// --- aplicações e resultados ao longo de 4 meses ---
const meses: { data: string; indice: number }[] = [
  { data: "2026-05-12", indice: 0 },
  { data: "2026-06-09", indice: 1 },
  { data: "2026-07-14", indice: 2 },
  { data: "2026-08-11", indice: 3 },
];

const aplicacoes: Aplicacao[] = [];
const resultados: Resultado[] = [];
let aplicN = 0;
let resN = 0;

for (const mes of meses) {
  // a cada mês, ~metade das atividades é aplicada, em ambas as turmas
  const doMes = pick(atividades, Math.ceil(atividades.length / 2));
  for (const atividade of doMes) {
    for (const turma of turmas) {
      aplicN += 1;
      const aplicacao: Aplicacao = {
        id: `apl-${aplicN}`,
        atividadeId: atividade.id,
        turmaId: turma.id,
        data: mes.data,
      };
      aplicacoes.push(aplicacao);

      for (const aluno of alunos.filter((a) => a.turmaId === turma.id)) {
        const perfil = perfis.get(aluno.id)!;
        const afinidade = perfil.forte.includes(atividade.formato) ? entre(10, 20) : entre(-10, 2);
        const tendencia = perfil.ganhoMensal * mes.indice;
        const ruido = entre(-8, 8);
        const acerto = clamp(perfil.baseline + afinidade + tendencia + ruido);
        const conclusao = clamp(acerto + entre(5, 25));
        const tentativas = acerto > 75 ? 1 : acerto > 55 ? 2 : round(entre(2, 4));
        const tempo = round(entre(240, 900) * (perfil.forte.includes(atividade.formato) ? 0.8 : 1.15));
        resN += 1;
        resultados.push({
          id: `res-${resN}`,
          aplicacaoId: aplicacao.id,
          alunoId: aluno.id,
          tentativas,
          percentualConclusao: round(conclusao),
          percentualAcerto: round(acerto),
          tempoSegundos: tempo,
        });
      }
    }
  }
}

// --- objetivos pedagógicos (gamificação leve) ---
const objetivos: ObjetivoPedagogico[] = [
  {
    id: "obj-1",
    professorId: professor.id,
    turmaId: "turma-6a",
    descricao: "Turma 6ºA com ≥ 70% de acerto médio em frações",
    meta: "Acerto médio ≥ 70% até setembro",
    status: "em andamento",
    progresso: 64,
  },
  {
    id: "obj-2",
    professorId: professor.id,
    descricao: "Reduzir número médio de tentativas por atividade",
    meta: "Média ≤ 1,8 tentativas",
    status: "em andamento",
    progresso: 45,
  },
  {
    id: "obj-3",
    professorId: professor.id,
    turmaId: "turma-6b",
    descricao: "Todos os alunos do 6ºB com ≥ 1 atividade concluída por mês",
    meta: "100% de participação mensal",
    status: "alcançado",
    progresso: 100,
  },
  {
    id: "obj-4",
    professorId: professor.id,
    descricao: "Mapear formato de atividade mais eficaz por aluno",
    meta: "Perfil traçado para 100% da turma",
    status: "não iniciado",
    progresso: 0,
  },
];

function pick<T>(arr: readonly T[], n: number): T[] {
  const copia = [...arr];
  const saida: T[] = [];
  for (let i = 0; i < n && copia.length > 0; i += 1) {
    const idx = Math.floor(rand() * copia.length);
    saida.push(copia.splice(idx, 1)[0]!);
  }
  return saida;
}
function rotuloCurto(f: FormatoId): string {
  const map: Record<FormatoId, string> = {
    "associacao-visual": "Associação",
    montagem: "Montagem",
    sequencia: "Sequência",
    objetiva: "Objetiva",
    completar: "Lacunas",
    manipulacao: "Manipulação",
    "exploracao-3d": "3D",
  };
  return map[f];
}

export function criarSeed(): DadosModolume {
  return {
    instituicoes: [instituicao],
    professores: [professor],
    turmas,
    alunos,
    atividades,
    aplicacoes,
    resultados,
    objetivos,
  };
}
