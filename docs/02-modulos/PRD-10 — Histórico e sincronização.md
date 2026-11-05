---
modulo: HIS
prd: PRD-10
atualizado: 2026-11-05
status: para revisão
---

# PRD-10 — Histórico e sincronização

## 1. Resumo executivo

Guarda as jogadas e avaliações de cada aluno e as leva do aparelho ao servidor. O aluno joga mesmo sem internet; quando a conexão volta, as jogadas são enviadas, e o professor passa a vê-las no painel.

## 2. Problema e oportunidade

- A internet nas escolas costuma ser instável (ADR 0003).
- Uma jogada perdida frustra o aluno e apaga um dado que o professor usaria.
- O histórico precisa acompanhar o aluno se ele trocar de aparelho.

## 3. Usuários e necessidades

| Perfil | Necessidade | Solução |
| --- | --- | --- |
| Aluno | Jogar sem depender do Wi-Fi | Progresso salvo no aparelho |
| Aluno | Não perder o progresso ao trocar de celular | Recuperação pelo servidor (fase 4) |
| Professor | Ver todas as jogadas da turma | Envio automático ao servidor quando houver conexão |

## 4. Objetivos e critérios de sucesso

| Objetivo | Indicador | Meta | Prazo |
| --- | --- | --- | --- |
| Nenhuma jogada perdida | Jogadas feitas sem conexão que chegam ao servidor | 100% | Testes da fase 4 |
| Sem duplicidade | Jogadas registradas mais de uma vez (MOD-CON-003) | 0 | Testes da fase 4 |
| Tempo até o professor ver | Tempo entre a reconexão e a jogada aparecer no painel | Até 1 minuto | Testes da fase 4 |

### 4.1 Critérios de validação

Testes de queda e volta de conexão, de envio repetido e de troca de aparelho.

## 5. Escopo funcional

### 5.1 Requisitos

| ID | Comportamento esperado | Prior. | Verif. | Situação |
| --- | --- | :---: | :---: | :---: |
| MOD-HIS-001 | Manter o histórico de jogadas e avaliações de cada aluno. | E | T | Implementado |
| MOD-HIS-002 | O professor consulta o histórico dos alunos das suas turmas. | E | D | Implementado |
| MOD-HIS-003 | O aluno consulta o próprio histórico. | I | D | Parcial |
| MOD-HIS-004 | As missões podem ser jogadas sem conexão com a internet, com o progresso salvo no aparelho. | E | T | Implementado |
| MOD-HIS-005 | As jogadas feitas sem conexão são enviadas ao servidor quando a conexão é restabelecida. | E | T | Implementado |
| MOD-HIS-006 | Ao entrar em outro aparelho, o aluno recupera seu progresso. | I | T | Implementado |

**Situação atual:** o app guarda as jogadas no aparelho e, com o aluno numa turma, coloca cada uma numa fila que é enviada à API ao abrir o app, ao voltar para ele, a cada minuto e logo depois de cada jogada. Sem internet, a fila espera e a aba "Professor" avisa quantas faltam enviar. O painel mostra o histórico vindo do banco. O progresso de gamificação (estrelas, pontos de luz, constelações, desafios do dia e compras) também vai para o banco e é juntado sem perda: em outro aparelho, o aluno recupera tudo ao entrar, e os aparelhos se igualam a cada abertura do app (ADR 0016). A lista detalhada de jogadas para o próprio aluno ainda não existe (HIS-003 parcial).

### 5.2 Regras de negócio

| Regra | Síntese |
| --- | --- |
| RN-20 | Cada jogada tem um identificador gerado no aparelho; o servidor ignora um identificador já recebido (evita duplicidade). |

### Fora do escopo atual

- Edição de jogadas já registradas.

## 6. Histórias de usuário

| ID | História | Requisitos |
| --- | --- | --- |
| HU-HIS-01 | Como **aluno**, quero jogar sem internet, para não depender do Wi-Fi da escola. | HIS-004 |
| HU-HIS-02 | Como **professor**, quero que as jogadas feitas sem internet cheguem ao painel, para ter os dados completos. | HIS-005, HIS-001 |
| HU-HIS-03 | Como **aluno**, quero recuperar meu progresso em outro aparelho. | HIS-006 |
| HU-HIS-04 | Como **professor**, quero ver o histórico de cada aluno. | HIS-002 |
| HU-HIS-05 | Como **aluno**, quero ver as missões que já joguei. | HIS-003 |

## 7. Critérios de aceite

Critérios marcados com [x] já são atendidos pelo sistema atual.

### HU-HIS-01 — Jogar sem internet

- [x] CA-01: Com o aparelho em modo avião, o aluno abre o app, joga uma missão e o resultado fica salvo.
- [x] CA-02: Falhas de conexão não fecham o app nem apagam progresso (MOD-CON-001).

### HU-HIS-02 — Envio ao servidor

- [x] CA-01: Dada uma jogada feita sem conexão, quando a internet volta, então ela é enviada sem ação do aluno.
- [x] CA-02: Dado o mesmo envio repetido, então o servidor registra a jogada uma única vez (RN-20).
- [ ] CA-03: O registro da jogada e a atualização dos pontos acontecem juntos, ou nenhum dos dois (MOD-CON-002).

### HU-HIS-03 — Troca de aparelho

- [x] CA-01: Dado um aluno que entra em outro aparelho com o código pessoal e o PIN, então vê as mesmas estrelas, constelações e luzes.
- [x] CA-02: Um aparelho com progresso desatualizado não apaga o que o aluno conquistou em outro (fica o maior valor).

### HU-HIS-04 — Histórico para o professor

- [x] CA-01: A ficha do aluno no painel mostra os resultados recentes, com atividade, data e acerto.
- [x] CA-02: O histórico usa as jogadas reais vindas do app.

### HU-HIS-05 — Histórico para o aluno

- [x] CA-01: A aba Níveis mostra as missões concluídas e as estrelas de cada uma.
- [ ] CA-02: O aluno vê a lista das jogadas, com data e resultado.

## 8. MVP e fases

| Fase | Entrega | Situação |
| --- | --- | --- |
| 1 | Progresso no aparelho e uso sem conexão. | Implementado |
| 4 | Envio ao servidor, sem duplicidade, e avatar recuperado em outro aparelho. | Implementado |
| 4 | Estrelas, constelações, luzes e compras recuperadas em outro aparelho. | Implementado |

## 9. Diretrizes do produto

- O aluno nunca perde uma jogada por falta de internet.
- Dados de versões anteriores do app continuam legíveis após atualizações (MOD-CON-004).

## 10. Dependências e riscos

| Risco | Mitigação planejada |
| --- | --- |
| Aparelho compartilhado por irmãos | Progresso ligado ao aluno do código pessoal, não ao aparelho. |
| Fila de envio muito grande | Envio em lotes e confirmação por jogada. |

## 11. Pendências para aprovação

- Definir por quanto tempo o histórico fica guardado após o fim do ano letivo.

## 12. Documentos vinculados

- [[PRD — Modolume]]
- [[PRD-17 — Qualidade, segurança e restrições]]
- [[0003-progresso-local-e-uso-sem-conexao|ADR 0003]] · [[0007-back-end-node-postgresql-railway|ADR 0007]]
