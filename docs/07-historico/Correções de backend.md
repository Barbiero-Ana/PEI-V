# Correções de backend

Escopo: os dois últimos commits de correção na branch `feat/backend-guilherme`, inspecionados até `0deda39`. Registro documental: 06/11/2026. Datas/horários abaixo vêm do Git, com fuso `-04:00`. Nenhuma execução de teste, migração ou homologação é presumida a partir da mensagem de commit.

## fba1bd1 — bloquear acesso com senha provisória

- Commit: `fba1bd1a1adcb317ea341df2d726ba654ff991c1`.
- Data Git: 05/11/2026, 13:52:23 (-04:00).
- Mensagem: `fix(api): bloquear acesso com senha provisoria`.

### Problema e mudança

Antes da alteração, a guarda conferia existência, ativação e papel da equipe, mas não verificava `senhaProvisoria`. A exigência de trocar a senha no painel não bastava para impedir chamadas diretas à API.

`apps/api/src/infra.ts` passa a consultar esse campo em cada chamada protegida. Contas provisórias recebem 403, com a mensagem `Troque sua senha provisória para continuar.`. O decorador `PermiteSenhaProvisoria` usa metadados lidos por `Reflector` para declarar exceções.

Em `apps/api/src/acesso.ts`, somente `GET /auth/eu` e `POST /auth/senha` recebem essa exceção. Elas ainda exigem JWT válido, conta ativa e papel correspondente. A troca válida grava o novo hash e limpa o indicador; a próxima chamada com o mesmo token consulta o estado atualizado e pode prosseguir. Esse comportamento não corresponde a uma renovação automática do JWT.

### Testes acrescentados

O commit adiciona o script `test` à API (`tsx --test src/*.test.ts`) e cria `senha-provisoria.test.ts`: bloqueio dos três papéis, exceções, troca com mesmo token, rejeições sem escrita, redefinição posterior, restrição por papel, conta inativa/papel alterado, JWT inválido/expirado e acesso de aluno.

São testes HTTP NestJS com banco simulado; não foram executados na revisão documental. Não verificam a interface, as permissões SQL nem uma troca persistida no PostgreSQL real. A correção vale para rotas que utilizam as guardas correspondentes; não torna todas as rotas públicas sujeitas à senha provisória. Não inclui migração.

## 0deda39 — corrigir ciclo de vida e acesso dos alunos

- Commit: `0deda39f8c91beaf69fd0163d0a553591ae53e13`.
- Data Git: 05/11/2026, 14:59:46 (-04:00).
- Mensagem: `fix(api): corrigir ciclo de vida e acesso dos alunos`.

### Problemas e mudanças

| Antes                                                                | Depois                                                                                                                       |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Transferência alterava a turma sem incrementar a versão de acesso    | `admin.ts` incrementa `versaoAcesso` na mesma atualização, apenas quando a turma muda.                                       |
| Guarda do aluno não comparava turma atual e turma do JWT             | `infra.ts` confere turma, versão, existência e ativação; divergência retorna 401.                                            |
| Guarda não verificava turma encerrada                                | Com turma inativa e demais verificações válidas, retorna 403.                                                                |
| Encerramento só alterava `ativa`                                     | Uma transação Prisma encerra a turma e incrementa a versão de acesso de seus alunos. Reabrir não recupera tokens anteriores. |
| Cadastro/transferência não recusavam destino encerrado nesses pontos | Cadastro em turma encerrada e transferência para turma encerrada retornam 400 antes da gravação.                             |

Editar sem trocar turma preserva a versão. Transferir de turma encerrada para ativa é permitido. Código pessoal e hash de PIN não são alterados pela transferência. O aluno mantém sua identidade; o caminho de transferência não apaga jogadas/progresso. O login já verificava turma ativa antes deste commit: a suíte nova cobre também esse comportamento existente, sem atribuí-lo como implementação nova.

### Arquivos e testes

Alterados: `apps/api/src/admin.ts`, `apps/api/src/infra.ts` e fixtures de `apps/api/src/senha-provisoria.test.ts`. Criado: `apps/api/src/ciclo-aluno.test.ts`.

A nova suíte verifica bloqueio nas seis rotas protegidas do aluno; login na turma atual; edição sem transferência; ida e volta de turma; JWT com turma divergente; encerramento/reabertura; turma inativa com versão atual; efeito restrito à turma encerrada; cadastro/transferência para turma encerrada; destino inexistente/de outra escola; matrícula duplicada; aluno inativo; recusa de cadastro/transferência por professor e coordenação.

O commit não acrescenta migração e utiliza campos existentes. A transação está confirmada no código, mas o fake usa `Promise.all`: os testes não comprovam rollback, concorrência ou atomicidade no PostgreSQL. A comparação de fixtures de histórico/progresso também não substitui homologação persistida. As suítes não foram executadas nesta revisão.

## Evidências e limites do registro

| Tipo            | Evidência disponível                                                                                                                      |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Inspeção        | Diffs Git, implementação atual, scripts e arquivos de testes dos commits acima.                                                           |
| Automatização   | Casos implementados com banco simulado; sem resultado de execução produzido nesta revisão.                                                |
| Manual relatada | Bloqueio por senha provisória; encerramento e reabertura de turma; invalidação de JWT após transferência; novo login na turma de destino. |

Os relatos manuais foram fornecidos como contexto pela equipe e registrados a seu pedido. Não foram acompanhados de data de execução, responsável, base, commit executado ou artefatos. Não são apresentados como testes automatizados, homologação reproduzida nesta etapa ou prova de integração completa frontend/API/PostgreSQL.

## Reproduzir a inspeção

Na raiz do repositório, em PowerShell, sem alterar arquivos ou banco:

```powershell
git branch --show-current
git show --stat fba1bd1
git show --stat 0deda39
git show fba1bd1 -- apps/api/src/infra.ts apps/api/src/acesso.ts apps/api/package.json
git show 0deda39 -- apps/api/src/admin.ts apps/api/src/infra.ts
```

Para comandos de testes e roteiro manual, consulte [Testes e verificações](../06-desenvolvimento/Testes%20e%20verifica%C3%A7%C3%B5es.md). Para preparar o ambiente, consulte [Executar localmente no Windows](../06-desenvolvimento/Executar%20localmente%20no%20Windows.md).
