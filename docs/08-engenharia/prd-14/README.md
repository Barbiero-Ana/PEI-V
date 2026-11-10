# PRD-14 — Atividades do professor

Professor prepara questões ou escolhe missão pronta, publica para turmas vinculadas e consulta resultados concluídos.

[PRD de origem](../../02-modulos/PRD-14%20%E2%80%94%20Atividades%20do%20professor.md) · [Matriz de rastreabilidade](../matriz.md) · [Qualidade e permissões](../prd-17/README.md)

## Perfis e necessidades

| Perfil | Necessidade | Solução |
| --- | --- | --- |
| Professor | Criar atividades do jeito da turma | Editor com quatro formatos e questões próprias |
| Professor | Usar os jogos do app | Escolha de atividade pronta do catálogo |
| Professor | Saber quem fez | Acompanhamento de conclusão por atividade (fase 4) |
| Aluno | Receber a atividade no app | Envio para as turmas, com data de liberação |

## Implementação

- [packages/core/src/atividades-professor.ts](../../../packages/core/src/atividades-professor.ts)
- [apps/web/app/professor/(painel)/atividades](../../../apps/web/app/professor/(painel)/atividades)
- [apps/api/src/professor.ts](../../../apps/api/src/professor.ts)
- [apps/api/src/aluno.ts](../../../apps/api/src/aluno.ts)

**Persistência** atividade_professor, atividade_turma, questao_atividade, opcao_questao, jogada.

## Regras de negócio

- **RN-26** Conteúdo por formato: **objetiva** (enunciado, alternativas e índice da correta); **completar** (texto com as respostas entre colchetes, como `25% de 80 é [20]`); **associação** (pares lado A e lado B); **sequência** (itens na ordem certa, que o app embaralha). Toda questão é do mesmo formato da atividade. Cada questão própria precisa de uma orientação de até 300 caracteres para publicação. Atividades já publicadas sem orientação exibem o retorno padrão do app.
- **RN-27** A atividade fica em rascunho até ser enviada; só atividades enviadas aparecem no app e na agenda do professor.

## Testes e limites

escrita-professor.test.ts e jogada.test.ts. Prazo, encerramento e estado em andamento pendentes.

## Dependências

[PRD-13](../prd-13/README.md) · [PRD-04](../prd-04/README.md) · [PRD-15](../prd-15/README.md)

## Requisitos

- [MOD-ATI-001](mod-ati-001.md) Disponibilizar ao professor o catálogo de missões, com conteúdo, formato, número de fases e mapa.
- [MOD-ATI-002](mod-ati-002.md) O professor cria atividades com questões próprias, nos formatos objetiva, completar, associação e sequência, ou escolhe uma atividade pronta do app.
- [MOD-ATI-003](mod-ati-003.md) Toda atividade tem título; instrução e orientações são opcionais.
- [MOD-ATI-004](mod-ati-004.md) O professor seleciona as turmas que recebem a atividade.
- [MOD-ATI-005](mod-ati-005.md) O professor define data de início e data limite.
- [MOD-ATI-006](mod-ati-006.md) A atividade fica associada ao seu formato e, quando informada, a uma habilidade da BNCC.
- [MOD-ATI-007](mod-ati-007.md) O professor edita atividades em rascunho e o prazo de atividades publicadas.
- [MOD-ATI-008](mod-ati-008.md) O professor publica (envia) a atividade para os alunos.
- [MOD-ATI-009](mod-ati-009.md) Exibir a situação da atividade: rascunho, publicada ou encerrada.
- [MOD-ATI-010](mod-ati-010.md) O professor vê, por atividade, os alunos que concluíram, que estão em andamento e que não iniciaram.
- [MOD-ATI-011](mod-ati-011.md) O professor pode liberar todos os mapas de uma turma, dispensando a ordem de desbloqueio.
- [MOD-ATI-012](mod-ati-012.md) O servidor valida o conteúdo de cada questão e exige uma orientação para resposta errada antes de publicar atividades com questões próprias.
- [MOD-ATI-013](mod-ati-013.md) O professor pré-visualiza a atividade como o aluno vai vê-la.
- [MOD-ATI-014](mod-ati-014.md) A atividade pode ser vinculada a um plano de aula.
- [MOD-ATI-015](mod-ati-015.md) A exclusão de uma atividade pede confirmação.
