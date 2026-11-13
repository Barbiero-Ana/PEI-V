---
modulo: ATI
prd: PRD-14
atualizado: 2026-11-11
revisao_documental: 2026-11-13
responsavel_revisao: Ana Barbiero — Líder de projeto
status: para revisão
---

# PRD-14 — Atividades do professor

## 1. Resumo executivo

O professor monta atividades no painel e as envia ao app da turma: com questões próprias, em quatro formatos que o app corrige e mede (objetiva, completar, associação e sequência), ou escolhendo uma atividade pronta do app (montagem, manipulação e 3D). É a volta da ponte: o dado leva à decisão, e a decisão chega ao aluno (ADR 0011).

## 2. Problema e oportunidade

- P2 (produto): o professor precisa adaptar o conteúdo à turma, não só observar resultados.
- Um editor livre não permitiria corrigir nem medir o acerto por formato, que é a base da análise.

## 3. Usuários e necessidades

| Perfil | Necessidade | Solução |
| --- | --- | --- |
| Professor | Criar atividades do jeito da turma | Editor com quatro formatos e questões próprias |
| Professor | Usar os jogos do app | Escolha de atividade pronta do catálogo |
| Professor | Saber quem fez | Acompanhamento de conclusão por atividade (fase 4) |
| Aluno | Receber a atividade no app | Envio para as turmas, com data de liberação |

## 4. Objetivos e critérios de sucesso

| Objetivo | Indicador | Meta | Prazo |
| --- | --- | --- | --- |
| Criar e enviar rápido | Passos para criar e publicar uma atividade (MOD-USA-004) | Até 5 | Já atendido (3 etapas e o envio) |
| Atividades ligadas ao planejamento | Atividades vinculadas a um plano de aula | 50% | 4 semanas de validação |
| Conclusão acompanhada | Atividades enviadas com a situação de cada aluno visível | 100% | Fase 4 |

### 4.1 Critérios de validação

Testes de validação do conteúdo (`atividadeSchema`), demonstração do envio e, na fase 4, teste ponta a ponta painel → app → painel.

## 5. Escopo funcional

### 5.1 Requisitos

| ID | Comportamento esperado | Prior. | Verif. | Situação |
| --- | --- | :---: | :---: | :---: |
| MOD-ATI-001 | Disponibilizar ao professor o catálogo de missões, com conteúdo, formato, número de fases e mapa. | E | D | Parcial |
| MOD-ATI-002 | O professor cria atividades com questões próprias, nos formatos objetiva, completar, associação e sequência, ou escolhe uma atividade pronta do app. | E | T | Implementado |
| MOD-ATI-003 | Toda atividade tem título; instrução e orientações são opcionais. | E | T | Implementado |
| MOD-ATI-004 | O professor seleciona as turmas que recebem a atividade. | E | T | Implementado |
| MOD-ATI-005 | O professor define data de início e data limite. | I | T | Implementado |
| MOD-ATI-006 | A atividade fica associada ao seu formato e, quando informada, a uma habilidade da BNCC. | I | T | Implementado |
| MOD-ATI-007 | O professor edita atividades em rascunho e o prazo de atividades publicadas. | E | T | Implementado |
| MOD-ATI-008 | O professor publica (envia) a atividade para os alunos. | E | T | Implementado |
| MOD-ATI-009 | Exibir a situação da atividade: rascunho, publicada ou encerrada. | E | D | Implementado |
| MOD-ATI-010 | O professor vê, por atividade, os alunos que concluíram, que estão em andamento e que não iniciaram. | E | D | Implementado |
| MOD-ATI-011 | O professor pode liberar todos os mapas de uma turma, dispensando a ordem de desbloqueio. | D | T | Pendente |
| MOD-ATI-012 | O servidor valida o conteúdo de cada questão e exige uma orientação para resposta errada antes de publicar atividades com questões próprias. | E | T | Implementado |
| MOD-ATI-013 | O professor pré-visualiza a atividade como o aluno vai vê-la. | I | D | Implementado |
| MOD-ATI-014 | A atividade pode ser vinculada a um plano de aula. | I | T | Implementado |
| MOD-ATI-015 | A exclusão de uma atividade pede confirmação. | E | T | Implementado |

| MOD-ATI-016 | Preservar cada publicação e vincular início, resposta offline e avaliação ao conteúdo respondido, sem substituir o histórico. | E | T | Implementado |

**Situação atual, em detalhe**

- **ATI-001:** o editor lista as atividades prontas do app com título e conteúdo; número de fases e mapa ainda não aparecem.
- **ATI-002:** mudou em relação à SRS v0.2, que previa atividades "compostas por uma ou mais missões do catálogo". O sistema adotou o modelo da ADR 0011: questões próprias em quatro formatos ou uma atividade pronta.
- **ATI-005 e ATI-009:** há liberação e prazo opcional, validado também no banco. A situação encerrada é derivada depois do último dia do prazo, no calendário escolar compartilhado.
- **ATI-007:** o formulário e a API permitem alterar somente o prazo enquanto a atividade está publicada. Recolher permite editar o rascunho; enviar novamente cria outra publicação imutável.
- **ATI-008 e ATI-010:** as atividades ficam no banco; enviadas e liberadas, aparecem na aba "Professor" do app. A página da atividade distingue não iniciada, em andamento e concluída. Inícios offline são sincronizados separadamente dos resultados. Entregas concluídas abrem a avaliação por aluno.

- **ATI-016:** cada publicação guarda conteúdo e destinatários. Início e resultado levam o identificador da publicação. O envio offline é conferido contra essa cópia, mesmo após republicação ou arquivamento. A migração observa o legado atualmente publicado e não atribui revisões a jogadas antigas. Ver [ADR 0026](../03-decisoes/0026-publicacoes-imutaveis-de-atividade.md).

### 5.2 Regras de negócio

| Regra | Síntese |
| --- | --- |
| RN-26 | Conteúdo por formato: **objetiva** (enunciado, alternativas e índice da correta); **completar** (texto com as respostas entre colchetes, como `25% de 80 é [20]`); **associação** (pares lado A e lado B); **sequência** (itens na ordem certa, que o app embaralha). Toda questão é do mesmo formato da atividade. Cada questão própria precisa de uma orientação de até 300 caracteres para publicação. Atividades já publicadas sem orientação exibem o retorno padrão do app. |
| RN-27 | A atividade fica em rascunho até ser enviada; só atividades enviadas aparecem no app e na agenda do professor. |

### Fora do escopo atual

- Questões com imagem ou áudio enviados pelo professor.
- Montagem, manipulação e 3D com conteúdo próprio (dependem de um jogo do app).
- Banco de questões compartilhado entre professores.

## 6. Histórias de usuário

| ID | História | Requisitos |
| --- | --- | --- |
| HU-ATI-01 | Como **professor**, quero criar uma atividade com minhas questões, para trabalhar o conteúdo do jeito da minha turma. | ATI-002, ATI-003, ATI-006, ATI-012 |
| HU-ATI-02 | Como **professor**, quero escolher um jogo pronto do app, para usar montagem, manipulação ou 3D. | ATI-001, ATI-002 |
| HU-ATI-03 | Como **professor**, quero ver a atividade como o aluno verá, antes de enviar. | ATI-013 |
| HU-ATI-04 | Como **professor**, quero enviar para as turmas certas, com data de início e prazo. | ATI-004, ATI-005, ATI-008 |
| HU-ATI-05 | Como **professor**, quero corrigir uma atividade ou mudar o prazo depois de enviar. | ATI-007, ATI-009, ATI-015 |
| HU-ATI-06 | Como **professor**, quero saber quem já fez, quem está fazendo e quem não começou. | ATI-010 |
| HU-ATI-07 | Como **professor**, quero ligar a atividade ao plano da aula. | ATI-014 |
| HU-ATI-08 | Como **professor**, quero liberar todos os mapas para a turma, quando fizer sentido. | ATI-011 |

| HU-ATI-09 | Como **aluno e professor**, quero preservar a versão respondida offline para manter resultados e devolutivas coerentes. | ATI-016, ATI-007 |

## 7. Critérios de aceite

Critérios marcados com [x] já são atendidos pelo painel atual.

### HU-ATI-01 — Questões próprias

- [x] CA-01: O editor tem três etapas (Atividade, Questões e Envio) e mostra em qual o professor está.
- [x] CA-02: Dada uma questão objetiva sem alternativa correta marcada, então o editor mostra "Marque a alternativa correta." e não deixa enviar.
- [x] CA-03: Dada uma questão de completar, então as respostas são as palavras entre colchetes (RN-26).
- [x] CA-04: Toda atividade exige título com pelo menos 3 caracteres ("Dê um título à atividade."); a habilidade da BNCC é opcional.
- [x] CA-05: Uma atividade com questões próprias exige ao menos uma questão ("Adicione ao menos uma questão.").
- [x] CA-06: O professor pode salvar um rascunho sem a orientação. Ao tentar publicar, o painel indica a primeira questão que precisa de feedback.
- [ ] CA-07: Quando o aluno confere uma resposta completa e errada, o app mostra a orientação daquela questão. Uma tentativa incompleta pede os dados que faltam. Ao acertar, o aluno vê o Lilo no rodapé e pode avançar ou ver o resultado.

### HU-ATI-02 — Atividade pronta

- [x] CA-01: Dado o formato "pronta", então o professor escolhe um jogo do app em uma lista, e o editor não pede questões.
- [ ] CA-02: Cada item do catálogo mostra formato, número de fases e mapa.

### HU-ATI-03 — Pré-visualização

- [x] CA-01: O editor mostra uma prévia da atividade, como no app.

### HU-ATI-04 — Enviar com datas

- [x] CA-01: O envio exige ao menos uma turma ("Escolha ao menos uma turma.") e a data de liberação.
- [x] CA-02: Atividades enviadas aparecem na agenda da Visão geral, no dia de liberação.
- [ ] CA-03: O professor define a data limite, e o app mostra o prazo (MIS-013).
- [x] CA-04: A atividade enviada aparece no app dos alunos da turma, na aba "Professor", a partir da data de liberação.

### HU-ATI-05 — Corrigir depois de enviar

- [x] CA-01: Uma atividade enviada pode voltar para rascunho para ser editada.
- [x] CA-02: Excluir exige abrir "Excluir" e confirmar em "Excluir definitivamente".
- [ ] CA-03: Depois da data limite, a atividade aparece como "Encerrada".

### HU-ATI-06 — Quem fez

- [x] CA-01: A página da atividade mostra quem já fez (com o acerto) e quem ainda não fez.
- [ ] CA-02: Separar também quem começou e não terminou ("em andamento").

### HU-ATI-07 — Ligada ao plano

- [x] CA-01: Dado um plano de aula, quando o professor cria uma atividade a partir dele, então a atividade já vem vinculada ao plano.

### HU-ATI-08 — Liberar mapas

- [ ] CA-01: Dada a opção "Liberar todos os mapas" na turma, então os alunos dessa turma veem todos os mapas abertos no app.

### HU-ATI-09 — Publicações preservadas

- [ ] CA-01: Dois envios concorrentes de uma atividade publicada retornam o mesmo identificador de publicação.
- [ ] CA-02: Alterar questões de uma atividade publicada é recusado; ajustar o prazo mantém o conteúdo.
- [ ] CA-03: Uma resposta da publicação 1 feita offline é registrada nessa versão após recolher, editar e publicar a 2.
- [ ] CA-04: Resposta sem versão, de outra atividade, de turma não destinatária ou com quantidade de fases incompatível é recusada e preservada no aparelho.
- [ ] CA-05: A entrega da publicação 1 não conclui automaticamente a publicação 2; a avaliação usa o título e a habilidade da resposta.
- [ ] CA-06: Arquivar preserva as publicações e permite sincronizar uma resposta offline válida.

Evidência automatizada: `verificar-publicacoes.ts`. Os critérios permanecem abertos para aceite integrado no APK.

## 8. MVP e fases

| Fase | Entrega | Situação |
| --- | --- | --- |
| 3 | Editor com quatro formatos e atividades prontas, prévia, vínculo com plano, envio em memória. | Implementado |
| 4 | Envio real ao app e acompanhamento por aluno. | Implementado |
| 5 | Data limite e situação "encerrada". | Implementado; homologação física pendente |

## 9. Diretrizes do produto

- Só formatos que o app consegue corrigir e medir; sem isso, a atividade não alimenta a análise.
- Uma ação principal por etapa do editor (lei de Hick).

## 10. Dependências e riscos

| Risco | Mitigação planejada |
| --- | --- |
| O contrato de conteúdo mudar na integração | Formato fixo validado no servidor (RN-26), que será o mesmo da API. |
| Atividades em memória somem ao reiniciar | Aceito para demonstração; resolvido na fase 4. |

## 11. Pendências para aprovação

- Confirmar a mudança do ATI-002 em relação à SRS v0.2.
- Homologar o prazo opcional, o calendário escolar e o tratamento das revisões de conteúdo após execução offline (ADR 0025).

## 12. Documentos vinculados

- [[PRD — Modolume]]
- [[PRD-13 — Planejamento de aulas]] · [[PRD-04 — Missões do aluno]] · [[PRD-15 — Avaliação e feedback]]
- [[0011-atividades-montadas-pelo-professor|ADR 0011]]

## 13. Controle da revisão documental

A data `atualizado` do histórico foi preservada. A revisão documental de **13/11/2026** foi aprovada por
**Ana Barbiero — Líder de projeto**, para organização, consistência e rastreabilidade. Essa aprovação não
substitui o aceite funcional: cenários sem evidência ou dependentes de validação pedagógica, institucional
e de aparelhos continuam pendentes na matriz de engenharia. Não foi inferida uma data de criação.
