# MOD-MIS-012

O aluno pode sair de uma missão a qualquer momento, sem gerar registro.

Origem: [PRD-04 — Missões do aluno](../../02-modulos/PRD-04%20%E2%80%94%20Miss%C3%B5es%20do%20aluno.md), seção 5. Prioridade **I**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-MIS-06 Como **aluno**, quero sair de uma missão quando precisar, sem que isso conte contra mim.

- **HU-MIS-06** CA-01: Dado o botão "Sair da missão", quando o aluno sai antes de terminar, então nenhum resultado é registrado e nenhum ponto é perdido.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [packages/core/src/missoes.ts](../../../packages/core/src/missoes.ts)
- [apps/mobile/src/componentes/Partida.tsx](../../../apps/mobile/src/componentes/Partida.tsx)
- [apps/api/src/jogada.ts](../../../apps/api/src/jogada.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
