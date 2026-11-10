# ADR 0017 — Acesso individual do aluno: código pessoal e PIN

- **Status:** Aceita
- **Data:** 05/11/2026
- **Decisores:** a preencher pela equipe
- **Uso de IA:** auxílio na comparação das alternativas, na implementação e nos testes, a partir do pedido da
  equipe de que cada aluno entre na própria conta com um código passado pelo professor ou pela coordenação.

## Contexto

Até aqui (ADR 0015), o aluno digitava o código da turma e tocava no próprio nome numa lista. Era simples, mas
qualquer colega podia tocar no nome de outro e jogar na conta dele, o que estraga os indicadores que o
professor usa (PRD-12) e expõe dados de menores. A lista também mostrava os nomes de toda a turma para quem
tivesse o código.

## Decisão

- **Código pessoal:** cada aluno tem um código de 8 caracteres (mostrado como `ABCD-2345`), de um alfabeto sem
  O, 0, I, 1 e L, que se confundem ao ditar ou imprimir. São cerca de 850 bilhões de combinações. O código fica
  no perfil do aluno no painel, para o professor ou a coordenação repassar.
- **PIN de 4 números:** criado pelo aluno no primeiro acesso (digitando duas vezes) e guardado só como hash
  (bcrypt). PINs fáceis (todos iguais ou em sequência) são recusados.
- **Sem lista de nomes:** o código identifica o aluno; o app só mostra o primeiro nome para ele confirmar
  ("Oi, Caio!").
- **Proteção contra tentativa e erro:** limite de tentativas por minuto nas rotas de entrada e, por aluno,
  bloqueio de 15 minutos depois de 5 PINs errados seguidos.
- **Redefinição pelo professor (só das próprias turmas):** "Zerar PIN" (o aluno esqueceu: cria outro no próximo
  acesso) e "Novo código" (código vazou ou celular perdido: o antigo para de funcionar).
- **Sessões revogáveis:** o token do aluno carrega a versão de acesso; um código novo aumenta a versão e as
  sessões antigas deixam de valer em todos os aparelhos. Aluno desativado também perde a sessão.

## Alternativas consideradas

- **Código da turma + nome + PIN:** mantém a lista de nomes à mostra e um passo a mais para o aluno.
- **Senha de figuras:** amigável, mas exige mais telas e é mais difícil de o professor repassar por escrito.
- **E-mail e senha:** inadequado para alunos de 11 anos, muitos sem e-mail próprio.

## Consequências

- **Positivas:** cada código abre só uma conta; dados do aluno protegidos mesmo se o código vazar; o professor
  resolve "esqueci o PIN" e "perdi o celular" sozinho, no painel.
- **Negativas:** o professor precisa entregar um código por aluno (no começo do ano); o aluno precisa lembrar de
  um PIN. Quem já estava conectado precisa entrar de novo uma vez.
- **Banco:** colunas `codigo_acesso`, `pin_hash`, `pin_falhas`, `bloqueado_ate` e `versao_acesso` na tabela
  `aluno` (migração `20261105120000_acesso_individual_aluno`, só acréscimos). Ver [[Modelo de dados]].
- **Pendente:** impressão dos códigos da turma em cartões; acesso próprio da coordenação ao painel.

Relacionados: [[PRD-01 — Autenticação e controle de acesso]], [[0015-integracao-app-painel-pela-api]].
