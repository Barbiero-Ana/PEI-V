---
modulo: ALU
prd: PRD-06
atualizado: 2026-11-04
revisao_documental: 2026-11-13
responsavel_revisao: Ana Barbiero — Líder de projeto
status: para revisão
---

# PRD-06 — Experiência do aluno

## 1. Resumo executivo

Define como o aluno se orienta no aplicativo: a tela inicial com o céu do mapa atual e a próxima missão, a trilha de mapas, a tela de conquistas e a navegação por abas. O objetivo é que o aluno chegue a uma missão em no máximo dois toques.

## 2. Problema e oportunidade

- P3 (produto): se o aluno não sabe o que fazer ao abrir o app, ele desiste.
- O feedback do professor precisa chegar ao aluno onde ele já olha: a tela inicial.

## 3. Usuários e necessidades

| Perfil | Necessidade | Solução |
| --- | --- | --- |
| Aluno | Saber o que jogar agora | Próxima missão em destaque na tela inicial |
| Aluno | Ver o caminho percorrido | Trilha de mapas com missões concluídas, atual e bloqueadas |
| Aluno | Receber orientação do professor | Feedbacks recentes na tela inicial |

## 4. Objetivos e critérios de sucesso

| Objetivo | Indicador | Meta | Prazo |
| --- | --- | --- | --- |
| Começar a jogar rápido | Toques da tela inicial até uma missão (MOD-USA-003) | No máximo 2 | Já atendido |
| Orientação sem ajuda | Alunos que encontram a próxima missão sem ajuda | 90% | Sessão de validação |

### 4.1 Critérios de validação

Inspeção das telas e teste de tarefa com alunos ("comece a próxima missão", "veja suas conquistas").

## 5. Escopo funcional

### 5.1 Requisitos

| ID | Comportamento esperado | Prior. | Verif. | Situação |
| --- | --- | :---: | :---: | :---: |
| MOD-ALU-001 | A tela inicial exibe nome e avatar, luzes, o céu do mapa atual, as próximas missões e o desafio do dia. | E | D | Implementado |
| MOD-ALU-002 | Destacar a próxima missão recomendada, que abre com um toque. | E | D | Implementado |
| MOD-ALU-003 | Exibir todos os mapas em forma de trilha, indicando missões concluídas, atual e bloqueadas. | E | D | Implementado |
| MOD-ALU-004 | Reunir em uma tela as conquistas, os dias de luz e a análise de aprendizagem. | I | D | Implementado |
| MOD-ALU-005 | A tela inicial exibe os feedbacks recentes do professor. | I | D | Pendente |
| MOD-ALU-006 | O aluno consulta as missões já realizadas e as estrelas obtidas. | I | D | Implementado |
| MOD-IU-001 | O aplicativo tem navegação inferior com as seções Início, Níveis, Professor, Conquistas e Perfil. | E | N | Implementado |
| MOD-IU-002 | As telas de jogo apresentam enunciado, botão de dica, área de interação e ações fixas no rodapé. | E | N | Implementado |

### Fora do escopo atual

- Mensagens livres entre aluno e professor.

## 6. Histórias de usuário

| ID | História | Requisitos |
| --- | --- | --- |
| HU-ALU-01 | Como **aluno**, quero abrir o app e ver logo o que jogar, para começar sem procurar. | ALU-001, ALU-002 |
| HU-ALU-02 | Como **aluno**, quero ver a trilha de mapas, para saber onde estou e o que vem depois. | ALU-003, ALU-006 |
| HU-ALU-03 | Como **aluno**, quero uma tela com minhas conquistas, meus dias de luz e meu jeito de aprender. | ALU-004 |
| HU-ALU-04 | Como **aluno**, quero ver o recado do professor na tela inicial, para saber o que melhorar. | ALU-005 |
| HU-ALU-05 | Como **aluno**, quero encontrar as seções sempre no mesmo lugar, para não me perder. | IU-001, IU-002 |

## 7. Critérios de aceite

Critérios marcados com [x] já são atendidos pelo app atual.

### HU-ALU-01 — O que jogar agora

- [x] CA-01: A tela inicial mostra nome, avatar, luzes, o céu do mapa atual, as próximas missões e o desafio do dia.
- [x] CA-02: A próxima missão recomendada abre com um toque.

### HU-ALU-02 — Trilha de mapas

- [x] CA-01: A aba Níveis mostra os mapas em trilha, com cada missão marcada como concluída, atual ou bloqueada, e as estrelas obtidas.

### HU-ALU-03 — Conquistas e jeito de aprender

- [x] CA-01: A aba Conquistas reúne conquistas, calendário de dias de luz e a análise de aprendizagem ([[PRD-11 — Análise de aprendizagem]]).

### HU-ALU-04 — Recado do professor

- [ ] CA-01: Dado um feedback concluído pelo professor, quando o aluno abre o app, então o recado aparece na tela inicial com o nome da atividade.
- [ ] CA-02: Depois de lido, o recado sai da tela inicial e fica disponível no histórico.

### HU-ALU-05 — Navegação estável

- [x] CA-01: A barra inferior tem sempre Início, Níveis, Professor, Conquistas e Perfil, nesta ordem, com ícone e nome.
- [x] CA-02: Toda tela de jogo tem enunciado no topo, lâmpada de dica, área de interação e botões fixos no rodapé.

## 8. MVP e fases

| Fase | Entrega | Situação |
| --- | --- | --- |
| 1 | Início, Níveis, Conquistas e Perfil. | Implementado |
| 4 | Feedback do professor na tela inicial. | Pendente |

## 9. Diretrizes do produto

- Tom moderno, sem infantilizar; sem emojis e sem gradientes na interface.
- Evitar telas com cartões iguais empilhados: preferir formas ligadas ao tema (céu, trilha, bilhete do desafio).

## 10. Dependências e riscos

| Risco | Mitigação planejada |
| --- | --- |
| Feedback depende da API | Entregar junto com a avaliação ([[PRD-15 — Avaliação e feedback]]). |

## 11. Pendências para aprovação

- Nenhuma.

## 12. Documentos vinculados

- [[PRD — Modolume]]
- [[PRD-04 — Missões do aluno]] · [[PRD-05 — Gamificação]] · [[PRD-15 — Avaliação e feedback]]

## 13. Controle da revisão documental

A data `atualizado` do histórico foi preservada. A revisão documental de **13/11/2026** foi aprovada por
**Ana Barbiero — Líder de projeto**, para organização, consistência e rastreabilidade. Essa aprovação não
substitui o aceite funcional: cenários sem evidência ou dependentes de validação pedagógica, institucional
e de aparelhos continuam pendentes na matriz de engenharia. Não foi inferida uma data de criação.
