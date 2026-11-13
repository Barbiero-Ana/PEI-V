# PRD do requisito MOD-PER-003

**Data registrada no PRD de origem:** 2026-11-05. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

O aluno pode montar o avatar com rosto, cabelo, cores e acessórios.

Origem: [PRD-07 — Perfil e personalização](../../02-modulos/PRD-07%20%E2%80%94%20Perfil%20e%20personaliza%C3%A7%C3%A3o.md), seção 5. Prioridade **I**, método **D**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-PER-01 Como **aluno**, quero montar meu avatar e escolher meu nome, para me reconhecer no app.

- **HU-PER-01** CA-01: Dado o editor de avatar, quando o aluno escolhe rosto, cabelo, cores e acessórios, então o avatar novo aparece no Início e no Perfil.
- **HU-PER-01** CA-02: Dado um nome vazio, então o botão de salvar fica indisponível até o nome ser preenchido.

Consulte as regras transversais no PRD-17.

## Implementação e evidência

- [apps/mobile/src/app/(abas)/perfil.tsx](../../../apps/mobile/src/app/%28abas%29/perfil.tsx)
- [apps/mobile/src/estado/jogador.tsx](../../../apps/mobile/src/estado/jogador.tsx)
- [apps/web/app/conta/senha](../../../apps/web/app/conta/senha)
- [apps/api/src/acesso.ts](../../../apps/api/src/acesso.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
