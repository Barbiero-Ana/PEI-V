# ADR 0001 — Monorepo com núcleo de regras compartilhado

- **Status:** Aceita
- **Data:** 06/10/2026
- **Decisores originais:** não identificados no registro histórico.

## Contexto

O Modolume tem dois públicos: o aluno, no aplicativo, e o professor, no painel web. Os dois precisam ver os
mesmos números sobre o mesmo aluno (estrelas, pontos, acerto por formato). Se cada aplicação calculasse as
regras do seu jeito, os resultados poderiam divergir.

## Decisão

Manter todo o código em um único repositório (monorepo, com pnpm e Turborepo), com três pacotes:
`apps/mobile` (aluno), `apps/web` (professor) e `packages/core` (regras de negócio). Toda regra existe só no
núcleo, e as aplicações apenas a usam.

## Alternativas consideradas

- **Repositórios separados para app e web:** cada um teria sua cópia das regras, com risco de divergência e
  trabalho dobrado a cada mudança.
- **Regras só no servidor:** o app deixaria de funcionar sem internet (ver [ADR 0003](0003-progresso-local-e-uso-sem-conexao.md)).

## Consequências

- **Positivas:** aluno e professor sempre veem os mesmos cálculos; uma mudança de regra vale para tudo de uma
  vez; um único comando verifica tipos, lint e testes de todo o projeto.
- **Negativas:** a configuração inicial do monorepo é mais trabalhosa; todos os pacotes precisam usar
  TypeScript.
- **Pendente:** a futura API também deve importar o núcleo, em vez de reescrever as regras.

## Aprovação da revisão documental

- **Data da revisão e aprovação:** 13/11/2026.
- **Assinatura de aprovação:** Ana Barbiero — Líder de projeto.
- **Registro:** aprovação expressa nesta conversa para organizar e consolidar a documentação.
- **Histórico:** a data original da decisão no cabeçalho foi preservada. Esta assinatura não atribui
  participação retroativa nem reativa decisões substituídas; evidências de homologação continuam separadas.
