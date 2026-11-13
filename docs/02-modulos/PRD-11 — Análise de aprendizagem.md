---
modulo: APR
prd: PRD-11
atualizado: 2026-11-11
revisao_documental: 2026-11-13
responsavel_revisao: Ana Barbiero — Líder de projeto
status: para revisão
---

# PRD-11 — Análise de aprendizagem

## 1. Resumo executivo

Transforma as jogadas em uma leitura de **como** cada aluno aprende: para cada formato de atividade, calcula acerto de primeira, autonomia, precisão e domínio, e mostra o resultado em um radar (pentagrama) de jeitos de aprender. É a informação que torna o Modolume uma ponte entre aluno e professor.

## 2. Problema e oportunidade

- P1 (produto): o professor não identifica em quais formatos os alunos têm dificuldade.
- P6: faltam indicadores contínuos e consolidados.
- Uma única jogada não pode rotular o aluno (ADR 0006).

## 3. Usuários e necessidades

| Perfil | Necessidade | Solução |
| --- | --- | --- |
| Professor | Saber em que tipo de atividade cada aluno e a turma vão melhor | Radar por aluno e por turma, com insights |
| Aluno | Conhecer o próprio jeito de aprender, sem rótulo | Cartão por formato e missão sugerida, na aba Conquistas |
| Escola | Evitar diagnóstico indevido | Amostra mínima e linguagem de tendência |

## 4. Objetivos e critérios de sucesso

| Objetivo | Indicador | Meta | Prazo |
| --- | --- | --- | --- |
| Mesmo resultado no app e na web | Casos de teste com cálculo idêntico (MOD-ADF-001) | 100% | Já atendido no núcleo |
| Nenhum rótulo com pouca amostra | Jeito principal exibido sem a amostra mínima da RN-09 | 0 casos | Já atendido |
| Leitura útil ao professor | Professores que relatam ao menos uma mudança de aula motivada pela análise | 1 por professor participante | Fim da validação |

### 4.1 Critérios de validação

Testes automatizados em `packages/core/src/aprendizagem.test.ts` e `indicators.test.ts`; entrevista com o professor após a validação.

## 5. Escopo funcional

### 5.1 Requisitos

| ID | Comportamento esperado | Prior. | Verif. | Situação |
| --- | --- | :---: | :---: | :---: |
| MOD-APR-001 | Associar cada missão a um formato de atividade e a um ou mais conteúdos. | E | N | Implementado |
| MOD-APR-002 | Calcular, para cada formato jogado, o acerto de primeira, a autonomia, a precisão e o domínio, conforme a RN-07. | E | T | Implementado |
| MOD-APR-003 | Classificar cada formato em nível e tendência, conforme a RN-08. | E | T | Implementado |
| MOD-APR-004 | Indicar o jeito de aprender principal do aluno somente nas condições da RN-09. | E | T | Implementado |
| MOD-APR-005 | Representar o resultado em um radar (pentagrama) com um eixo por jeito de aprender (Visual, Mãos na massa, Lógico, Simbólico e Espacial), cada um agrupando formatos de atividade. | E | D | Implementado |
| MOD-APR-006 | Atualizar o radar e os indicadores a cada nova jogada ou avaliação. | E | T | Implementado |
| MOD-APR-007 | Exibir ao aluno o jeito principal, um cartão por formato jogado, os formatos ainda não experimentados e uma missão sugerida. | I | D | Implementado |
| MOD-APR-008 | Exibir ao professor o radar e os indicadores de cada aluno e o consolidado da turma. | E | D | Parcial |
| MOD-APR-009 | Exibir a evolução do acerto ao longo dos meses. | I | D | Implementado |

**Situação atual, em detalhe**

- **App e painel:** chamam o cálculo de domínio do núcleo com rodadas, acertos de primeira, tentativas
  e dicas preservados. As últimas dez jogadas por formato são ordenadas por data e ID estável.
- **Apresentação:** o app mostra formatos; o painel agrupa os formatos nos cinco jeitos. A confiança e a
  indicação de predominância usam as condições do núcleo. Acerto médio permanece nas tabelas identificado
  como acerto. Registros antigos sem medidas suficientes não geram autonomia inventada.
- **Validação:** testes verificam a adaptação entre as interfaces. A conferência visual com o mesmo aluno
  no app e no painel permanece no roteiro de homologação.

### 5.2 Regras de negócio

| Regra | Síntese |
| --- | --- |
| RN-07 | Domínio = 65% acerto de primeira + 20% autonomia + 15% precisão, nas 10 jogadas mais recentes do formato. |
| RN-08 | Nível: 75 ou mais "vai muito bem"; 50 a 74 "está crescendo"; abaixo de 50 "vale treinar". Tendência quando a diferença entre as metades é de 12 pontos ou mais. |
| RN-09 | Jeito principal só com 2 ou mais jogadas, 6 ou mais fases e domínio médio de 60 ou mais. |
| RN-21 | No painel, o jeito em que o aluno vai melhor só aparece com pelo menos 3 atividades naquele jeito. |

### Fora do escopo atual

- Classificar o aluno em um estilo de aprendizagem fixo.
- Previsão de nota ou de reprovação.

## 6. Histórias de usuário

| ID | História | Requisitos |
| --- | --- | --- |
| HU-APR-01 | Como **professor**, quero ver em que jeito de aprender cada aluno vai melhor, para escolher o formato das atividades. | APR-005, APR-008 |
| HU-APR-02 | Como **professor**, quero o consolidado da turma, para planejar a aula para o grupo. | APR-008 |
| HU-APR-03 | Como **professor**, quero que a análise só apareça com dados suficientes, para não rotular um aluno por uma jogada. | APR-004 |
| HU-APR-04 | Como **aluno**, quero entender em que tipo de atividade vou bem e qual experimentar, para melhorar. | APR-007 |
| HU-APR-05 | Como **professor**, quero ver a evolução ao longo dos meses, para saber se a turma está melhorando. | APR-009 |
| HU-APR-06 | Como **equipe**, quero que o cálculo seja o mesmo no app e no painel, para não haver números diferentes para o mesmo aluno. | APR-001, APR-002, APR-003, APR-006 |

## 7. Critérios de aceite

Critérios marcados com [x] já são atendidos pelo sistema atual.

### HU-APR-01 — Jeito de cada aluno

- [x] CA-01: A ficha do aluno no painel mostra o pentagrama com os cinco jeitos, comparado com a média da turma.
- [x] CA-02: O jeito em que o aluno vai melhor só é indicado com pelo menos 3 atividades naquele jeito (RN-21).

### HU-APR-02 — Consolidado da turma

- [x] CA-01: A página Habilidades e insights mostra o pentagrama da turma e uma sugestão de como ensinar e avaliar.

### HU-APR-03 — Sem rótulo precipitado

- [x] CA-01: Dado um aluno com 1 jogada em um formato, então o app não indica jeito principal (RN-09).
- [x] CA-02: Os níveis aparecem como "vai muito bem", "está crescendo" e "vale treinar", nunca como "fraco" ou "ruim".

### HU-APR-04 — Análise para o aluno

- [x] CA-01: A aba Conquistas mostra um cartão por formato jogado, os formatos ainda não experimentados e uma missão sugerida.

### HU-APR-05 — Evolução mensal

- [x] CA-01: A página Desempenho mostra o acerto médio de cada turma mês a mês.

### HU-APR-06 — Mesmo cálculo em todo lugar

- [ ] CA-01: Dadas 10 jogadas com 80% de acerto de primeira, 100% de autonomia e precisão máxima, então o domínio é calculado pela RN-07 no núcleo, usado pelo app e pelo painel.
- [ ] CA-02: Dada uma nova jogada sincronizada, então o pentagrama do painel se atualiza na próxima consulta (fase 4).
- [ ] CA-03: O painel usa o domínio (RN-07), e não só o acerto médio, quando receber jogadas reais (fase 4).

## 8. MVP e fases

| Fase | Entrega | Situação |
| --- | --- | --- |
| 1 | Cálculo do domínio e análise no app. | Implementado |
| 3 | Pentagrama, insights e evolução no painel (acerto médio, dados de demonstração). | Implementado |
| 4 | Painel com o domínio calculado sobre as jogadas reais. | Implementado; aceite visual pendente |

## 9. Diretrizes do produto

- A análise é uma referência para o professor, nunca um diagnóstico.
- Sempre mostrar a base do número (quantas atividades sustentam a leitura).

## 10. Dependências e riscos

| Risco | Mitigação planejada |
| --- | --- |
| Pesos da RN-07 sem validação pedagógica | Validar com o professor orientador e a escola (pendência do PRD do produto). |
| Pouca jogada por formato | Amostra mínima (RN-09 e RN-21) e incentivo à variedade (ADR 0004). |

## 11. Pendências para aprovação

- Validar os pesos do domínio e decidir se poderão ser configurados.

## 12. Documentos vinculados

- [[PRD — Modolume]]
- [[PRD-12 — Painel do professor]] · [[PRD-04 — Missões do aluno]]
- [[0006-analise-de-aprendizagem-por-dominio|ADR 0006]]

## 13. Controle da revisão documental

A data `atualizado` do histórico foi preservada. A revisão documental de **13/11/2026** foi aprovada por
**Ana Barbiero — Líder de projeto**, para organização, consistência e rastreabilidade. Essa aprovação não
substitui o aceite funcional: cenários sem evidência ou dependentes de validação pedagógica, institucional
e de aparelhos continuam pendentes na matriz de engenharia. Não foi inferida uma data de criação.
