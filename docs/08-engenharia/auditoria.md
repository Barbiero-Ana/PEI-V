# Auditoria técnica do Modolume

## Consolidação funcional em 11/11/2026

Foram implementadas as quatro frentes solicitadas. O [roteiro de consolidação](consolidacao-funcional.md)
registra responsabilidades, transição e testes em aparelho. As migrações desta entrega foram exercitadas
somente em bancos descartáveis. A API e o painel publicados e os APKs anteriores não foram atualizados por
esta revisão local.

| Frente | Implementação e evidência |
| --- | --- |
| Progresso | Transação por aluno com histórico, crédito e compra, ID estável e preços no núcleo. Conciliação local por revisão com operações pendentes. Testes de soma nas duas ordens, reenvio, compra repetida, saldo concorrente e rollback do conjunto quando o débito falha. Importação legada preserva a base disponível, sem reconstruir eventos antigos ausentes. |
| Aprendizagem | App e painel usam o cálculo de domínio do núcleo. A adaptação mantém rodadas, acertos de primeira, tentativas e dicas. Ordem estável por data/ID e confiança compartilhada. O pentagrama agrupa formatos e as tabelas continuam identificando o acerto médio separadamente. |
| Atividades | Prazo opcional inclusivo, início separado da conclusão, detalhe por fase nas novas entregas, rascunho privado, avaliação publicada versionada e histórico imutável. Central de avisos no app com leitura persistida por aluno e fila offline. Exclusão de atividade com avaliação arquiva o conteúdo e preserva as devolutivas. |
| Qualidade | ESLint da API além da tipagem, incluindo restrições de importação entre aplicações. Workflow de CI versionado com lockfile congelado, testes, migrações em base isolada, build do painel, rotas protegidas e bundle Android. Não usa segredos de produção. |

Passaram **55 testes do núcleo, 72 da API e 24 do mobile**, mais um teste de contrato entre núcleo e painel (**152 testes no total**), além da suíte de PostgreSQL. A suíte aplicou
as migrações pelo CLI Prisma duas vezes em outra base descartável e confirmou a idempotência. Lint dos
quatro pacotes, tipagem, tipagem dos testes móveis e formatação passaram. O painel gerou sua build e o teste
de produção local confirmou login, recuperação, 404 e redirecionamento sem sessão, inclusive na nova rota
de avaliação. Metro/Hermes exportaram o bundle Android com as novas telas. O YAML do workflow foi validado.

O Next ainda informa o aviso preexistente de ausência do plugin opcional específico na configuração ESLint;
o lint configurado e a build passaram. A execução remota da CI depende de enviar as alterações ao GitHub.
A instalação assinada, a conferência visual, a acessibilidade e os dois aparelhos físicos continuam no roteiro
de aceite. Os [ADRs 0024](../03-decisoes/0024-progresso-por-operacoes-confirmadas.md) e
[0025](../03-decisoes/0025-ciclo-de-atividades-e-devolutivas.md) registram as decisões para homologação,
incluindo o bônus diário único pela melhor tentativa e os avisos internos ao app, sem push nesta entrega.

## Revisão de estrutura e documentação em 10/11/2026

A revisão cruzou os fluxos de autenticação, sessão móvel, sincronização, atividades, análise de aprendizagem e
cadastros com seus PRDs, guias e fichas geradas. A separação entre aplicações e núcleo está aplicada. O núcleo
mantém cálculos e validações sem importar Expo, React Native, Next ou Nest. A API valida o papel e o vínculo,
e as migrações permanecem versionadas.

| Situação | Achado e encaminhamento |
| --- | --- |
| Corrigido na documentação | O guia de isolamento ainda descrevia sessão em AsyncStorage e chaves por seção como formato atual. Agora descreve SecureStore, limpeza de credenciais legadas e envelope conjunto por identidade. |
| Corrigido na documentação | O PRD de acesso marcava recuperação por e-mail como ausente e o de administração prometia entregar senha provisória. Ambos agora descrevem definição por link solicitado pela pessoa, com entrega real pendente de homologação. |
| Corrigido na rastreabilidade | As fichas de sincronização e notificações diziam que persistência local já presente no código estava pendente. O gerador passou a distinguir a conclusão local atômica, os alertas lidos no navegador e os respectivos limites entre aparelhos. |
| Corrigido na documentação | O critério de paridade de aprendizagem estava marcado como atendido. O app calcula domínio no núcleo, enquanto o painel usa acerto médio. O critério fica aberto até integrar o mesmo cálculo no painel. |
| Corrigido na documentação | O acompanhamento da atividade estava marcado como completo, embora o estado em andamento esteja ausente. O requisito fica parcial. A devolutiva posterior de avaliação também foi distinguida da orientação por erro de questão que já existe. |
| Corrigido na referência | O modelo de dados passou a incluir matéria, segmento e o nome atual de ponto por mapa. Documentos de contexto e inventário anteriores estão identificados como históricos. |
| Corrigido na configuração | Os exemplos de ambiente agora cobrem API, painel integrado e app. O guia inclui Resend, API obrigatória na web de produção, ambientes EAS e a limitação de `auto` com túnel do Expo. |
| Pendente no código | Consolidar ganhos, tentativas e compras distintos entre aparelhos. O maior total e a união de conquistas preservam parte do estado, mas não somam contribuições concorrentes. |
| Pendente de manutenção | Os controladores de administração e professor concentram regras e acesso ao banco. Ao alterar esses fluxos, extrair operações por domínio mantendo transações e guardas cobertas pelos testes existentes. Os providers de conta e jogador também concentram orquestração e regras de recompensa. |
| Pendente de automação | Há comandos de teste, lint e tipagem, mas não foi encontrada uma esteira de CI versionada neste checkout. O comando `lint` da API executa apenas `tsc --noEmit`; acrescentar análise de regras e fronteiras além da tipagem. Automatizar as verificações e a aplicação das migrações em uma base isolada antes das próximas entregas. |
| Pendente de aceite | Registrar teste em aparelho físico, entrega real do Resend, privacidade e procedimento de exportação e exclusão. Builds e testes unitários não concluem esses aceites. |

A matriz contém 230 requisitos declarados. O cruzamento dos fluxos acima não constitui aceite individual de
todos eles. A revisão de 08/11 abaixo é mantida como histórico das verificações e decisões daquela etapa.

Nesta sessão passaram 47 testes do núcleo, 69 da API e 21 do mobile. A tipagem e o lint do mobile e a
verificação de formatação de todo o código também passaram. A API HTTPS respondeu ao teste de saúde e à autenticação e consulta de uma conta fictícia do
professor. A tela pública de entrada do painel respondeu.

Em 11/11/2026, o AAB `1.0.0` (código 2) concluiu no EAS e passou na validação estrutural com `bundletool`
1.18.3. O manifesto confirma o pacote `br.com.modolume.app`, mínimo API 24 e alvo API 36. Há permissões
herdadas a revisar, incluindo sobreposição de janelas e armazenamento externo até a API 32. O
[roteiro Android](publicacao-android.md) registra o artefato e os aceites ainda abertos. Esta evidência não
confirma instalação em aparelho, compatibilidade com páginas de 16 KB ou aprovação pela loja.
O APK do perfil `preview` também concluiu no EAS e está disponível para instalação direta de teste,
com a mesma versão e código. O aceite físico permanece aberto.

## Revisão de 08/11/2026

Revisão de 8 de novembro de 2026. O trabalho partiu do PRD do produto, dos 17 PRDs vigentes e das verificações anteriores no repositório. O resultado é uma versão com correções locais de segurança, persistência e manutenção e com conformidade parcial documentada. A validação institucional continua aberta.

## Diagnóstico e alterações

| Achado | Mudança e impacto | Referências |
| --- | --- | --- |
| Cadastro e redefinição entregavam senha provisória ao administrador. Uma sessão antiga podia recuperar acesso depois de certas alterações de conta. | Cadastro devolve apenas o ID. Recuperação usa token de uso único, prazo, hash e canal privado. Revogação invalida credencial e sessões. Troca da senha própria encerra a sessão e exige novo login. E-mail de conta com senha definida não pode ser redirecionado pelo administrador. | [Acesso](../../apps/api/src/acesso.ts), [credenciais](../../apps/api/src/credencial.ts), [administração](../../apps/api/src/admin.ts), [recuperação web](../../apps/web/app/redefinir-senha) |
| O provisionamento podia conceder alteração ou exclusão de registros de auditoria. Falhas na gravação do registro eram engolidas. | O papel da API pode ler e inserir em `registro`. `UPDATE`, `DELETE` e `TRUNCATE` são recusados. As gravações auditadas de credenciais, usuários, turmas, vínculos e demais ações já registradas usam a mesma transação da alteração. | [Privilégios](../../apps/api/prisma/sql/papel-da-api.sql), [infraestrutura](../../apps/api/src/infra.ts), [teste no banco](../../apps/api/scripts/verificar-banco.ts) |
| Resultados do professor podiam ser gravados sem vínculo válido. A API aceitava campos matematicamente incompatíveis. Reenvios podiam ser confirmados sem verificar a propriedade do registro. | A validação exige origem, referência e formato coerentes. Cada ID é confirmado pela existência da jogada do aluno. O app guarda recusas separadas da fila. A atividade concluída orienta o aluno a acompanhar o envio. Pedir a mesma dica várias vezes na fase conta uma vez. | [Validação](../../apps/api/src/jogada.ts), [entrada da API](../../apps/api/src/aluno.ts), [fila](../../apps/mobile/src/estado/conta.tsx), [partida](../../apps/mobile/src/componentes/Partida.tsx) |
| Planejamento aceitava datas e horários impossíveis e requisições diretas podiam registrar uma aula futura. | Esquema compartilhado valida datas civis e horário. A API aplica RN-25, e salvar registro marca a aula como realizada. | [Planejamento](../../packages/core/src/planejamento.ts), [validação](../../packages/core/src/validacao.ts), [API do professor](../../apps/api/src/professor.ts) |
| Lista da equipe sem busca combinada. Paginação da auditoria aceitava deslocamento fracionário. | Busca de nomes sem acentos, combinação com perfil e situação e paginação de 20 na web. A consulta de auditoria usa página inteira, limite e desempate estável. A lista da equipe ainda recebe todos os usuários da instituição antes de filtrar no servidor web. | [Usuários](../../apps/web/app/admin/usuarios/page.tsx), [administração](../../apps/api/src/admin.ts) |
| Build 404 falhava em `useRef`. Lint web abria assistente interativo. | Web, Next e React DOM resolvem a mesma instância do React, com Expo mantendo sua versão. ESLint da web usa configuração explícita e executa sem interação. | [Dependências](../../package.json), [lint](../../apps/web/eslint.config.mjs), [teste web](../../scripts/verificar-web.mjs) |
| Módulos do núcleo tinham nomes mistos. A tabela `pontos_mapa` e o modelo correspondente estavam no plural. | Foram padronizados os controladores, provedores, esquemas e arquivos do núcleo afetados. A tabela passou a `ponto_mapa`, com modelo `PontoMapa`. | [Núcleo](../../packages/core/src), [schema](../../apps/api/prisma/schema.prisma), [migrações](../../apps/api/prisma/migrations) |

A [arquitetura](arquitetura.md) compara a organização anterior com a atual e explica responsabilidades, contratos, sessão, persistência e configuração. A [matriz](matriz.md) contém 230 requisitos e liga cada um à fonte, à implementação, aos critérios da história e à evidência disponível. Cada PRD tem um [documento de módulo](README.md) e cada requisito tem sua ficha. Os PRDs originais foram preservados.

## Migrações e dados

| Migração | Efeito | Preservação |
| --- | --- | --- |
| `20261108120000_proteger_registro` | Revoga escrita de alteração, remoção e truncamento da auditoria para o papel da API. Protege a tabela de controle de migrações quando presente. | Mantém registros existentes. |
| `20261108130000_redefinicao_segura` | Acrescenta versão da sessão, resumo do token e prazo em `professor`, com unicidade e restrição de preenchimento conjunto. | Mantém hashes e históricos. A equipe entra novamente após a atualização. |
| `20261108140000_ponto_mapa_singular` | Renomeia tabela e restrições de chave em transação. | Mantém linhas, relacionamentos, restrição de saldo e privilégios. |

As migrações foram exercitadas em PostgreSQL local isolado com dados sintéticos. O ambiente institucional ainda precisa da verificação dos papéis e da aplicação das migrações antes da troca da API.

## Evidências executadas

| Verificação | Resultado |
| --- | --- |
| Núcleo TypeScript com Vitest | 47 testes aprovados. |
| API HTTP e controladores com banco simulado | 67 testes aprovados. Incluem vínculos, papéis, validade da sessão, alteração de e-mail, dados de jogada e registro de aula futura. |
| Estado e sincronização mobile | 17 testes aprovados. Incluem separação por identidade, resposta atrasada e recusas. |
| PostgreSQL 18.6 isolado | Migrações e preservação de dados, privilégios em ambas as ordens, uso único concorrente, expiração, rollback quando falha a auditoria e deduplicação de reenvio. O adaptador Resend foi simulado. |
| TypeScript e análise estática | Tipagem dos quatro pacotes e lint web e mobile aprovados. A build web informa ausência do plugin opcional do Next na configuração ESLint. |
| Build e teste web em produção local | 27 páginas geradas. Login e recuperação retornaram 200, caminho inexistente retornou 404 e as áreas protegidas redirecionaram sem sessão. |
| Exportação Android | Metro e Hermes geraram o bundle. Teste em dispositivo, instalação de APK e publicação não foram executados. |

Na revisão da prévia, o mobile foi atualizado do Expo SDK 57 para o SDK 58, com React Native 0.88.1. A barra de abas passou a usar o emissor e a ação de navegação fornecidos pela versão atual do Expo Router. Os jogos de arraste adotaram a tipagem das referências nativas do React Native. O Metro serviu o bundle Android, a tipagem e o lint do app passaram e os 17 testes mobile continuaram aprovados. A web foi recompilada e os três perfis de demonstração abriram seus painéis em `127.0.0.1:3173`. O endereço `localhost:3000` resolvia para outro serviço na máquina.

O Prettier passou no conjunto de código configurado para API, web, app e núcleo. O [mapa do módulo do aluno](modulo-do-aluno.md) reúne a jornada do app e os requisitos de cadastro e vínculo escolar, que ficam em PRDs diferentes.

## Divergências e decisões de produto

| Referência | Divergência e tratamento |
| --- | --- |
| MOD-ADM-010 e MOD-AUT-007 | O PRD descreve senha provisória entregue ao usuário e recuperação futura por e-mail. A instrução da auditoria exige que administradores desconheçam as senhas. O fluxo novo usa definição por link privado e prazo padrão configurável de 30 minutos. A configuração e a entrega real pelo Resend continuam pendentes. |
| MOD-TUR-001 a 005, MOD-ADM-011, ADR 0019 e PRD-17 | O termo “gestão” reúne permissões que o produto divide entre administração e coordenação. O código preserva o recorte atual e a divisão de responsabilidades. |
| MOD-TUR-003 e PRD-03 | A tabela aceita vários professores, enquanto a descrição de situação menciona um responsável. A validação institucional precisa confirmar a regra de responsabilidade e a interface para múltiplos docentes. |
| MOD-MIS-012, MOD-ATI-010 e IND-04 | Sair sem registrar resultado e acompanhar “em andamento” podem coexistir com eventos distintos. É preciso decidir quando registrar início e qual é o denominador de conclusão. |
| IND-06, RN-07 e MOD-APR-008 | O resultado conta tentativas por fase, mas o indicador SMART usa meta por atividade. O pentagrama web usa acerto e o app usa domínio. Os números ainda exigem alinhamento sem reclassificar silenciosamente dados históricos. |
| MOD-HIS-006 e MOD-CON-002 | A recuperação de agregados está implementada, mas `Math.max` não soma ganhos independentes de vários aparelhos. Fila, recompensa e pontos ainda não têm uma unidade transacional de ponta a ponta. |

## Pendências que impedem declarar conformidade integral

1. Configurar e homologar o Resend. O corpo público de recuperação é uniforme, mas o tempo pode diferir porque o pedido de conta existente chama o provedor. Testar entrega real e avaliar envio assíncrono durável para reduzir esse sinal. A atualização protegida do e-mail após a ativação ainda precisa de um fluxo com verificação do titular.
2. Armazenar a credencial do aluno no armazenamento seguro do aparelho. O isolamento local separa alunos, mas o token ainda usa o armazenamento atual do app. Verificar a migração de sessões e o comportamento sem rede em aparelho real.
3. Tornar recompensas, compras e fila consistentes em interrupções e sincronização concorrente. Restaurar histórico detalhado. Revisar a validade dos dados enviados quando uma atividade muda depois da execução offline.
4. Cobrir concorrência na administração de papéis e PIN e condições de autorização alteradas durante uma transação. Acrescentar cobertura de auditoria por operação. O PostgreSQL local verificou o rollback da revogação de credencial.
5. Homologar formulários e filtros no navegador e validar recortes e páginas com volume representativo. Faltam prazos, encerramento e andamento em atividades, o ciclo de avaliação e feedback e os avisos de aluno. As fichas da matriz registram as demais lacunas.
6. Completar a nomenclatura legada de identificadores, diretórios e contratos internos. Mantêm-se nomes técnicos exigidos pelas ferramentas e rotas públicas consumidas pelas aplicações. As tabelas de domínio estão no singular.
7. Realizar testes com a escola, medições de acessibilidade e desempenho, homologação em aparelho e verificação da implantação HTTPS, dos acessos ao banco e da documentação institucional de privacidade.

O resultado atende parcialmente os PRDs. A evidência local confirma as correções testadas e os artefatos de build. Os critérios da matriz que dependem de ambiente real, decisão de produto ou verificação individual continuam abertos.
