# Publicação do app do aluno na Google Play

10/11/2026 · Expo SDK 58 · `br.com.modolume.app`

Os perfis EAS `play-internal` e `production` estão preparados para gerar Android App Bundles
com ambientes separados. A geração e a validação do artefato na Play Console estão pendentes.

## Ordem de trabalho

| Quando | Entrega | Como conferir |
| --- | --- | --- |
| Agora, em paralelo | Confirmar a conta Play Console, acesso ao projeto EAS e titularidade de `br.com.modolume.app`. Preparar ficha, capturas com dados fictícios e lista de testadores. | A equipe responsável consegue criar o cadastro da loja, escolher a faixa de teste e convidar os participantes. |
| Primeiro teste interno | Gerar um AAB de loja apontando para API HTTPS de homologação, com banco isolado e turma fictícia. | Instalar pela Google Play em Android físico. Conferir versão, API alvo, compatibilidade com 16 KB, permissões do manifesto final e jornada professor → aluno → painel. |
| Antes de testar fora da equipe | Preparar política de privacidade, declaração de dados e conta escolar fictícia para revisão. Se a conta exigir teste fechado, iniciar a contagem assim que a versão estiver disponível aos testadores e as informações exigidas estiverem preenchidas. | Verificar o checklist da Play Console e guardar os resultados dos testes e as correções feitas durante a faixa fechada. |
| Antes de usar dados reais | Homologar a sessão protegida, definir o tratamento e o atendimento de pedidos com a escola e testar migração e restauração do banco. Fechar a consolidação de progresso em dois aparelhos para a operação escolar. | Atualizar a partir de uma instalação anterior, trocar de aluno, jogar offline em dois aparelhos e ensaiar exportação, exclusão e restauração em homologação. |

Para um app disponível exclusivamente na faixa interna, o Google dispensa o formulário de Segurança dos dados.
O teste fechado segue as exigências próprias da Play Console. [Faixas de teste](https://support.google.com/googleplay/android-developer/answer/9845334) ·
[Requisitos do teste fechado](https://support.google.com/googleplay/android-developer/answer/14151465).

## 1. Homologação técnica

- [ ] Disponibilizar API e painel em HTTPS. Aplicar as migrações em uma base de homologação isolada com
  dados fictícios. Verificar logs, alertas de falha, backup e restauração.
- [ ] Executar o [roteiro móvel](plano-correcao-mobile.md) em Android físico e em iOS para a entrega iOS.
  No Android, repetir o percurso na versão assinada instalada pela faixa de testes da loja.
- [ ] Validar no aparelho a migração para SecureStore, o logout e a troca de aluno.
- [ ] Concluir a consolidação de pontos, tentativas e compras entre aparelhos.
- [ ] Preparar uma conta escolar fictícia para revisão com código, PIN criado e atividade liberada.
  Fornecer as instruções na seção **Acesso ao app** da Play Console. A demonstração local cobre as missões
  sem turma. [Acesso para revisão](https://support.google.com/googleplay/android-developer/answer/9859455).

## 2. Build Android

1. Confirmar acesso ao projeto Modolume no Expo e à conta de desenvolvedor verificada na Play Console.
2. Configurar `EXPO_PUBLIC_API_URL` nos ambientes do EAS. `preview` deve apontar para a API HTTPS de
   homologação e `production` deve apontar para a API HTTPS de produção. O endereço é público.
   As chaves de serviço, credenciais do banco e o segredo JWT ficam na API.
   O hook `eas-build-pre-install` rejeita URL ausente, `auto`, HTTP e endereços de desenvolvimento evidentes
   nos dois perfis de loja. Confirmar a conectividade real da API em uma rede externa.
3. Usar um `android.versionCode` em `apps/mobile/app.json` superior ao de qualquer artefato já enviado
   para o pacote, incluindo a faixa de testes. O versionamento do EAS neste projeto usa a configuração local.
4. Na raiz do repositório, executar para o primeiro teste interno:

   ```powershell
   Set-Location apps/mobile
   npx eas-cli@latest whoami
   npx eas-cli@latest build --platform android --profile play-internal
   ```

5. Usar a chave de upload do projeto e baixar o `.aab` do EAS. Enviar na faixa de teste interno com
   Play App Signing. Conferir Android 16 (API 36) ou superior como alvo e validar as bibliotecas nativas
   em dispositivo com páginas de memória de 16 KB. Revisar o relatório de pré-lançamento e o manifesto
   mesclado do artefato. A pasta Android gerada na máquina local fica fora do Git.
   [Envio manual](https://docs.expo.dev/submit/android-manual/) ·
   [API alvo](https://support.google.com/googleplay/android-developer/answer/11926878) ·
   [Páginas de memória](https://developer.android.com/guide/practices/page-sizes).
6. Após o aceite, incrementar o `versionCode` e gerar o AAB com
   `npx eas-cli@latest build --platform android --profile production`. Validar a conexão e o login da versão
   de produção com dados fictícios antes de liberar a versão pública.
   [Perfis de build do EAS](https://docs.expo.dev/eas/json/).

## 3. Dados e ficha da loja

- [ ] Acordar com a escola quais dados entram no piloto, a finalidade, a retenção e o procedimento de
  acesso, exportação e exclusão. Inventariar nome, vínculo com turma, autenticação, avatar e desempenho,
  além de logs e SDKs usados na versão.
- [ ] Publicar a política de privacidade em URL pública e vinculá-la no app e na Play Console.
  Preencher **Segurança dos dados**, classificação indicativa e público-alvo. Conferir a Política para
  Famílias por incluir crianças. [Dados do usuário](https://support.google.com/googleplay/android-developer/answer/10144311) ·
  [Segurança dos dados](https://support.google.com/googleplay/android-developer/answer/10787469) ·
  [Público-alvo](https://support.google.com/googleplay/android-developer/answer/9867159).
- [ ] Preparar nome, descrição, contato de suporte, ícone, imagem de destaque e capturas com dados fictícios.
- [ ] Para conta pessoal criada após 13/11/2023, executar teste fechado com pelo menos 12 pessoas inscritas
  durante 14 dias consecutivos. Depois, solicitar acesso à produção e enviar a versão para revisão.
  [Requisitos do teste fechado](https://support.google.com/googleplay/android-developer/answer/14151465).

### Inventário inicial para privacidade e Segurança dos dados

| Dado | Fluxo observado no código |
| --- | --- |
| Nome, matrícula e turma | O painel mantém o cadastro escolar no PostgreSQL. A API entrega ao aluno informações de perfil e turma associadas à sua sessão. |
| Código, PIN e sessão | O servidor mantém o código e o hash do PIN. O app guarda a sessão no cofre nativo e limpa as cópias locais legadas. |
| Avatar, atividade e desempenho | O app mantém uma cópia local. Na conta escolar, envia avatar, acertos, tentativas, tempo, progresso e demais resultados à API. O painel mostra os dados conforme os vínculos da equipe. |
| Demonstração e PDF | O visitante guarda o progresso no aparelho. O relatório pode ser gerado localmente e compartilhado pelo aluno pelo menu do sistema. |

Validar este inventário contra o AAB efetivamente distribuído e a infraestrutura usada, inclusive SDKs,
permissões, logs e backups. Antes de publicar a política, a equipe e a escola precisam confirmar o responsável
pelo tratamento, o contato de privacidade, os prazos de retenção e o procedimento para pedidos. A avaliação
do tratamento deve considerar o melhor interesse de crianças e adolescentes.
[Orientação da ANPD](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-divulga-enunciado-sobre-o-tratamento-de-dados-pessoais-de-criancas-e-adolescentes).

O [PRD-17](prd-17/mod-seg-011.md) registra exportação e exclusão como pendentes. A relação de jogadas
restringe a exclusão direta do aluno. A implementação precisa decidir, conforme a política definida,
quais registros associados são excluídos ou anonimizados, como o histórico de auditoria é tratado e
como a medida alcança as cópias de segurança.

### Material que já pode ser preparado

- **Descrição curta sugerida:** Missões de matemática, desafios e atividades da escola com o Lilo.
- **Capturas sugeridas:** início com demonstração, mapa de missões, uma questão com feedback e aba de atividades.
  Usar perfis fictícios e ocultar códigos de acesso.
- **Acesso para revisão:** abrir o app, inserir o código fictício e o PIN já cadastrado, tocar em
  **Professor** e abrir a atividade indicada. Disponibilizar essas credenciais na Play Console.

## Integrações adiadas

- O Resend aguarda a verificação do domínio para homologar a entrega de ativação e recuperação da equipe.
- O login Google exige definir o público antes de criar contas independentes. Nessa integração, a API
  verificaria a identidade Google e faria o vínculo com a conta autorizada. A demonstração atual é local.
