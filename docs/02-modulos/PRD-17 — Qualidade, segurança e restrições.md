---
modulo: QUA
prd: PRD-17
atualizado: 2026-11-05
status: para revisão
---

# PRD-17 — Qualidade, segurança e restrições

## 1. Resumo executivo

Reúne os requisitos que valem para todos os módulos: adequação funcional, desempenho, compatibilidade, usabilidade, confiabilidade, segurança, manutenibilidade e portabilidade (características da ISO/IEC 25010), além das interfaces, das restrições do projeto e da matriz de permissões por perfil.

## 2. Problema e oportunidade

- O Modolume trata dados de menores de idade: segurança e privacidade não são opcionais (LGPD e ECA).
- Escolas têm aparelhos variados e internet instável: desempenho e confiabilidade definem se o produto é usado.
- Aluno e professor têm pouco tempo e experiências diferentes com tecnologia: usabilidade é requisito.

## 3. Usuários e necessidades

| Perfil | Necessidade | Solução |
| --- | --- | --- |
| Aluno | App rápido, que não perde progresso | Metas de desempenho e uso sem conexão |
| Professor | Painel rápido e fácil de entender | Metas de desempenho e [[Diretrizes de usabilidade do painel]] |
| Escola e família | Dados protegidos | Coleta mínima, permissões no servidor, HTTPS |
| Equipe | Código fácil de manter | Núcleo compartilhado, tipagem estrita, controle de versão |

## 4. Objetivos e critérios de sucesso

| Objetivo | Indicador | Meta | Prazo |
| --- | --- | --- | --- |
| Desempenho medido | Requisitos DES medidos e documentados | 7 de 7 | Antes da validação (fase 6) |
| Segurança no servidor | Requisitos SEG essenciais atendidos | 100% | Fim da fase 4 |
| Usabilidade comprovada | Requisitos USA "A medir" medidos | 100% | Antes da validação |

### 4.1 Critérios de validação

Medições documentadas (tempo, quadros por segundo, contraste), testes automatizados no núcleo, inspeção de código e checklist das [[Diretrizes de usabilidade do painel]].

## 5. Escopo funcional

### 5.1 Requisitos não funcionais

**Adequação funcional (ADF)**

| ID | Critério | Prior. | Verif. | Situação |
| --- | --- | :---: | :---: | :---: |
| MOD-ADF-001 | O cálculo de pontos, estrelas, constelações e domínio produz o mesmo resultado no aplicativo e na plataforma web. | E | T | Implementado |
| MOD-ADF-002 | Cada missão indica o conteúdo de Matemática trabalhado, alinhado à BNCC. | E | N | Parcial |
| MOD-ADF-003 | Os mapas apresentam complexidade crescente, do reconhecimento de quantidades até funções, probabilidade, média e ordem das operações. | E | N | Implementado |
| MOD-ADF-004 | Cada mapa contém pelo menos dois formatos de atividade diferentes. | I | N | Parcial |

ADF-002: as missões indicam o conteúdo; falta a revisão pedagógica do código BNCC de cada uma. ADF-004: o Mapa 5 ("Construir no espaço") só tem missões de exploração 3D.

**Eficiência de desempenho (DES)**

| ID | Critério | Prior. | Verif. | Situação |
| --- | --- | :---: | :---: | :---: |
| MOD-DES-001 | App: tela inicial em até 3 segundos após a abertura, em aparelho intermediário. | I | T | A medir |
| MOD-DES-002 | Retorno visual a toques e arrastes em até 100 milissegundos. | E | T | A medir |
| MOD-DES-003 | Animações e jogos a no mínimo 30 quadros por segundo. | I | T | A medir |
| MOD-DES-004 | Consultas da plataforma web respondem em até 2 segundos em condições normais. | I | T | A medir |
| MOD-DES-005 | O painel do professor carrega em até 3 segundos para uma turma de até 40 alunos. | I | T | A medir |
| MOD-DES-006 | O relatório em PDF é gerado em até 5 segundos. | D | T | A medir |
| MOD-DES-007 | Listas com mais de 20 registros são paginadas. | I | N | Parcial |

**Compatibilidade (CMP)**

| ID | Critério | Prior. | Verif. | Situação |
| --- | --- | :---: | :---: | :---: |
| MOD-CMP-001 | App: funciona nas versões de Android suportadas pelo Expo SDK adotado (iOS, se a versão para iPhone for contratada). | E | T | Implementado |
| MOD-CMP-002 | Web: funciona nas duas versões mais recentes de Chrome, Edge, Firefox e Safari. | E | T | A medir |
| MOD-CMP-003 | App e web trocam dados por uma interface única de serviços. | E | N | Implementado |

CMP-003: o painel já usa a interface `DataProvider`, que a API vai atender (ADR 0009); o app ainda não envia dados.

**Usabilidade (USA)**

| ID | Critério | Prior. | Verif. | Situação |
| --- | --- | :---: | :---: | :---: |
| MOD-USA-001 | Textos para o aluno usam linguagem simples, sem termos técnicos. | E | N | Implementado |
| MOD-USA-002 | Um aluno sem experiência prévia conclui a primeira missão sem ajuda de um adulto. | I | T | A medir |
| MOD-USA-003 | Qualquer missão pode ser iniciada em no máximo 2 toques a partir da tela inicial. | I | T | Implementado |
| MOD-USA-004 | Uma atividade pode ser criada e publicada pelo professor em até 5 passos. | I | T | Implementado |
| MOD-USA-005 | Os botões de ação dos jogos ficam fixos no rodapé, na mesma posição em todas as missões. | I | N | Implementado |
| MOD-USA-006 | Ao soltar um objeto arrastado, o destino é reconhecido pelo centro do objeto, com tolerância mínima de 18 pontos. | I | T | A medir |
| MOD-USA-007 | Erros não retiram pontos já obtidos, e o retorno de erro tem tom encorajador. | E | N | Implementado |
| MOD-USA-008 | Toda operação exibe retorno de carregamento, sucesso, aviso ou erro. | E | N | Parcial |
| MOD-USA-009 | Listas vazias exibem uma mensagem que orienta o usuário. | I | N | Implementado |
| MOD-USA-010 | Formulários validam os campos obrigatórios antes de salvar, com mensagem junto ao campo. | E | T | Implementado |
| MOD-USA-011 | Operações críticas, como desativar usuário ou apagar progresso, pedem confirmação. | E | T | Implementado |
| MOD-USA-012 | Animações de interface duram no máximo 1,5 segundo, exceto as de comemoração. | I | N | A medir |
| MOD-USA-013 | O texto do aplicativo usa contraste mínimo de 4,5:1 no modo de alto contraste. | E | A | A medir |
| MOD-USA-014 | Elementos tocáveis têm área mínima de 44 × 44 pontos. | E | N | Parcial |
| MOD-USA-015 | Estados como certo, errado, bloqueado e concluído não são indicados apenas por cor. | E | N | Implementado |
| MOD-USA-016 | O layout não corta textos com o tamanho de texto em 130%. | I | T | A medir |
| MOD-USA-017 | Os enunciados das fases têm tamanho mínimo de 19 pontos no tamanho de texto normal. | I | N | A medir |
| MOD-USA-018 | As interfaces seguem as dez heurísticas de Nielsen e as leis de Hick e de Fitts, conforme as [[Diretrizes de usabilidade do painel]]. | E | N | Parcial |

DES-007: a lista de Alunos do painel já tem páginas de 20; falta aplicar às demais listas longas. USA-014: atendido no menu, nos filtros e nas ações principais do painel; falta conferir todos os botões do app. USA-018: o checklist foi aplicado a todas as telas do painel em 04/11/2026 (ver as revisões nas diretrizes); falta testar com professores.

**Confiabilidade (CON)**

| ID | Critério | Prior. | Verif. | Situação |
| --- | --- | :---: | :---: | :---: |
| MOD-CON-001 | Falhas de comunicação não fecham o aplicativo nem causam perda de progresso. | E | T | Implementado |
| MOD-CON-002 | O registro do resultado e a atualização dos pontos ocorrem de forma atômica. | E | T | Parcial |
| MOD-CON-003 | Um mesmo resultado não é registrado mais de uma vez no servidor. | I | T | Implementado |
| MOD-CON-004 | Dados salvos por versões anteriores do aplicativo continuam legíveis após atualizações. | I | T | Parcial |
| MOD-CON-005 | Web: disponibilidade mínima de 99% no horário escolar. | I | A | A medir |

**Segurança (SEG)**

| ID | Critério | Prior. | Verif. | Situação |
| --- | --- | :---: | :---: | :---: |
| MOD-SEG-001 | Senhas armazenadas com função de hash adaptativa, nunca em texto simples. | E | N | Implementado |
| MOD-SEG-002 | Sessões usam tokens com expiração, guardados em área segura do dispositivo. | E | N | Parcial |
| MOD-SEG-003 | Toda operação restrita tem a permissão verificada no servidor. | E | T | Implementado |
| MOD-SEG-004 | Cada perfil acessa somente os dados e funções necessários à sua atividade. | E | T | Implementado |
| MOD-SEG-005 | Toda comunicação em produção usa HTTPS. | E | N | Pendente |
| MOD-SEG-006 | Os dados recebidos são validados no servidor antes de serem gravados. | E | T | Implementado |
| MOD-SEG-007 | O aluno visualiza somente as próprias avaliações e dados. | E | T | Implementado |
| MOD-SEG-008 | O tratamento de dados de menores tem consentimento dos responsáveis ou base legal firmada com a escola, conforme a LGPD. | E | N | Pendente |
| MOD-SEG-009 | O aplicativo do aluno coleta somente nome, turma, avatar e dados de jogo. | E | N | Implementado |
| MOD-SEG-010 | O aplicativo não exibe publicidade nem compartilha dados com terceiros para fins comerciais. | E | N | Implementado |
| MOD-SEG-011 | A escola pode exportar e excluir os dados de um aluno a pedido do responsável. | I | T | Pendente |
| MOD-SEG-012 | Ações sensíveis (entradas, permissões, desativações, vínculos, acesso dos alunos) ficam num registro que o usuário da API não consegue alterar nem apagar. | E | T | Implementado |

Banco (ADR 0016): chaves estrangeiras, `ENUM`, datas e 19 restrições `CHECK` recusam dados impossíveis; o histórico nunca é apagado em cascata; papel de banco com privilégio mínimo para produção; login limitado a 10 tentativas por minuto. Detalhes em [[Modelo de dados]]. SEG-002: no painel, token assinado em cookie `httpOnly`, com expiração de 8 horas. SEG-003, SEG-004 e SEG-006: no painel, a sessão e o recorte por professor são verificados no servidor, e os formulários de plano e de atividade são validados no servidor; falta a API.

**Manutenibilidade (MAN)**

| ID | Critério | Prior. | Verif. | Situação |
| --- | --- | :---: | :---: | :---: |
| MOD-MAN-001 | As regras de negócio ficam em um núcleo compartilhado, separado das interfaces. | E | N | Implementado |
| MOD-MAN-002 | Novas missões são incluídas como dados no catálogo, sem alteração das telas existentes. | I | N | Implementado |
| MOD-MAN-003 | O código segue tipagem estática estrita e padrões automáticos de formatação e análise estática. | I | N | Implementado |
| MOD-MAN-004 | Componentes de interface com o mesmo comportamento são reutilizados. | I | N | Implementado |
| MOD-MAN-005 | O código é mantido em sistema de controle de versão. | E | N | Implementado |
| MOD-MAN-006 | Credenciais e endereços são definidos por ambiente, fora do código-fonte. | E | N | Implementado |

MAN-006: segredo da sessão e senha de demonstração vêm do ambiente; em desenvolvimento há valores padrão, recusados em produção no caso do segredo.

**Portabilidade (POR)**

| ID | Critério | Prior. | Verif. | Situação |
| --- | --- | :---: | :---: | :---: |
| MOD-POR-001 | App: gerado a partir de um único código-fonte, pronto para Android e, se contratado, iOS. | I | N | Implementado |
| MOD-POR-002 | App: se adapta a telas de 4,7 a 13 polegadas. | E | T | A medir |
| MOD-POR-003 | Web: se adapta a larguras a partir de 768 pixels (e funciona no celular). | E | T | Implementado |
| MOD-POR-004 | App: pode ser instalado para validação sem depender das lojas oficiais. | I | D | Implementado |

### 5.2 Interfaces

| ID | Requisito | Prior. | Verif. | Situação |
| --- | --- | :---: | :---: | :---: |
| MOD-IH-001 | O app usa a tela sensível ao toque para tocar, arrastar, girar e aproximar com dois dedos. | E | D | Implementado |
| MOD-IH-002 | O app usa a vibração e a saída de áudio do aparelho quando essas opções estão ligadas. | I | D | Implementado |
| MOD-IS-001 | O sistema usa um serviço de back-end com autenticação, banco de dados relacional e controle de acesso por registro. | E | N | Implementado |
| MOD-IS-002 | O app usa a síntese de voz do sistema operacional, em português do Brasil. | E | D | Implementado |
| MOD-IS-003 | O app usa os recursos do sistema operacional para gerar e compartilhar arquivos PDF. | I | D | Implementado |
| MOD-IC-001 | A comunicação entre app, plataforma web e servidor usa HTTPS com TLS 1.2 ou superior. | E | N | Pendente |

As interfaces de usuário (MOD-IU-001 a 003) estão no [[PRD-06 — Experiência do aluno]] e no [[PRD-12 — Painel do professor]].

### 5.3 Restrições do projeto

| ID | Restrição |
| --- | --- |
| MOD-RES-001 | O aplicativo do aluno é desenvolvido em React Native, com Expo e TypeScript. |
| MOD-RES-002 | A plataforma web é desenvolvida em Next.js, com TypeScript. |
| MOD-RES-003 | A interface segue a identidade visual do Modolume: Poppins nos títulos, Inter no texto e Lexend como opção de leitura facilitada; sem gradientes e sem emojis. |
| MOD-RES-004 | O conteúdo pedagógico se limita à Matemática do Ensino Fundamental. |
| MOD-RES-005 | A publicação depende da conta de desenvolvedor na Google Play; a App Store só entra se a versão para iPhone for contratada. |
| MOD-RES-006 | Os dados pessoais são tratados conforme a LGPD e o Estatuto da Criança e do Adolescente. |

### 5.4 Matriz de permissões

Legenda: **T** acesso total; **P** acesso parcial, restrito aos próprios dados ou às turmas vinculadas; **—** sem acesso.

| Funcionalidade | Administrador | Gestão | Professor | Aluno |
| --- | :---: | :---: | :---: | :---: |
| Usuários | T | — | — | — |
| Turmas e vínculos | T | T | P | P |
| Catálogo de missões | T | T | T | P |
| Atividades | — | P | T | P |
| Planejamento de aulas | — | P | T | — |
| Avaliação e feedback | — | P | T | P |
| Análise de aprendizagem | — | P | T | P |
| Painel de indicadores | — | T | T | — |
| Gamificação e personalização | — | — | — | T |
| Relatório para a família | — | — | P | T |
| Acessibilidade | T | T | T | T |
| Perfil e senha | T | T | T | T |
| Notificações | P | P | P | P |

As permissões são verificadas no servidor, não apenas na interface. O acesso parcial respeita os vínculos entre usuário, turma e instituição.

### Fora do escopo atual

- Certificações formais (ISO 27001, por exemplo).
- Alta disponibilidade fora do horário escolar.

## 6. Histórias de usuário

| ID | História | Requisitos |
| --- | --- | --- |
| HU-QUA-01 | Como **escola**, quero que os dados dos alunos sejam protegidos e só acessados por quem tem vínculo, para cumprir a LGPD. | SEG-001 a SEG-011, matriz 5.4 |
| HU-QUA-02 | Como **aluno**, quero que o app abra e responda rápido, mesmo num celular simples. | DES-001 a DES-003, POR-002 |
| HU-QUA-03 | Como **professor**, quero que o painel carregue rápido e funcione no navegador que eu tiver. | DES-004, DES-005, CMP-002, POR-003 |
| HU-QUA-04 | Como **aluno**, quero não perder meu progresso se a internet cair ou o app atualizar. | CON-001 a CON-004 |
| HU-QUA-05 | Como **usuário**, quero telas que eu entenda sem treinamento. | USA-001 a USA-018 |
| HU-QUA-06 | Como **equipe**, quero regras num lugar só e código tipado, para evoluir sem quebrar. | MAN-001 a MAN-006, ADF-001 |
| HU-QUA-07 | Como **professor orientador**, quero que o conteúdo siga a BNCC e cresça em dificuldade. | ADF-002 a ADF-004 |

## 7. Critérios de aceite

Critérios marcados com [x] já são atendidos pelo sistema atual.

### HU-QUA-01 — Dados protegidos

- [x] CA-01: O app não pede nem guarda e-mail, telefone, endereço ou foto do aluno.
- [x] CA-02: Nenhuma tela exibe publicidade.
- [x] CA-03: Senhas e PINs ficam em hash adaptativo (bcrypt) no banco.
- [ ] CA-04: Em produção, todo acesso por HTTP é redirecionado para HTTPS.
- [ ] CA-05: Dado um pedido do responsável, a escola exporta e exclui os dados do aluno.

### HU-QUA-02 — App rápido

- [ ] CA-01: Medido em aparelho intermediário, o Início aparece em até 3 segundos.
- [ ] CA-02: Jogos 3D mantêm 30 quadros por segundo ou mais.

### HU-QUA-03 — Painel rápido

- [ ] CA-01: O painel de uma turma com 40 alunos carrega em até 3 segundos.
- [ ] CA-02: As telas principais funcionam nas duas últimas versões de Chrome, Edge, Firefox e Safari.
- [x] CA-03: O painel funciona no celular, com o menu em gaveta.

### HU-QUA-04 — Progresso seguro

- [x] CA-01: Sem internet, o app continua funcionando e salva as jogadas.
- [ ] CA-02: O mesmo resultado enviado duas vezes é gravado uma única vez.

### HU-QUA-05 — Telas compreensíveis

- [x] CA-01: Todo formulário do painel mostra a mensagem de erro junto ao campo.
- [x] CA-02: Ações que apagam dados pedem confirmação.
- [ ] CA-03: Todas as telas passam no checklist das [[Diretrizes de usabilidade do painel]].

### HU-QUA-06 — Código sustentável

- [x] CA-01: Pontos, estrelas, constelações, domínio e indicadores SMART são calculados no `packages/core` e têm testes automatizados.
- [x] CA-02: O TypeScript roda em modo estrito no app, na web e no núcleo.

### HU-QUA-07 — Conteúdo pedagógico

- [x] CA-01: Os mapas vão de quantidades e pares (Mapa 1) até funções, probabilidade, média e ordem das operações (Mapa 8).
- [ ] CA-02: Cada missão tem o código da habilidade BNCC revisado.
- [ ] CA-03: Todos os mapas têm pelo menos dois formatos (falta o Mapa 5).

## 8. MVP e fases

| Fase | Entrega | Situação |
| --- | --- | --- |
| 1 a 3 | Núcleo compartilhado, tipagem estrita, uso sem conexão, coleta mínima. | Implementado |
| 4 | Hash de senha e de PIN, permissões na API, gravação atômica e sem duplicidade. | Implementado |
| 4 | HTTPS em produção (com a API publicada). | Pendente |
| 6 | Medições de desempenho, contraste e usabilidade documentadas. | Pendente |

## 9. Diretrizes do produto

- Privacidade por padrão: coletar o mínimo e explicar o porquê.
- Toda meta de qualidade precisa de um número e de um método de medição.

## 10. Dependências e riscos

| Risco | Mitigação planejada |
| --- | --- |
| Falta de aparelho intermediário para medir | Definir um aparelho de referência da equipe e documentar o modelo. |
| Consentimento dos responsáveis atrasar a validação | Iniciar o termo com a escola antes da fase 6. |

## 11. Pendências para aprovação

- Escolher o aparelho de referência para as medições.
- Formalizar o termo de consentimento com a escola.

## 12. Documentos vinculados

- [[PRD — Modolume]]
- [[Diretrizes de usabilidade do painel]]
- [[0001-monorepo-com-nucleo-compartilhado|ADR 0001]] · [[0003-progresso-local-e-uso-sem-conexao|ADR 0003]] · [[0007-back-end-node-postgresql-railway|ADR 0007]]
