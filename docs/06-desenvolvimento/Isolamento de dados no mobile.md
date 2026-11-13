# Isolamento de dados no mobile — P0-01

Atualizado em 10/11/2026. Inclui a conclusão local atômica (ADR 0022) e a sessão no cofre nativo (ADR 0023).

O estado do jogador e a sincronização usam a identidade do aluno retornada pela API. O visitante usa um espaço separado. A troca de identidade desmonta os providers e as telas anteriores; não reaproveita progresso, histórico, compras, rosto, capa, cache de atividades ou conclusões entre pessoas.

## Armazenamento

Revisão de 13/11/2026 (ADR 0027): sessão, cache e filas passam pelo adaptador
`apps/mobile/src/estado/ambiente.ts`. A produção em `https://api.modolume.com.br` mantém as chaves
históricas abaixo. Outros servidores recebem um prefixo derivado sem perda do endereço canônico;
o prefixo usa somente caracteres válidos no SecureStore. A enumeração e a limpeza de credenciais
alcançam somente o ambiente atual. Nada é copiado ou apagado da produção ao instalar o APK de homologação.

- `modolume.sessao.v3`, no SecureStore, guarda a sessão e a identificação mínima de aluno e turma.
- `modolume:isolado:v3:aluno:<id codificado>`, no AsyncStorage, reúne o estado do jogador e da conta em um
  envelope. O jogador contém perfil, avatar, progresso, resultados, compras e preferências. A seção da conta
  contém fila, atividades em cache, conclusões e marcadores de sincronização.
- `modolume:isolado:v3:visitante` reúne os dados da demonstração. Eles permanecem separados da conta escolar.
- As chaves por seção `modolume:isolado:v2:...` são lidas por compatibilidade até a seção correspondente
  ser gravada no envelope atual.

Os snapshots incluem a identidade no envelope. Uma identidade divergente, JSON inválido ou falha de leitura
bloqueia a abertura. As escritas de dados são serializadas por identidade. A conclusão grava recompensa e
jogada pendente em uma operação e exibe o resultado após a gravação. A troca aguarda as escritas dos dados.
O logout registra a sessão desconectada no cofre antes dessa espera. Aberturas simultâneas da mesma seção
compartilham a inicialização.

O perfil recuperado no login só inicializa um snapshot novo. Um perfil local já existente permanece no espaço da conta. Na migração de sessão antiga sem avatar confirmado, o app consulta o perfil do servidor antes de enviar o avatar padrão; uma edição local explícita tem precedência sobre essa resposta tardia.

## Migração conservadora

A migração da sessão remove `modolume:sessao:v2` e as cópias da credencial nas chaves de cache atuais e legadas.
Preserva os demais campos e a chave global de jogador `modolume:aluno:v3`.

1. Uma sessão antiga que contém conta, ID e token é migrada para SecureStore, com marcador de limpeza retomável
   após interrupção. A reinstalação exige nova entrada. A identidade da sessão não determina a autoria do
   progresso global legado.
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

O `tsx` e os tipos Node são dependências de desenvolvimento. O SecureStore é uma dependência nativa
compatível com o Expo SDK 58. A validação de instalação e migração deve ser feita também no build nativo.

## Homologação no aplicativo real

Em aparelho/emulador de teste, com alunos fictícios A e B e cópia de segurança dos dados de homologação:

1. Como visitante, jogue e personalize o avatar. Entre em A: não deve receber progresso, compras ou avatar do visitante.
2. Em A, conclua missões/atividades e personalize o perfil. Sem internet, crie pendências e reinicie o app: a mesma conta deve recuperar seus dados locais.
3. Saia, entre em B e confira todos os campos e a aba Professor. Dados/pendências de A não devem aparecer nem ser enviados com B. Volte a A para conferir sua preservação.
4. Retarde respostas da API em ambiente de teste. Alterne a conta durante GET de progresso/atividades e durante POST de jogadas. A resposta antiga não pode modificar o novo perfil, fila ou conclusões. Repita A → B → A.
5. Atualize uma instalação com as chaves antigas. Confira que as cópias do token são removidas e que a fila,
   o progresso identificado e os demais dados são preservados. O aviso de dados globais legados continua
   disponível. Somente as pendências com autoria explícita são copiadas para o aluno correspondente.
6. Retorne à rede e confira no servidor que somente as jogadas do aluno autenticado foram enviadas. O app deve reenviar eventuais IDs não confirmados sem duplicá-los.

O aceite em aparelho deve cobrir AsyncStorage, SecureStore, suspensão, encerramento abrupto, navegação,
latência e persistência na API. A identidade combina o servidor e o ID do aluno. Trocar entre produção e
homologação não exige limpar o armazenamento; as sessões e pendências de cada ambiente permanecem
separadas. Misturas eventualmente enviadas por versões anteriores à revisão de 13/11 exigem apuração própria.
