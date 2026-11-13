---
modulo: AVA
prd: PRD-15
atualizado: 2026-11-11
revisao_documental: 2026-11-13
responsavel_revisao: Ana Barbiero — Líder de projeto
status: para revisão
---

# PRD-15 — Avaliação e feedback

## 1. Resumo executivo

Permite ao professor olhar o detalhe do que cada aluno fez numa atividade (fases, tentativas, tempo e dicas), registrar uma avaliação e escrever um feedback que o aluno lê no app. Fecha o ciclo: o aluno recebe orientação sobre o que melhorar.

## 2. Problema e oportunidade

- P2 (produto): a avaliação precisa usar evidências da prática, não só a prova.
- O aluno precisa saber o que o professor achou, no lugar onde já está: o app.

## 3. Usuários e necessidades

| Perfil | Necessidade | Solução |
| --- | --- | --- |
| Professor | Entender como o aluno chegou ao resultado | Detalhe por missão: fases, tentativas, tempo e dicas |
| Professor | Orientar o aluno | Feedback escrito, visível no app ao concluir a avaliação |
| Aluno | Saber o que melhorar | Recado do professor no Início ([[PRD-06 — Experiência do aluno]]) |

## 4. Objetivos e critérios de sucesso

| Objetivo | Indicador | Meta | Prazo |
| --- | --- | --- | --- |
| Feedback chega ao aluno | Feedbacks concluídos que aparecem no app | 100% | Testes da fase 4 |
| Professor dá retorno | Atividades com ao menos um feedback por turma | 1 por semana | 4 semanas de validação |

### 4.1 Critérios de validação

Teste ponta a ponta: professor avalia no painel → aluno vê o feedback no app.

## 5. Escopo funcional

### 5.1 Requisitos

| ID | Comportamento esperado | Prior. | Verif. | Situação |
| --- | --- | :---: | :---: | :---: |
| MOD-AVA-001 | O professor visualiza as atividades concluídas pelos alunos. | E | D | Implementado |
| MOD-AVA-002 | O professor visualiza o detalhe de cada aluno: fases, tentativas, tempo e dicas por missão. | E | D | Implementado |
| MOD-AVA-003 | O professor registra uma avaliação e um feedback escrito. | I | T | Implementado |
| MOD-AVA-004 | O professor pode registrar sua percepção do desempenho nas habilidades da atividade. | D | T | Implementado |
| MOD-AVA-005 | O professor conclui a avaliação, tornando o feedback visível ao aluno. | I | T | Implementado |
| MOD-AVA-006 | Manter o histórico das avaliações. | I | T | Implementado |

**Situação atual:** a página da atividade abre a avaliação individual, com agregados e medidas por fase
nas novas entregas. O professor salva versões em rascunho ou publica uma devolutiva não vazia, com percepção
opcional sobre a habilidade informada. Rascunhos são privados; o aluno recebe apenas versões publicadas,
visíveis no Início e na central de avisos. O histórico preserva as versões, o título e a habilidade da época.
Avaliações são imutáveis para o papel de execução no banco. A exclusão de atividade com avaliação arquiva
seu conteúdo para preservar o histórico. Entregas antigas sem medidas por fase indicam essa ausência.
A orientação imediata ao errar uma questão continua pertencendo ao PRD-14. O fluxo completo no aparelho
aguarda homologação, conforme o [ADR 0025](../03-decisoes/0025-ciclo-de-atividades-e-devolutivas.md).

### 5.2 Regras de negócio

| Regra | Síntese |
| --- | --- |
| RN-28 | O feedback só fica visível ao aluno depois que o professor conclui a avaliação; rascunhos são privados. |

### Fora do escopo atual

- Nota oficial ou integração com o boletim.
- Conversa (chat) entre aluno e professor.

## 6. Histórias de usuário

| ID | História | Requisitos |
| --- | --- | --- |
| HU-AVA-01 | Como **professor**, quero ver quais atividades cada aluno concluiu, para acompanhar a turma. | AVA-001 |
| HU-AVA-02 | Como **professor**, quero ver fases, tentativas, tempo e dicas do aluno, para entender onde ele travou. | AVA-002 |
| HU-AVA-03 | Como **professor**, quero escrever um feedback e decidir quando o aluno vai vê-lo. | AVA-003, AVA-005 |
| HU-AVA-04 | Como **professor**, quero registrar minha percepção sobre as habilidades, para complementar os números. | AVA-004 |
| HU-AVA-05 | Como **professor**, quero rever avaliações antigas, para acompanhar a evolução. | AVA-006 |

## 7. Critérios de aceite

Critérios marcados com [x] já são atendidos pelo painel atual.

### HU-AVA-01 — Atividades concluídas

- [x] CA-01: A ficha do aluno mostra os resultados recentes, com o nome da atividade, a data e o acerto.
- [ ] CA-02: A página de cada atividade mostra quem concluiu (ver MOD-ATI-010).

### HU-AVA-02 — Detalhe da jogada

- [ ] CA-01: Dada uma atividade concluída, quando o professor abre o detalhe do aluno, então vê cada fase com tentativas, tempo e se pediu dica.

### HU-AVA-03 — Feedback

- [ ] CA-01: Dado um feedback salvo sem concluir, então o aluno não o vê (RN-28).
- [ ] CA-02: Ao concluir a avaliação, o feedback aparece no Início do aluno, e o aluno recebe um aviso (MOD-NOT-002).
- [ ] CA-03: O feedback não pode ficar vazio ao concluir.

### HU-AVA-04 — Percepção sobre habilidades

- [ ] CA-01: O professor marca, para cada habilidade da atividade, "consolidada", "em desenvolvimento" ou "precisa de apoio".

### HU-AVA-05 — Histórico

- [ ] CA-01: A ficha do aluno lista as avaliações anteriores, da mais recente para a mais antiga.

## 8. MVP e fases

| Fase | Entrega | Situação |
| --- | --- | --- |
| 3 | Resultados recentes na ficha do aluno. | Implementado |
| 4 | Detalhe por fase, avaliação, feedback no app e histórico. | Implementado; aceite em aparelho pendente |

## 9. Diretrizes do produto

- Feedback em linguagem encorajadora, como o retorno das missões.
- A avaliação complementa os indicadores; não substitui a nota oficial.

## 10. Dependências e riscos

| Risco | Mitigação planejada |
| --- | --- |
| Depende das jogadas reais | Construir junto com a sincronização ([[PRD-10 — Histórico e sincronização]]). |

## 11. Pendências para aprovação

- Homologar a escala implementada conforme HU-AVA-04 e o texto das devolutivas com a equipe pedagógica.

## 12. Documentos vinculados

- [[PRD — Modolume]]
- [[PRD-06 — Experiência do aluno]] · [[PRD-14 — Atividades do professor]] · [[PRD-16 — Notificações]]

## 13. Controle da revisão documental

A data `atualizado` do histórico foi preservada. A revisão documental de **13/11/2026** foi aprovada por
**Ana Barbiero — Líder de projeto**, para organização, consistência e rastreabilidade. Essa aprovação não
substitui o aceite funcional: cenários sem evidência ou dependentes de validação pedagógica, institucional
e de aparelhos continuam pendentes na matriz de engenharia. Não foi inferida uma data de criação.
