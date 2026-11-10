---
modulo: NOT
prd: PRD-16
atualizado: 2026-11-05
status: para revisão
---

# PRD-16 — Notificações

## 1. Resumo executivo

Avisos que chegam a quem precisa agir: o aluno fica sabendo de atividades novas e de avaliações, e o professor recebe os alertas do dia (aula de hoje, plano em rascunho, aula sem registro, atividade liberada, aluno em queda).

## 2. Problema e oportunidade

- Sem aviso, a atividade enviada pelo professor pode passar despercebida.
- O professor tem pouco tempo; os alertas precisam ser poucos, priorizados e acionáveis.

## 3. Usuários e necessidades

| Perfil | Necessidade | Solução |
| --- | --- | --- |
| Aluno | Saber que há atividade nova ou feedback | Aviso no app e central de notificações |
| Professor | Saber o que precisa de ação hoje | Alertas do dia no sino do painel |

## 4. Objetivos e critérios de sucesso

| Objetivo | Indicador | Meta | Prazo |
| --- | --- | --- | --- |
| Alertas acionáveis | Alertas do professor que levam direto à tela da ação | 100% | Já atendido |
| Aluno informado | Alunos que abrem uma atividade nova em até 2 dias após o aviso | 70% | 4 semanas de validação |

### 4.1 Critérios de validação

Demonstração dos alertas do painel; na fase 4, teste de recebimento no app.

## 5. Escopo funcional

### 5.1 Requisitos

| ID | Comportamento esperado | Prior. | Verif. | Situação |
| --- | --- | :---: | :---: | :---: |
| MOD-NOT-001 | Avisar o aluno quando uma atividade for publicada para sua turma. | I | T | Pendente |
| MOD-NOT-002 | Avisar o aluno quando uma atividade for avaliada. | I | T | Pendente |
| MOD-NOT-003 | O sistema pode lembrar o aluno de atividades com prazo próximo. | D | T | Pendente |
| MOD-NOT-004 | Oferecer uma central de notificações, distinguindo lidas e não lidas. | I | D | Parcial |
| MOD-NOT-005 | O sistema pode avisar o professor sobre avaliações pendentes. | D | T | Pendente |
| MOD-NOT-006 | O painel mostra os alertas do dia do professor: aula hoje, plano de amanhã em rascunho, aula sem registro, atividade liberada hoje, atividade com data passada não enviada, aluno em queda e alunos que pedem atenção. | I | D | Implementado |

**Situação atual:** o sino no topo do painel mostra o total de alertas não lidos. O professor marca um alerta ao abrir seu link e pode marcar todos de uma vez. O estado de leitura é guardado por conta e dia no navegador (NOT-004 parcial). O envio de avisos ao app está pendente.

### Fora do escopo atual

- Notificações por e-mail ou SMS.
- Avisos para a família.

## 6. Histórias de usuário

| ID | História | Requisitos |
| --- | --- | --- |
| HU-NOT-01 | Como **aluno**, quero ser avisado de atividade nova e de prazo próximo, para não perder nada. | NOT-001, NOT-003 |
| HU-NOT-02 | Como **aluno**, quero saber quando o professor avaliou minha atividade. | NOT-002 |
| HU-NOT-03 | Como **usuário**, quero ver meus avisos num só lugar, separando o que já li. | NOT-004 |
| HU-NOT-04 | Como **professor**, quero ver de manhã o que precisa da minha ação hoje. | NOT-006, NOT-005 |

## 7. Critérios de aceite

Critérios marcados com [x] já são atendidos pelo sistema atual.

### HU-NOT-01 — Atividade nova e prazo

- [ ] CA-01: Dada uma atividade publicada para a turma, então os alunos recebem um aviso no app com o título.
- [ ] CA-02: Um dia antes do prazo, o aluno que não concluiu recebe um lembrete.

### HU-NOT-02 — Atividade avaliada

- [ ] CA-01: Ao concluir a avaliação, o aluno recebe um aviso que abre o feedback.

### HU-NOT-03 — Central

- [x] CA-01: O sino do painel mostra a quantidade de alertas e abre a lista.
- [ ] CA-02: Alertas abertos aparecem como lidos e saem do contador.

### HU-NOT-04 — Alertas do professor

- [x] CA-01: Dada uma aula hoje, então o alerta "Aula hoje às HH:MM · turma" aparece no sino.
- [x] CA-02: Dada uma aula passada sem registro, então aparece o alerta "Aula sem registro".
- [x] CA-03: Dado um aluno com queda no período, então aparece "Nome caiu N pontos".
- [x] CA-04: Cada alerta leva à tela onde a ação é feita.
- [ ] CA-05: Avaliações pendentes geram alerta (NOT-005).

## 8. MVP e fases

| Fase | Entrega | Situação |
| --- | --- | --- |
| 3 | Alertas do dia no painel. | Implementado |
| 4 | Avisos no app e central com lidas e não lidas. | Pendente |

## 9. Diretrizes do produto

- Poucos alertas e todos acionáveis; nada de aviso só informativo no sino.
- Nunca usar notificação para pressionar o aluno (sem "você está atrasado").

## 10. Dependências e riscos

| Risco | Mitigação planejada |
| --- | --- |
| Excesso de avisos | Agrupar por tipo e limitar o lembrete de prazo a um por atividade. |
| Notificação push exige permissão do aparelho | Central dentro do app funciona mesmo sem permissão. |

## 11. Pendências para aprovação

- Decidir se haverá notificação push no celular ou apenas a central no app.

## 12. Documentos vinculados

- [[PRD — Modolume]]
- [[PRD-12 — Painel do professor]] · [[PRD-14 — Atividades do professor]] · [[PRD-15 — Avaliação e feedback]]
