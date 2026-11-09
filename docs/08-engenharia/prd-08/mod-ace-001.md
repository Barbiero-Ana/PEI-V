# MOD-ACE-001

O aluno pode escolher o tamanho do texto: normal, grande ou muito grande.

Origem: [PRD-08 — Acessibilidade](../../02-modulos/PRD-08%20%E2%80%94%20Acessibilidade.md), seção 5. Prioridade **E**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-ACE-01 Como **aluno com baixa visão**, quero aumentar o texto e usar alto contraste sem perder a tela em que estou.

- **HU-ACE-01** CA-01: Há três tamanhos de texto (Normal, Grande e Muito grande, que equivale a 130%), e a escolha vale para todo o app.
- **HU-ACE-01** CA-02: Dado o alto contraste ligado no meio de uma tela, então as cores mudam na hora e o aluno continua na mesma tela (ADR 0005).
- **HU-ACE-01** CA-03: Nenhum texto fica cortado com o tamanho em 130% (MOD-USA-016; a medir em todas as telas).

Consulte as regras transversais no PRD-17.

## Implementação e evidência

- [apps/mobile/src/app/acessibilidade.tsx](../../../apps/mobile/src/app/acessibilidade.tsx)
- [apps/mobile/src/estado/acessibilidade.tsx](../../../apps/mobile/src/estado/acessibilidade.tsx)
- [apps/mobile/src/lib/acessibilidadeSalva.ts](../../../apps/mobile/src/lib/acessibilidadeSalva.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
