---
atualizado: 2026-11-05
status: para revisão
---

# PRD — Modolume

## 1. Resumo executivo

O Modolume conecta a prática do aluno às decisões pedagógicas do professor. O estudante realiza missões interativas de Matemática em diferentes formatos no aplicativo móvel; a plataforma web transforma as jogadas em indicadores por aluno e turma, para apoiar adaptações de aulas e atividades. A gamificação é um meio de engajamento.

## 2. Problema e oportunidade

- P1: professor não identifica facilmente em quais formatos os alunos encontram dificuldade.
- P2: planejamento e avaliações nem sempre usam evidências da turma.
- P3: atividades repetitivas e punição por erros podem desmotivar.
- P4: atividades somente textuais criam barreiras de acesso.
- P5: famílias têm pouca visibilidade do progresso cotidiano.
- P6: os professores não dispõem de indicadores contínuos e consolidados sobre o desempenho dos alunos nas atividades realizadas, dificultando o acompanhamento individual e coletivo.

## 3. Usuários e necessidades

| Perfil | Necessidade | Solução |
| --- | --- | --- |
| Aluno | Praticar com autonomia e acessibilidade | Missões, dicas, retorno imediato e progresso |
| Professor | Identificar dificuldades e planejar intervenções | Radar por formato, indicadores SMART, planos de aula e atividades |
| Gestão escolar | Organizar turmas e vínculos | Administração de turmas/usuários (a desenvolver) |
| Família | Entender a evolução | Relatório semanal compartilhável |
| Administrador | Controlar permissões | Gestão de contas (a desenvolver) |

## 4. Objetivos e critérios de sucesso

Os objetivos do produto seguem o formato SMART. As metas são preliminares e dependem de aprovação (seção 9).

| Objetivo | Indicador | Meta proposta | Prazo |
| --- | --- | --- | --- |
| O aluno conclui a primeira missão sozinho (P3, P4) | Alunos que concluem a 1ª missão sem ajuda de um adulto | 80% dos participantes | Sessão de validação |
| O aluno pratica com regularidade (P3) | Alunos com atividade em pelo menos 3 dias por semana | 50% dos alunos ativos | 4 semanas de validação |
| O professor identifica rapidamente quem precisa de ajuda (P1, P6) | Tempo para localizar os alunos que pedem atenção no painel | Menos de 1 minuto | Teste de tarefa na validação |
| O professor usa os dados para planejar (P2) | Planos de aula ou atividades criados a partir do painel | 1 por turma por semana | 4 semanas de validação |
| A família acompanha o progresso (P5) | Relatórios semanais gerados e compartilhados | 1 por aluno participante | 4 semanas de validação |

### 4.1 Critérios de validação

A validação será realizada com alunos e professores da escola parceira, considerando as metas iniciais definidas neste documento. Os indicadores serão avaliados por meio de testes de usabilidade, registros de utilização, testes funcionais e questionários aplicados aos participantes.

Para assegurar a consistência dos resultados, serão definidos antes da validação:

- Quantidade de alunos e professores participantes.
- Período e condições de utilização da plataforma.
- Procedimentos de coleta e análise dos dados.
- Critérios de aprovação dos testes.
- Responsáveis pela execução e documentação da validação.

Os resultados deverão apresentar a quantidade de participantes avaliados, os valores obtidos e o percentual de cumprimento de cada meta. As metas são preliminares e estarão sujeitas à aprovação da equipe e do professor orientador antes da aplicação dos testes.

## 5. Escopo funcional

O projeto é composto por duas soluções complementares e um núcleo de serviços compartilhados.

- **Aplicativo do aluno (Android):** realização de missões interativas de Matemática, com 8 mapas e 28 missões na versão atual, distribuídas entre diferentes formatos de atividade. Inclui gamificação por constelações, mascote Lilo (um axolote), personalização, acessibilidade, acompanhamento da aprendizagem, armazenamento offline e relatório para a família. O aluno entra com um código pessoal e um PIN (ADR 0017). A versão para iPhone é opcional, contratada à parte.
- **Painel do professor:** acompanhamento individual e coletivo dos alunos, indicadores SMART por turma, radar de habilidades por formato, tendências de aprendizagem, agenda, planejamento de aulas, criação de atividades e acompanhamento de conclusão.
- **Gestão e administração:** cadastro e gerenciamento de usuários, turmas, vínculos, perfis de acesso e históricos, com permissões específicas para cada perfil.
- **Serviços compartilhados:** autenticação, API, banco de dados, regras de negócio, sincronização do progresso e distribuição das atividades elaboradas pelo professor.
- **Site institucional:** página inicial com a apresentação da empresa, as soluções comerciais (sem preços; a proposta vem da equipe de vendas) e o acesso do professor (ADR 0018). O app do aluno não abre no navegador.

Cada módulo tem um PRD próprio, com requisitos, histórias de usuário e critérios de aceite (seção 10). Esses PRDs substituem a Especificação de Requisitos de Software.

### Fora do escopo atual

- Conteúdos de outras disciplinas além de Matemática.
- Chat entre usuários.
- Videoaulas.
- Integração com diário de classe e boletim escolar.
- Ranking competitivo entre alunos.
- Publicação obrigatória nas lojas oficiais durante a validação do MVP.

## 6. MVP e fases

| Fase | Entrega | Situação |
| --- | --- | --- |
| 1 | Aplicativo mobile com missões, mapas, gamificação e acessibilidade. | Avançada |
| 2 | Núcleo compartilhado com regras de negócio, cálculos de aprendizagem e testes. | Avançada |
| 3 | Painel do professor com indicadores SMART, agenda, planejamento de aulas e criação de atividades, utilizando dados de demonstração. | Avançada |
| 4 | API, autenticação real, banco de dados, sincronização e distribuição das atividades para o aplicativo (ADR 0015). | Avançada (banco no Railway; falta publicar a API) |
| ==5== | ==Gestão de usuários, turmas e vínculos para utilização institucional.== | ==Pendente== |
| ==6== | ==Validação assistida com a escola parceira e avaliação dos critérios de sucesso.== | ==Pendente== |

## 7. Diretrizes do produto

- Não rotular definitivamente a aprendizagem de um aluno; exibir análises com amostra mínima.
- Erro e dica não retiram pontos; dicas contribuem para a métrica de autonomia.
- Missões em contextos do cotidiano, com manipulação direta e alternativas acessíveis.
- Mesmas regras matemáticas no mobile e na web, em `packages/core`.
- Todo indicador mostrado ao professor é SMART: diz o que mede, como é calculado, qual a meta, por que importa e em que período.
- Interfaces seguem as [[Diretrizes de usabilidade do painel]] (heurísticas de Nielsen, leis de Hick e de Fitts).
- Respeitar a LGPD, o ECA e os instrumentos de autorização da escola/responsáveis.

## 8. Dependências e riscos

| Risco | Mitigação planejada |
| --- | --- |
| Internet escolar instável | Persistência local e sincronização segura |
| Acesso indevido a dados de menores | Segregação por perfil, permissões no servidor, auditoria e documentação LGPD |
| Indicadores interpretados como diagnóstico | Linguagem não diagnóstica, indicadores SMART com definição visível e revisão pedagógica |

## 9. Pendências para aprovação

- Formalizar os procedimentos de autorização e tratamento de dados pessoais.
- Aprovar as metas de sucesso e definir a quantidade de participantes, os instrumentos de coleta e os critérios de avaliação.
- Validar os pesos utilizados no cálculo de domínio e definir se poderão ser configurados futuramente.
- Aprovar as metas dos indicadores SMART do painel (RN-13) e decidir se o professor poderá ajustá-las.
- Estabelecer, em contrato, os limites de alunos, turmas e utilização para dimensionamento da infraestrutura (a proposta comercial deixa esses limites para o contrato).
- Validar com a equipe as três soluções comerciais (aplicativo, painel web e pacote completo) definidas na Proposta Comercial Modolume.
- Validar os critérios de aceite das funcionalidades previstas para o MVP.

## 10. Documentos vinculados

**PRDs de módulo**

- Acesso: [[PRD-01 — Autenticação e controle de acesso]] · [[PRD-02 — Administração de usuários]] · [[PRD-03 — Gestão de turmas]]
- Aluno: [[PRD-04 — Missões do aluno]] · [[PRD-05 — Gamificação]] · [[PRD-06 — Experiência do aluno]] · [[PRD-07 — Perfil e personalização]] · [[PRD-08 — Acessibilidade]] · [[PRD-09 — Relatório para a família]] · [[PRD-10 — Histórico e sincronização]]
- Professor: [[PRD-11 — Análise de aprendizagem]] · [[PRD-12 — Painel do professor]] · [[PRD-13 — Planejamento de aulas]] · [[PRD-14 — Atividades do professor]] · [[PRD-15 — Avaliação e feedback]]
- Transversal: [[PRD-16 — Notificações]] · [[PRD-17 — Qualidade, segurança e restrições]]

**Outros**

- [[Diretrizes de usabilidade do painel]]
- [[Índice de ADRs]]
- [[Contexto do Projeto]]
- [[Orçamento - Proposta Comercial Modolume]]
