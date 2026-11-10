import type { FormatoId } from "@modolume/core";
import type { Ponta, ValorPonta } from "./pentagrama";

/**
 * Insights para o professor: dicas práticas a partir do pentagrama de
 * habilidades e dos números do aluno ou da turma. São regras fixas e
 * explicáveis (sem IA): cada dica diz em que dado se apoia. Servem para
 * modelar atividades e provas, não são diagnóstico.
 */

/** A partir desta quantidade de atividades num jeito, ele entra nas conclusões. */
export const MINIMO_JEITO = 3;

/** O que cada jeito de aprender sugere para ensinar e para avaliar. */
export const GUIA_JEITOS: Record<Ponta, { ensinar: string; avaliar: string; questao: string; formatos: FormatoId[] }> =
  {
    Visual: {
      questao: "com figuras, esquemas ou gráficos",
      ensinar: "Comece por imagens, esquemas, cores e gráficos, e peça para ligar a figura ao número antes da conta.",
      avaliar: "Questões com figuras e esquemas, associação de colunas e leitura de gráficos e tabelas.",
      formatos: ["associacao-visual"],
    },
    "Mãos na massa": {
      questao: "de situação do dia a dia, para montar ou desenhar",
      ensinar:
        "Use material concreto (blocos, tiras de papel, dinheiro de brinquedo) e deixe montar antes de formalizar.",
      avaliar: "Situações do dia a dia, montar ou desenhar a resposta, uso de malha quadriculada.",
      formatos: ["montagem", "manipulacao"],
    },
    Lógico: {
      questao: "de ordenar etapas ou completar sequências",
      ensinar: "Apresente o conteúdo em passos numerados e peça para ordenar etapas e completar sequências.",
      avaliar: "Ordenar as etapas de uma resolução, sequências e padrões, explicar o passo a passo.",
      formatos: ["sequencia"],
    },
    Simbólico: {
      questao: "objetivas ou de completar",
      ensinar: "Trabalhe direto com a escrita matemática: contas, expressões e tabelas para completar.",
      avaliar: "Questões objetivas, completar lacunas e cálculos diretos.",
      formatos: ["completar", "objetiva"],
    },
    Espacial: {
      questao: "com figuras geométricas, vistas ou planificações",
      ensinar: "Use formas, sólidos, planificações e giros; desenhar a situação ajuda a entender.",
      avaliar: "Questões com figuras geométricas, vistas, planificações e medidas na malha.",
      formatos: ["exploracao-3d"],
    },
  };

export interface Insight {
  tipo: "forte" | "ensinar" | "avaliar" | "ponte" | "ritmo" | "evolucao" | "dados";
  titulo: string;
  texto: string;
  /** Em que número a dica se apoia. */
  base?: string;
}

/** Jeitos com dados suficientes, do maior para o menor acerto. */
export function jeitosConfiaveis(pontas: ValorPonta[]) {
  return pontas.filter((p) => p.aluno !== null && p.atividades >= MINIMO_JEITO).sort((a, b) => b.aluno! - a.aluno!);
}

export function insightsDoAluno(
  pontas: ValorPonta[],
  numeros: { tentativas: number; conclusao: number; tendencia: number; nome: string },
): { forte: ValorPonta | null; fraco: ValorPonta | null; dicas: Insight[]; formatosSugeridos: FormatoId[] } {
  const ok = jeitosConfiaveis(pontas);
  const forte = ok[0] ?? null;
  const fraco = ok.length > 1 ? ok.at(-1)! : null;
  const primeiro = numeros.nome.split(" ")[0];
  const dicas: Insight[] = [];

  if (!forte) {
    dicas.push({
      tipo: "dados",
      titulo: "Ainda faltam dados",
      texto: `Ainda não há atividades suficientes em nenhum jeito de aprender para apontar o ponto forte de ${primeiro}. Varie os formatos nas próximas aulas.`,
    });
    return { forte, fraco, dicas, formatosSugeridos: [] };
  }

  const guia = GUIA_JEITOS[forte.jeito];
  dicas.push({
    tipo: "ensinar",
    titulo: "Para ensinar",
    texto: guia.ensinar,
    base: `${forte.aluno}% de acerto em ${forte.atividades} atividades do jeito ${forte.jeito.toLowerCase()}${forte.turma !== null ? ` (turma: ${forte.turma}%)` : ""}`,
  });
  dicas.push({
    tipo: "avaliar",
    titulo: "Para provas e atividades",
    texto: `${guia.avaliar} Começar a prova por questões desse tipo ajuda ${primeiro} a ganhar confiança.`,
  });
  if (fraco && fraco.aluno! < forte.aluno! - 5) {
    dicas.push({
      tipo: "ponte",
      titulo: "Ponte para a dificuldade",
      texto: `Em ${fraco.jeito.toLowerCase()} o acerto é menor. Apresente esses conteúdos primeiro pelo jeito ${forte.jeito.toLowerCase()} e só depois no formato de ${fraco.formatos.join(" e ").toLowerCase()}.`,
      base: `${fraco.aluno}% em ${fraco.jeito.toLowerCase()} contra ${forte.aluno}% em ${forte.jeito.toLowerCase()}`,
    });
  }
  if (numeros.tentativas >= 2.5 || numeros.conclusao < 75) {
    dicas.push({
      tipo: "ritmo",
      titulo: "Ritmo",
      texto:
        numeros.conclusao < 75
          ? "Prefira atividades e provas mais curtas, com menos itens por página, e confira o andamento no meio da tarefa."
          : "Divida as tarefas em partes menores e dê retorno a cada parte, antes de seguir.",
      base: `${String(numeros.tentativas).replace(".", ",")} tentativas por atividade · ${numeros.conclusao}% de conclusão`,
    });
  }
  return { forte, fraco, dicas, formatosSugeridos: guia.formatos };
}

/** Insights da turma: como os jeitos fortes se distribuem e o que isso sugere. */
export function insightsDaTurma(turma: ValorPonta[], alunos: { nome: string; forte: Ponta | null }[]): Insight[] {
  const dicas: Insight[] = [];
  const contagem = new Map<Ponta, number>();
  for (const a of alunos) if (a.forte) contagem.set(a.forte, (contagem.get(a.forte) ?? 0) + 1);
  const ordem = [...contagem.entries()].sort((a, b) => b[1] - a[1]);
  const total = alunos.length;
  const semDados = alunos.filter((a) => !a.forte).length;

  if (ordem[0]) {
    const [jeito, n] = ordem[0];
    dicas.push({
      tipo: "forte",
      titulo: `${n} de ${total} alunos aprendem melhor pelo jeito ${jeito.toLowerCase()}`,
      texto: `Nas provas da turma, inclua questões desse tipo (${GUIA_JEITOS[jeito].avaliar.charAt(0).toLowerCase()}${GUIA_JEITOS[jeito].avaliar.slice(1, -1)}).`,
    });
  }
  if (ordem.length > 1) {
    dicas.push({
      tipo: "avaliar",
      titulo: "Provas com formatos variados",
      texto: `A turma não aprende toda do mesmo jeito: ${ordem.map(([j, n]) => `${n} ${j.toLowerCase()}`).join(", ")}. Misture tipos de questão para que cada aluno encontre o seu.`,
    });
  }
  // aqui o pentagrama é o da turma: "aluno" é a média da turma e "turma" a média de todas as turmas
  const fracos = turma.filter((p) => p.aluno !== null).sort((a, b) => a.aluno! - b.aluno!);
  if (fracos[0]) {
    dicas.push({
      tipo: "ponte",
      titulo: `Reforçar o jeito ${fracos[0].jeito.toLowerCase()}`,
      texto: `É onde a turma tem menos acerto. ${GUIA_JEITOS[fracos[0].jeito].ensinar}`,
      base: `${fracos[0].aluno}% de acerto médio da turma${fracos[0].turma !== null ? ` (todas as turmas: ${fracos[0].turma}%)` : ""}`,
    });
  }
  if (semDados > 0)
    dicas.push({
      tipo: "dados",
      titulo: `${semDados} ${semDados === 1 ? "aluno ainda sem" : "alunos ainda sem"} ponto forte definido`,
      texto: "Faltam atividades em formatos variados para concluir. Varie os formatos nas próximas aulas.",
    });
  return dicas;
}

/** Cor de cada jeito (paleta validada para daltonismo; sempre acompanhada do nome). */
export const COR_JEITO: Record<Ponta, string> = {
  Visual: "#7B61FF",
  "Mãos na massa": "#D9773E",
  Lógico: "#2E86C1",
  Simbólico: "#3B9E6E",
  Espacial: "#C2459A",
};

/**
 * Composição sugerida para uma prova da turma: cada jeito com dados ganha ao
 * menos uma questão (para ninguém ficar sem um tipo que funcione para si) e o
 * restante é dividido pela quantidade de alunos que aprendem melhor de cada
 * jeito (maiores restos).
 */
export function provaSugerida(
  pontas: { jeito: Ponta; aluno: number | null }[],
  alunos: { forte: Ponta | null }[],
  total = 10,
) {
  const jeitos = pontas.filter((p) => p.aluno !== null).map((p) => p.jeito);
  if (jeitos.length === 0) return [];
  const base = Math.min(1, Math.floor(total / jeitos.length));
  const sobra = total - base * jeitos.length;
  const contagem = Object.fromEntries(jeitos.map((j) => [j, alunos.filter((a) => a.forte === j).length])) as Record<
    Ponta,
    number
  >;
  const soma = Object.values(contagem).reduce((a, b) => a + b, 0) || 1;
  const cotas = jeitos.map((j) => {
    const exata = (contagem[j] / soma) * sobra;
    return { jeito: j, questoes: base + Math.floor(exata), resto: exata % 1, alunos: contagem[j] };
  });
  let faltam = total - cotas.reduce((a, c) => a + c.questoes, 0);
  for (const c of [...cotas].sort((a, b) => b.resto - a.resto)) {
    if (faltam <= 0) break;
    c.questoes += 1;
    faltam -= 1;
  }
  return cotas
    .filter((c) => c.questoes > 0)
    .sort((a, b) => b.questoes - a.questoes)
    .map(({ jeito, questoes, alunos }) => ({ jeito, questoes, alunos, tipo: GUIA_JEITOS[jeito].questao }));
}
