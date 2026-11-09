# MOD-HIS-005

As jogadas feitas sem conexão são enviadas ao servidor quando a conexão é restabelecida.

Origem: [PRD-10 — Histórico e sincronização](../../02-modulos/PRD-10%20%E2%80%94%20Hist%C3%B3rico%20e%20sincroniza%C3%A7%C3%A3o.md), seção 5. Prioridade **E**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-HIS-02 Como **professor**, quero que as jogadas feitas sem internet cheguem ao painel, para ter os dados completos.

- **HU-HIS-02** CA-01: Dada uma jogada feita sem conexão, quando a internet volta, então ela é enviada sem ação do aluno.
- **HU-HIS-02** CA-02: Dado o mesmo envio repetido, então o servidor registra a jogada uma única vez (RN-20).
- **HU-HIS-02** CA-03: O registro da jogada e a atualização dos pontos acontecem juntos, ou nenhum dos dois (MOD-CON-002).

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/mobile/src/estado/conta.tsx](../../../apps/mobile/src/estado/conta.tsx)
- [apps/mobile/src/estado/isolamento.ts](../../../apps/mobile/src/estado/isolamento.ts)
- [apps/mobile/src/estado/jogador.tsx](../../../apps/mobile/src/estado/jogador.tsx)
- [apps/api/src/aluno.ts](../../../apps/api/src/aluno.ts)

**Aceite nesta auditoria** Evidência parcial.

Suíte mobile exercita fila e troca de identidade. Queda e reconexão em celular pendentes.
