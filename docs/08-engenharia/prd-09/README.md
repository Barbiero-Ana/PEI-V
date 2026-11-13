# PRD-09 — Relatório para a família

**Data registrada no PRD de origem:** 2026-11-05. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

O app gera PDF A4 a partir do progresso disponível localmente e abre o compartilhamento do sistema.

[PRD de origem](../../02-modulos/PRD-09%20%E2%80%94%20Relat%C3%B3rio%20para%20a%20fam%C3%ADlia.md) · [Matriz de rastreabilidade](../matriz.md) · [Qualidade e permissões](../prd-17/README.md)

## Perfis e necessidades

| Perfil | Necessidade | Solução |
| --- | --- | --- |
| Família | Entender, em linguagem simples, o que o aluno fez na semana | Relatório visual de uma página |
| Aluno | Mostrar o que conquistou | Botão de compartilhar no app |
| Professor | Apoiar a conversa com a família | Mesmo relatório, sem dados de outros alunos |

## Implementação

- [apps/mobile/src/app/relatorio.tsx](../../../apps/mobile/src/app/relatorio.tsx)
- [apps/mobile/src/lib/relatorioPdf.ts](../../../apps/mobile/src/lib/relatorioPdf.ts)

**Persistência** Histórico local e progresso da conta.

## Regras de negócio

Sem regras numeradas próprias no PRD. Consulte a seção 5 da origem.

## Testes e limites

Histórico remoto é restaurado para a análise. Geração, compartilhamento e tempo no aparelho pendentes.

## Dependências

[PRD-05](../prd-05/README.md) · [PRD-15](../prd-15/README.md)

## Requisitos

- [MOD-REL-001](mod-rel-001.md) Gerar um relatório semanal com missões jogadas, estrelas, dias de luz, constelações e evolução do mascote.
- [MOD-REL-002](mod-rel-002.md) O relatório pode ser exportado em PDF, no formato A4.
- [MOD-REL-003](mod-rel-003.md) O PDF pode ser compartilhado pelos aplicativos do aparelho.
