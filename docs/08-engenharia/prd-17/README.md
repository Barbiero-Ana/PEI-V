# PRD-17 — Qualidade, segurança e restrições

Requisitos transversais de segurança, qualidade, desempenho, interfaces e portabilidade.

[PRD de origem](../../02-modulos/PRD-17%20%E2%80%94%20Qualidade%2C%20seguran%C3%A7a%20e%20restri%C3%A7%C3%B5es.md) · [Matriz de rastreabilidade](../matriz.md) · [Qualidade e permissões](../prd-17/README.md)

## Perfis e necessidades

| Perfil | Necessidade | Solução |
| --- | --- | --- |
| Aluno | App rápido, que não perde progresso | Metas de desempenho e uso sem conexão |
| Professor | Painel rápido e fácil de entender | Metas de desempenho e [[Diretrizes de usabilidade do painel]] |
| Escola e família | Dados protegidos | Coleta mínima, permissões no servidor, HTTPS |
| Equipe | Código fácil de manter | Núcleo compartilhado, tipagem estrita, controle de versão |

## Implementação

- [apps/api/src/infra.ts](../../../apps/api/src/infra.ts)
- [apps/api/prisma/schema.prisma](../../../apps/api/prisma/schema.prisma)
- [apps/api/scripts/verificar-banco.ts](../../../apps/api/scripts/verificar-banco.ts)
- [apps/web/middleware.ts](../../../apps/web/middleware.ts)
- [apps/mobile/src/estado/isolamento.ts](../../../apps/mobile/src/estado/isolamento.ts)
- [packages/core](../../../packages/core)

**Persistência** Todas as entidades e dados locais.

## Regras de negócio

Sem regras numeradas próprias no PRD. Consulte a seção 5 da origem.

## Testes e limites

Suítes do núcleo, API e app e verificação em PostgreSQL. Medições, validação institucional e ambiente real pendentes.

## Dependências

Veja o PRD de origem.

## Requisitos

- [MOD-ADF-001](mod-adf-001.md) O cálculo de pontos, estrelas, constelações e domínio produz o mesmo resultado no aplicativo e na plataforma web.
- [MOD-ADF-002](mod-adf-002.md) Cada missão indica o conteúdo de Matemática trabalhado, alinhado à BNCC.
- [MOD-ADF-003](mod-adf-003.md) Os mapas apresentam complexidade crescente, do reconhecimento de quantidades até funções, probabilidade, média e ordem das operações.
- [MOD-ADF-004](mod-adf-004.md) Cada mapa contém pelo menos dois formatos de atividade diferentes.
- [MOD-DES-001](mod-des-001.md) App: tela inicial em até 3 segundos após a abertura, em aparelho intermediário.
- [MOD-DES-002](mod-des-002.md) Retorno visual a toques e arrastes em até 100 milissegundos.
- [MOD-DES-003](mod-des-003.md) Animações e jogos a no mínimo 30 quadros por segundo.
- [MOD-DES-004](mod-des-004.md) Consultas da plataforma web respondem em até 2 segundos em condições normais.
- [MOD-DES-005](mod-des-005.md) O painel do professor carrega em até 3 segundos para uma turma de até 40 alunos.
- [MOD-DES-006](mod-des-006.md) O relatório em PDF é gerado em até 5 segundos.
- [MOD-DES-007](mod-des-007.md) Listas com mais de 20 registros são paginadas.
- [MOD-CMP-001](mod-cmp-001.md) App: funciona nas versões de Android suportadas pelo Expo SDK adotado (iOS, se a versão para iPhone for contratada).
- [MOD-CMP-002](mod-cmp-002.md) Web: funciona nas duas versões mais recentes de Chrome, Edge, Firefox e Safari.
- [MOD-CMP-003](mod-cmp-003.md) App e web trocam dados por uma interface única de serviços.
- [MOD-USA-001](mod-usa-001.md) Textos para o aluno usam linguagem simples, sem termos técnicos.
- [MOD-USA-002](mod-usa-002.md) Um aluno sem experiência prévia conclui a primeira missão sem ajuda de um adulto.
- [MOD-USA-003](mod-usa-003.md) Qualquer missão pode ser iniciada em no máximo 2 toques a partir da tela inicial.
- [MOD-USA-004](mod-usa-004.md) Uma atividade pode ser criada e publicada pelo professor em até 5 passos.
- [MOD-USA-005](mod-usa-005.md) Os botões de ação dos jogos ficam fixos no rodapé, na mesma posição em todas as missões.
- [MOD-USA-006](mod-usa-006.md) Ao soltar um objeto arrastado, o destino é reconhecido pelo centro do objeto, com tolerância mínima de 18 pontos.
- [MOD-USA-007](mod-usa-007.md) Erros não retiram pontos já obtidos, e o retorno de erro tem tom encorajador.
- [MOD-USA-008](mod-usa-008.md) Toda operação exibe retorno de carregamento, sucesso, aviso ou erro.
- [MOD-USA-009](mod-usa-009.md) Listas vazias exibem uma mensagem que orienta o usuário.
- [MOD-USA-010](mod-usa-010.md) Formulários validam os campos obrigatórios antes de salvar, com mensagem junto ao campo.
- [MOD-USA-011](mod-usa-011.md) Operações críticas, como desativar usuário ou apagar progresso, pedem confirmação.
- [MOD-USA-012](mod-usa-012.md) Animações de interface duram no máximo 1,5 segundo, exceto as de comemoração.
- [MOD-USA-013](mod-usa-013.md) O texto do aplicativo usa contraste mínimo de 4,5:1 no modo de alto contraste.
- [MOD-USA-014](mod-usa-014.md) Elementos tocáveis têm área mínima de 44 × 44 pontos.
- [MOD-USA-015](mod-usa-015.md) Estados como certo, errado, bloqueado e concluído não são indicados apenas por cor.
- [MOD-USA-016](mod-usa-016.md) O layout não corta textos com o tamanho de texto em 130%.
- [MOD-USA-017](mod-usa-017.md) Os enunciados das fases têm tamanho mínimo de 19 pontos no tamanho de texto normal.
- [MOD-USA-018](mod-usa-018.md) As interfaces seguem as dez heurísticas de Nielsen e as leis de Hick e de Fitts, conforme as [[Diretrizes de usabilidade do painel]].
- [MOD-CON-001](mod-con-001.md) Falhas de comunicação não fecham o aplicativo nem causam perda de progresso.
- [MOD-CON-002](mod-con-002.md) O registro do resultado e a atualização dos pontos ocorrem de forma atômica.
- [MOD-CON-003](mod-con-003.md) Um mesmo resultado não é registrado mais de uma vez no servidor.
- [MOD-CON-004](mod-con-004.md) Dados salvos por versões anteriores do aplicativo continuam legíveis após atualizações.
- [MOD-CON-005](mod-con-005.md) Web: disponibilidade mínima de 99% no horário escolar.
- [MOD-SEG-001](mod-seg-001.md) Senhas armazenadas com função de hash adaptativa, nunca em texto simples.
- [MOD-SEG-002](mod-seg-002.md) Sessões usam tokens com expiração, guardados em área segura do dispositivo.
- [MOD-SEG-003](mod-seg-003.md) Toda operação restrita tem a permissão verificada no servidor.
- [MOD-SEG-004](mod-seg-004.md) Cada perfil acessa somente os dados e funções necessários à sua atividade.
- [MOD-SEG-005](mod-seg-005.md) Toda comunicação em produção usa HTTPS.
- [MOD-SEG-006](mod-seg-006.md) Os dados recebidos são validados no servidor antes de serem gravados.
- [MOD-SEG-007](mod-seg-007.md) O aluno visualiza somente as próprias avaliações e dados.
- [MOD-SEG-008](mod-seg-008.md) O tratamento de dados de menores tem consentimento dos responsáveis ou base legal firmada com a escola, conforme a LGPD.
- [MOD-SEG-009](mod-seg-009.md) O aplicativo do aluno coleta somente nome, turma, avatar e dados de jogo.
- [MOD-SEG-010](mod-seg-010.md) O aplicativo não exibe publicidade nem compartilha dados com terceiros para fins comerciais.
- [MOD-SEG-011](mod-seg-011.md) A escola pode exportar e excluir os dados de um aluno a pedido do responsável.
- [MOD-SEG-012](mod-seg-012.md) Ações sensíveis (entradas, permissões, desativações, vínculos, acesso dos alunos) ficam num registro que o usuário da API não consegue alterar nem apagar.
- [MOD-MAN-001](mod-man-001.md) As regras de negócio ficam em um núcleo compartilhado, separado das interfaces.
- [MOD-MAN-002](mod-man-002.md) Novas missões são incluídas como dados no catálogo, sem alteração das telas existentes.
- [MOD-MAN-003](mod-man-003.md) O código segue tipagem estática estrita e padrões automáticos de formatação e análise estática.
- [MOD-MAN-004](mod-man-004.md) Componentes de interface com o mesmo comportamento são reutilizados.
- [MOD-MAN-005](mod-man-005.md) O código é mantido em sistema de controle de versão.
- [MOD-MAN-006](mod-man-006.md) Credenciais e endereços são definidos por ambiente, fora do código-fonte.
- [MOD-POR-001](mod-por-001.md) App: gerado a partir de um único código-fonte, pronto para Android e, se contratado, iOS.
- [MOD-POR-002](mod-por-002.md) App: se adapta a telas de 4,7 a 13 polegadas.
- [MOD-POR-003](mod-por-003.md) Web: se adapta a larguras a partir de 768 pixels (e funciona no celular).
- [MOD-POR-004](mod-por-004.md) App: pode ser instalado para validação sem depender das lojas oficiais.
- [MOD-IH-001](mod-ih-001.md) O app usa a tela sensível ao toque para tocar, arrastar, girar e aproximar com dois dedos.
- [MOD-IH-002](mod-ih-002.md) O app usa a vibração e a saída de áudio do aparelho quando essas opções estão ligadas.
- [MOD-IS-001](mod-is-001.md) O sistema usa um serviço de back-end com autenticação, banco de dados relacional e controle de acesso por registro.
- [MOD-IS-002](mod-is-002.md) O app usa a síntese de voz do sistema operacional, em português do Brasil.
- [MOD-IS-003](mod-is-003.md) O app usa os recursos do sistema operacional para gerar e compartilhar arquivos PDF.
- [MOD-IC-001](mod-ic-001.md) A comunicação entre app, plataforma web e servidor usa HTTPS com TLS 1.2 ou superior.
- [MOD-RES-001](mod-res-001.md) O aplicativo do aluno é desenvolvido em React Native, com Expo e TypeScript.
- [MOD-RES-002](mod-res-002.md) A plataforma web é desenvolvida em Next.js, com TypeScript.
- [MOD-RES-003](mod-res-003.md) A interface segue a identidade visual do Modolume: Poppins nos títulos, Inter no texto e Lexend como opção de leitura facilitada; sem gradientes e sem emojis.
- [MOD-RES-004](mod-res-004.md) O conteúdo pedagógico se limita à Matemática do Ensino Fundamental.
- [MOD-RES-005](mod-res-005.md) A publicação depende da conta de desenvolvedor na Google Play; a App Store só entra se a versão para iPhone for contratada.
- [MOD-RES-006](mod-res-006.md) Os dados pessoais são tratados conforme a LGPD e o Estatuto da Criança e do Adolescente.
