# MOD-GAM-008

O aluno pode trocar luzes por itens do avatar e capas do perfil; itens comprados ficam liberados permanentemente.

Origem: [PRD-05 — Gamificação](../../02-modulos/PRD-05%20%E2%80%94%20Gamifica%C3%A7%C3%A3o.md), seção 5. Prioridade **D**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-GAM-06 Como **aluno**, quero trocar minhas luzes por itens do avatar, para personalizar meu perfil.

- **HU-GAM-06** CA-01: Dado um item comprado, então ele continua liberado mesmo depois de trocar por outro (RN-10).
- **HU-GAM-06** CA-02: Dado saldo insuficiente, então o botão de compra fica indisponível e mostra quanto falta.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [packages/core/src/constelacoes.ts](../../../packages/core/src/constelacoes.ts)
- [apps/mobile/src/estado/jogador.tsx](../../../apps/mobile/src/estado/jogador.tsx)
- [apps/mobile/src/app/loja.tsx](../../../apps/mobile/src/app/loja.tsx)
- [apps/api/src/aluno.ts](../../../apps/api/src/aluno.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
