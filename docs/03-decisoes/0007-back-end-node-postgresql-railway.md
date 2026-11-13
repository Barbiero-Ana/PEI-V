# ADR 0007 — Back-end em Node.js com PostgreSQL no Railway

- **Status:** Aceita (implementada em 04/11/2026; detalhes da integração no ADR 0015) (banco e hospedagem definidos pela equipe; framework da API a confirmar)
- **Data:** 14/10/2026
- **Decisores originais:** não identificados no registro histórico.

## Contexto

O painel do professor precisa de login, turmas, vínculo de alunos e acesso às jogadas. A equipe definiu um banco
PostgreSQL em servidor próprio no Railway. Faltava escolher a tecnologia da API, considerando que o painel é em
React e que as regras já existem em TypeScript no `packages/core`.

## Decisão

API em Node.js com TypeScript, usando NestJS (organização em módulos e controle de acesso por perfil) e Prisma
(acesso ao banco e migrações), hospedada no Railway junto do PostgreSQL. A API importa o `packages/core` para
calcular os indicadores.

## Alternativas consideradas

- **Java com Spring Boot:** robusto, mas exigiria reescrever as regras do núcleo em outra linguagem.
- **Python com FastAPI:** simples, mas com o mesmo problema de duplicar as regras.
- **C# com .NET:** mesmo problema de duplicação.
- **Supabase (back-end pronto):** dispensaria o servidor, mas a equipe optou por servidor próprio.
- **Fastify ou Hono no lugar do NestJS:** mais leves, porém sem a estrutura de módulos que ajuda uma equipe de
  cinco pessoas.

## Consequências

- **Positivas:** reaproveita o núcleo e a validação (Zod); uma única linguagem na equipe; o app, o painel e a API
  compartilham os mesmos tipos.
- **Negativas:** a equipe passa a manter o servidor (deploy, backups, segurança).
- **Pendente:** confirmar o framework da API; definir o esquema do banco, a autenticação (código da turma para o
  aluno, e-mail e senha para o professor) e a sincronização das jogadas feitas sem conexão.

## Aprovação da revisão documental

- **Data da revisão e aprovação:** 13/11/2026.
- **Assinatura de aprovação:** Ana Barbiero — Líder de projeto.
- **Registro:** aprovação expressa nesta conversa para organizar e consolidar a documentação.
- **Histórico:** a data original da decisão no cabeçalho foi preservada. Esta assinatura não atribui
  participação retroativa nem reativa decisões substituídas; evidências de homologação continuam separadas.
