# PRD do requisito MOD-ADM-007

**Data registrada no PRD de origem:** 2026-11-10. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

A lista de usuários deve identificar usuários ativos e inativos por texto.

Origem: [PRD-02 — Administração de usuários](../../02-modulos/PRD-02%20%E2%80%94%20Administra%C3%A7%C3%A3o%20de%20usu%C3%A1rios.md), seção 5. Prioridade **I**, método **N**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-ADM-02 Como **administrador**, quero encontrar um usuário pelo nome, perfil ou situação, para atendê-lo rápido.

- **HU-ADM-02** CA-01: Dado um termo de busca, quando o administrador pesquisa, então a lista mostra só os usuários cujo nome contém o termo, sem diferenciar acentos e maiúsculas.
- **HU-ADM-02** CA-02: Dados os filtros de perfil e situação, quando aplicados juntos, então a lista respeita os dois.
- **HU-ADM-02** CA-03: A situação de cada usuário aparece escrita ("Ativo" ou "Inativo"), não só por cor.
- **HU-ADM-02** CA-04: Dada uma busca sem resultado, então a lista mostra uma mensagem que orienta a mudar o filtro (MOD-USA-009).

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/api/src/admin.ts](../../../apps/api/src/admin.ts)
- [apps/web/app/admin/usuarios](../../../apps/web/app/admin/usuarios)
- [apps/web/app/admin/registros](../../../apps/web/app/admin/registros)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
