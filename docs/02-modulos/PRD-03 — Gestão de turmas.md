---
modulo: TUR
prd: PRD-03
atualizado: 2026-11-05
revisao_documental: 2026-11-13
responsavel_revisao: Ana Barbiero — Líder de projeto
status: para revisão
---

# PRD-03 — Gestão de turmas

## 1. Resumo executivo

Organiza as turmas do ano letivo e os vínculos entre professores e alunos. É o recorte que define quem vê o quê: o professor vê as próprias turmas, e o aluno, apenas a sua.

## 2. Problema e oportunidade

- Os indicadores do professor são calculados por turma; sem turmas bem definidas, a análise perde sentido.
- O aluno entra com o próprio código de acesso e um PIN (MOD-AUT-009, ADR 0017); o código da turma não é mais usado para entrar.

## 3. Usuários e necessidades

| Perfil | Necessidade | Solução |
| --- | --- | --- |
| Gestão escolar | Montar as turmas do ano e vincular pessoas | Cadastro de turmas e vínculos |
| Professor | Ver apenas as próprias turmas | Recorte por vínculo |
| Aluno | Entrar na turma certa | Código de acesso da turma |

## 4. Objetivos e critérios de sucesso

| Objetivo | Indicador | Meta | Prazo |
| --- | --- | --- | --- |
| Turmas prontas para a validação | Turmas participantes cadastradas com professor e alunos | 100% | Uma semana antes da validação |
| Isolamento entre turmas | Acessos indevidos a outra turma nos testes | 0 | Fase 4 |

### 4.1 Critérios de validação

Testes de vínculo e de recorte de dados por perfil; demonstração do cadastro de uma turma.

## 5. Escopo funcional

### 5.1 Requisitos

| ID | Comportamento esperado | Prior. | Verif. | Situação |
| --- | --- | :---: | :---: | :---: |
| MOD-TUR-001 | A gestão cadastra a turma selecionando segmento, série, turno e ano letivo. O sistema salva um identificador único com o número da série, a sigla do turno (`AM`, `TD` ou `IN`) e um número sequencial, como `6AM12`. | E | T | Implementado |
| MOD-TUR-002 | A gestão deve poder editar e consultar turmas. | E | T | Implementado |
| MOD-TUR-003 | A administração pode atribuir uma turma no cadastro do professor. A coordenação adiciona e remove professores das turmas do seu segmento. | E | T | Implementado |
| MOD-TUR-004 | A gestão deve poder vincular alunos a uma turma. | E | T | Implementado |
| MOD-TUR-005 | A gestão deve poder remover vínculos, preservando o histórico. | E | T | Implementado |
| MOD-TUR-006 | Exibir os professores e alunos de cada turma. | E | D | Implementado |
| MOD-TUR-007 | Identificar turmas ativas e encerradas. | I | D | Implementado |
| MOD-TUR-008 | ~~Gerar para cada turma um código de acesso, que pode ser renovado.~~ Substituído pelo código pessoal do aluno (MOD-AUT-009, ADR 0017). | — | — | Substituído |
| MOD-TUR-009 | O professor visualiza somente as turmas às quais está vinculado. | E | T | Implementado |
| MOD-TUR-010 | O aluno acessa somente as informações da própria turma. | E | T | Implementado |

**Situação atual:** cada aluno entra com código pessoal e PIN (MOD-AUT-009). O código da turma identifica o cadastro no painel. Turmas anteriores mantêm o nome e o código gravados. A coordenação acessa indicadores, alunos e vínculos somente do segmento atribuído. A atribuição usa a lista de turmas, a busca por professor e o filtro por matéria. Cada operação pede confirmação com o nome do professor e da turma. Turmas com série anterior ambígua ficam pendentes de classificação pela administração.

### 5.2 Regras de negócio

| Regra | Síntese |
| --- | --- |
| RN-18 | Um aluno pertence a uma turma ativa por vez; a troca de turma preserva o histórico anterior. |
| RN-19 | ~~Renovar o código da turma invalida o anterior.~~ Substituída: gerar um novo código pessoal para o aluno invalida o anterior e encerra as sessões dele em todos os aparelhos (ADR 0017). |

### Fora do escopo atual

- Grade de horários e carga horária por matéria.
- Enturmação automática a partir do sistema acadêmico.

## 6. Histórias de usuário

| ID | História | Requisitos |
| --- | --- | --- |
| HU-TUR-01 | Como **gestão**, quero cadastrar as turmas do ano letivo, para organizar o uso do Modolume. | TUR-001, TUR-002, TUR-007 |
| HU-TUR-02 | Como **gestão**, quero vincular professores e alunos às turmas, para que cada um veja o que é seu. | TUR-003, TUR-004, TUR-005, TUR-006 |
| HU-TUR-03 | Como **professor**, quero ver só as minhas turmas, para não me perder em dados de outras. | TUR-009 |
| HU-TUR-04 | ~~Como **professor**, quero um código para a turma entrar no app, e poder trocá-lo se vazar.~~ Substituída pela HU-AUT-07. | TUR-008 |
| HU-TUR-05 | Como **aluno**, quero ver só o que é da minha turma, para encontrar minhas atividades. | TUR-010 |

## 7. Critérios de aceite

### HU-TUR-01 — Cadastrar turmas

- [ ] CA-01: Dado o formulário de turma, quando a gestão salva com nome, série, período e ano letivo, então a turma aparece como "Ativa".
- [ ] CA-02: Dada uma turma, quando a gestão a encerra, então ela aparece como "Encerrada" e deixa de aceitar novas entradas pelo código.

### HU-TUR-02 — Vincular pessoas

- [ ] CA-01: Dada uma turma, quando a gestão vincula um professor, então a turma passa a aparecer no painel desse professor.
- [ ] CA-02: Dado um aluno vinculado, quando a gestão remove o vínculo, então o aluno sai da lista da turma e suas jogadas continuam no histórico.

### HU-TUR-03 — Ver só as minhas turmas

- [x] CA-01: Dado um professor logado, quando ele abre Turmas, então vê apenas as turmas em que é responsável.
- [x] CA-02: Dado o endereço de uma turma de outro professor, quando aberto, então o painel mostra "página não encontrada".
- [x] CA-03: Os indicadores da Visão geral, de Desempenho e de Habilidades consideram apenas as turmas do professor.

### HU-TUR-04 — Código da turma (substituída)

Substituída pela HU-AUT-07 do [[PRD-01 — Autenticação e controle de acesso]]: o código agora é de cada aluno, sem letras ambíguas, e um código novo invalida o anterior.

### HU-TUR-05 — Aluno vê só a própria turma

- [x] CA-01: Dado um aluno logado, quando o app lista atividades do professor, então só aparecem as publicadas para a turma dele.

## 8. MVP e fases

| Fase | Entrega | Situação |
| --- | --- | --- |
| 3 | Lista e ficha da turma no painel, com recorte por professor (dados de demonstração). | Implementado |
| 4 | Turmas e vínculos vindos da API. | Implementado |
| 5 | Cadastro e edição de turmas (administrador) e vínculos professor ↔ turma (coordenação). | Implementado |

## 9. Diretrizes do produto

- A turma é a unidade de análise do professor; todos os indicadores podem ser filtrados por ela.
- Remover vínculos nunca apaga histórico.

## 10. Dependências e riscos

| Risco | Mitigação planejada |
| --- | --- |
| Código de acesso compartilhado fora da escola | Cada código abre só uma conta e exige o PIN do aluno; o professor gera um código novo quando precisar (ADR 0017). |
| Turmas com mais de um professor | O modelo da API já prevê vínculo de vários professores (TUR-003). |

## 11. Pendências para aprovação

- Confirmar se uma turma terá mais de um professor na validação.

## 12. Documentos vinculados

- [[PRD — Modolume]]
- [[PRD-01 — Autenticação e controle de acesso]] · [[PRD-02 — Administração de usuários]] · [[PRD-12 — Painel do professor]]

## 13. Controle da revisão documental

A data `atualizado` do histórico foi preservada. A revisão documental de **13/11/2026** foi aprovada por
**Ana Barbiero — Líder de projeto**, para organização, consistência e rastreabilidade. Essa aprovação não
substitui o aceite funcional: cenários sem evidência ou dependentes de validação pedagógica, institucional
e de aparelhos continuam pendentes na matriz de engenharia. Não foi inferida uma data de criação.
