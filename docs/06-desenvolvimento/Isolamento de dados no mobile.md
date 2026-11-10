# Isolamento de dados no mobile — P0-01

O estado do jogador e a sincronização usam a identidade do aluno retornada pela API. O visitante usa um espaço separado. A troca de identidade desmonta os providers e as telas anteriores; não reaproveita progresso, histórico, compras, rosto, capa, cache de atividades ou conclusões entre pessoas.

## Armazenamento

- `modolume:sessao:v2`: ponteiro da sessão atual (ou `conta: null` após sair).
- `modolume:isolado:v2:aluno:<id codificado>:jogador`: perfil, avatar, progresso, resultados, compras e preferências do aluno.
- `modolume:isolado:v2:aluno:<id codificado>:conta`: fila, atividades em cache, conclusões e marcadores de sincronização.
- `modolume:isolado:v2:visitante:jogador` e `:conta`: uso sem autenticação. Dados do visitante não são enviados depois de entrar numa conta.

Os snapshots incluem a identidade no envelope. Uma identidade divergente, JSON inválido ou falha de leitura bloqueia a abertura em vez de substituir silenciosamente os dados por um estado vazio. Escritas são serializadas por chave e aguardadas antes de persistir uma troca de sessão. Aberturas simultâneas da mesma chave compartilham a inicialização.

O perfil recuperado no login só inicializa um snapshot novo. Um perfil local já existente permanece no espaço da conta. Na migração de sessão antiga sem avatar confirmado, o app consulta o perfil do servidor antes de enviar o avatar padrão; uma edição local explícita tem precedência sobre essa resposta tardia.

## Migração conservadora

As chaves antigas `modolume:aluno:v3` e `modolume:conta:v1` nunca são removidas nem sobrescritas por esta migração.

1. Uma sessão antiga que contém conta, ID e token pode ser migrada para manter a abertura offline. Isso identifica somente a sessão, não a origem do progresso global.
2. A fila antiga é copiada para cada aluno somente quando o próprio item contém o `alunoId` correspondente. A inicialização do snapshot novo é persistida antes de liberar o uso; uma fila já inicializada não é reimportada após receber confirmações.
3. Progresso, histórico, compras, avatar, conclusões e cache antigos são ambíguos: a chave global pode conter dados de várias pessoas. Eles permanecem preservados na origem e não são atribuídos automaticamente nem ao visitante nem ao aluno que estava conectado.
4. O Perfil mostra um aviso sobre os dados antigos preservados. A recuperação desses dados ambíguos exige apuração da origem pela equipe; não há ferramenta de atribuição automática ou recuperação manual nesta entrega.
5. Dados novos de cada identidade e pendências conhecidas continuam disponíveis sem internet. Sair preserva os snapshots e as pendências; um novo login na mesma conta recupera seu espaço local.

Não desinstale o app, limpe os dados ou use ferramentas de reset durante a homologação da migração. Isso removeria o armazenamento do aparelho, inclusive os dados antigos preservados.

## Sincronização e troca de conta

Cada operação captura aluno, token e escopo da sessão. Antes de cada envio e depois de cada resposta, verifica se o escopo ainda está ativo. A troca invalida o escopo imediatamente, inclusive A → B → A. Respostas de progresso/atividades e erros de autenticação antigos não são aplicados à nova conta.

O envio de jogadas filtra `alunoId` antes de montar o lote e usa o token capturado da mesma identidade. Somente IDs efetivamente enviados são confirmados. Nenhuma pendência é descartada por um limite arbitrário de fila. Se a conta mudar durante um POST, sua resposta não limpa filas: os IDs podem ser reenviados no próximo login da mesma conta, conforme a idempotência já existente na API.

Requisições já transmitidas não são desfeitas: podem concluir no servidor com o token original. As seguintes são interrompidas localmente e nenhuma resposta é transferida para outra sessão. Os contratos da API não mudaram.

## Verificações automatizadas

Na raiz:

```powershell
pnpm --filter @modolume/mobile test
pnpm --filter @modolume/mobile test:typecheck
pnpm --filter @modolume/mobile typecheck
pnpm --filter @modolume/mobile lint
```

Os testes usam `node:test`/`tsx` e o mesmo repositório e controladores de escopo utilizados no app, com armazenamento e rede simulados. Cobrem isolamento dos dados, visitante, retomada offline, migração, filas, respostas atrasadas, escrita ordenada e armazenamento inválido. O TypeScript dos testes tem configuração própria para não introduzir tipos Node no código nativo.

O `tsx` e os tipos Node são dependências de desenvolvimento já presentes no lockfile do monorepo; não foi adicionada dependência nativa. Em instalações cuja configuração do pnpm tenta reinstalar antes de cada comando, é possível usar `--config.verify-deps-before-run=false` quando as ferramentas necessárias já estiverem instaladas.

## Homologação no aplicativo real

Em aparelho/emulador de teste, com alunos fictícios A e B e cópia de segurança dos dados de homologação:

1. Como visitante, jogue e personalize o avatar. Entre em A: não deve receber progresso, compras ou avatar do visitante.
2. Em A, conclua missões/atividades e personalize o perfil. Sem internet, crie pendências e reinicie o app: a mesma conta deve recuperar seus dados locais.
3. Saia, entre em B e confira todos os campos e a aba Professor. Dados/pendências de A não devem aparecer nem ser enviados com B. Volte a A para conferir sua preservação.
4. Retarde respostas da API em ambiente de teste. Alterne a conta durante GET de progresso/atividades e durante POST de jogadas. A resposta antiga não pode modificar o novo perfil, fila ou conclusões. Repita A → B → A.
5. Atualize uma instalação com as chaves antigas. Confira que permanecem intactas, que o aviso aparece e que apenas as pendências identificadas são copiadas para o aluno correto. Não considere o progresso global como pertencente à conta anteriormente conectada.
6. Retorne à rede e confira no servidor que somente as jogadas do aluno autenticado foram enviadas. O app deve reenviar eventuais IDs não confirmados sem duplicá-los.

Os testes não substituem validação de AsyncStorage nativo, suspensão/encerramento abrupto, navegação, latência real ou persistência efetiva na API. A identidade continua baseada no ID do aluno; trocar ambientes de API com IDs reutilizados exige limpeza controlada de dados fictícios ou uma futura identificação estável do ambiente. A sessão continua persistida em AsyncStorage, como antes; esta correção não implementa SecureStore. Uma eventual mistura de dados já enviada ao servidor pela versão antiga também exige apuração: não há limpeza automática de dados remotos.
