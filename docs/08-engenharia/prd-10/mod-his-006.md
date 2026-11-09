# MOD-HIS-006

Ao entrar em outro aparelho, o aluno recupera seu progresso.

Origem: [PRD-10 — Histórico e sincronização](../../02-modulos/PRD-10%20%E2%80%94%20Hist%C3%B3rico%20e%20sincroniza%C3%A7%C3%A3o.md), seção 5. Prioridade **I**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-HIS-03 Como **aluno**, quero recuperar meu progresso em outro aparelho.

- **HU-HIS-03** CA-01: Dado um aluno que entra em outro aparelho com o código pessoal e o PIN, então vê as mesmas estrelas, constelações e luzes.
- **HU-HIS-03** CA-02: Um aparelho com progresso desatualizado não apaga o que o aluno conquistou em outro (fica o maior valor).

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/mobile/src/estado/conta.tsx](../../../apps/mobile/src/estado/conta.tsx)
- [apps/mobile/src/estado/isolamento.ts](../../../apps/mobile/src/estado/isolamento.ts)
- [apps/mobile/src/estado/jogador.tsx](../../../apps/mobile/src/estado/jogador.tsx)
- [apps/api/src/aluno.ts](../../../apps/api/src/aluno.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
