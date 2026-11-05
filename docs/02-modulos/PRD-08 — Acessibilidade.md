---
modulo: ACE
prd: PRD-08
atualizado: 2026-11-04
status: para revisão
---

# PRD-08 — Acessibilidade

## 1. Resumo executivo

Recursos para que alunos com baixa visão, dislexia, dificuldade de leitura ou sensibilidade a movimento usem o Modolume com autonomia: tamanho do texto, leitura em voz, fonte para dislexia, alto contraste e redução de animações. A acessibilidade faz parte do produto desde o início, e não é um extra.

## 2. Problema e oportunidade

- P4 (produto): atividades só de texto criam barreiras de acesso.
- Um aluno que não consegue ler o enunciado aparece como "com dificuldade em Matemática" nos indicadores, quando a barreira é outra.

## 3. Usuários e necessidades

| Perfil | Necessidade | Solução |
| --- | --- | --- |
| Aluno com baixa visão | Ler e distinguir elementos | Texto maior e alto contraste |
| Aluno com dislexia ou em alfabetização | Entender o enunciado | Fonte Lexend e leitura em voz |
| Aluno sensível a movimento | Usar sem desconforto | Redução de animações, inclusive pela configuração do aparelho |
| Aluno que usa leitor de tela | Saber o que cada botão faz | Rótulos de acessibilidade |

## 4. Objetivos e critérios de sucesso

| Objetivo | Indicador | Meta | Prazo |
| --- | --- | --- | --- |
| Contraste adequado | Textos com contraste ≥ 4,5:1 no alto contraste (MOD-USA-013) | 100% | Antes da validação |
| Layout robusto | Telas sem texto cortado com texto em 130% (MOD-USA-016) | 100% | Antes da validação |
| Rótulos completos | Elementos interativos com rótulo para leitor de tela | 100% | Fase 6 |

### 4.1 Critérios de validação

Testes de cada opção, medição de contraste, inspeção com o leitor de tela do aparelho (TalkBack e VoiceOver).

## 5. Escopo funcional

### 5.1 Requisitos

| ID | Comportamento esperado | Prior. | Verif. | Situação |
| --- | --- | :---: | :---: | :---: |
| MOD-ACE-001 | O aluno pode escolher o tamanho do texto: normal, grande ou muito grande. | E | T | Implementado |
| MOD-ACE-002 | O aluno pode ativar a leitura em voz de enunciados, dicas, retornos e títulos, com opção de ouvir de novo. | E | T | Implementado |
| MOD-ACE-003 | O aluno pode usar uma fonte de leitura facilitada para dislexia. | I | T | Implementado |
| MOD-ACE-004 | O aluno pode ativar o alto contraste, aplicado sem reiniciar o aplicativo e sem sair da tela atual. | E | T | Implementado |
| MOD-ACE-005 | O aluno pode reduzir as animações; o sistema também respeita a redução de movimento configurada no aparelho. | E | T | Implementado |
| MOD-ACE-006 | Todos os elementos interativos têm rótulos para leitores de tela. | I | N | Parcial |
| MOD-ACE-007 | A tela de acessibilidade pode exibir uma pré-visualização do efeito de cada opção. | D | D | Parcial |

**Situação atual:** as opções ficam em Perfil → Acessibilidade e são guardadas no aparelho (expo-sqlite), lidas antes da primeira tela. A leitura em voz usa a síntese do sistema em português do Brasil (expo-speech). O app tem rótulos de acessibilidade nos principais controles, mas falta uma auditoria completa com leitor de tela (ACE-006).

### Fora do escopo atual

- Tradução para Libras.
- Controle por voz.

## 6. Histórias de usuário

| ID | História | Requisitos |
| --- | --- | --- |
| HU-ACE-01 | Como **aluno com baixa visão**, quero aumentar o texto e usar alto contraste sem perder a tela em que estou. | ACE-001, ACE-004 |
| HU-ACE-02 | Como **aluno com dificuldade de leitura**, quero ouvir o enunciado e a dica, para resolver sozinho. | ACE-002 |
| HU-ACE-03 | Como **aluno com dislexia**, quero uma fonte mais fácil de ler. | ACE-003 |
| HU-ACE-04 | Como **aluno sensível a movimento**, quero menos animações. | ACE-005 |
| HU-ACE-05 | Como **aluno que usa leitor de tela**, quero saber o que cada botão faz. | ACE-006 |
| HU-ACE-06 | Como **aluno**, quero ver o efeito de cada opção antes de escolher. | ACE-007 |

## 7. Critérios de aceite

Critérios marcados com [x] já são atendidos pelo app atual.

### HU-ACE-01 — Texto e contraste

- [x] CA-01: Há três tamanhos de texto (Normal, Grande e Muito grande, que equivale a 130%), e a escolha vale para todo o app.
- [x] CA-02: Dado o alto contraste ligado no meio de uma tela, então as cores mudam na hora e o aluno continua na mesma tela (ADR 0005).
- [ ] CA-03: Nenhum texto fica cortado com o tamanho em 130% (MOD-USA-016; a medir em todas as telas).

### HU-ACE-02 — Leitura em voz

- [x] CA-01: Com a voz ligada, enunciados, dicas, retornos e títulos são lidos em português do Brasil.
- [x] CA-02: Cada fase tem o botão "Ouvir de novo".

### HU-ACE-03 — Fonte para dislexia

- [x] CA-01: A opção troca a fonte do app inteiro para Lexend.

### HU-ACE-04 — Menos animações

- [x] CA-01: Com a opção ligada, comemorações e transições ficam sem movimento.
- [x] CA-02: Se o aparelho estiver configurado para reduzir movimento, o app já abre com menos animações.

### HU-ACE-05 — Leitor de tela

- [ ] CA-01: Com TalkBack ou VoiceOver, todos os botões e áreas de jogo são anunciados com um nome que descreve a ação.
- [ ] CA-02: Estados como certo, errado, bloqueado e concluído são anunciados em texto, não só por cor (MOD-USA-015).

### HU-ACE-06 — Pré-visualização

- [x] CA-01: A leitura em voz tem o botão "Ouvir um exemplo".
- [ ] CA-02: As demais opções (texto, fonte, contraste e animações) mostram uma prévia antes de serem aplicadas.

## 8. MVP e fases

| Fase | Entrega | Situação |
| --- | --- | --- |
| 1 | Tamanho do texto, voz, Lexend, alto contraste, menos animações. | Implementado |
| 6 | Auditoria com leitor de tela e medições de contraste e de texto em 130%. | Pendente |

## 9. Diretrizes do produto

- Nenhuma informação depende só de cor.
- Toda opção de acessibilidade vale na hora, sem reiniciar.
- Áreas de toque com no mínimo 44 × 44 pontos (MOD-USA-014).

## 10. Dependências e riscos

| Risco | Mitigação planejada |
| --- | --- |
| Voz indisponível em alguns aparelhos | Usar a voz do sistema; avisar quando não houver voz em português instalada. |
| Jogos 3D difíceis de anunciar ao leitor de tela | Descrever o objetivo da fase e oferecer alternativa por toque. |

## 11. Pendências para aprovação

- Definir o roteiro da auditoria com leitor de tela.

## 12. Documentos vinculados

- [[PRD — Modolume]]
- [[PRD-17 — Qualidade, segurança e restrições]]
- [[0005-alto-contraste-sem-reiniciar|ADR 0005]]
