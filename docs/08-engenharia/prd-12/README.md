# PRD-12 — Painel do professor

**Data registrada no PRD de origem:** 2026-11-05. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

A web recorta dados por professor e turma, calcula indicadores e apresenta agenda, alertas e filtros.

[PRD de origem](../../02-modulos/PRD-12%20%E2%80%94%20Painel%20do%20professor.md) · [Matriz de rastreabilidade](../matriz.md) · [Qualidade e permissões](../prd-17/README.md)

## Perfis e necessidades

| Perfil | Necessidade | Solução |
| --- | --- | --- |
| Professor | Saber o que tem pela frente | Agenda da semana na abertura do painel |
| Professor | Saber quem precisa de ajuda e por quê | Lista "Pedem atenção" com o motivo em uma frase (RN-12) |
| Professor | Saber se a turma vai bem e o que fazer | Metas SMART por turma, com situação e ação sugerida (RN-13) |
| Professor | Achar as seções sem decorar ícones | Menu com nomes visíveis, em dois grupos |
| Gestão | Acompanhar as turmas | Mesmo painel, com escopo da gestão (fase 5) |

## Implementação

- [apps/web/app/professor/(painel)](../../../apps/web/app/professor/(painel))
- [apps/web/lib/painel/dados.ts](../../../apps/web/lib/painel/dados.ts)
- [packages/core/src/indicadores-smart.ts](../../../packages/core/src/indicadores-smart.ts)
- [apps/api/src/professor.ts](../../../apps/api/src/professor.ts)

**Persistência** professor_turma, jogada, plano_aula, atividade_professor.

## Regras de negócio

- **RN-12** Um aluno **pede atenção** quando tem atividade e acerto médio abaixo de 60% no período, ou queda de 10 pontos ou mais entre a primeira e a segunda metade do período. É uma referência para acompanhar, não um diagnóstico.
- **RN-13** Os indicadores SMART usam janela de 4 semanas terminando na atividade mais recente, comparação com as 4 semanas anteriores, metas da tabela 5.2 e as situações "atingida", "perto", "abaixo" e "sem dados".

## Testes e limites

indicadores-smart.test.ts e leitura-professor.test.ts. Medições de usabilidade e decisões sobre os denominadores pendentes.

## Dependências

[PRD-11](../prd-11/README.md) · [PRD-13](../prd-13/README.md) · [PRD-14](../prd-14/README.md) · [PRD-16](../prd-16/README.md)

## Requisitos

- [MOD-PRF-001](mod-prf-001.md) O painel exibe as turmas do professor com número de alunos e acerto médio.
- [MOD-PRF-002](mod-prf-002.md) O painel exibe acerto médio, conclusão e tentativas por formato de atividade.
- [MOD-PRF-003](mod-prf-003.md) O painel lista os alunos com acerto médio, quantidade de atividades, tendência e formato de destaque.
- [MOD-PRF-004](mod-prf-004.md) O painel exibe as atividades publicadas recentemente.
- [MOD-PRF-005](mod-prf-005.md) O painel indica avaliações pendentes e alunos sem atividade recente.
- [MOD-PRF-006](mod-prf-006.md) O painel indica as missões e formatos com maior uso de dicas.
- [MOD-PRF-007](mod-prf-007.md) O painel oferece atalhos para criar plano de aula, criar atividade e abrir turmas.
- [MOD-PRF-008](mod-prf-008.md) O painel exibe, para cada turma, os indicadores SMART IND-01 a IND-06, cada um com valor, meta, período de medição, comparação com o período anterior e situação (RN-13).
- [MOD-PRF-009](mod-prf-009.md) Cada indicador mostra, na própria tela, sua definição SMART: o que mede, como é calculado, por que a meta é atingível, por que importa e em que período.
- [MOD-PRF-010](mod-prf-010.md) Um indicador abaixo ou perto da meta mostra uma ação sugerida e um atalho para planejar uma aula para a turma.
- [MOD-PRF-011](mod-prf-011.md) A Visão geral começa pela agenda da semana (aulas e atividades que entram no app), seguida dos alunos que pedem atenção e das turmas.
- [MOD-PRF-012](mod-prf-012.md) Os alunos que pedem atenção aparecem com o motivo em uma frase, conforme a RN-12.
- [MOD-PRF-013](mod-prf-013.md) O menu mostra o nome de todas as seções, em grupos (Visão geral; Acompanhar; Planejar), com no máximo 4 seções por grupo.
- [MOD-PRF-014](mod-prf-014.md) Todo item clicável do menu e das ações principais tem área mínima de 44 × 44 px.
- [MOD-PRF-015](mod-prf-015.md) Em telas estreitas, o menu vira uma gaveta aberta pelo botão "Menu", que mostra o nome da seção atual.
- [MOD-PRF-016](mod-prf-016.md) A situação de metas, alunos e resultados é escrita em texto, nunca indicada só por cor.
- [MOD-PRF-017](mod-prf-017.md) A página Desempenho mostra as metas SMART: com "Todas as turmas", uma tabela com uma linha por turma e uma coluna por indicador; com uma turma escolhida, as metas completas da turma.
- [MOD-PRF-018](mod-prf-018.md) O filtro de turma é o mesmo em todas as páginas (Turma, Alunos, Desempenho, Habilidades, Planos, Calendário e Atividades): um seletor com a cor e a contagem de cada turma, que ganha campo de busca a partir de 7 opções e funciona pelo teclado.
- [MOD-PRF-019](mod-prf-019.md) Os filtros ficam no endereço da página (podem ser compartilhados e desfeitos com o botão voltar), mostram a contagem de cada opção e oferecem "Limpar filtros".
- [MOD-PRF-020](mod-prf-020.md) Páginas com conteúdo em pastas mostram as abas na lateral esquerda, com nome e descrição; em telas estreitas, viram uma faixa com rolagem acima do conteúdo.
- [MOD-PRF-021](mod-prf-021.md) Com mais de 4 turmas e sem filtro, o gráfico de evolução e os resultados por formato mostram a média das turmas, em vez de uma linha por turma.
- [MOD-PRF-022](mod-prf-022.md) Abrir cartões, gavetas, explicações ou trocar de aba não muda a largura nem a rolagem da página (layout estável).
- [MOD-PRF-023](mod-prf-023.md) O cartão de resumo do aluno abre só depois de o mouse ficar parado 2 s sobre o nome, flutua sobre a página e fecha ao tirar o mouse, rolar ou apertar Esc.
- [MOD-IU-003](mod-iu-003.md) A plataforma web tem navegação lateral, listas, formulários e painéis de indicadores.
