# MOD-TUR-009

O professor visualiza somente as turmas às quais está vinculado.

Origem: [PRD-03 — Gestão de turmas](../../02-modulos/PRD-03%20%E2%80%94%20Gest%C3%A3o%20de%20turmas.md), seção 5. Prioridade **E**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-TUR-03 Como **professor**, quero ver só as minhas turmas, para não me perder em dados de outras.

- **HU-TUR-03** CA-01: Dado um professor logado, quando ele abre Turmas, então vê apenas as turmas em que é responsável.
- **HU-TUR-03** CA-02: Dado o endereço de uma turma de outro professor, quando aberto, então o painel mostra "página não encontrada".
- **HU-TUR-03** CA-03: Os indicadores da Visão geral, de Desempenho e de Habilidades consideram apenas as turmas do professor.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/api/src/admin.ts](../../../apps/api/src/admin.ts)
- [apps/api/src/coordenacao.ts](../../../apps/api/src/coordenacao.ts)
- [apps/api/src/professor.ts](../../../apps/api/src/professor.ts)
- [apps/web/app/admin/turmas](../../../apps/web/app/admin/turmas)
- [apps/web/app/coordenacao/vinculos](../../../apps/web/app/coordenacao/vinculos)

**Aceite nesta auditoria** Evidência parcial.

leitura-professor.test.ts verifica recorte ao perder vínculo e quando turma encerra.
