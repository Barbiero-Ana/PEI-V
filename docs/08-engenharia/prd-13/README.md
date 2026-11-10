# PRD-13 — Planejamento de aulas

Professor cria e acompanha planos das turmas vinculadas. A API protege vínculos, data e registro da aula.

[PRD de origem](../../02-modulos/PRD-13%20%E2%80%94%20Planejamento%20de%20aulas.md) · [Matriz de rastreabilidade](../matriz.md) · [Qualidade e permissões](../prd-17/README.md)

## Perfis e necessidades

| Perfil | Necessidade | Solução |
| --- | --- | --- |
| Professor | Planejar com base nos dados da turma | Formulário de plano com acerto por formato e alunos em atenção ao lado |
| Professor | Ver as aulas no tempo | Lista de planos, agenda da semana e calendário mensal |
| Professor | Guardar o que aconteceu na aula | Registro da aula e situação "realizada" |
| Coordenação | Ver por que um formato ou aluno foi escolhido | Plano liga formatos, habilidades e alunos em acompanhamento |

## Implementação

- [apps/web/app/professor/(painel)/planejamento](../../../apps/web/app/professor/(painel)/planejamento)
- [packages/core/src/planejamento.ts](../../../packages/core/src/planejamento.ts)
- [apps/api/src/professor.ts](../../../apps/api/src/professor.ts)

**Persistência** plano_aula, plano_habilidade, plano_formato, plano_missao, plano_aluno_foco.

## Regras de negócio

- **RN-22** Turma, data, tema e número de aulas (de 1 a 10) são obrigatórios. Objetivos são obrigatórios, exceto em rascunhos.
- **RN-23** Os alunos em acompanhamento precisam ser da turma escolhida no plano.
- **RN-24** Uma aula com data passada e situação diferente de "realizada" conta como "sem registro".
- **RN-25** O registro da aula só fica disponível a partir da data da aula; salvar o registro marca o plano como "realizada".

## Testes e limites

escrita-professor.test.ts e validacao.test.ts. Revisar datas e fluxo completo pela web.

## Dependências

[PRD-12](../prd-12/README.md) · [PRD-14](../prd-14/README.md)

## Requisitos

- [MOD-PLA-001](mod-pla-001.md) O professor cria um plano de aula com turma, data, horário, número de aulas, tema, unidade temática e habilidades da BNCC, objetivos, conteúdos, metodologia, formatos de atividade, recursos, avaliação, alunos em acompanhamento e observações.
- [MOD-PLA-002](mod-pla-002.md) O formulário mostra, ao lado das escolhas, o acerto da turma em cada formato e os alunos que pedem atenção, com o motivo.
- [MOD-PLA-003](mod-pla-003.md) O plano tem a situação rascunho, planejada ou realizada.
- [MOD-PLA-004](mod-pla-004.md) O professor registra o que aconteceu na aula.
- [MOD-PLA-005](mod-pla-005.md) O professor consulta os planos em lista, filtrando por turma.
- [MOD-PLA-006](mod-pla-006.md) O professor vê os planos em um calendário mensal.
- [MOD-PLA-007](mod-pla-007.md) A ficha da turma e a do aluno levam a um plano novo com a turma (e o aluno) já marcados.
- [MOD-PLA-008](mod-pla-008.md) O painel avisa quando há aulas passadas sem registro.
- [MOD-PLA-009](mod-pla-009.md) O professor edita e exclui planos; a exclusão pede confirmação.
- [MOD-PLA-010](mod-pla-010.md) O plano mostra as atividades do app ligadas àquela aula e permite criar uma atividade vinculada.
- [MOD-PLA-011](mod-pla-011.md) Os planos ficam guardados no servidor, disponíveis em qualquer aparelho.
- [MOD-PLA-012](mod-pla-012.md) O professor duplica um plano para outra turma ou data; a cópia volta para "planejada" e sem registro.
