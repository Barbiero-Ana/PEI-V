# MOD-MIS-006

O aluno pode pedir uma dica em qualquer fase.

Origem: [PRD-04 — Missões do aluno](../../02-modulos/PRD-04%20%E2%80%94%20Miss%C3%B5es%20do%20aluno.md), seção 5. Prioridade **E**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-MIS-03 Como **aluno**, quero pedir dica e entender meu erro, para não desistir.

- **HU-MIS-03** CA-01: A lâmpada de dica está visível em toda fase; ao tocar, a dica aparece sem tirar pontos.
- **HU-MIS-03** CA-02: Dada uma resposta errada, quando o aluno confere, então vê uma mensagem encorajadora que explica o que conferir e pode tentar de novo.
- **HU-MIS-03** CA-03: O retorno de acerto ou erro aparece em até 100 ms após a conferência (MOD-DES-002; a medir).

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [packages/core/src/missoes.ts](../../../packages/core/src/missoes.ts)
- [apps/mobile/src/componentes/Partida.tsx](../../../apps/mobile/src/componentes/Partida.tsx)
- [apps/api/src/jogada.ts](../../../apps/api/src/jogada.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
