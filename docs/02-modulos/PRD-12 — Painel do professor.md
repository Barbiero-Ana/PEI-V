---
modulo: PRF
prd: PRD-12
atualizado: 2026-11-05
revisao_documental: 2026-11-13
responsavel_revisao: Ana Barbiero — Líder de projeto
status: para revisão
---

# PRD-12 — Painel do professor

## 1. Resumo executivo

O painel web é onde o professor transforma as jogadas dos alunos em decisões de aula. Começa pela agenda da semana e mostra quem pede atenção, as turmas e as **metas SMART** de cada turma: cada indicador diz o que mede, como é calculado, qual a meta, por que importa e em que período, com uma ação sugerida quando a meta não é atingida.

## 2. Problema e oportunidade

- P1 e P6 (produto): o professor não tem indicadores contínuos e consolidados.
- P2: o planejamento nem sempre usa evidências da turma.
- Números soltos ("65%") não dizem se a situação é boa ou ruim, nem o que fazer. Indicadores SMART resolvem isso.
- O professor tem pouco tempo: a interface precisa ser reconhecível à primeira vista, com poucas escolhas por vez e alvos fáceis de clicar (Nielsen, Hick e Fitts).

## 3. Usuários e necessidades

| Perfil | Necessidade | Solução |
| --- | --- | --- |
| Professor | Saber o que tem pela frente | Agenda da semana na abertura do painel |
| Professor | Saber quem precisa de ajuda e por quê | Lista "Pedem atenção" com o motivo em uma frase (RN-12) |
| Professor | Saber se a turma vai bem e o que fazer | Metas SMART por turma, com situação e ação sugerida (RN-13) |
| Professor | Achar as seções sem decorar ícones | Menu com nomes visíveis, em dois grupos |
| Gestão | Acompanhar as turmas | Mesmo painel, com escopo da gestão (fase 5) |

## 4. Objetivos e critérios de sucesso

| Objetivo | Indicador | Meta | Prazo |
| --- | --- | --- | --- |
| Encontrar quem precisa de ajuda | Tempo para localizar os alunos que pedem atenção | Menos de 1 minuto | Teste de tarefa na validação |
| Entender um indicador sem ajuda | Professores que explicam corretamente o que uma meta mede, depois de abrir "Como é medido" | 100% dos participantes | Teste de tarefa na validação |
| Uso regular | Acessos do professor ao painel por semana | Pelo menos 2 | 4 semanas de validação |
| Carregamento rápido | Tempo de carga para turma de até 40 alunos (MOD-DES-005) | Até 3 segundos | A medir antes da validação |

### 4.1 Critérios de validação

Testes automatizados dos indicadores (`packages/core/src/indicadores-smart.test.ts`), teste de tarefa com professores (localizar alunos, ler uma meta, planejar a partir dela) e checklist das [[Diretrizes de usabilidade do painel]].

## 5. Escopo funcional

### 5.1 Requisitos

| ID | Comportamento esperado | Prior. | Verif. | Situação |
| --- | --- | :---: | :---: | :---: |
| MOD-PRF-001 | O painel exibe as turmas do professor com número de alunos e acerto médio. | E | D | Implementado |
| MOD-PRF-002 | O painel exibe acerto médio, conclusão e tentativas por formato de atividade. | E | D | Implementado |
| MOD-PRF-003 | O painel lista os alunos com acerto médio, quantidade de atividades, tendência e formato de destaque. | E | D | Implementado |
| MOD-PRF-004 | O painel exibe as atividades publicadas recentemente. | I | D | Implementado |
| MOD-PRF-005 | O painel indica avaliações pendentes e alunos sem atividade recente. | I | D | Parcial |
| MOD-PRF-006 | O painel indica as missões e formatos com maior uso de dicas. | I | D | Pendente |
| MOD-PRF-007 | O painel oferece atalhos para criar plano de aula, criar atividade e abrir turmas. | D | D | Implementado |
| MOD-PRF-008 | O painel exibe, para cada turma, os indicadores SMART IND-01 a IND-06, cada um com valor, meta, período de medição, comparação com o período anterior e situação (RN-13). | E | T | Implementado |
| MOD-PRF-009 | Cada indicador mostra, na própria tela, sua definição SMART: o que mede, como é calculado, por que a meta é atingível, por que importa e em que período. | E | D | Implementado |
| MOD-PRF-010 | Um indicador abaixo ou perto da meta mostra uma ação sugerida e um atalho para planejar uma aula para a turma. | I | D | Implementado |
| MOD-PRF-011 | A Visão geral começa pela agenda da semana (aulas e atividades que entram no app), seguida dos alunos que pedem atenção e das turmas. | I | D | Implementado |
| MOD-PRF-012 | Os alunos que pedem atenção aparecem com o motivo em uma frase, conforme a RN-12. | E | D | Implementado |
| MOD-PRF-013 | O menu mostra o nome de todas as seções, em grupos (Visão geral; Acompanhar; Planejar), com no máximo 4 seções por grupo. | E | N | Implementado |
| MOD-PRF-014 | Todo item clicável do menu e das ações principais tem área mínima de 44 × 44 px. | E | N | Implementado |
| MOD-PRF-015 | Em telas estreitas, o menu vira uma gaveta aberta pelo botão "Menu", que mostra o nome da seção atual. | E | D | Implementado |
| MOD-PRF-016 | A situação de metas, alunos e resultados é escrita em texto, nunca indicada só por cor. | E | N | Implementado |
| MOD-PRF-017 | A página Desempenho mostra as metas SMART: com "Todas as turmas", uma tabela com uma linha por turma e uma coluna por indicador; com uma turma escolhida, as metas completas da turma. | E | D | Implementado |
| MOD-PRF-018 | O filtro de turma é o mesmo em todas as páginas (Turma, Alunos, Desempenho, Habilidades, Planos, Calendário e Atividades): um seletor com a cor e a contagem de cada turma, que ganha campo de busca a partir de 7 opções e funciona pelo teclado. | E | T | Implementado |
| MOD-PRF-019 | Os filtros ficam no endereço da página (podem ser compartilhados e desfeitos com o botão voltar), mostram a contagem de cada opção e oferecem "Limpar filtros". | I | T | Implementado |
| MOD-PRF-020 | Páginas com conteúdo em pastas mostram as abas na lateral esquerda, com nome e descrição; em telas estreitas, viram uma faixa com rolagem acima do conteúdo. | I | D | Implementado |
| MOD-PRF-021 | Com mais de 4 turmas e sem filtro, o gráfico de evolução e os resultados por formato mostram a média das turmas, em vez de uma linha por turma. | I | D | Implementado |
| MOD-PRF-022 | Abrir cartões, gavetas, explicações ou trocar de aba não muda a largura nem a rolagem da página (layout estável). | E | T | Implementado |
| MOD-PRF-023 | O cartão de resumo do aluno abre só depois de o mouse ficar parado 2 s sobre o nome, flutua sobre a página e fecha ao tirar o mouse, rolar ou apertar Esc. | I | T | Implementado |
| MOD-IU-003 | A plataforma web tem navegação lateral, listas, formulários e painéis de indicadores. | E | N | Implementado |

**Situação atual, em detalhe**

- **PRF-002:** com uma turma escolhida, a página Desempenho mostra acerto, conclusão e tentativas em cada formato.
- **PRF-005:** o painel mostra aulas sem registro e alunos que pedem atenção; avaliações pendentes dependem do [[PRD-15 — Avaliação e feedback]]. A participação na janela aparece na meta IND-05.
- **PRF-006:** o banco já guarda as dicas de cada jogada (coluna `dicas`), mas o painel ainda não as usa; os dados de demonstração não têm dicas (fase 4).
- Com a API ligada (`API_URL`), os números vêm das jogadas reais do app, guardadas no banco; sem ela, dos dados de demonstração do núcleo (ADR 0009 e 0015). O avatar de cada aluno é o que ele montou no app.

### 5.2 Indicadores SMART (RN-13)

Janela de medição: as **4 semanas** que terminam na atividade mais recente da turma, comparadas com as 4 semanas anteriores. Revisão a cada 4 semanas. Situação: **Meta atingida**; **Perto da meta** (até 5 pontos da meta, ou 0,3 tentativa no IND-06); **Abaixo da meta**; **Sem dados**.

| ID | Indicador | Específico (o que mede) | Mensurável (fórmula) | Atingível (meta) | Relevante (por que importa / ação) | Temporal |
| --- | --- | --- | --- | --- | --- | --- |
| IND-01 | Acerto médio da turma | Quanto a turma acerta nas atividades | Média do % de acerto dos resultados da janela | No mínimo 70% | Mostra se o conteúdo foi compreendido. Ação: retomar no formato em que a turma acerta mais. | 4 semanas |
| IND-02 | Alunos abaixo de 60% no período | Parcela da turma com acerto médio abaixo de 60% | Alunos com atividade e média < 60% ÷ alunos com atividade | No máximo 15% | Indica quem precisa de intervenção antes da avaliação. Ação: marcar esses alunos no próximo plano. | 4 semanas |
| IND-03 | Formato com menor acerto | O formato em que a turma acerta menos | Menor acerto médio entre formatos com 3 ou mais resultados | No mínimo 60% | Aponta o tipo de atividade que precisa de mediação. Ação: trabalhar o formato com apoio ou o conteúdo em outro formato. | 4 semanas |
| IND-04 | Conclusão das atividades | Quanto das atividades os alunos terminam | Média do % de conclusão | No mínimo 85% | Conclusão baixa indica atividade longa ou pouco tempo. Ação: rever o tamanho ou reservar tempo de aula. | 4 semanas |
| IND-05 | Participação | Alunos que fizeram ao menos uma atividade | Alunos com resultado na janela ÷ alunos da turma | No mínimo 90% | Sem participação, os outros números não representam a turma. Ação: verificar acesso ao aparelho. | 4 semanas |
| IND-06 | Tentativas por atividade | Tentativas médias até concluir | Média do número de tentativas | No máximo 1,8 | Muitas tentativas sugerem chute ou enunciado difícil. Ação: ler o enunciado com a turma. | 4 semanas |

As definições e as metas ficam em `packages/core/src/indicadores-smart.ts` (constante `INDICADORES_SMART`), e o texto exibido no painel sai dessa mesma constante.

### 5.3 Regras de negócio

| Regra | Síntese |
| --- | --- |
| RN-12 | Um aluno **pede atenção** quando tem atividade e acerto médio abaixo de 60% no período, ou queda de 10 pontos ou mais entre a primeira e a segunda metade do período. É uma referência para acompanhar, não um diagnóstico. |
| RN-13 | Os indicadores SMART usam janela de 4 semanas terminando na atividade mais recente, comparação com as 4 semanas anteriores, metas da tabela 5.2 e as situações "atingida", "perto", "abaixo" e "sem dados". |

### Fora do escopo atual

- Metas definidas pelo próprio professor (ver pendências).
- Exportar indicadores em planilha.
- Comparação entre professores ou escolas.

## 6. Histórias de usuário

| ID | História | Requisitos |
| --- | --- | --- |
| HU-PRF-01 | Como **professor**, quero abrir o painel e ver minha semana, para me organizar antes das aulas. | PRF-011, PRF-004, PRF-007 |
| HU-PRF-02 | Como **professor**, quero ver quem pede atenção e por quê, para agir antes da próxima avaliação. | PRF-012, PRF-003, PRF-005 |
| HU-PRF-03 | Como **professor**, quero saber se cada turma está atingindo as metas, para decidir onde concentrar esforço. | PRF-008, PRF-001 |
| HU-PRF-04 | Como **professor**, quero entender como cada indicador é calculado, para confiar no número e explicá-lo à coordenação. | PRF-009 |
| HU-PRF-05 | Como **professor**, quero uma sugestão do que fazer quando uma meta não é atingida, para ir direto ao planejamento. | PRF-010 |
| HU-PRF-06 | Como **professor**, quero comparar os formatos de atividade da turma, para escolher como ensinar e avaliar. | PRF-002, PRF-006 |
| HU-PRF-07 | Como **professor**, quero achar qualquer seção sem decorar ícones, no computador e no celular. | PRF-013, PRF-014, PRF-015, IU-003 |
| HU-PRF-08 | Como **professor daltônico ou com baixa visão**, quero entender a situação sem depender de cores. | PRF-016 |
| HU-PRF-09 | Como **professor com muitas turmas**, quero escolher a turma numa lista com busca, igual em todas as páginas, para filtrar resultados sem a tela virar uma bagunça. | PRF-018, PRF-019, PRF-021 |
| HU-PRF-10 | Como **professor**, quero comparar as metas de todas as turmas numa só tela. | PRF-017 |
| HU-PRF-11 | Como **professor**, quero que a tela não se mexa quando abro um cartão ou troco de aba. | PRF-020, PRF-022, PRF-023 |

## 7. Critérios de aceite

Critérios marcados com [x] já são atendidos pelo painel atual (dados de demonstração).

### HU-PRF-01 — Minha semana

- [x] CA-01: A Visão geral começa pela data de hoje, pela saudação e pela agenda de segunda a sexta, com as aulas e as atividades que entram no app em cada dia.
- [x] CA-02: Dadas aulas passadas sem registro, então um aviso no topo da agenda informa quantas são e leva à aula.
- [x] CA-03: A ação principal da tela ("Novo plano de aula") é a única com botão preenchido.

### HU-PRF-02 — Quem pede atenção

- [x] CA-01: Dado um aluno com acerto médio de 55%, então ele aparece em "Pedem atenção" com a frase "Acerto abaixo de 60%" (RN-12).
- [x] CA-02: Dado um aluno com queda de 12 pontos, então a frase informa a queda em pontos.
- [x] CA-03: O menu mostra, ao lado de "Alunos", quantos alunos pedem atenção.
- [ ] CA-04: Avaliações pendentes aparecem na Visão geral (depende do PRD-15).

### HU-PRF-03 — Metas da turma

- [x] CA-01: A aba "Metas" da turma mostra os seis indicadores com valor, meta, comparação com as 4 semanas anteriores e situação.
- [x] CA-02: O topo da aba informa o período medido, o período de comparação, a data da próxima revisão e quantas metas foram atingidas.
- [x] CA-03: Cada cartão de turma na Visão geral mostra "N de 6 atingidas" e quantas estão abaixo da meta.
- [x] CA-04: Dada uma turma sem atividades no período, então os indicadores aparecem como "Sem dados", e não como zero.
- [x] CA-05: A aba "Metas" mostra um contador em destaque quando há metas abaixo.

### HU-PRF-04 — Como é medido

- [x] CA-01: Cada indicador tem "Como é medido", que abre as partes Específico, Mensurável, Atingível, Relevante e Temporal e a quantidade de resultados usados.
- [x] CA-02: O texto exibido é o mesmo desta seção 5.2 (vem de `INDICADORES_SMART`).

### HU-PRF-05 — O que fazer

- [x] CA-01: Dado um indicador "Abaixo da meta" ou "Perto da meta", então aparece "O que fazer:" com a ação sugerida e o atalho "Planejar aula" para a turma.
- [x] CA-02: Indicadores com meta atingida não mostram ação, para não poluir a tela.

### HU-PRF-06 — Comparar formatos

- [x] CA-01: A aba "Formatos de atividade" da turma mostra o acerto médio por formato e quantos resultados sustentam cada número.
- [x] CA-02: Com uma turma escolhida em Desempenho, conclusão e tentativas aparecem por formato (PRF-002).
- [ ] CA-03: O painel mostra as missões e os formatos com maior uso de dicas (PRF-006, fase 4).

### HU-PRF-07 — Navegação reconhecível

- [x] CA-01: No computador, o menu lateral mostra o nome de todas as seções, separadas em "Acompanhar" (Turmas, Alunos, Desempenho, Habilidades e insights) e "Planejar" (Planos de aula, Calendário, Atividades para o app).
- [x] CA-02: A seção atual fica destacada e é anunciada ao leitor de tela (`aria-current`).
- [x] CA-03: Cada item do menu tem pelo menos 44 px de altura e ocupa a largura do menu.
- [x] CA-04: Em telas estreitas, o topo mostra o nome da seção atual e o botão "Menu"; a gaveta fecha com "Fechar", com a tecla Esc, tocando fora ou ao escolher uma seção.
- [x] CA-05: Há o link "Pular para o conteúdo", visível ao navegar pelo teclado.
- [x] CA-06: "Sair do painel" fica sempre visível no rodapé do menu (no celular, no topo).

### HU-PRF-09 — Filtro de turma que escala

- [x] CA-01: Em todas as páginas com turma, o filtro é um seletor "Turma" com a turma escolhida, sua cor e a contagem.
- [x] CA-02: Dada uma lista com mais de 6 opções, o seletor mostra o campo "Buscar turma", que filtra sem diferenciar acentos.
- [x] CA-03: O seletor abre com Enter ou seta para baixo, navega com as setas, escolhe com Enter e fecha com Esc ou clicando fora.
- [x] CA-04: Em Alunos, turma, situação ("Todos" ou "Pedem atenção") e ordem são filtros separados, cada um com a sua contagem, e o resultado diz "N de M alunos" com "Limpar filtros".
- [x] CA-05: Em Alunos, a lista mostra 20 alunos por página, com "Anterior" e "Próxima"; mudar um filtro volta para a página 1.
- [x] CA-06: Com mais de 4 turmas e "Todas as turmas", o gráfico de Desempenho mostra a média das turmas.

### HU-PRF-10 — Metas de todas as turmas

- [x] CA-01: Em Desempenho com "Todas as turmas", a tabela "Metas por turma" tem uma linha por turma (com "N de 6 atingidas") e uma coluna por indicador, com valor e situação escrita.
- [x] CA-02: Clicar no nome da turma mostra as metas completas dela, com "Como é medido" e "O que fazer".

### HU-PRF-11 — Tela estável

- [x] CA-01: Trocar de aba na ficha da turma não cria nem remove barra de rolagem da página.
- [x] CA-02: As abas ficam na lateral e o painel tem altura mínima, para a página não "pular" ao trocar de aba.
- [x] CA-03: O cartão de resumo do aluno abre com o mouse parado 2 s sobre o nome e não empurra a lista.

### HU-PRF-08 — Sem depender de cor

- [x] CA-01: A situação de cada meta aparece escrita ("Meta atingida", "Perto da meta", "Abaixo da meta", "Sem dados").
- [x] CA-02: A comparação com o período anterior aparece escrita ("Melhorou 3 pts em 4 semanas", "Piorou…").
- [x] CA-03: Valores em alerta usam cor com contraste de pelo menos 4,5:1 sobre branco.

## 8. MVP e fases

| Fase | Entrega | Situação |
| --- | --- | --- |
| 3 | Etapas 1 a 4 do painel (ADR 0009), metas SMART e navegação com nomes visíveis. | Implementado |
| 4 | Dados reais pela API: dicas por formato, domínio no pentagrama, avaliações pendentes. | Pendente |
| 5 | Visão da escola para a coordenação (`/coordenacao`): parâmetros gerais, desempenho por turma e por formato, dados individuais só para consulta (ADR 0019). | Implementado |

## 9. Diretrizes do produto

- Todo número mostrado ao professor responde: o que é, é bom ou ruim, comparado com quê e o que fazer.
- Agenda primeiro; cor da marca como identidade; pouca tabela; números-chave grandes.
- Seguir as [[Diretrizes de usabilidade do painel]] em toda tela nova.
- Linguagem de acompanhamento, nunca de diagnóstico.

## 10. Dependências e riscos

| Risco | Mitigação planejada |
| --- | --- |
| Metas fixas não servirem para todas as turmas | Metas documentadas como proposta; pendência de permitir ajuste pelo professor. |
| Dois números parecidos confundirem ("pedem atenção" no período todo × IND-02 nas 4 semanas) | Nomes diferentes e período escrito em cada um; "Como é medido" explica a diferença. |
| Dados de demonstração com datas antigas | A janela é calculada a partir da atividade mais recente, e não da data de hoje. |

## 11. Pendências para aprovação

- Aprovar as metas do IND-01 ao IND-06.
- Decidir se o professor poderá ajustar as metas da própria turma.
- Decidir se a janela deve seguir o bimestre escolar em vez de 4 semanas.

## 12. Documentos vinculados

- [[PRD — Modolume]]
- [[PRD-11 — Análise de aprendizagem]] · [[PRD-13 — Planejamento de aulas]] · [[PRD-14 — Atividades do professor]] · [[PRD-16 — Notificações]]
- [[Diretrizes de usabilidade do painel]]
- [[0008-painel-do-professor-em-nextjs|ADR 0008]] · [[0009-painel-construido-por-etapas|ADR 0009]] · [[0012-indicadores-smart-no-painel|ADR 0012]] · [[0013-navegacao-do-painel-com-nomes-visiveis|ADR 0013]]

## 13. Controle da revisão documental

A data `atualizado` do histórico foi preservada. A revisão documental de **13/11/2026** foi aprovada por
**Ana Barbiero — Líder de projeto**, para organização, consistência e rastreabilidade. Essa aprovação não
substitui o aceite funcional: cenários sem evidência ou dependentes de validação pedagógica, institucional
e de aparelhos continuam pendentes na matriz de engenharia. Não foi inferida uma data de criação.
