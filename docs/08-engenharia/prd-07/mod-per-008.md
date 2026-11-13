# PRD do requisito MOD-PER-008

**Data registrada no PRD de origem:** 2026-11-05. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

O professor pode alterar a própria senha. O aluno não tem senha: o PIN é zerado pelo professor (MOD-AUT-009).

Origem: [PRD-07 — Perfil e personalização](../../02-modulos/PRD-07%20%E2%80%94%20Perfil%20e%20personaliza%C3%A7%C3%A3o.md), seção 5. Prioridade **I**, método **T**. Situação declarada na origem **Pendente**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-PER-05 Como **professor**, quero ver meus dados e trocar minha senha.

- **HU-PER-05** CA-01: Dado um professor logado, quando abre "Meus dados", então vê nome, e-mail e perfil de acesso.
- **HU-PER-05** CA-02: Dada a troca de senha, o sistema pede a senha atual e confirma a nova.

Consulte as regras transversais no PRD-17.

## Implementação e evidência

- [apps/mobile/src/app/(abas)/perfil.tsx](../../../apps/mobile/src/app/(abas)/perfil.tsx)
- [apps/mobile/src/estado/jogador.tsx](../../../apps/mobile/src/estado/jogador.tsx)
- [apps/web/app/conta/senha](../../../apps/web/app/conta/senha)
- [apps/api/src/acesso.ts](../../../apps/api/src/acesso.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
