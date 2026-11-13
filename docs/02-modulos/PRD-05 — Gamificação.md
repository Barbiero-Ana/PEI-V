---
modulo: GAM
prd: PRD-05
atualizado: 2026-11-04
revisao_documental: 2026-11-13
responsavel_revisao: Ana Barbiero — Líder de projeto
status: para revisão
---

# PRD-05 — Gamificação

## 1. Resumo executivo

"O céu que se ilumina": cada mapa monta uma constelação real, que acende com os pontos de luz das missões. Desafio do dia, dias de luz, conquistas, loja e o mascote Lilo mantêm o aluno praticando. A gamificação é meio, não fim: ela incentiva o aluno a jogar formatos variados, o que dá ao professor dados mais completos.

## 2. Problema e oportunidade

- P3 (produto): atividades repetitivas e punição por erro desmotivam.
- Sem regularidade de uso, os indicadores do professor ficam com pouca amostra.
- Ranking entre alunos expõe quem tem dificuldade; o projeto evita isso de propósito.

## 3. Usuários e necessidades

| Perfil | Necessidade | Solução |
| --- | --- | --- |
| Aluno | Sentir progresso e ter motivo para voltar | Constelações, pontos de luz, desafio do dia, dias de luz, conquistas, mascote |
| Aluno com dificuldade | Não ser comparado nem punido | Sem ranking; sem perda de pontos; calendário sem punição |
| Professor | Que o aluno jogue formatos variados | Última estrela só com o mapa completo (ADR 0004) |

## 4. Objetivos e critérios de sucesso

| Objetivo | Indicador | Meta | Prazo |
| --- | --- | --- | --- |
| Regularidade | Alunos com atividade em 3 ou mais dias por semana | 50% dos alunos ativos | 4 semanas de validação |
| Variedade | Alunos que jogaram pelo menos 4 formatos | 70% | 4 semanas de validação |
| Satisfação | Nota no questionário curto com os alunos | 4 de 5 ou mais | Fim da validação |

### 4.1 Critérios de validação

Testes automatizados das regras (`packages/core/src/constelacoes.test.ts`), registros de uso e questionário com os alunos.

## 5. Escopo funcional

### 5.1 Requisitos

| ID | Comportamento esperado | Prior. | Verif. | Situação |
| --- | --- | :---: | :---: | :---: |
| MOD-GAM-001 | Liberar cada mapa quando o anterior for concluído. | E | T | Implementado |
| MOD-GAM-002 | Atribuir pontos de luz a cada missão concluída, conforme a RN-02. | E | T | Implementado |
| MOD-GAM-003 | Acender as estrelas da constelação do mapa conforme a RN-03 e a RN-04. | E | T | Implementado |
| MOD-GAM-004 | Manter um álbum de constelações, com explicação, meses de visibilidade no céu do Brasil e curiosidades. | I | D | Implementado |
| MOD-GAM-005 | Sortear diariamente um desafio do dia, conforme a RN-11. | I | T | Implementado |
| MOD-GAM-006 | Registrar e exibir em calendário os dias em que o aluno jogou, sem punição por dias sem jogar. | I | D | Implementado |
| MOD-GAM-007 | Conceder conquistas por marcos de progresso, mostrando quanto falta para cada uma. | I | D | Implementado |
| MOD-GAM-008 | O aluno pode trocar luzes por itens do avatar e capas do perfil; itens comprados ficam liberados permanentemente. | D | T | Implementado |
| MOD-GAM-009 | O mascote reage ao contexto (acerto, erro, dica e comemoração) e evolui conforme as estrelas acesas. | I | D | Implementado |
| MOD-GAM-010 | No primeiro acesso, apresentar o mascote, o céu e os mapas, com opção de pular. | I | D | Implementado |
| MOD-GAM-011 | Não exibir classificação (ranking) entre alunos. | I | N | Implementado |

**Observação:** durante a validação, todos os mapas ficam liberados por padrão (Perfil → "Liberar todos os níveis"), para a equipe e a escola testarem qualquer missão. A ordem de desbloqueio (GAM-001) volta a valer quando essa opção é desligada.

### 5.2 Regras de negócio

| Regra | Síntese |
| --- | --- |
| RN-02 | Pontos de luz = fases + acertos de primeira + 3. |
| RN-03 | A cada 5 pontos de luz no mapa, acende uma estrela, até a penúltima. |
| RN-04 | A última estrela só acende com todas as missões do mapa concluídas; a constelação vai para o álbum. |
| RN-05 | O próximo mapa é liberado ao concluir o anterior, salvo liberação pelo professor. |
| RN-10 | Itens comprados são permanentes; luzes gastas não voltam. |
| RN-11 | O desafio do dia é igual para todos na data. O bônus diário é único e corresponde à melhor recompensa base desse desafio no dia, conforme ADR 0024, para independer da ordem de reconexão. |

### Fora do escopo atual

- Ranking, competição ou comparação entre alunos.
- Compras com dinheiro real.
- Desafio do dia definido pelo professor (ideia futura).

## 6. Histórias de usuário

| ID | História | Requisitos |
| --- | --- | --- |
| HU-GAM-01 | Como **aluno**, quero ver as estrelas da constelação acendendo, para sentir que estou avançando. | GAM-002, GAM-003 |
| HU-GAM-02 | Como **aluno**, quero guardar as constelações completas num álbum e ler curiosidades, para ter orgulho do que conquistei. | GAM-004 |
| HU-GAM-03 | Como **aluno**, quero um desafio especial por dia, para ter motivo de voltar. | GAM-005 |
| HU-GAM-04 | Como **aluno**, quero ver os dias em que joguei sem ser punido pelos dias que faltei. | GAM-006 |
| HU-GAM-05 | Como **aluno**, quero conquistas que mostrem quanto falta, para ter metas claras. | GAM-007 |
| HU-GAM-06 | Como **aluno**, quero trocar minhas luzes por itens do avatar, para personalizar meu perfil. | GAM-008 |
| HU-GAM-07 | Como **aluno**, quero que o Lilo reaja ao que faço e cresça comigo, para me sentir acompanhado. | GAM-009, GAM-010 |
| HU-GAM-08 | Como **aluno**, quero avançar mapa a mapa, para que a dificuldade cresça aos poucos. | GAM-001 |
| HU-GAM-09 | Como **aluno com dificuldade**, quero não ser comparado com os colegas. | GAM-011 |

## 7. Critérios de aceite

Critérios marcados com [x] já são atendidos pelo app atual.

### HU-GAM-01 — Constelação acendendo

- [x] CA-01: Dada uma missão de 5 fases com 4 acertos de primeira, quando concluída, então o aluno ganha 12 pontos de luz (RN-02).
- [x] CA-02: Dado um mapa com 10 pontos de luz acumulados, então 2 estrelas estão acesas (RN-03).
- [x] CA-03: Dado um mapa com pontos suficientes, mas com uma missão não concluída, então a última estrela continua apagada (RN-04).

### HU-GAM-02 — Álbum

- [x] CA-01: Dada uma constelação completa, então ela aparece no álbum do Perfil com explicação, meses de visibilidade e curiosidade de cada estrela.

### HU-GAM-03 — Desafio do dia

- [x] CA-01: Dados dois alunos no mesmo dia, então os dois veem o mesmo desafio.
- [x] CA-02: A primeira conclusão recebe o bônus diário. Uma tentativa melhor ajusta apenas a diferença desse único bônus, sem multiplicá-lo por aparelho (RN-11; ADR 0024).

### HU-GAM-04 — Dias de luz

- [x] CA-01: O calendário marca os dias jogados; um dia sem jogar não apaga nem reduz nada.

### HU-GAM-05 — Conquistas

- [x] CA-01: Cada conquista ainda não obtida mostra quanto falta (por exemplo, "faltam 2 missões").

### HU-GAM-06 — Loja

- [x] CA-01: Dado um item comprado, então ele continua liberado mesmo depois de trocar por outro (RN-10).
- [x] CA-02: Dado saldo insuficiente, então o botão de compra fica indisponível e mostra quanto falta.

### HU-GAM-07 — Lilo

- [x] CA-01: O Lilo muda de expressão em acerto, erro, dica e comemoração.
- [x] CA-02: No primeiro acesso, a apresentação mostra o Lilo, o céu e os mapas, com o botão "Pular".

### HU-GAM-08 — Avanço por mapas

- [x] CA-01: Com "Liberar todos os níveis" desligado, o mapa seguinte só abre quando o anterior é concluído.

### HU-GAM-09 — Sem ranking

- [x] CA-01: Nenhuma tela do app mostra a posição ou a pontuação de outros alunos.

## 8. MVP e fases

| Fase | Entrega | Situação |
| --- | --- | --- |
| 1 | Constelações, álbum, desafio do dia, dias de luz, conquistas, loja e Lilo. | Implementado |
| 4 | Liberação de mapas pelo professor (MOD-ATI-011). | Pendente |

## 9. Diretrizes do produto

- Recompensar esforço e variedade, nunca comparar alunos.
- Animações encantadoras, mas suaves, e respeitando a redução de movimento ([[PRD-08 — Acessibilidade]]).

## 10. Dependências e riscos

| Risco | Mitigação planejada |
| --- | --- |
| Aluno repetir só a missão mais fácil | Última estrela exige o mapa completo (ADR 0004). |
| Gamificação tirar o foco da aprendizagem | Pontos dependem de acertos de primeira; dados vão para o professor. |

## 11. Pendências para aprovação

- Definir se o desafio do dia poderá ser escolhido pelo professor.

## 12. Documentos vinculados

- [[PRD — Modolume]]
- [[PRD-04 — Missões do aluno]] · [[PRD-07 — Perfil e personalização]]
- [[0004-ultima-estrela-so-com-o-mapa-completo|ADR 0004]]

## 13. Controle da revisão documental

A data `atualizado` do histórico foi preservada. A revisão documental de **13/11/2026** foi aprovada por
**Ana Barbiero — Líder de projeto**, para organização, consistência e rastreabilidade. Essa aprovação não
substitui o aceite funcional: cenários sem evidência ou dependentes de validação pedagógica, institucional
e de aparelhos continuam pendentes na matriz de engenharia. Não foi inferida uma data de criação.
