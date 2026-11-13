# PRD-16 — Notificações

**Data registrada no PRD de origem:** 2026-11-11. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

O app reúne avisos de atividade, prazo e avaliação. O sino do professor inclui avaliações pendentes.

[PRD de origem](../../02-modulos/PRD-16%20%E2%80%94%20Notifica%C3%A7%C3%B5es.md) · [Matriz de rastreabilidade](../matriz.md) · [Qualidade e permissões](../prd-17/README.md)

## Perfis e necessidades

| Perfil | Necessidade | Solução |
| --- | --- | --- |
| Aluno | Saber que há atividade nova ou feedback | Aviso no app e central de notificações |
| Professor | Saber o que precisa de ação hoje | Alertas do dia no sino do painel |

## Implementação

- [apps/api/src/avisos-aluno.ts](../../../apps/api/src/avisos-aluno.ts)
- [apps/mobile/src/app/avisos.tsx](../../../apps/mobile/src/app/avisos.tsx)
- [apps/web/lib/painel/alertas.ts](../../../apps/web/lib/painel/alertas.ts)
- [apps/web/components/painel/alertas.tsx](../../../apps/web/components/painel/alertas.tsx)

**Persistência** Derivado de plano_aula, atividade_professor, avaliacao_atividade e jogada; leitura_aviso_aluno.

## Regras de negócio

Sem regras numeradas próprias no PRD. Consulte a seção 5 da origem.

## Testes e limites

O aluno tem leitura persistida no banco e fila offline. O sino da equipe mantém lidos por conta/dia no navegador. Push e leitura da equipe entre aparelhos ficam fora desta entrega.

## Dependências

[PRD-12](../prd-12/README.md) · [PRD-14](../prd-14/README.md) · [PRD-15](../prd-15/README.md)

## Requisitos

- [MOD-NOT-001](mod-not-001.md) Avisar o aluno quando uma atividade for publicada para sua turma.
- [MOD-NOT-002](mod-not-002.md) Avisar o aluno quando uma atividade for avaliada.
- [MOD-NOT-003](mod-not-003.md) O sistema pode lembrar o aluno de atividades com prazo próximo.
- [MOD-NOT-004](mod-not-004.md) Oferecer uma central de notificações, distinguindo lidas e não lidas.
- [MOD-NOT-005](mod-not-005.md) O sistema pode avisar o professor sobre avaliações pendentes.
- [MOD-NOT-006](mod-not-006.md) O painel mostra os alertas do dia do professor: aula hoje, plano de amanhã em rascunho, aula sem registro, atividade liberada hoje, atividade com data passada não enviada, aluno em queda e alunos que pedem atenção.
