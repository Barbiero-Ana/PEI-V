# PRD-07 — Perfil e personalização

Aluno configura avatar e preferências no app. A equipe consulta a conta e altera a própria senha pela web.

[PRD de origem](../../02-modulos/PRD-07%20%E2%80%94%20Perfil%20e%20personaliza%C3%A7%C3%A3o.md) · [Matriz de rastreabilidade](../matriz.md) · [Qualidade e permissões](../prd-17/README.md)

## Perfis e necessidades

| Perfil | Necessidade | Solução |
| --- | --- | --- |
| Aluno | Se reconhecer no app | Avatar montável, capa e nome editáveis |
| Aluno | Ver o que já conquistou | Constelações de todos os mapas no perfil |
| Aluno | Controlar o aparelho | Vibração, apagar progresso com confirmação |
| Usuários da web | Trocar a senha | Alteração de senha (fase 4) |

## Implementação

- [apps/mobile/src/app/(abas)/perfil.tsx](../../../apps/mobile/src/app/(abas)/perfil.tsx)
- [apps/mobile/src/estado/jogador.tsx](../../../apps/mobile/src/estado/jogador.tsx)
- [apps/web/app/conta/senha](../../../apps/web/app/conta/senha)
- [apps/api/src/acesso.ts](../../../apps/api/src/acesso.ts)

**Persistência** aluno, avatar_aluno, compra_loja, professor.

## Regras de negócio

Sem regras numeradas próprias no PRD. Consulte a seção 5 da origem.

## Testes e limites

senha-provisoria.test.ts cobre troca de senha na API. Preferências e avatar exigem testes em aparelho.

## Dependências

[PRD-05](../prd-05/README.md) · [PRD-08](../prd-08/README.md)

## Requisitos

- [MOD-PER-001](mod-per-001.md) O usuário visualiza seus dados principais e seu perfil de acesso.
- [MOD-PER-002](mod-per-002.md) O aluno pode alterar nome e avatar.
- [MOD-PER-003](mod-per-003.md) O aluno pode montar o avatar com rosto, cabelo, cores e acessórios.
- [MOD-PER-004](mod-per-004.md) O aluno pode escolher uma capa animada para o perfil, gratuita ou comprada com luzes.
- [MOD-PER-005](mod-per-005.md) O perfil exibe as constelações de todos os mapas e as estrelas acesas em cada uma.
- [MOD-PER-006](mod-per-006.md) O aluno pode ligar e desligar a vibração.
- [MOD-PER-007](mod-per-007.md) O aluno pode apagar o progresso do aparelho, mediante confirmação.
- [MOD-PER-008](mod-per-008.md) O professor pode alterar a própria senha. O aluno não tem senha: o PIN é zerado pelo professor (MOD-AUT-009).
