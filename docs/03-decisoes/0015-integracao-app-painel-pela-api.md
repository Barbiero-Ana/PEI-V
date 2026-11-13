# ADR 0015 — Integração do app com o painel pela API

- **Status:** Aceita (o acesso do aluno foi substituído pelo [[0017-acesso-individual-do-aluno|ADR 0017]])
- **Data:** 04/11/2026
- **Decisores originais:** não identificados no registro histórico.
- **Uso de IA:** auxílio na escrita da API, das telas e dos testes de ponta a ponta. A escolha de NestJS com PostgreSQL
  (ADR 0007) e o pedido de separar as atividades do professor das missões dos mapas são da equipe.

## Contexto

O app guardava tudo no aparelho e o painel usava dados de demonstração: um não sabia do outro. A equipe pediu que eles
conversassem nos dois sentidos — o que o professor monta no painel chega ao app, e o que o aluno faz no app (jogadas e
avatar) chega ao painel — e que as atividades do professor ficassem numa aba separada, deixando as missões dos mapas
como as atividades padrão de mapeamento da aprendizagem.

## Decisão

- **API em `apps/api`** com NestJS, Prisma e PostgreSQL (ADR 0007). Ela roda com `tsx`, para importar o
  `packages/core` direto do código-fonte (as mesmas validações e tipos do app e do painel). Como o `tsx` não gera os
  metadados de tipo dos decoradores, as dependências são injetadas com `@Inject(Classe)`.
- **Acesso:** professor entra com e-mail e senha (bcrypt, token de 8 horas); aluno entra com o código da turma e o
  próprio nome (token de 180 dias). Toda rota confere o papel e o vínculo no servidor.
- **Jogadas:** cada missão ou atividade concluída vira uma jogada com id gerado no aparelho. O app guarda numa fila e
  envia quando há internet; o servidor ignora ids repetidos (sem duplicar). A jogada indica a origem: `mapa`
  (mapeamento) ou `professor` (atividade enviada).
- **Avatar:** o app envia o rosto montado e o SVG gerado (o mesmo do relatório da família). O painel mostra o SVG; o
  servidor recusa SVG com script.
- **Atividades do professor:** o contrato (formatos, validação e exemplos) foi para o núcleo
  (`atividades-professor.ts`). O app mostra as atividades enviadas e já liberadas na aba **Professor**, separada dos
  mapas, e as executa por toque nos quatro formatos; as atividades prontas abrem o jogo do app.
- **Painel:** lê `GET /professor/dados` e converte as jogadas no formato do núcleo (missão → atividade, missão jogada
  pela turma num dia → aplicação, jogada → resultado). Os indicadores e as metas SMART continuam calculados pelo
  núcleo. Sem `API_URL`, o painel volta aos dados de demonstração.
- **Banco no desenvolvimento:** PostgreSQL embutido (`pnpm --filter @modolume/api banco:local`), porque o endereço
  interno do Railway (`postgres.railway.internal`) só existe dentro do Railway. Publicado, a API usa a `DATABASE_URL`
  do Railway.

## Alternativas consideradas

- **API dentro do Next (rotas `/api`):** mais rápida de montar, mas contraria o ADR 0008 e misturaria o painel com o
  servidor do app.
- **Compilar a API com `tsc` e duplicar os tipos:** o padrão do NestJS, mas exigiria copiar as regras do núcleo para a
  API, com risco de divergência (ADR 0001).
- **Calcular os indicadores na API:** possível, mas o painel já calcula com o núcleo; a API ficaria com duas versões
  do mesmo cálculo.

## Consequências

- **Positivas:** o ciclo aluno ↔ professor funciona de ponta a ponta, inclusive sem internet; o avatar do aluno é o
  mesmo no app e no painel; o painel mostra quem já fez cada atividade.
- **Negativas:** os planos de aula continuam em memória no painel; o token do aluno fica no armazenamento comum do
  aparelho (falta a área segura, MOD-SEG-002); o painel ainda usa o acerto médio, e não o domínio, no pentagrama.
- **O que fica pendente:** publicar a API no Railway, guardar os planos no banco, cadastro de turmas e usuários pela
  gestão, renovação do código da turma e data limite das atividades.

## Aprovação da revisão documental

- **Data da revisão e aprovação:** 13/11/2026.
- **Assinatura de aprovação:** Ana Barbiero — Líder de projeto.
- **Registro:** aprovação expressa nesta conversa para organizar e consolidar a documentação.
- **Histórico:** a data original da decisão no cabeçalho foi preservada. Esta assinatura não atribui
  participação retroativa nem reativa decisões substituídas; evidências de homologação continuam separadas.
