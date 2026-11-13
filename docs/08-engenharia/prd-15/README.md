# PRD-15 — Avaliação e feedback

**Data registrada no PRD de origem:** 2026-11-11. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

Professor consulta fases e salva versões de avaliação. Rascunhos são privados; a publicação libera a devolutiva e o aviso ao aluno.

[PRD de origem](../../02-modulos/PRD-15%20%E2%80%94%20Avalia%C3%A7%C3%A3o%20e%20feedback.md) · [Matriz de rastreabilidade](../matriz.md) · [Qualidade e permissões](../prd-17/README.md)

## Perfis e necessidades

| Perfil | Necessidade | Solução |
| --- | --- | --- |
| Professor | Entender como o aluno chegou ao resultado | Detalhe por missão: fases, tentativas, tempo e dicas |
| Professor | Orientar o aluno | Feedback escrito, visível no app ao concluir a avaliação |
| Aluno | Saber o que melhorar | Recado do professor no Início ([[PRD-06 — Experiência do aluno]]) |

## Implementação

- [apps/api/src/avaliacoes.ts](../../../apps/api/src/avaliacoes.ts)
- [apps/web/app/professor/(painel)/atividades](../../../apps/web/app/professor/(painel)/atividades)
- [apps/mobile/src/app/feedback](../../../apps/mobile/src/app/feedback)

**Persistência** jogada, avaliacao_atividade, registro.

## Regras de negócio

- **RN-28** O feedback só fica visível ao aluno depois que o professor conclui a avaliação; rascunhos são privados.

## Testes e limites

verificar-consolidacao.ts cobre privacidade, publicação, histórico, imutabilidade no banco e preservação ao excluir a atividade. Aceite em aparelho pendente.

## Dependências

[PRD-06](../prd-06/README.md) · [PRD-14](../prd-14/README.md) · [PRD-16](../prd-16/README.md)

## Requisitos

- [MOD-AVA-001](mod-ava-001.md) O professor visualiza as atividades concluídas pelos alunos.
- [MOD-AVA-002](mod-ava-002.md) O professor visualiza o detalhe de cada aluno: fases, tentativas, tempo e dicas por missão.
- [MOD-AVA-003](mod-ava-003.md) O professor registra uma avaliação e um feedback escrito.
- [MOD-AVA-004](mod-ava-004.md) O professor pode registrar sua percepção do desempenho nas habilidades da atividade.
- [MOD-AVA-005](mod-ava-005.md) O professor conclui a avaliação, tornando o feedback visível ao aluno.
- [MOD-AVA-006](mod-ava-006.md) Manter o histórico das avaliações.
