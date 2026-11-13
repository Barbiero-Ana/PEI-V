# PRD do requisito MOD-ACE-005

**Data registrada no PRD de origem:** 2026-11-04. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

O aluno pode reduzir as animações; o sistema também respeita a redução de movimento configurada no aparelho.

Origem: [PRD-08 — Acessibilidade](../../02-modulos/PRD-08%20%E2%80%94%20Acessibilidade.md), seção 5. Prioridade **E**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-ACE-04 Como **aluno sensível a movimento**, quero menos animações.

- **HU-ACE-04** CA-01: Com a opção ligada, comemorações e transições ficam sem movimento.
- **HU-ACE-04** CA-02: Se o aparelho estiver configurado para reduzir movimento, o app já abre com menos animações.

Consulte as regras transversais no PRD-17.

## Implementação e evidência

- [apps/mobile/src/app/acessibilidade.tsx](../../../apps/mobile/src/app/acessibilidade.tsx)
- [apps/mobile/src/estado/acessibilidade.tsx](../../../apps/mobile/src/estado/acessibilidade.tsx)
- [apps/mobile/src/lib/acessibilidadeSalva.ts](../../../apps/mobile/src/lib/acessibilidadeSalva.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
