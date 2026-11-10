# MOD-MIS-013

Exibir o prazo das atividades publicadas pelo professor.

Origem: [PRD-04 — Missões do aluno](../../02-modulos/PRD-04%20%E2%80%94%20Miss%C3%B5es%20do%20aluno.md), seção 5. Prioridade **I**, método **D**. Situação declarada na origem **Parcial**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-MIS-07 Como **aluno**, quero ver as atividades que o professor mandou e o prazo de cada uma.

- **HU-MIS-07** CA-01: Dada uma atividade publicada e já liberada para a turma, quando o aluno abre o app, então ela aparece na aba "Professor", em "Para fazer", com a data de liberação.
- **HU-MIS-07** CA-02: Dada uma atividade com prazo vencido, então ela aparece como encerrada e não pode mais ser iniciada.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [packages/core/src/missoes.ts](../../../packages/core/src/missoes.ts)
- [apps/mobile/src/componentes/Partida.tsx](../../../apps/mobile/src/componentes/Partida.tsx)
- [apps/api/src/jogada.ts](../../../apps/api/src/jogada.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
