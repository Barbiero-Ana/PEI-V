---
modulo: PLA
prd: PRD-13
atualizado: 2026-11-04
status: para revisão
---

# PRD-13 — Planejamento de aulas

## 1. Resumo executivo

O professor planeja as aulas no próprio painel, vendo ao lado os dados da turma: o acerto em cada formato de atividade e os alunos que pedem atenção. Depois da aula, registra como foi. Assim, o dado vira decisão pedagógica no mesmo lugar (ADR 0010).

> Módulo novo nesta versão da documentação: ele já existia no sistema, mas não estava na Especificação de Requisitos. Os requisitos abaixo descrevem o que o sistema faz hoje.

## 2. Problema e oportunidade

- P2 (produto): planejamento e avaliações nem sempre usam evidências da turma.
- Sem o planejamento no painel, o professor leva os dados para outra ferramenta e a ponte entre aluno e professor se perde.

## 3. Usuários e necessidades

| Perfil | Necessidade | Solução |
| --- | --- | --- |
| Professor | Planejar com base nos dados da turma | Formulário de plano com acerto por formato e alunos em atenção ao lado |
| Professor | Ver as aulas no tempo | Lista de planos, agenda da semana e calendário mensal |
| Professor | Guardar o que aconteceu na aula | Registro da aula e situação "realizada" |
| Coordenação | Ver por que um formato ou aluno foi escolhido | Plano liga formatos, habilidades e alunos em acompanhamento |

## 4. Objetivos e critérios de sucesso

| Objetivo | Indicador | Meta | Prazo |
| --- | --- | --- | --- |
| Planejar a partir dos dados | Planos com pelo menos um formato ou aluno em acompanhamento marcado | 70% dos planos | 4 semanas de validação |
| Histórico das aulas | Aulas passadas com registro | 80% | 4 semanas de validação |
| Planejar rápido | Tempo para criar um plano a partir da ficha da turma | Até 5 minutos | Teste de tarefa na validação |

### 4.1 Critérios de validação

Teste de tarefa com professores ("planeje a próxima aula do 6º A para os alunos em atenção") e testes funcionais de validação do formulário.

## 5. Escopo funcional

### 5.1 Requisitos

| ID | Comportamento esperado | Prior. | Verif. | Situação |
| --- | --- | :---: | :---: | :---: |
| MOD-PLA-001 | O professor cria um plano de aula com turma, data, horário, número de aulas, tema, unidade temática e habilidades da BNCC, objetivos, conteúdos, metodologia, formatos de atividade, recursos, avaliação, alunos em acompanhamento e observações. | E | T | Implementado |
| MOD-PLA-002 | O formulário mostra, ao lado das escolhas, o acerto da turma em cada formato e os alunos que pedem atenção, com o motivo. | E | D | Implementado |
| MOD-PLA-003 | O plano tem a situação rascunho, planejada ou realizada. | E | T | Implementado |
| MOD-PLA-004 | O professor registra o que aconteceu na aula. | I | T | Implementado |
| MOD-PLA-005 | O professor consulta os planos em lista, filtrando por turma. | E | D | Implementado |
| MOD-PLA-006 | O professor vê os planos em um calendário mensal. | I | D | Implementado |
| MOD-PLA-007 | A ficha da turma e a do aluno levam a um plano novo com a turma (e o aluno) já marcados. | I | D | Implementado |
| MOD-PLA-008 | O painel avisa quando há aulas passadas sem registro. | I | D | Implementado |
| MOD-PLA-009 | O professor edita e exclui planos; a exclusão pede confirmação. | E | T | Implementado |
| MOD-PLA-010 | O plano mostra as atividades do app ligadas àquela aula e permite criar uma atividade vinculada. | I | D | Implementado |
| MOD-PLA-011 | Os planos ficam guardados no servidor, disponíveis em qualquer aparelho. | E | T | Implementado |
| MOD-PLA-012 | O professor duplica um plano para outra turma ou data; a cópia volta para "planejada" e sem registro. | D | T | Implementado |

**Situação atual:** os planos ficam no banco (tabela `plano_aula` e as filhas `plano_habilidade`, `plano_formato`, `plano_missao` e `plano_aluno_foco`, ADR 0016). A API confere a turma, as habilidades, as missões e descarta alunos de outra turma (RN-23). Sem API (demonstração), os planos ficam na memória do painel.

### 5.2 Regras de negócio

| Regra | Síntese |
| --- | --- |
| RN-22 | Turma, data, tema e número de aulas (de 1 a 10) são obrigatórios. Objetivos são obrigatórios, exceto em rascunhos. |
| RN-23 | Os alunos em acompanhamento precisam ser da turma escolhida no plano. |
| RN-24 | Uma aula com data passada e situação diferente de "realizada" conta como "sem registro". |
| RN-25 | O registro da aula só fica disponível a partir da data da aula; salvar o registro marca o plano como "realizada". |

### Fora do escopo atual

- Compartilhar planos entre professores.
- Exportar o plano em PDF.
- Banco de planos prontos.

## 6. Histórias de usuário

| ID | História | Requisitos |
| --- | --- | --- |
| HU-PLA-01 | Como **professor**, quero planejar a aula vendo o desempenho da turma ao lado, para escolher formatos e alunos com base em dados. | PLA-001, PLA-002 |
| HU-PLA-02 | Como **professor**, quero começar um plano direto da ficha da turma ou do aluno, para não preencher de novo o que já sei. | PLA-007 |
| HU-PLA-03 | Como **professor**, quero ver meus planos em lista e no calendário, para me organizar no mês. | PLA-005, PLA-006 |
| HU-PLA-04 | Como **professor**, quero registrar como foi a aula, para manter o histórico da turma. | PLA-003, PLA-004, PLA-008 |
| HU-PLA-05 | Como **professor**, quero corrigir, duplicar ou excluir um plano sem risco de apagar por engano. | PLA-009, PLA-012 |
| HU-PLA-06 | Como **professor**, quero ligar atividades do app à aula, para que a prática aconteça no formato planejado. | PLA-010 |
| HU-PLA-07 | Como **professor**, quero que meus planos fiquem salvos em qualquer computador. | PLA-011 |

## 7. Critérios de aceite

Critérios marcados com [x] já são atendidos pelo painel atual.

### HU-PLA-01 — Planejar com dados ao lado

- [x] CA-01: Dada a turma escolhida no formulário, então aparecem o acerto da turma em cada formato e a lista de alunos, com os que pedem atenção primeiro e o motivo.
- [x] CA-02: Dado um plano sem tema, quando o professor salva, então vê "Dê um tema para a aula." junto ao campo, na etapa certa do formulário (RN-22).
- [x] CA-03: Dado um plano "planejada" sem objetivos, então o sistema pede os objetivos; como "rascunho", salva sem eles.

### HU-PLA-02 — Começar da ficha

- [x] CA-01: Dado o botão de planejar na ficha da turma, então o formulário abre com a turma já escolhida.
- [x] CA-02: Dada a ficha de um aluno, então o plano abre com a turma e o aluno já marcados em acompanhamento.

### HU-PLA-03 — Lista e calendário

- [x] CA-01: A lista de planos pode ser filtrada por turma.
- [x] CA-02: O calendário mostra os planos do mês, com a cor da turma.

### HU-PLA-04 — Registro da aula

- [x] CA-01: Dada uma aula passada sem registro, então a Visão geral e o menu avisam quantas são (RN-24).
- [x] CA-02: Ao salvar o registro, o plano passa a "realizada" e o aviso some (RN-25).
- [x] CA-03: Antes da data da aula, o registro aparece indisponível, com a data a partir da qual poderá ser feito.

### HU-PLA-05 — Editar e excluir

- [x] CA-01: A exclusão fica escondida em "Excluir plano" e exige um segundo clique em "Excluir definitivamente".
- [x] CA-02: "Duplicar" copia o plano para outra turma ou data, como planejado e sem registro.

### HU-PLA-06 — Atividades da aula

- [x] CA-01: O plano mostra as atividades do app ligadas a ele e tem o atalho para criar uma nova, já vinculada.

### HU-PLA-07 — Planos no servidor

- [x] CA-01: Dado um plano salvo, quando o professor entra de outro computador, então o plano está lá.
- [x] CA-02: Reiniciar o servidor não apaga planos.

## 8. MVP e fases

| Fase | Entrega | Situação |
| --- | --- | --- |
| 3 | Planejamento completo no painel, com planos em memória. | Implementado |
| 4 | Planos guardados no banco pela API. | Implementado |

## 9. Diretrizes do produto

- O plano sempre mostra o porquê: formatos, habilidades e alunos ligados aos dados da turma.
- O formulário é dividido em etapas, e o erro leva o professor à etapa do campo com problema.

## 10. Dependências e riscos

| Risco | Mitigação planejada |
| --- | --- |
| Perda dos planos ao reiniciar o servidor | Aceito só para demonstração; resolvido na fase 4. |
| Formulário longo cansar o professor | Etapas, campos opcionais e começar da ficha da turma. |

## 11. Pendências para aprovação

- Definir se o plano precisa de aprovação da coordenação.

## 12. Documentos vinculados

- [[PRD — Modolume]]
- [[PRD-12 — Painel do professor]] · [[PRD-14 — Atividades do professor]]
- [[0010-planejamento-de-aulas-no-painel|ADR 0010]]
