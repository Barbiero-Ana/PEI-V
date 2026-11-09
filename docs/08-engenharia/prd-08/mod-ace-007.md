# MOD-ACE-007

A tela de acessibilidade pode exibir uma pré-visualização do efeito de cada opção.

Origem: [PRD-08 — Acessibilidade](../../02-modulos/PRD-08%20%E2%80%94%20Acessibilidade.md), seção 5. Prioridade **D**, método **D**. Situação declarada na origem **Parcial**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-ACE-06 Como **aluno**, quero ver o efeito de cada opção antes de escolher.

- **HU-ACE-06** CA-01: A leitura em voz tem o botão "Ouvir um exemplo".
- **HU-ACE-06** CA-02: As demais opções (texto, fonte, contraste e animações) mostram uma prévia antes de serem aplicadas.

Consulte as regras transversais no PRD-17.

## Implementação e evidência

- [apps/mobile/src/app/acessibilidade.tsx](../../../apps/mobile/src/app/acessibilidade.tsx)
- [apps/mobile/src/estado/acessibilidade.tsx](../../../apps/mobile/src/estado/acessibilidade.tsx)
- [apps/mobile/src/lib/acessibilidadeSalva.ts](../../../apps/mobile/src/lib/acessibilidadeSalva.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
