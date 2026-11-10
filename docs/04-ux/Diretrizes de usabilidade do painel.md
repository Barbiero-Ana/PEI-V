---
atualizado: 2026-11-04
status: para revisão
---

# Diretrizes de usabilidade do painel

Regras de interface do painel do professor (e, no que couber, do app do aluno), baseadas nas **10 heurísticas de Nielsen**, na **lei de Hick** e na **lei de Fitts**. Toda tela nova ou alterada passa pelo checklist da seção 4 antes de ser entregue. Os requisitos correspondentes são o MOD-USA-018 ([[PRD-17 — Qualidade, segurança e restrições]]) e o MOD-PRF-013 a MOD-PRF-016 ([[PRD-12 — Painel do professor]]).

## 1. Heurísticas de Nielsen

| Nº | Heurística | O que significa | Como o painel aplica |
| --- | --- | --- | --- |
| 1 | Visibilidade do estado do sistema | O usuário sempre sabe onde está e o que está acontecendo. | Seção atual destacada no menu e anunciada ao leitor de tela; no celular, o nome da seção aparece no topo; trilha "Visão geral / Turmas / 6º Ano A"; período medido escrito no topo das metas; contadores no menu (alunos em atenção, aulas sem registro). |
| 2 | Correspondência com o mundo real | A linguagem é a do usuário, não a do sistema. | Termos de escola: "plano de aula", "diário da turma", "registro da aula", "pedem atenção". Indicadores em frases ("Melhorou 3 pts em 4 semanas"), sem siglas técnicas na interface. |
| 3 | Controle e liberdade | É fácil desfazer e sair. | Gaveta do menu fecha com "Fechar", Esc ou toque fora; atividade enviada pode voltar para rascunho; "Sair do painel" sempre visível. |
| 4 | Consistência e padrões | O mesmo elemento funciona do mesmo jeito em todas as telas. | Links de seção sempre como "Ver …" com seta à direita; uma única cor para ações (roxo); alerta sempre em pêssego escuro com texto; mesmas faixas de acerto (80%, 60%) em todo o painel. |
| 5 | Prevenção de erros | Evitar o erro antes de corrigi-lo. | Exclusão em dois passos ("Excluir" → "Excluir definitivamente"); formulários em etapas, com validação no servidor e a mensagem junto ao campo; datas por seletor de data. |
| 6 | Reconhecer em vez de lembrar | Mostrar as opções, em vez de exigir que o usuário as decore. | Menu com o **nome** de cada seção (antes eram só ícones); formulário de plano mostra os dados da turma ao lado; "Como é medido" explica o indicador na própria tela. |
| 7 | Flexibilidade e eficiência | Atalhos para quem já conhece o sistema. | Planejar direto da ficha da turma, do aluno ou de uma meta abaixo; "Duplicar plano"; busca de aluno na turma; filtros que ficam no endereço da página. |
| 8 | Estética e design minimalista | Mostrar só o que importa para a decisão. | Agenda primeiro; ação sugerida só quando a meta não é atingida; definições SMART recolhidas até serem pedidas; pouca tabela. |
| 9 | Ajudar a reconhecer e corrigir erros | Mensagens claras, com a solução. | "Dê um tema para a aula.", "Escolha ao menos uma turma.", "Marque a alternativa correta.": cada mensagem diz o que fazer. |
| 10 | Ajuda e documentação | Ajuda no contexto, quando necessária. | "Como é medido" em cada indicador, com as partes SMART e a base do cálculo; legendas das faixas de acerto; descrição curta abaixo do título de cada seção. |

## 2. Lei de Hick

> O tempo para decidir cresce com o número de opções. Menos opções por vez, e agrupadas, levam a decisões mais rápidas.

| Regra | Aplicação no painel |
| --- | --- |
| Agrupar a navegação | Menu em três blocos: Visão geral; **Acompanhar** (Turmas, Alunos, Desempenho, Habilidades e insights); **Planejar** (Planos de aula, Calendário, Atividades para o app). No máximo 4 seções por grupo. |
| Uma ação principal por tela | Só a ação principal tem botão preenchido (por exemplo, "Novo plano de aula" na Visão geral, "Planejar aula" na turma); as demais são links. |
| Revelar aos poucos | Detalhes ficam recolhidos: "Como é medido", "Excluir", atividades do dia na agenda. Formulários longos são divididos em etapas. |
| Abas curtas e na lateral | No máximo 5 abas por página (a turma tem Diário, Metas, Formatos, Aulas e Sobre), na lateral esquerda, com nome e descrição sempre visíveis. |
| Uma escolha por vez nos filtros | A turma é escolhida num seletor (uma lista que abre), e não em dezenas de botões; com mais de 6 turmas, a lista ganha busca. Situação e ordem, que têm poucas opções fixas, ficam em botões. |
| Não comparar o que não cabe | Com mais de 4 turmas, o gráfico mostra a média e não uma linha por turma; a tabela de metas cresce para baixo (uma linha por turma). |
| Destacar o que pede ação | Metas abaixo e alunos em atenção vêm com contador; o resto fica neutro. |

## 3. Lei de Fitts

> O tempo para acertar um alvo depende da distância e do tamanho: alvos grandes e próximos são mais rápidos.

| Regra | Aplicação no painel |
| --- | --- |
| Alvo mínimo de 44 × 44 px | Itens do menu, botão "Menu", "Sair", "Como é medido", "Planejar aula" e ícone de ficha do aluno têm pelo menos 44 px. |
| Linhas inteiras clicáveis | Itens do menu ocupam toda a largura; em "Pedem atenção" e nos cartões de turma da Visão geral, a linha ou o cartão inteiro é o link. (Pendente: aplicar o mesmo ao diário da turma.) |
| Ação perto do conteúdo | "Planejar aula" aparece ao lado da meta que motivou a ação; "Ver alunos" no canto do bloco "Pedem atenção". |
| Bordas e cantos | Menu fixo na borda esquerda (computador); botão "Menu" no canto superior direito (celular), ao alcance do polegar. |
| Ícone sozinho, só com rótulo | Ícones isolados só onde o significado é universal (sino); nos demais, ícone e texto juntos. |
| Opções da lista grandes | Cada opção do seletor de turma tem 44 px de altura e a linha inteira é clicável. |

## 4. Estabilidade da tela

A tela não pode "tremer" nem "pular" quando o professor abre ou fecha algo.

- A área de conteúdo reserva sempre o espaço da barra de rolagem (`scrollbar-gutter: stable`).
- A área de conteúdo é o contêiner dos elementos de posição absoluta (`position: relative`), para que nada escape da rolagem e crie uma segunda barra na página.
- Cartões flutuantes (resumo do aluno, seletor de turma, alertas) ficam sobre a página e não empurram o conteúdo.
- O painel das abas tem altura mínima, para a página não encolher ao trocar para uma aba curta.
- O cartão de resumo do aluno só abre com o mouse parado 2 s sobre o nome.

## 5. Checklist para tela nova ou alterada

- [ ] A seção atual está destacada no menu e a página tem um título (`h1`) claro.
- [ ] Os termos são os do professor (escola), sem jargão técnico.
- [ ] Há uma única ação principal com botão preenchido.
- [ ] Todo alvo clicável tem pelo menos 44 × 44 px.
- [ ] Nenhuma informação depende só de cor (situação sempre escrita).
- [ ] Contraste de texto de pelo menos 4,5:1.
- [ ] Ações destrutivas pedem confirmação; ações reversíveis podem ser desfeitas.
- [ ] Mensagens de erro ficam junto ao campo e dizem o que fazer.
- [ ] Listas vazias explicam o que fazer.
- [ ] Todo número mostrado ao professor diz o que é, a meta ou a referência, o período e a base do cálculo (indicador SMART).
- [ ] A tela funciona em 390 px de largura, sem rolagem lateral.
- [ ] A navegação por teclado alcança tudo, e "Pular para o conteúdo" funciona.
- [ ] Abrir, fechar ou trocar qualquer coisa não muda a largura nem cria barra de rolagem na página.
- [ ] Filtro de turma pelo seletor comum, com contagem; a tela continua organizada com 30 turmas.
- [ ] Listas com mais de 20 itens têm páginas.
- [ ] Sem emojis e sem gradientes; cores e fontes da marca.

## 6. Revisões já feitas

| Data | Tela | Problema | Heurística/lei | Mudança |
| --- | --- | --- | --- | --- |
| 04/11/2026 | Menu do painel | 8 ícones sem nome, que só apareciam ao passar o mouse | Nielsen 6; Hick | Menu com nomes, em grupos; gaveta com nomes no celular |
| 04/11/2026 | Menu do painel | Ponto colorido sem número para avisos | Nielsen 1; cor como única informação | Contador com número e texto para o leitor de tela |
| 04/11/2026 | Ficha da turma | Botão "+" redondo sem texto | Nielsen 6 | Botão "Planejar aula" com texto |
| 04/11/2026 | Ficha da turma | Ícone de ficha do aluno com 32 px | Fitts | Área ampliada para 44 px |
| 04/11/2026 | Turma e Visão geral | Números sem meta nem período | Nielsen 2 e 10 | Aba "Metas" com indicadores SMART |
| 04/11/2026 | Layout | Sem atalho de teclado para o conteúdo | Nielsen 7 | Link "Pular para o conteúdo" |
| 04/11/2026 | Todas as telas | Página ganhava uma segunda barra de rolagem que aparecia e sumia ao trocar de aba ("tela tremendo") | Nielsen 4 e 8 | Conteúdo como contêiner dos elementos absolutos e espaço da barra reservado |
| 04/11/2026 | Pastas (turma) | Abas no topo quebravam em duas linhas | Hick; Nielsen 6 | Abas na lateral, com descrição |
| 04/11/2026 | Alunos | Turma e "precisam de atenção" misturados nas mesmas abas | Nielsen 4; Hick | Filtros separados (turma, situação, ordem), com contagem, "Limpar filtros" e páginas de 20 |
| 04/11/2026 | Todas com turma | Botões de turma virariam uma parede com muitas turmas | Hick; Fitts | Seletor de turma comum, com busca a partir de 7 opções |
| 04/11/2026 | Desempenho | Metas só existiam dentro da ficha da turma; cores de turma diferentes do resto do painel | Nielsen 1 e 4 | Metas por turma no topo, filtro de turma, mesmas cores; média geral com mais de 4 turmas |
| 04/11/2026 | Ficha da turma | Cartão do aluno abria em toda a linha e empurrava a lista | Nielsen 8 | Abre só sobre o nome, após 2 s, flutuando sobre a página |
| 04/11/2026 | Calendário, Habilidades | Botões de 32 px | Fitts | 44 px |

## 7. Pendências de revisão

- Paginar as demais listas longas (planos e atividades) e a lista de turmas da Visão geral, para escolas com muitas turmas.
- Medir contraste e tempo de carregamento (MOD-USA-013, MOD-DES-005).
- Conferir alvos de 44 pontos em todos os botões do app do aluno (MOD-USA-014).

## 8. Documentos vinculados

- [[PRD-12 — Painel do professor]] · [[PRD-17 — Qualidade, segurança e restrições]] · [[PRD-08 — Acessibilidade]]
- [[0013-navegacao-do-painel-com-nomes-visiveis|ADR 0013]]
