# Auditoria técnica do Modolume

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
