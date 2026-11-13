---
modulo: MIS
prd: PRD-04
atualizado: 2026-11-11
revisao_documental: 2026-11-13
responsavel_revisao: Ana Barbiero — Líder de projeto
status: para revisão
---

# PRD-04 — Missões do aluno

## 1. Resumo executivo

O coração do aplicativo: missões de Matemática divididas em fases, cada uma partindo de uma situação do cotidiano e resolvida por manipulação direta (arrastar, ligar, montar, girar, encher). Cada missão concluída gera o registro que alimenta a gamificação do aluno e os indicadores do professor.

## 2. Problema e oportunidade

- P1 e P6 (produto): o professor precisa saber em que **formato** cada aluno vai melhor; por isso cada missão tem um formato definido.
- P3: atividades repetitivas e punição por erro desmotivam.
- P4: atividades só de texto criam barreiras.

## 3. Usuários e necessidades

| Perfil | Necessidade | Solução |
| --- | --- | --- |
| Aluno | Entender a tarefa e resolver sem medo de errar | Cenário do dia a dia, instrução curta, dica a qualquer momento e retorno encorajador |
| Aluno com dificuldade motora | Resolver sem arrastar | Alternativa por toque em toda interação de arrastar |
| Professor | Receber dados comparáveis entre formatos | Registro padronizado de cada jogada (`ResultadoJogada`) |

## 4. Objetivos e critérios de sucesso

| Objetivo | Indicador | Meta | Prazo |
| --- | --- | --- | --- |
| Missão compreensível sem adulto | Alunos que concluem a 1ª missão sem ajuda (MOD-USA-002) | 80% | Sessão de validação |
| Registro completo | Jogadas concluídas com todos os campos de MIS-009 | 100% | Testes da fase 4 |
| Variedade de formatos | Mapas com pelo menos 2 formatos diferentes (MOD-ADF-004) | 8 de 8 | Hoje 7 de 8: o Mapa 5 só tem exploração 3D |

### 4.1 Critérios de validação

Testes automatizados do cálculo de resultado (`packages/core/src/missoes.test.ts`), demonstração das 28 missões e sessão de uso com alunos.

## 5. Escopo funcional

### 5.1 Requisitos

| ID | Comportamento esperado | Prior. | Verif. | Situação |
| --- | --- | :---: | :---: | :---: |
| MOD-MIS-001 | Exibir ao aluno as missões organizadas em mapas e as atividades publicadas para a turma. | E | D | Implementado |
| MOD-MIS-002 | Indicar a situação de cada missão: bloqueada, disponível, atual ou concluída, com as estrelas obtidas. | E | D | Implementado |
| MOD-MIS-003 | Cada fase deve apresentar uma situação do cotidiano e uma instrução curta da tarefa. | E | N | Implementado |
| MOD-MIS-004 | O aluno resolve as fases por manipulação direta dos elementos da tela. | E | D | Implementado |
| MOD-MIS-005 | Toda interação de arrastar deve ter uma alternativa por toque: tocar no item e depois no destino. | E | T | Implementado |
| MOD-MIS-006 | O aluno pode pedir uma dica em qualquer fase. | E | T | Implementado |
| MOD-MIS-007 | Informar acerto ou erro imediatamente após a conferência da resposta. | E | T | Implementado |
| MOD-MIS-008 | Em caso de erro, explicar o que aconteceu e permitir nova tentativa. | E | T | Implementado |
| MOD-MIS-009 | Ao fim da missão, registrar formato, fases, acertos de primeira, tentativas, tempo, dicas, percentual de acerto e estrelas. | E | T | Implementado |
| MOD-MIS-010 | Exibir ao fim da missão as estrelas, os pontos de luz ganhos, o avanço da constelação e o resumo da jogada. | E | D | Implementado |
| MOD-MIS-011 | A tela de resultado oferece jogar de novo, voltar e seguir para a próxima missão. | I | D | Implementado |
| MOD-MIS-012 | O aluno pode sair de uma missão a qualquer momento, sem gerar registro. | I | T | Implementado |
| MOD-MIS-013 | Exibir o prazo das atividades publicadas pelo professor. | I | D | Implementado |

**Situação atual:** 28 missões em 8 mapas, nos formatos associação visual, montagem, sequência, completar, manipulação e exploração 3D. As missões dos mapas são as **atividades padrão de mapeamento da aprendizagem**: toda jogada vai para o professor com a origem "mapa". As atividades enviadas pelo professor ficam numa **aba separada** ("Professor"), com a data de liberação; a data limite (MIS-013) ainda não existe ([[PRD-14 — Atividades do professor]]).

### 5.2 Regras de negócio

| Regra | Síntese |
| --- | --- |
| RN-01 | 3 estrelas se acerto de primeira ≥ 90%; 2 se ≥ 60%; senão 1. |
| RN-06 | Dica não retira pontos; influencia a autonomia. |

### Fora do escopo atual

- Missões criadas pelo próprio aluno.
- Missões em dupla ou em grupo.

## 6. Histórias de usuário

| ID | História | Requisitos |
| --- | --- | --- |
| HU-MIS-01 | Como **aluno**, quero ver as missões em mapas e saber quais já fiz, para escolher o que jogar. | MIS-001, MIS-002 |
| HU-MIS-02 | Como **aluno**, quero resolver a missão mexendo nas peças, a partir de uma situação real, para entender a Matemática no dia a dia. | MIS-003, MIS-004, MIS-005 |
| HU-MIS-03 | Como **aluno**, quero pedir dica e entender meu erro, para não desistir. | MIS-006, MIS-007, MIS-008 |
| HU-MIS-04 | Como **aluno**, quero ver o que ganhei ao terminar e escolher o próximo passo, para continuar motivado. | MIS-010, MIS-011 |
| HU-MIS-05 | Como **professor**, quero que cada jogada seja registrada do mesmo jeito, para comparar os formatos. | MIS-009 |
| HU-MIS-06 | Como **aluno**, quero sair de uma missão quando precisar, sem que isso conte contra mim. | MIS-012 |
| HU-MIS-07 | Como **aluno**, quero ver as atividades que o professor mandou e o prazo de cada uma. | MIS-001, MIS-013 |

## 7. Critérios de aceite

Critérios marcados com [x] já são atendidos pelo app atual.

### HU-MIS-01 — Ver as missões nos mapas

- [x] CA-01: Dada a tela Níveis, quando aberta, então cada missão mostra a situação (bloqueada, disponível, atual ou concluída) por ícone e texto, e as estrelas obtidas.
- [x] CA-02: O mapa atual aparece aberto, e os demais podem ser expandidos.

### HU-MIS-02 — Resolver por manipulação

- [x] CA-01: Toda fase mostra o cenário do dia a dia e uma instrução curta acima da área de interação.
- [x] CA-02: Dado um item arrastável, quando o aluno toca nele e depois no destino, então o item vai para o destino, como se tivesse sido arrastado.
- [x] CA-03: Os botões de ação ficam fixos no rodapé, na mesma posição em todas as missões (MOD-USA-005).

### HU-MIS-03 — Dica e erro

- [x] CA-01: A lâmpada de dica está visível em toda fase; ao tocar, a dica aparece sem tirar pontos.
- [x] CA-02: Dada uma resposta errada, quando o aluno confere, então vê uma mensagem encorajadora que explica o que conferir e pode tentar de novo.
- [ ] CA-03: O retorno de acerto ou erro aparece em até 100 ms após a conferência (MOD-DES-002; a medir).

### HU-MIS-04 — Fim da missão

- [x] CA-01: Ao concluir, o aluno vê as estrelas, os pontos de luz ganhos e a constelação do mapa avançando.
- [x] CA-02: A tela oferece "Jogar de novo", "Voltar" e, quando houver, a próxima missão.

### HU-MIS-05 — Registro padronizado

- [x] CA-01: Dada uma missão concluída, então o registro contém formato, fases, acertos de primeira, tentativas, tempo, dicas, percentual de acerto e estrelas.
- [x] CA-02: Dada uma missão com 10 fases e 9 acertos de primeira, então o percentual de acerto é 90% e o aluno recebe 3 estrelas (RN-01).

### HU-MIS-06 — Sair da missão

- [x] CA-01: Dado o botão "Sair da missão", quando o aluno sai antes de terminar, então nenhum resultado é registrado e nenhum ponto é perdido.

### HU-MIS-07 — Atividades do professor

- [x] CA-01: Dada uma atividade publicada e já liberada para a turma, quando o aluno abre o app, então ela aparece na aba "Professor", em "Para fazer", com a data de liberação.
- [ ] CA-02: Dada uma atividade com prazo vencido, então ela aparece como encerrada e não pode mais ser iniciada.

## 8. MVP e fases

| Fase | Entrega | Situação |
| --- | --- | --- |
| 1 | 28 missões em 8 mapas, dica, retorno imediato, resultado padronizado. | Implementado |
| 4 | Atividades do professor no app, na aba "Professor", com data de liberação. | Implementado |
| 5 | Data limite das atividades (MOD-ATI, fase 5). | Implementado; homologação física pendente |

## 9. Diretrizes do produto

- Toda fase parte de uma situação do cotidiano; nada de "apertar a resposta certa" como única interação.
- Errar faz parte: o retorno de erro explica, encoraja e não tira pontos.
- Novas missões entram como dados no catálogo (`packages/core/src/missoes.ts`), sem mudar as telas (MOD-MAN-002).

## 10. Dependências e riscos

| Risco | Mitigação planejada |
| --- | --- |
| Missões 3D lentas em aparelhos antigos | Meta de 30 quadros por segundo (MOD-DES-003) testada em aparelho intermediário; opção de reduzir animações. |
| Enunciado difícil de ler | Leitura em voz e tamanhos de texto ([[PRD-08 — Acessibilidade]]). |

## 11. Pendências para aprovação

- Revisão pedagógica do alinhamento de cada missão à BNCC (MOD-ADF-002).

## 12. Documentos vinculados

- [[PRD — Modolume]]
- [[PRD-05 — Gamificação]] · [[PRD-11 — Análise de aprendizagem]] · [[PRD-14 — Atividades do professor]]
- [[0004-ultima-estrela-so-com-o-mapa-completo|ADR 0004]]

## 13. Controle da revisão documental

A data `atualizado` do histórico foi preservada. A revisão documental de **13/11/2026** foi aprovada por
**Ana Barbiero — Líder de projeto**, para organização, consistência e rastreabilidade. Essa aprovação não
substitui o aceite funcional: cenários sem evidência ou dependentes de validação pedagógica, institucional
e de aparelhos continuam pendentes na matriz de engenharia. Não foi inferida uma data de criação.
