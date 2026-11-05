/**
 * Soluções do Modolume para a página inicial, conforme a "Proposta Comercial
 * Modolume". A página não mostra preços: a escola pede uma demonstração ou fala
 * com a equipe de vendas, que monta a proposta (assinatura ou compra).
 */

export interface Solucao {
  id: "app" | "painel" | "completo";
  nome: string;
  /** Para quem é, em uma frase. */
  paraQuem: string;
  inclui: string[];
  destaque?: boolean;
}

export const SOLUCOES: Solucao[] = [
  {
    id: "app",
    nome: "Aplicativo do aluno",
    paraQuem: "Para a escola que quer os alunos praticando Matemática no celular (Android).",
    inclui: [
      "Missões e mini-jogos em 7 formatos de atividade",
      "Gamificação com constelações, desafio do dia e mascote",
      "Acessibilidade: texto, voz, contraste e animações",
      "Registro do progresso e sincronização",
      "Publicação na Google Play",
    ],
  },
  {
    id: "painel",
    nome: "Painel do professor",
    paraQuem: "Para a escola que quer organizar turmas e aulas na web.",
    inclui: [
      "Turmas e indicadores de aprendizagem",
      "Planejamento de aulas com a BNCC",
      "Criação de atividades",
      "Acesso do professor pelo navegador",
    ],
  },
  {
    id: "completo",
    nome: "Pacote completo",
    paraQuem: "App e painel ligados: o professor envia, o aluno joga e o resultado chega ao painel.",
    inclui: [
      "Tudo do Aplicativo do aluno e do Painel do professor",
      "Atividades do professor direto no app da turma",
      "Resultados de cada aluno no painel, por formato",
      "Mesma API e mesmo banco, sem infraestrutura duplicada",
    ],
    destaque: true,
  },
];

/** Serviços opcionais, combinados na proposta. */
export const SERVICOS_ADICIONAIS = [
  { nome: "Treinamento da equipe", detalhe: "Sessões remotas para professores, do app, do painel ou dos dois." },
  { nome: "Suporte depois da compra", detalhe: "Para a escola que comprou e hospeda por conta própria." },
  { nome: "Versão para iPhone", detalhe: "Publicação na App Store, opcional." },
];

/** Contato comercial. Trocar pelo e-mail oficial quando existir. */
export const CONTATO_EMAIL = "contato@modolume.com.br";
