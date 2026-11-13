# PRD do requisito MOD-ATI-006

**Data registrada no PRD de origem:** 2026-11-11. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

A atividade fica associada ao seu formato e, quando informada, a uma habilidade da BNCC.

Origem: [PRD-14 — Atividades do professor](../../02-modulos/PRD-14%20%E2%80%94%20Atividades%20do%20professor.md), seção 5. Prioridade **I**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-ATI-01 Como **professor**, quero criar uma atividade com minhas questões, para trabalhar o conteúdo do jeito da minha turma.

- **HU-ATI-01** CA-01: O editor tem três etapas (Atividade, Questões e Envio) e mostra em qual o professor está.
- **HU-ATI-01** CA-02: Dada uma questão objetiva sem alternativa correta marcada, então o editor mostra "Marque a alternativa correta." e não deixa enviar.
- **HU-ATI-01** CA-03: Dada uma questão de completar, então as respostas são as palavras entre colchetes (RN-26).
- **HU-ATI-01** CA-04: Toda atividade exige título com pelo menos 3 caracteres ("Dê um título à atividade."); a habilidade da BNCC é opcional.
- **HU-ATI-01** CA-05: Uma atividade com questões próprias exige ao menos uma questão ("Adicione ao menos uma questão.").
- **HU-ATI-01** CA-06: O professor pode salvar um rascunho sem a orientação. Ao tentar publicar, o painel indica a primeira questão que precisa de feedback.
- **HU-ATI-01** CA-07: Quando o aluno confere uma resposta completa e errada, o app mostra a orientação daquela questão. Uma tentativa incompleta pede os dados que faltam. Ao acertar, o aluno vê o Lilo no rodapé e pode avançar ou ver o resultado.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [packages/core/src/atividades-professor.ts](../../../packages/core/src/atividades-professor.ts)
- [apps/web/app/professor/(painel)/atividades](../../../apps/web/app/professor/(painel)/atividades)
- [apps/api/src/professor.ts](../../../apps/api/src/professor.ts)
- [apps/api/src/aluno.ts](../../../apps/api/src/aluno.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
