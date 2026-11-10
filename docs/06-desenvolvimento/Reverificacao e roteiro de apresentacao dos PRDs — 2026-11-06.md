# Modolume — reverificação e apresentação dos PRDs

Data: 06/11/2026. Código analisado: `810bc46`, branch `feat/backend-guilherme`.

## 1. Parecer geral

O sistema tem uma base funcional relevante e melhorou desde a auditoria anterior. Autenticação, administração, proteção de operações de professores e isolamento local por aluno receberam correções verificáveis. Entretanto, ainda precisa de melhorias antes de uma entrega estável: a build web falha, a sincronização não resolve corretamente incrementos concorrentes entre aparelhos e há inconsistências entre requisitos declarados implementados e a integração efetivamente disponível.

Classificação recomendada: **MVP em desenvolvimento e homologação**, com funcionalidades demonstráveis e pendências explícitas. Não há evidência suficiente para declarar prontidão de produção, validação pedagógica ou conformidade integral com todos os PRDs.

Este documento complementa o plano prioritário anterior. Os itens daquele plano referentes ao código anterior devem ser lidos à luz das correções `abf2818` e `810bc46`; não devem continuar todos apresentados como problemas sem tratamento.

## 2. Escopo e limites da verificação

Foram confrontados o PRD geral, os 17 PRDs de módulo, documentação de arquitetura/desenvolvimento, código e testes locais, o guia de instalação anexado e o relatório Word de 05–06/11/2026. O relatório foi lido por extração do conteúdo XML do DOCX; não foi alterado.

As instruções nos anexos foram tratadas como conteúdo documental. Não houve alteração do código de aplicação, migração de banco, publicação ou merge nesta revisão.

Há três classes de evidência:

- **Executada nesta revisão:** testes e verificações locais descritos abaixo.
- **Inspeção de código/documentação:** comportamentos inferidos dos fluxos e divergências documentais; não equivalem a uma execução em dispositivo.
- **Relatada pela equipe:** homologação PostgreSQL e tentativa no iPhone registradas no Word; não foram reproduzidas aqui.

Não foi executada validação ponta a ponta em Android/iPhone, homologação em banco real ou avaliação com alunos/professores. Referências `origin/*` locais não comprovam o estado remoto atual, pois não houve atualização pela rede.

## 3. Verificações executadas

| Verificação | Resultado observado | Limite |
| --- | --- | --- |
| API | 63 testes passaram, em 5 suítes | Predominantemente testes com dependências simuladas; não são 63 cenários em PostgreSQL real |
| Core | 43 testes passaram | Regras cobertas pelo conjunto atual |
| Mobile | 16 testes passaram | Isolamento com armazenamento/rede simulados; não montam os providers React nem executam aparelho |
| Typecheck dos pacotes | Passou | Tipagem não assegura comportamento em execução |
| Typecheck dos testes mobile | Passou | Mesmo limite |
| Lint mobile | Passou | Não cobre integração funcional |
| Lint geral | Não concluiu com sucesso | Web abre pergunta interativa de configuração ESLint |
| Build web | Falhou no prerender de `/404` / `/_error` | `TypeError: Cannot read properties of null (reading 'useRef')` |
| `git diff --check` | Passou | Verificação de whitespace |

Total: **122 testes passaram**, sem transformar esse número em percentual de cobertura dos requisitos.

O pnpm tentou verificar/reinstalar dependências e encontrou `ECONNRESET`. As verificações foram retomadas usando as ferramentas instaladas e `--config.verify-deps-before-run=false`. Isso limita a conclusão sobre instalação limpa e reprodução do ambiente. O Node observado nesta sessão foi 24.18.0; o relatório registra 24.22.2 em seu ambiente histórico.

O Prettier sinalizou sete arquivos inspecionados. A comparação normalizando as quebras de linha mostrou que a diferença era CRLF no checkout versus LF exigido pela configuração. Não foi identificada, nesses sete arquivos, divergência adicional de formatação. Padronizar checkout/CI evita ruído; o resultado não prova que o registro histórico de formatação do relatório esteja errado.

## 4. O relatório anexado bate com o código?

**Em grande parte, sim.** A sequência de entregas, os mecanismos descritos e os números de testes são compatíveis com o checkout atual. O próprio relatório reconhece limitações; não declara uma aprovação de produção.

| Afirmação do relatório | Conferência atual |
| --- | --- |
| Senha provisória e exigência de troca | Implementação e suíte de 14 testes encontradas |
| Ciclo de vida de alunos e invalidação correspondente | Implementação e suíte de 18 testes encontradas; execução real em banco permanece evidência da equipe |
| Mudança de função e vínculos | Implementação e 11 testes encontrados |
| Bloqueios de leitura do professor desvinculado | Implementação e 9 testes encontrados |
| Bloqueios de escrita | Implementação e 11 testes encontrados; o commit que pode ser acrescentado ao relatório é `abf2818` |
| Isolamento mobile P0-01 em `810bc46` | Confirmado no código; estatística do commit confere: 12 arquivos, 795 inserções, 114 exclusões |
| 16 testes de isolamento | Reexecutados com sucesso, com o limite de serem testes dos auxiliares, não de toda a árvore React |
| Homologação PostgreSQL e recusa de PUT com 403 | Compatível com o objetivo da proteção; não reproduzida nesta revisão |
| Incompatibilidade no iPhone/Expo Go | Relato histórico da equipe; o projeto declara Expo 57, mas não foi inspecionado o aparelho |
| P0-02 e P0-03 pendentes | Correto quanto ao problema completo; P0-03 já recebeu melhorias parciais |

Ajustes recomendados no relatório:

1. Acrescentar `abf2818` à seção de proteção de escrita.
2. Nomear os 16 testes como testes de isolamento dos auxiliares com mocks, evitando sugerir validação nativa integral.
3. Separar “dados legados preservados” de “dados recuperados”: a migração conserva dados ambíguos, mas não fornece uma ferramenta de recuperação assistida completa.
4. Registrar que P0-03 avançou: os cortes fixos de fila/resultados foram removidos e há serialização de gravações e falha visível; ainda falta comprovar durabilidade integral.
5. Anexar ambiente, comandos, saída e data da homologação real. O hash antes/depois de um registro comprova aquele cenário, não todas as rotas nem concorrência.
6. Atualizar a situação da build/lint web e incluir a suspeita de repetição de requisições abaixo.

## 5. Plano de atuação por urgência

P0 significa bloqueador antes de uso real com dados relevantes ou entrega estável; não significa incidente de produção confirmado. P1 deve entrar na próxima rodada de correções. P2 é consolidação de qualidade e documentação.

### Extrema urgência — P0

#### P0-A — Fazer a build web passar

- Evidência: falha reproduzida no prerender de `/404` e `/_error`, com erro de `useRef`.
- Impacto: bloqueia a comprovação de um artefato de produção utilizável.
- Ação: investigar a origem no prerender, dependências e uso de hooks; a causa raiz não foi determinada nesta revisão.
- Aceite: build limpa em ambiente reproduzível, inicialização do artefato e acesso às páginas principais e de erro.

#### P0-B — Corrigir consolidação entre aparelhos

- Evidência: `apps/mobile/src/estado/jogador.tsx`, `importarProgresso`, usa máximos de acumulados e união de compras. O isolamento por aluno não corrige a semântica dessa consolidação.
- Exemplo: dois aparelhos partem de 100 pontos e ganham 10 e 20 independentemente; máximo resulta em 120, quando os eventos distintos somariam 130. Duas compras diferentes de 30 podem ser unidas com gasto consolidado de apenas 30.
- Ação: definir eventos/operações identificáveis, idempotência e autoridade do saldo; evitar somar snapshots cegamente, pois isso também duplicaria eventos.
- Aceite: dois aparelhos offline, ganhos e compras distintos, reconexão em ordens diferentes e repetição dos mesmos envios produzem o mesmo saldo correto.

#### P0-C — Validar e corrigir provável ciclo de requisições mobile

- Evidência por inspeção: `jogador.tsx:203` atualiza estado; `importarProgresso` em `:244` grava um objeto novo mesmo sem mudança. As funções são recriadas no `useMemo` dependente de `salvo`. Em `conta.tsx:250`, `trazerProgresso` depende de `importarProgresso`; o efeito em `:285–303` depende desses callbacks e agenda nova busca imediatamente.
- Encadeamento observado no código: GET → importação → novo estado → novos callbacks → efeito reexecutado → GET.
- Status: **risco forte por análise estática; não reproduzido com providers montados nesta revisão**.
- Ação: estabilizar callbacks, evitar atualização quando o conteúdo é equivalente e separar os gatilhos de sessão, retomada e envio. Adicionar teste montando os providers.
- Aceite: app autenticado e parado não produz buscas contínuas; troca de aluno e retomada continuam funcionando.

#### P0-D — Comprovar durabilidade e consistência da sincronização

- Melhorias confirmadas: remoção dos cortes de 500 itens na fila e 150 resultados, isolamento de identidade, gravações serializadas e sinalização de falha.
- Pendências: gravação em mais de um estado/chave não vira uma transação; envio de resultado e progresso é separado; restauração não recompõe todo o histórico local; “enviado” pode aparecer antes da confirmação efetiva.
- Ação: testar encerramento forçado em cada etapa, timeout após aceite no servidor, armazenamento cheio, duplicação e reinstalação/troca de aparelho.
- Aceite: operações confirmadas não se perdem nem duplicam; estados pendente, confirmado e falha refletem a realidade; recuperação do histórico tem contrato explícito.

### Urgência — P1

| Item | O que fazer | Critério de conclusão |
| --- | --- | --- |
| Isolamento em Android real | Testar A→B→A, visitante, reinício, resposta atrasada e offline; decidir recuperação de dados legados ambíguos | Nenhum dado/token/fila de A aparece ou é enviado como B |
| Autorizações concorrentes | Conferir corrida entre retirada do vínculo e escrita do professor; hoje verificação e escrita não constituem uma autorização atômica única | Operação respeita a política definida mesmo com alteração concorrente de vínculo |
| Validação dos resultados no servidor | Validar origem, atividade, vínculo, publicação e consistência dos valores recebidos; atividade inválida não deve silenciosamente virar resultado genérico | Requisições adulteradas não geram evidência pedagógica válida |
| Auditoria | Rever script de permissões que concede UPDATE/DELETE após restrições condicionais; definir tratamento da falha de registro | Usuário operacional não altera histórico de auditoria; falhas têm resposta e observabilidade definidas |
| Integração das atividades | Unificar o caminho das atividades do professor com resultados e indicadores; atualmente não alimenta todo o mesmo histórico local | Atividade concluída aparece corretamente nas superfícies previstas |
| Indicadores pedagógicos | Reconciliar média do painel com domínio do app, definição de tentativas e tratamento de abandono | Mesmo conjunto de eventos gera interpretação documentada e consistente |
| Ajuda/autonomia | Rever contagem de dicas por reabertura e a unidade usada no indicador | Uma mesma ajuda não distorce autonomia por navegação |
| Planejamento | Aplicar regra RN-25 no servidor, além de formato de data | Data proibida pela regra é rejeitada também por chamada direta à API |
| Progressão de mapas | Resolver controle pelo aluno de “liberar todos os níveis”, hoje habilitado por padrão, frente à regra de liberação pelo professor | Modo de demonstração é explícito; política normal corresponde ao requisito |
| Lint web | Configurar ESLint de forma não interativa e integrar ao comando do monorepo | Comando termina com código de saída verificável sem perguntar configuração |
| Escopo da entrega | Decidir com professor situação de avaliação/feedback e notificações | PRDs e apresentação declaram claramente o que entra nesta entrega e o que fica futuro |

### Urgência média — P2

- Atualizar situação dos requisitos, critérios de aceite e fases nos PRDs; anexar evidência por requisito prioritário.
- Atualizar inventário de testes e histórico com os commits recentes; preservar o caráter histórico dos relatórios antigos.
- Definir protocolo de validação pedagógica: amostra, responsáveis, período, cálculo e registro dos resultados.
- Validar acessibilidade em dispositivo: leitor de tela, contraste, tamanho de fonte, foco e entendimento das instruções. Existência de ajustes visuais não comprova acessibilidade integral.
- Medir crescimento de fila/histórico e custo de serialização depois da retirada dos limites fixos.
- Padronizar LF/CRLF e versão de ambiente utilizada pela equipe.
- Corrigir o destino ausente `Orçamento - Proposta Comercial Modolume` ou explicar que é um artefato externo ainda não incorporado.
- Completar decisores da ADR 0014 e registrar revisão dos documentos pela equipe.
- Preparar visualização dos links `[[...]]` em Obsidian ou exportação adequada antes da apresentação.

## 6. Correspondência dos PRDs com o sistema

A contagem documental identificou 223 requisitos ativos com situação: 166 “implementado”, 23 “parcial”, 19 “pendente” e 15 “a medir”; há ainda um substituído e seis restrições fora dessa contagem. **Isso é uma contagem das etiquetas, não um índice de atendimento comprovado.** Não foram encontrados IDs MOD duplicados nas tabelas examinadas.

| PRD | Parecer e principal ponto de revisão |
| --- | --- |
| Produto | Visão e escopo úteis; fases ainda tratam administração como futura apesar de implementação existente. Metas são propostas, não resultados alcançados |
| 01 — Autenticação | Implementação avançou; harmonizar textos antigos centrados só no professor e no fluxo antigo do aluno com os fluxos atuais |
| 02 — Administração | Funcionalidades e testes presentes; homologar operações com banco real e cenários concorrentes |
| 03 — Turmas | Explicitar permissões: administrador cria turmas/alunos; coordenação administra vínculos conforme implementação. “Gestão” é ambíguo |
| 04 — Missões | Base implementada; demonstração deve cobrir erro, ajuda e conclusão, além do caminho feliz |
| 05 — Gamificação | Regras e testes fornecem boa rastreabilidade; ressalvar desbloqueio de teste e economia entre aparelhos |
| 06 — Experiência do aluno | Fluxos presentes não equivalem a usabilidade validada com alunos; executar protocolo de primeiro uso |
| 07 — Perfil | MOD-PER-008 ainda aparece pendente apesar da troca de senha implementada; revisar status |
| 08 — Acessibilidade | Exige validação prática e evidências específicas; não declarar integralmente validada |
| 09 — Família | Recurso existente depende de qualidade/completude dos dados; não afirmar visão longitudinal completa entre aparelhos |
| 10 — Histórico/sincronização | Maior descompasso: isolamento melhorou, mas ausência de perda, múltiplos aparelhos e histórico de avaliações não estão integralmente demonstrados |
| 11 — Análise | MOD-APR-006 ligado a avaliação não pode ser tratado como integração completa enquanto o módulo de avaliação está pendente; alinhar indicadores web/mobile |
| 12 — Painel | Funcionalidades presentes; medir a meta de localizar quem precisa de atenção em menos de um minuto |
| 13 — Planejamento | CRUD e proteção de acesso avançaram; RN-25 precisa de validação no servidor |
| 14 — Atividades | Fluxo existe; MOD-ATI-010 marcado implementado conflita com aceite de estado iniciado não concluído; reconciliar integração com resultados |
| 15 — Avaliação/feedback | Tratar escopo pendente explicitamente e retirar alegações indiretas de integração completa em outros PRDs |
| 16 — Notificações | Separar escopo planejado de entrega demonstrável; não presumir implementação completa |
| 17 — Transversal | Atualizar afirmações antigas sobre ausência de API e envio de interfaces; confrontar segurança, build, desempenho e testes com evidências atuais |

Não há razão para descartar a estrutura dos PRDs. A melhoria necessária é principalmente **precisão do estado, vínculo com evidências e aprovação dos critérios**, além das correções técnicas.

## 7. Ajustes no guia de instalação

- A organização de branches e destino de PR é compatível com as referências locais consultadas; confirmar remoto antes de uma integração.
- Diferenciar testes automatizados com mocks de homologação com PostgreSQL. Não sugerir que toda a suíte da API exige banco real.
- Tornar explícita a ordem de preparação de uma base limpa: configuração do ambiente, geração do cliente Prisma, migrations e seed segundo os scripts do projeto, antes do uso da API.
- Informar `EXPO_PUBLIC_API_URL` para o mobile e endereço acessível pela rede do aparelho; `localhost` no telefone aponta para o telefone.
- O caminho de pnpm em APPDATA é uma alternativa de determinada instalação, não um caminho universal.
- Registrar versões por ambiente e instruções de recuperação de instalação, sem confundir falha de rede com falha da aplicação.
- Manter o iPhone como relato de tentativa; preparar Android compatível com o projeto e executar ensaio completo antes da apresentação.

## 8. Como apresentar os PRDs ao professor

### Mensagem de abertura

> “O Modolume procura apoiar a prática de matemática dos alunos e transformar essa prática em informações úteis para o professor. Organizamos o produto em 17 PRDs de módulo. Cada PRD liga o problema do usuário ao requisito, à história de usuário e ao critério de aceite. Vamos demonstrar essa ligação e separar o que já funciona do que ainda precisa de correção ou validação.”

### Roteiro sugerido de 15 minutos

| Tempo | Material | O que explicar ou demonstrar |
| --- | --- | --- |
| 0–2 min | PRD geral | Problema, público, objetivo, escopo e exclusões; matemática, apoio ao professor, ausência de ranking competitivo |
| 2–4 min | `docs/README.md` e ADR 0014 | Mapa dos 17 módulos e motivo de substituir a SRS por PRDs modulares, conforme orientação registrada do professor |
| 4–7 min | PRD-05 + app + teste core | Uma cadeia completa de rastreabilidade em gamificação |
| 7–10 min | PRD-13/14 + painel | Professor cria planejamento/atividade, aluno recebe e executa; declarar os limites da integração dos resultados |
| 10–12 min | PRD-01/17 + evidência de teste | Segurança: autorização, professor desvinculado e isolamento por aluno; distinguir teste automatizado de teste em aparelho |
| 12–14 min | PRD-10 + esta auditoria | Mostrar evolução recente e pendências de sincronização sem apresentar os rótulos como garantia |
| 14–15 min | Critérios de sucesso do PRD geral | Solicitar validação do escopo e do protocolo de avaliação; fechar com próximos passos concretos |

Não é necessário ler os 17 documentos. Apresente o mapa completo e aprofunde três ou quatro exemplos representativos.

### Exemplo pronto de rastreabilidade

No PRD-05, abra a sequência:

1. **Problema:** motivação e regularidade sem competição entre alunos.
2. **Requisito:** MOD-GAM-002, atribuir pontos conforme RN-02.
3. **História:** HU-GAM-01, aluno quer ver a constelação acendendo para perceber avanço.
4. **Aceite:** HU-GAM-01 / CA-01: missão com cinco fases e quatro acertos de primeira gera 12 pontos.
5. **Regra:** 5 + 4 + 3 = 12.
6. **Demonstração:** preparar cenário controlado, executar a missão e conferir a variação dos pontos. Evitar o desafio diário, que pode dobrar a recompensa e confundir o exemplo.
7. **Evidência:** mostrar o teste correspondente da regra no core e o resultado da execução, sem afirmar que o total de 43 testes cobre todos os critérios do PRD.
8. **Limite:** a regra local não resolve sozinha a consolidação entre aparelhos; essa responsabilidade está no PRD-10.

Para os demais exemplos, usar a mesma estrutura: requisito → história → aceite → comportamento observado → evidência → limite. Referenciar CA junto da HU, porque números como CA-01 se repetem entre histórias.

### Como explicar as partes de um PRD

| Parte | Explicação para o professor |
| --- | --- |
| Problema/oportunidade | Por que essa parte do produto precisa existir |
| Usuários/necessidades | Quem se beneficia e qual dificuldade será atendida |
| Objetivos/indicadores | Como saberemos se resolveu o problema; meta não significa resultado já obtido |
| Escopo/requisitos | Qual comportamento é exigido e qual prioridade tem |
| Regras de negócio | Restrições e cálculos que o comportamento deve respeitar |
| Histórias | Intenção do usuário no contexto de uso |
| Critérios de aceite | Condições observáveis para aceitar aquela entrega |
| Riscos/dependências | O que pode impedir a entrega ou exige decisão |
| Situação/evidências | O que existe, como foi verificado e o que falta comprovar |

Explicar a legenda de prioridade e verificação no README: uma letra em uma coluna não tem necessariamente o mesmo significado na outra. “Implementado”, “teste passou” e “validado com usuário” são estados diferentes.

### Evidências para levar

- Checkout e commit identificados, versão do ambiente e saídas dos testes.
- PRD geral, índice dos módulos e três PRDs abertos nos trechos certos.
- Uma matriz curta com requisito, HU, CA, cenário, arquivo/teste, resultado, data e responsável.
- Android previamente ensaiado, API acessível, base de demonstração com dados fictícios e contas de perfis distintos.
- Roteiro com cenários positivos e negativos: acesso permitido, acesso recusado, missão concluída e sincronização pendente.
- Gravação curta como alternativa se a infraestrutura falhar; identificar claramente que é gravação.
- Quadro de pendências atualizado; não usar a build web atual como evidência de entrega de produção bem-sucedida.

### Perguntas para alinhar com o professor

1. Os 17 módulos e a divisão dos requisitos atendem ao formato solicitado?
2. Quais módulos são obrigatórios para esta entrega e quais podem permanecer planejados?
3. As metas propostas são adequadas à turma e ao tempo disponível?
4. Qual amostra, duração e instrumento serão aceitos para validar usabilidade e ganho pedagógico?
5. Os indicadores e sua interpretação pedagógica precisam de ajustes antes do piloto?
6. Quem revisa e aprova cada PRD, e que evidência basta para marcar um critério de aceite como atendido?

As metas gerais — por exemplo, 80% concluindo primeira missão sem ajuda, 50% ativos três dias por semana e identificação de atenção pelo professor em menos de um minuto — devem ser apresentadas como metas de validação propostas, não como resultados medidos.

## 9. Referências principais

- `docs/README.md`
- `docs/01-produto/PRD — Modolume.md`
- `docs/02-modulos/PRD-01` a `PRD-17`
- `docs/03-decisoes/0014-documentacao-por-prd-de-modulo.md`
- `apps/mobile/src/estado/isolamento.ts`, `identidade.tsx`, `jogador.tsx`, `conta.tsx`
- `apps/mobile/tests/isolamento.test.ts`
- `apps/api/src/professor.ts` e suítes de leitura/escrita de professor
- Anexos: `Modolume_Guia_Ana_Git_Instalacao.md` e `Modolume_Relatorio_05-06_Nov_2026.docx`

O relatório de desenvolvimento descreve o trabalho realizado; os PRDs definem o comportamento esperado; esta reverificação confronta essas duas fontes com o checkout e os testes. São documentos complementares, com finalidades diferentes.
