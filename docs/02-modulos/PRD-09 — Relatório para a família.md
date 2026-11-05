---
modulo: REL
prd: PRD-09
atualizado: 2026-11-05
status: para revisão
---

# PRD-09 — Relatório para a família

## 1. Resumo executivo

Um relatório semanal do aluno, em PDF A4, que a família recebe pelo aplicativo de mensagens do celular: missões jogadas, estrelas, dias de luz, constelações e a evolução do Lilo. Leva para casa o que o aluno pratica fora da prova.

## 2. Problema e oportunidade

- P5 (produto): famílias têm pouca visibilidade do progresso cotidiano.
- Muitas famílias acompanham a escola só pelo celular; um PDF compartilhável chega pelo canal que elas já usam.

## 3. Usuários e necessidades

| Perfil | Necessidade | Solução |
| --- | --- | --- |
| Família | Entender, em linguagem simples, o que o aluno fez na semana | Relatório visual de uma página |
| Aluno | Mostrar o que conquistou | Botão de compartilhar no app |
| Professor | Apoiar a conversa com a família | Mesmo relatório, sem dados de outros alunos |

## 4. Objetivos e critérios de sucesso

| Objetivo | Indicador | Meta | Prazo |
| --- | --- | --- | --- |
| Família informada | Relatórios compartilhados por aluno participante | Pelo menos 1 | 4 semanas de validação |
| Geração rápida | Tempo para gerar o PDF (MOD-DES-006) | Até 5 segundos | A medir antes da validação |

### 4.1 Critérios de validação

Demonstração da geração e do compartilhamento no Android (e no iOS, se a versão para iPhone for contratada); medição do tempo de geração.

## 5. Escopo funcional

### 5.1 Requisitos

| ID | Comportamento esperado | Prior. | Verif. | Situação |
| --- | --- | :---: | :---: | :---: |
| MOD-REL-001 | Gerar um relatório semanal com missões jogadas, estrelas, dias de luz, constelações e evolução do mascote. | I | D | Implementado |
| MOD-REL-002 | O relatório pode ser exportado em PDF, no formato A4. | I | T | Implementado |
| MOD-REL-003 | O PDF pode ser compartilhado pelos aplicativos do aparelho. | I | D | Implementado |

**Situação atual:** tela Relatório no app; o PDF é montado como HTML e convertido com expo-print, e compartilhado com expo-sharing.

### Fora do escopo atual

- Envio automático por e-mail ou SMS.
- Indicadores pedagógicos detalhados (ficam com o professor).

## 6. Histórias de usuário

| ID | História | Requisitos |
| --- | --- | --- |
| HU-REL-01 | Como **família**, quero receber um resumo da semana do aluno, para acompanhar sem entrar em nenhum sistema. | REL-001 |
| HU-REL-02 | Como **aluno**, quero gerar o PDF e mandar para minha família pelo celular. | REL-002, REL-003 |

## 7. Critérios de aceite

Critérios marcados com [x] já são atendidos pelo app atual.

### HU-REL-01 — Resumo da semana

- [x] CA-01: O relatório mostra os dias jogados na semana, as estrelas, as constelações com as estrelas acesas e o estágio do Lilo.
- [x] CA-02: O texto usa linguagem simples, sem termos técnicos (MOD-USA-001).

### HU-REL-02 — Gerar e compartilhar

- [x] CA-01: Dado o botão de compartilhar, quando o aluno toca, então o PDF A4 é gerado e abre a lista de aplicativos do aparelho.
- [ ] CA-02: O PDF é gerado em até 5 segundos em aparelho intermediário (MOD-DES-006; a medir).

## 8. MVP e fases

| Fase | Entrega | Situação |
| --- | --- | --- |
| 1 | Relatório semanal em PDF e compartilhamento. | Implementado |
| 4 | Recado do professor no relatório (a decidir). | Pendente |

## 9. Diretrizes do produto

- O relatório só tem dados do próprio aluno.
- Nada de notas ou comparações: o foco é o que o aluno fez e conquistou.

## 10. Dependências e riscos

| Risco | Mitigação planejada |
| --- | --- |
| Compartilhamento expõe dados do aluno | Coleta mínima (MOD-SEG-009); o aluno escolhe com quem compartilhar. |

## 11. Pendências para aprovação

- Decidir se o feedback do professor entra no relatório.

## 12. Documentos vinculados

- [[PRD — Modolume]]
- [[PRD-05 — Gamificação]] · [[PRD-15 — Avaliação e feedback]]
