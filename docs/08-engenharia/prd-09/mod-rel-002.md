# PRD do requisito MOD-REL-002

**Data registrada no PRD de origem:** 2026-11-05. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

O relatório pode ser exportado em PDF, no formato A4.

Origem: [PRD-09 — Relatório para a família](../../02-modulos/PRD-09%20%E2%80%94%20Relat%C3%B3rio%20para%20a%20fam%C3%ADlia.md), seção 5. Prioridade **I**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-REL-02 Como **aluno**, quero gerar o PDF e mandar para minha família pelo celular.

- **HU-REL-02** CA-01: Dado o botão de compartilhar, quando o aluno toca, então o PDF A4 é gerado e abre a lista de aplicativos do aparelho.
- **HU-REL-02** CA-02: O PDF é gerado em até 5 segundos em aparelho intermediário (MOD-DES-006; a medir).

Consulte as regras transversais no PRD-17.

## Implementação e evidência

- [apps/mobile/src/app/relatorio.tsx](../../../apps/mobile/src/app/relatorio.tsx)
- [apps/mobile/src/lib/relatorioPdf.ts](../../../apps/mobile/src/lib/relatorioPdf.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
