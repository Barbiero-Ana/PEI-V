---
title: "Modolume — Documento de Requisitos de Produto (PRD)"
mainfont: Helvetica
sansfont: Helvetica
fontsize: 11pt
lang: pt-BR
---

<!-- Fonte: Helvetica em todo o documento. Sem uso de cores. -->
<!-- RASCUNHO v0.1 — trechos marcados com [A DEFINIR] dependem de decisão da equipe. -->

<div style="font-family: Helvetica, Arial, sans-serif; text-align: center;">

**CENTRO UNIVERSITÁRIO DE VÁRZEA GRANDE — UNIVAG**

**PROJETO EXTENSIONISTA INTEGRADOR IV**

<br><br><br><br><br><br>

# MODOLUME

## DOCUMENTO DE REQUISITOS DE PRODUTO (PRD)

Plataforma de compreensão da aprendizagem: uma ponte entre aluno e professor

<br><br><br><br><br><br><br><br>

VÁRZEA GRANDE — MT

2026

</div>

<div style="page-break-after: always;"></div>

<div style="font-family: Helvetica, Arial, sans-serif; text-align: center;">

ANA CAROLINA DA S. BARBIERO

TÚLIO F. Q. DANTAS

JOÃO VITOR DOS REIS LEME FRANCO

GUILHERME SOARES NISTAL SANCHES

YURI ZAMBRANA A. DE MAGALHÃES

<br><br><br><br><br>

**MODOLUME**

**DOCUMENTO DE REQUISITOS DE PRODUTO (PRD)**

<br><br><br>

</div>

<div style="font-family: Helvetica, Arial, sans-serif; margin-left: 50%; text-align: justify;">

Documento de requisitos de produto apresentado ao Projeto Extensionista Integrador IV do Centro Universitário de Várzea Grande — UNIVAG. Define o problema, os usuários, os objetivos e o escopo do Modolume, e serve de base para a Especificação de Requisitos de Software e para os Registros de Decisão de Arquitetura.

Professor orientador: Brendo Yuri Maia do Vale.

</div>

<div style="font-family: Helvetica, Arial, sans-serif; text-align: center;">

<br><br><br><br><br><br>

VÁRZEA GRANDE — MT

2026

</div>

<div style="page-break-after: always;"></div>

## CONTROLE DE VERSÕES

| Versão | Data | Descrição | Responsável |
|---|---|---|---|
| 0.1 | 29/10/2026 | Rascunho inicial, a partir da Especificação de Requisitos e dos ADRs 0001 a 0011. | [A DEFINIR] |

## SUMÁRIO

1. Visão geral
2. Problema
3. Objetivos e não objetivos
4. Público-alvo e personas
5. Solução proposta
6. Histórias de usuário
7. Funcionalidades e priorização
8. Escopo do MVP
9. Métricas de sucesso
10. Premissas, dependências e restrições
11. Riscos
12. Cronograma e marcos
13. Questões em aberto
14. Relação com os demais documentos
- Referências

<div style="page-break-after: always;"></div>

## 1 VISÃO GERAL

O Modolume é uma plataforma educacional formada por um aplicativo móvel para o aluno e uma plataforma web para o professor. O aluno resolve atividades de Matemática do Ensino Fundamental apresentadas como minijogos, em formatos de interação diferentes. Cada jogada gera dados sobre como o aluno se sai em cada formato. O professor recebe esses dados organizados em um perfil de aprendizagem por aluno e por turma, e os usa para planejar aulas e adaptar avaliações.

O Modolume não é apenas um aplicativo para praticar Matemática. Ele é uma **ponte entre aluno e professor**: a prática do aluno vira informação pedagógica para o professor, e a decisão do professor volta ao aluno na forma de novas atividades.

| Item | Descrição |
|---|---|
| Produto | Modolume |
| Componentes | Aplicativo do aluno (Android e iOS) e plataforma web do professor |
| Conteúdo inicial | Matemática do Ensino Fundamental, alinhada à BNCC |
| Usuários principais | Alunos e professores |
| Usuários secundários | Gestão escolar, administrador e família |

<div style="page-break-after: always;"></div>

## 2 PROBLEMA

### 2.1 Situação atual

Em geral, a avaliação em Matemática no Ensino Fundamental usa um único formato: a prova escrita com questões objetivas ou discursivas. Quando um aluno vai mal, o professor sabe *que* ele teve dificuldade, mas não sabe *por quê*: se não compreendeu o conteúdo ou se o formato da atividade não favorece seu jeito de aprender.

Alguns alunos compreendem melhor quando manipulam objetos, montam, ordenam ou visualizam em três dimensões. Na sala de aula, identificar isso exige observação individual, o que é inviável em turmas de 30 a 40 alunos.

### 2.2 Problemas identificados

| Nº | Problema | Quem é afetado |
|---|---|---|
| P1 | O professor não tem informação objetiva sobre os formatos de atividade em que cada aluno compreende melhor ou tem mais dificuldade. | Professor |
| P2 | Provas e planos de aula são montados sem dados sobre a turma, e alunos com dificuldade só são percebidos depois da nota. | Professor e aluno |
| P3 | O aluno com dificuldade perde a motivação diante de atividades repetitivas e de erros que "custam pontos". | Aluno |
| P4 | Alunos com baixa visão, dislexia ou dificuldade de leitura têm barreiras de acesso a atividades baseadas em texto. | Aluno |
| P5 | A família tem pouca visibilidade do que o aluno pratica fora da prova. | Família |

### 2.3 Por que resolver agora

[A DEFINIR] Incluir aqui a justificativa da equipe: dados ou relatos da escola parceira, experiência dos integrantes, pesquisas sobre formatos de aprendizagem e o caráter extensionista do projeto.

<div style="page-break-after: always;"></div>

## 3 OBJETIVOS E NÃO OBJETIVOS

### 3.1 Objetivo geral

Permitir que o professor compreenda como cada aluno aprende Matemática, a partir de atividades em formatos diferentes, para planejar aulas e avaliações que atendam os alunos com dificuldade.

### 3.2 Objetivos específicos

| Nº | Objetivo | Problema atendido |
|---|---|---|
| O1 | Oferecer ao aluno atividades de Matemática em pelo menos sete formatos de interação, a partir de situações do cotidiano. | P1, P3 |
| O2 | Medir, para cada aluno e cada formato, o acerto de primeira, a autonomia (uso de dicas), a precisão e o domínio. | P1 |
| O3 | Apresentar ao professor um perfil de aprendizagem por aluno e por turma, com indicação dos alunos que pedem atenção. | P1, P2 |
| O4 | Permitir que o professor planeje aulas e envie atividades ao aplicativo a partir desses dados. | P2 |
| O5 | Manter o aluno motivado com gamificação sem punição por erro e sem ranking entre alunos. | P3 |
| O6 | Garantir acessibilidade: tamanho de texto, leitura em voz, fonte para dislexia, alto contraste e redução de animações. | P4 |
| O7 | Gerar um relatório semanal do aluno que possa ser compartilhado com a família. | P5 |

### 3.3 Não objetivos

O que o Modolume, nesta versão, **não pretende** fazer:

- Substituir o professor ou a prova oficial da escola.
- Atribuir nota oficial ou integrar com diário de classe e boletim.
- Rotular o aluno com um "estilo de aprendizagem" fixo. O jeito de aprender principal é uma indicação que muda com as jogadas, e só aparece com dados suficientes (RN-09).
- Comparar alunos entre si por meio de classificação (ranking).
- Oferecer outras disciplinas além de Matemática.
- Oferecer troca de mensagens, videoaulas ou conteúdo de terceiros.

<div style="page-break-after: always;"></div>

## 4 PÚBLICO-ALVO E PERSONAS

### 4.1 Usuários

| Usuário | Como usa o Modolume | Necessidade principal |
|---|---|---|
| Aluno | Aplicativo móvel | Praticar de forma divertida, entender o que errou e não ter medo de errar. |
| Professor | Plataforma web | Saber rapidamente quem precisa de ajuda e em qual formato, e agir sobre isso. |
| Gestão escolar | Plataforma web | Organizar turmas e vínculos entre professores e alunos. |
| Administrador | Plataforma web | Cadastrar usuários e perfis. |
| Família | Relatório em PDF | Acompanhar o que o aluno pratica e como evolui. |

### 4.2 Personas

> As personas abaixo são fictícias e representam grupos de usuários. [A DEFINIR] Validar com a escola parceira e, se possível, basear em entrevistas.

**Persona 1 — Júlia, 11 anos, 6º ano**

- Usa o celular da família, quase sempre em casa e às vezes sem internet.
- Gosta de jogos e de montar coisas; trava em enunciados longos.
- Vai mal nas provas de frações e acha que "não é boa em Matemática".
- **O que precisa:** atividades curtas, visuais, com dica quando trava e retorno que não a faça desistir.
- **Como o Modolume ajuda:** missões de pizza e jarra para frações, leitura em voz do enunciado, erro sem perda de pontos e constelações que acendem com o progresso.

**Persona 2 — Prof. Ricardo, professor de Matemática**

- Dá aula para quatro turmas de 6º e 7º ano, com cerca de 35 alunos cada.
- Tem pouco tempo entre as aulas e não usa planilhas complicadas.
- Percebe que parte da turma não acompanha, mas não sabe dizer quem nem por quê.
- **O que precisa:** uma visão rápida da turma, com os alunos que pedem atenção e o motivo, e uma forma prática de levar isso para o plano de aula.
- **Como o Modolume ajuda:** agenda e painel com o radar de habilidades da turma, ficha de cada aluno e criação de plano de aula e de atividade a partir desses dados.

**Persona 3 — Dona Sandra, responsável pela Júlia**

- Trabalha o dia todo e acompanha a escola pelo celular.
- **O que precisa:** saber, de forma simples, se a filha está praticando e evoluindo.
- **Como o Modolume ajuda:** relatório semanal em PDF, compartilhável pelo celular.

<div style="page-break-after: always;"></div>

## 5 SOLUÇÃO PROPOSTA

### 5.1 Ciclo do produto

O valor do Modolume está no ciclo entre aluno e professor:

1. **O aluno joga.** Resolve missões no aplicativo, em formatos diferentes, mesmo sem conexão.
2. **O sistema mede.** Cada jogada registra acertos de primeira, tentativas, tempo e dicas por formato.
3. **O professor compreende.** O painel mostra o perfil de aprendizagem de cada aluno e da turma.
4. **O professor age.** Planeja a aula e monta atividades no formato em que o aluno ou o grupo vai melhor, ou no formato que precisa ser treinado.
5. **O aluno recebe.** A atividade chega ao aplicativo e o ciclo recomeça.

### 5.2 Formatos de atividade

| Formato | Exemplo de interação |
|---|---|
| Associação visual | Ligar pares (quantidade e número, fração e figura). |
| Montagem | Montar com cubos ou peças. |
| Sequência | Ordenar etapas ou números. |
| Completar lacunas | Preencher o valor que falta em uma expressão. |
| Manipulação | Equilibrar a balança, encher a jarra, girar os ponteiros do relógio. |
| Exploração 3D | Girar e observar sólidos geométricos. |
| Questão objetiva | Escolher a alternativa correta. |

### 5.3 Diferenciais

- **Foco no professor, não só no aluno:** a gamificação é o meio; a informação pedagógica é o fim.
- **Análise por formato de atividade**, e não apenas por acerto geral.
- **Erro sem punição:** pedir dica ou errar não retira pontos; o erro é registrado como informação.
- **Acessibilidade desde o início**, e não como recurso adicional.
- **Funciona sem internet** no aplicativo do aluno.
- **Sem ranking, sem publicidade e coleta mínima de dados** de menores de idade.

<div style="page-break-after: always;"></div>

## 6 HISTÓRIAS DE USUÁRIO

As histórias abaixo representam as necessidades principais. O detalhamento de cada uma está nos requisitos da Especificação de Requisitos (coluna "SRS").

### 6.1 Aluno

| ID | História | Critério de aceite resumido | SRS |
|---|---|---|---|
| HU-01 | Como aluno, quero entrar com o código da turma e escolher meu nome e avatar, para começar sem precisar de e-mail. | Entrada concluída sem e-mail, em poucos passos. | AUT-009 |
| HU-02 | Como aluno, quero ver a próxima missão em destaque, para começar a jogar com um toque. | Missão abre em no máximo 2 toques a partir do início. | ALU-002, USA-003 |
| HU-03 | Como aluno, quero pedir uma dica quando travo, para não desistir da atividade. | Dica disponível em toda fase, sem perda de pontos. | MIS-006, RN-06 |
| HU-04 | Como aluno, quero entender por que errei e tentar de novo, para aprender com o erro. | Retorno imediato, explicativo e encorajador. | MIS-007, MIS-008 |
| HU-05 | Como aluno, quero ver minhas estrelas e constelações acenderem, para sentir que estou evoluindo. | Estrelas acendem a cada 5 pontos de luz no mapa. | GAM-003, RN-03 |
| HU-06 | Como aluno com dificuldade de leitura, quero ouvir o enunciado e aumentar o texto, para resolver sozinho. | Leitura em voz e três tamanhos de texto. | ACE-001, ACE-002 |
| HU-07 | Como aluno, quero jogar mesmo sem internet, para não depender do Wi-Fi. | Progresso salvo no aparelho e enviado depois. | HIS-004, HIS-005 |

### 6.2 Professor

| ID | História | Critério de aceite resumido | SRS |
|---|---|---|---|
| HU-08 | Como professor, quero ver quais alunos da turma pedem atenção e por quê, para agir antes da prova. | Painel lista alunos com tendência de queda ou domínio baixo. | PRF-003, PRF-005 |
| HU-09 | Como professor, quero ver o radar de habilidades de cada aluno e da turma, para saber em que formato cada um vai melhor. | Radar com um eixo por formato, atualizado a cada jogada. | APR-005, APR-008 |
| HU-10 | Como professor, quero montar uma atividade e enviá-la ao aplicativo da turma, para trabalhar o que a turma precisa. | Atividade criada e publicada em até 5 passos. | ATI-002, ATI-008, USA-004 |
| HU-11 | Como professor, quero planejar a aula vendo os dados da turma ao lado, para escolher os formatos com base em informação. | Formulário do plano mostra acerto por formato e alunos em atenção. | ADR 0010 |
| HU-12 | Como professor, quero dar um feedback escrito ao aluno, para orientar sua prática. | Feedback visível ao aluno após a conclusão da avaliação. | AVA-003, AVA-005 |

### 6.3 Gestão, administração e família

| ID | História | Critério de aceite resumido | SRS |
|---|---|---|---|
| HU-13 | Como gestão, quero cadastrar turmas e vincular professores e alunos, para organizar o ano letivo. | Turma criada com professores e alunos vinculados. | TUR-001 a TUR-004 |
| HU-14 | Como administrador, quero cadastrar e desativar usuários sem perder o histórico. | Usuário desativado mantém seus registros. | ADM-001, ADM-006 |
| HU-15 | Como responsável, quero receber um relatório semanal do aluno, para acompanhar sua evolução. | PDF A4 compartilhável pelo celular. | REL-001 a REL-003 |

<div style="page-break-after: always;"></div>

## 7 FUNCIONALIDADES E PRIORIZAÇÃO

A priorização segue o método MoSCoW: **Deve ter** (sem isso o produto não cumpre o objetivo), **Deveria ter** (importante, mas o produto funciona sem), **Poderia ter** (desejável) e **Não terá agora** (fora desta versão).

| Funcionalidade | Componente | Prioridade | Grupos na SRS |
|---|---|---|---|
| Login e controle de acesso por perfil | App e web | Deve ter | AUT |
| Turmas, vínculos e código de acesso | Web | Deve ter | TUR |
| Missões em mapas, com fases e dicas | App | Deve ter | MIS |
| Registro de desempenho por formato | App e núcleo | Deve ter | MIS-009, APR |
| Análise de aprendizagem (domínio, nível, tendência, radar) | Núcleo, app e web | Deve ter | APR |
| Painel do professor (agenda, turmas, alunos em atenção) | Web | Deve ter | PRF |
| Uso sem conexão e sincronização | App | Deve ter | HIS |
| Acessibilidade principal (texto, voz, contraste, animações) | App | Deve ter | ACE |
| Atividades montadas pelo professor e enviadas ao app | Web e app | Deveria ter | ATI |
| Planejamento de aulas no painel | Web | Deveria ter | ADR 0010 |
| Gamificação (pontos de luz, constelações, álbum, desafio do dia, dias de luz, mascote) | App | Deveria ter | GAM |
| Avaliação e feedback do professor | Web e app | Deveria ter | AVA |
| Administração de usuários | Web | Deveria ter | ADM |
| Relatório semanal para a família | App | Poderia ter | REL |
| Notificações | App e web | Poderia ter | NOT |
| Loja de itens do avatar e capas do perfil | App | Poderia ter | GAM-008, PER-004 |
| Importação de usuários por CSV | Web | Poderia ter | ADM-008 |
| Outras disciplinas, mensagens, videoaulas, integração com sistemas acadêmicos | — | Não terá agora | — |

> [A DEFINIR] A equipe deve confirmar essa priorização. A Especificação de Requisitos usa outra escala (Essencial, Importante, Desejável) por requisito; aqui a prioridade é por funcionalidade.

<div style="page-break-after: always;"></div>

## 8 ESCOPO DO MVP

O MVP (produto mínimo viável) é a menor versão que já demonstra o ciclo completo entre aluno e professor.

### 8.1 Dentro do MVP

- Aplicativo do aluno com os mapas de missões, os sete formatos de atividade, dicas, retorno imediato e gamificação básica (pontos de luz e constelações).
- Registro das jogadas no aparelho, com uso sem conexão e envio ao servidor.
- Cálculo de domínio, nível e tendência por formato no núcleo compartilhado.
- Plataforma web do professor com login, turmas, alunos, desempenho por formato, radar de habilidades e alunos que pedem atenção.
- Recursos de acessibilidade principais no aplicativo.
- Integração real entre aplicativo, servidor e painel (etapa 5 da ADR 0009).

### 8.2 Fora do MVP

- Loja de itens, notificações e relatório para a família (previstos para versões seguintes).
- Publicação nas lojas oficiais (a validação é feita com instalação direta e Expo Go).
- Importação de usuários por planilha.
- Tudo o que está em "Não terá agora" e em "Não objetivos".

### 8.3 Critério de pronto do MVP

O MVP está pronto quando um aluno real, em uma turma real, joga missões no aplicativo e o professor dessa turma vê, no painel, o resultado dessas jogadas no radar de habilidades e na lista de alunos que pedem atenção.

<div style="page-break-after: always;"></div>

## 9 MÉTRICAS DE SUCESSO

As metas abaixo são propostas iniciais para a validação com a escola parceira. [A DEFINIR] A equipe deve revisar os valores e o período de medição.

### 9.1 Métricas do aluno

| Métrica | Como medir | Meta proposta |
|---|---|---|
| Conclusão da primeira missão sem ajuda | Observação na sessão de teste (MOD-USA-002) | 80% dos alunos |
| Engajamento | Alunos que jogam em pelo menos 3 dias por semana (dias de luz) | 50% dos alunos ativos |
| Autonomia crescente | Redução do uso de dicas por formato ao longo de 4 semanas | Queda em pelo menos 3 formatos |
| Evolução do domínio | Variação do domínio médio da turma em 4 semanas | Aumento de 10 pontos |
| Satisfação | Questionário curto com os alunos | 4 de 5 ou mais |

### 9.2 Métricas do professor

| Métrica | Como medir | Meta proposta |
|---|---|---|
| Uso do painel | Acessos do professor ao painel por semana | Pelo menos 2 |
| Tempo para encontrar quem precisa de ajuda | Teste de tarefa com o professor | Menos de 1 minuto |
| Uso dos dados no planejamento | Planos de aula ou atividades criados a partir do painel | Pelo menos 1 por turma por semana |
| Utilidade percebida | Entrevista com o professor após a validação | Professor relata ao menos uma mudança na aula ou na prova motivada pelos dados |

### 9.3 Métricas técnicas

| Métrica | Meta | Referência na SRS |
|---|---|---|
| Tela inicial do aplicativo | Até 3 segundos | DES-001 |
| Carregamento do painel (turma de 40 alunos) | Até 3 segundos | DES-005 |
| Jogadas perdidas na sincronização | Nenhuma | CON-001, CON-003 |
| Mesmo cálculo no aplicativo e na web | 100% dos casos de teste | ADF-001 |

<div style="page-break-after: always;"></div>

## 10 PREMISSAS, DEPENDÊNCIAS E RESTRIÇÕES

### 10.1 Premissas

- Os alunos têm acesso a um celular Android ou iOS, próprio ou da família.
- O aluno pode ficar sem internet durante o uso; por isso o aplicativo funciona sem conexão.
- O professor tem acesso a um computador ou tablet com navegador atualizado.
- A escola parceira autoriza a validação com alunos e intermedia o consentimento dos responsáveis.

### 10.2 Dependências

- Servidor próprio em Node.js com PostgreSQL hospedado no Railway (ADR 0007, em proposta).
- Síntese de voz do sistema operacional, em português do Brasil, para a leitura em voz.
- Contas de desenvolvedor na Google Play e na App Store para publicação nas lojas (fora do MVP).

### 10.3 Restrições

- Aplicativo em React Native com Expo e TypeScript; plataforma web em Next.js com TypeScript (ADRs 0002 e 0008).
- Regras de negócio em um núcleo compartilhado entre aplicativo e web (ADR 0001).
- Conteúdo limitado à Matemática do Ensino Fundamental, alinhado à BNCC.
- Tratamento de dados conforme a LGPD e o Estatuto da Criança e do Adolescente: coleta mínima, sem publicidade e sem compartilhamento com terceiros.
- Identidade visual do Modolume: Poppins e Inter, sem gradientes e sem emojis.
- Prazo do semestre letivo do Projeto Integrador IV.

<div style="page-break-after: always;"></div>

## 11 RISCOS

| Nº | Risco | Impacto | Probabilidade | Mitigação |
|---|---|---|---|---|
| R1 | Poucas jogadas por aluno, insuficientes para uma análise confiável. | Alto | Média | Regra de dados mínimos (RN-09); desafio do dia e atividades do professor para estimular o uso. |
| R2 | O professor não usar o painel por falta de tempo. | Alto | Média | Agenda primeiro, poucos cliques, alunos em atenção em destaque e pouca tabela. |
| R3 | A análise ser interpretada como rótulo definitivo do aluno. | Alto | Baixa | Linguagem de tendência ("está crescendo", "vale treinar") e indicação que muda com as jogadas. |
| R4 | Falta de autorização para a validação com menores de idade. | Alto | Média | Termo de consentimento via escola desde cedo; dados de demonstração como alternativa. |
| R5 | Perda de dados na sincronização entre aparelho e servidor. | Médio | Baixa | Registro atômico e sem duplicidade (CON-002, CON-003); testes de reconexão. |
| R6 | Atraso na integração real entre aplicativo e painel. | Alto | Média | Interface única de dados (`DataProvider`) já usada com dados de demonstração (ADR 0009). |
| R7 | Aparelhos antigos com desempenho ruim nos jogos 3D. | Médio | Média | Redução de animações e metas de desempenho testadas em aparelho intermediário. |

<div style="page-break-after: always;"></div>

## 12 CRONOGRAMA E MARCOS

[A DEFINIR] Datas a confirmar pela equipe, conforme o calendário do Projeto Integrador IV.

| Marco | Entrega | Situação |
|---|---|---|
| M1 | Especificação de Requisitos e ADRs iniciais | Concluído |
| M2 | Aplicativo do aluno com missões, gamificação e acessibilidade | Em andamento |
| M3 | Painel do professor — etapas 1 a 4 (acesso, turmas, desempenho, radar e insights) | Em andamento |
| M4 | Planejamento de aulas e atividades montadas pelo professor | Em andamento |
| M5 | Integração real: servidor, login e jogadas vindas do aplicativo (etapa 5) | A iniciar |
| M6 | Validação com a escola parceira e coleta das métricas | A iniciar |
| M7 | Apresentação final à banca | A iniciar |

<div style="page-break-after: always;"></div>

## 13 QUESTÕES EM ABERTO

| Nº | Questão | Responsável |
|---|---|---|
| Q1 | Qual escola, turmas e séries participarão da validação? | [A DEFINIR] |
| Q2 | Como será obtido o consentimento dos responsáveis? | [A DEFINIR] |
| Q3 | O professor poderá ajustar os pesos do cálculo de domínio ou eles serão fixos? | [A DEFINIR] |
| Q4 | A gestão escolar terá um painel próprio ou usará o mesmo do professor? | [A DEFINIR] |
| Q5 | O aluno verá o feedback do professor apenas no aplicativo ou também no relatório da família? | [A DEFINIR] |
| Q6 | Após o MVP, qual será a próxima disciplina, se houver? | [A DEFINIR] |

<div style="page-break-after: always;"></div>

## 14 RELAÇÃO COM OS DEMAIS DOCUMENTOS

| Documento | Papel | Relação com este PRD |
|---|---|---|
| PRD (este documento) | Define o problema, os usuários, os objetivos, o escopo e as métricas: **o quê** e **por quê**. | Documento de origem. |
| Especificação de Requisitos de Software (ISO/IEC/IEEE 29148) | Detalha cada requisito funcional e não funcional: **o que exatamente** o sistema faz. | Cada funcionalidade e história deste PRD se desdobra em requisitos da SRS. |
| Registros de Decisão de Arquitetura (ADR) | Registram as decisões técnicas: **como** construir e por quê. | Cada ADR deve atender a um objetivo ou restrição deste PRD. |

Mudanças de escopo ou de prioridade devem ser feitas primeiro neste PRD e depois refletidas na SRS e, quando houver impacto técnico, em um novo ADR.

<div style="page-break-after: always;"></div>

## REFERÊNCIAS

BRASIL. **Lei nº 13.709, de 14 de agosto de 2018.** Lei Geral de Proteção de Dados Pessoais (LGPD). Brasília, DF: Presidência da República, 2018.

BRASIL. **Lei nº 8.069, de 13 de julho de 1990.** Estatuto da Criança e do Adolescente. Brasília, DF: Presidência da República, 1990.

BRASIL. Ministério da Educação. **Base Nacional Comum Curricular.** Brasília, DF: MEC, 2018.

CAGAN, Marty. **Inspirado:** como criar produtos de tecnologia que os clientes amam. 2. ed. Rio de Janeiro: Alta Books, 2021.

INTERNATIONAL ORGANIZATION FOR STANDARDIZATION. **ISO/IEC/IEEE 29148:2018:** systems and software engineering — life cycle processes — requirements engineering. Genebra: ISO, 2018.

PRESSMAN, Roger S.; MAXIM, Bruce R. **Engenharia de software:** uma abordagem profissional. 9. ed. Porto Alegre: AMGH, 2021.

SOMMERVILLE, Ian. **Engenharia de software.** 10. ed. São Paulo: Pearson, 2019.

W3C. **Web Content Accessibility Guidelines (WCAG) 2.1.** World Wide Web Consortium, 2018.
