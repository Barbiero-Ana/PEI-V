# PRD do requisito MOD-ADM-006

**Data registrada no PRD de origem:** 2026-11-10. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

O administrador deve poder ativar e desativar usuários, preservando o histórico.

Origem: [PRD-02 — Administração de usuários](../../02-modulos/PRD-02%20%E2%80%94%20Administra%C3%A7%C3%A3o%20de%20usu%C3%A1rios.md), seção 5. Prioridade **E**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-ADM-04 Como **administrador**, quero desativar quem saiu da escola sem perder o histórico, para manter os registros pedagógicos.

- **HU-ADM-04** CA-01: Dado um usuário ativo, quando o administrador pede para desativar, então o sistema pede confirmação antes (MOD-USA-011).
- **HU-ADM-04** CA-02: Depois de desativado, o usuário não consegue entrar, e suas jogadas e avaliações continuam visíveis para quem tem permissão (RN-16).
- **HU-ADM-04** CA-03: Dado um usuário inativo, quando o administrador o reativa, então ele volta a entrar com o mesmo histórico.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/api/src/admin.ts](../../../apps/api/src/admin.ts)
- [apps/web/app/admin/usuarios](../../../apps/web/app/admin/usuarios)
- [apps/web/app/admin/registros](../../../apps/web/app/admin/registros)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
