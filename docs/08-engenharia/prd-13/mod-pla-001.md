# MOD-PLA-001

O professor cria um plano de aula com turma, data, horário, número de aulas, tema, unidade temática e habilidades da BNCC, objetivos, conteúdos, metodologia, formatos de atividade, recursos, avaliação, alunos em acompanhamento e observações.

Origem: [PRD-13 — Planejamento de aulas](../../02-modulos/PRD-13%20%E2%80%94%20Planejamento%20de%20aulas.md), seção 5. Prioridade **E**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-PLA-01 Como **professor**, quero planejar a aula vendo o desempenho da turma ao lado, para escolher formatos e alunos com base em dados.

- **HU-PLA-01** CA-01: Dada a turma escolhida no formulário, então aparecem o acerto da turma em cada formato e a lista de alunos, com os que pedem atenção primeiro e o motivo.
- **HU-PLA-01** CA-02: Dado um plano sem tema, quando o professor salva, então vê "Dê um tema para a aula." junto ao campo, na etapa certa do formulário (RN-22).
- **HU-PLA-01** CA-03: Dado um plano "planejada" sem objetivos, então o sistema pede os objetivos; como "rascunho", salva sem eles.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/web/app/professor/(painel)/planejamento](../../../apps/web/app/professor/(painel)/planejamento)
- [packages/core/src/planejamento.ts](../../../packages/core/src/planejamento.ts)
- [apps/api/src/professor.ts](../../../apps/api/src/professor.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
