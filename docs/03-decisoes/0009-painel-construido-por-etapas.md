# ADR 0009 — Painel do professor construído por etapas

- **Status:** Aceita
- **Data:** 27/10/2026
- **Decisores originais:** não identificados no registro histórico.
- **Uso de IA:** ver a seção [Papel da equipe e da IA](#papel-da-equipe-e-da-ia).

## Contexto

O painel do professor precisa de muitas partes: login, turmas, pontuações e dificuldades dos alunos, gráficos de
desempenho, pentagrama de habilidades e insights. Construir tudo de uma vez aumentaria o risco de quebrar o que
já funciona, como o app do aluno e as rotas web existentes.

## Decisão

Construir o painel em etapas pequenas, cada uma funcionando sozinha e validada pela equipe antes da próxima:

1. **Acesso:** login do professor, sessão, páginas protegidas, estrutura do painel e visão geral.
2. **Turmas e alunos:** lista de turmas, alunos de cada turma, pontuações e dificuldades.
3. **Desempenho:** gráficos de desempenho por formato e evolução no tempo.
4. **Pentagrama e insights:** pentagrama de habilidades por aluno e por turma, com insights para o professor.
5. **Integração real:** troca dos dados de demonstração pela API (login real e jogadas vindas do app).

Até a etapa 5, o painel usa os dados de demonstração do núcleo (`MockDataProvider`) por trás da mesma interface
(`DataProvider`) que a API vai atender. Assim, a troca não muda as telas.

As rotas do painel ficam em `/professor`, separadas das rotas do aluno, que não são alteradas.

Regras de interface: limpa e objetiva, sem emojis, sem gradientes e com uso mínimo de efeitos ao passar o mouse.

## Papel da equipe e da IA

A equipe especificou o painel antes de qualquer código ser escrito. A especificação repassada à IA definiu:

- **Público e objetivo:** o painel é do professor e deve mostrar como cada aluno aprende, para apoiar o
  planejamento de aulas e avaliações.
- **Integração:** o painel deve ser integrado ao app do aluno e acessar os dados das jogadas.
- **Conteúdo obrigatório:** login e controle de acesso do professor; pontuações dos alunos; dificuldades;
  gráficos de desempenho; pentagrama de habilidades; insights para o professor.
- **Diretrizes de interface:** intuitiva, objetiva e limpa; sem emojis; sem gradientes; sem uso excessivo de
  efeitos ao passar o mouse; seguindo a identidade visual do Modolume.
- **Tecnologia:** Next.js com TypeScript ([ADR 0008](0008-painel-do-professor-em-nextjs.md)), consumindo a API
  própria com PostgreSQL ([ADR 0007](0007-back-end-node-postgresql-railway.md)).
- **Forma de trabalho:** construção por partes, sem quebrar o sistema existente, com validação da equipe ao fim
  de cada etapa.

Com essa especificação, a IA atuou como **direcionamento e auxílio na escrita do código**: propôs a divisão das
etapas e a estrutura de pastas, implementou o código de cada etapa e o testou no navegador. A equipe:

- definiu as necessidades e as regras acima;
- revisa e valida cada etapa antes de autorizar a próxima;
- decide qualquer mudança de escopo ou de prioridade.

A IA não decidiu requisitos, não escolheu tecnologias por conta própria e não aprova entregas.

## Consequências

- **Positivas:** cada etapa pode ser testada e validada isoladamente; o que já funciona não é afetado; a
  integração com a API acontece num ponto só.
- **Negativas:** até a etapa 5 os dados são de demonstração e o login é provisório.

## Aprovação da revisão documental

- **Data da revisão e aprovação:** 13/11/2026.
- **Assinatura de aprovação:** Ana Barbiero — Líder de projeto.
- **Registro:** aprovação expressa nesta conversa para organizar e consolidar a documentação.
- **Histórico:** a data original da decisão no cabeçalho foi preservada. Esta assinatura não atribui
  participação retroativa nem reativa decisões substituídas; evidências de homologação continuam separadas.
