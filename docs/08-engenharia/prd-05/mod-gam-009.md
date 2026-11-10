# MOD-GAM-009

O mascote reage ao contexto (acerto, erro, dica e comemoração) e evolui conforme as estrelas acesas.

Origem: [PRD-05 — Gamificação](../../02-modulos/PRD-05%20%E2%80%94%20Gamifica%C3%A7%C3%A3o.md), seção 5. Prioridade **I**, método **D**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-GAM-07 Como **aluno**, quero que o Lilo reaja ao que faço e cresça comigo, para me sentir acompanhado.

- **HU-GAM-07** CA-01: O Lilo muda de expressão em acerto, erro, dica e comemoração.
- **HU-GAM-07** CA-02: No primeiro acesso, a apresentação mostra o Lilo, o céu e os mapas, com o botão "Pular".

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [packages/core/src/constelacoes.ts](../../../packages/core/src/constelacoes.ts)
- [apps/mobile/src/estado/jogador.tsx](../../../apps/mobile/src/estado/jogador.tsx)
- [apps/mobile/src/app/loja.tsx](../../../apps/mobile/src/app/loja.tsx)
- [apps/api/src/aluno.ts](../../../apps/api/src/aluno.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
