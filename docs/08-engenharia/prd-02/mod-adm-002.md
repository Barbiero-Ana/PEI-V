# PRD do requisito MOD-ADM-002

**Data registrada no PRD de origem:** 2026-11-10. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

No cadastro, o administrador deve definir o papel: administrador, coordenação ou professor. O aluno é cadastrado na turma, com o código de acesso.

Origem: [PRD-02 — Administração de usuários](../../02-modulos/PRD-02%20%E2%80%94%20Administra%C3%A7%C3%A3o%20de%20usu%C3%A1rios.md), seção 5. Prioridade **E**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-ADM-01 Como **administrador**, quero cadastrar um usuário com seu perfil, para que ele possa acessar o Modolume.

- **HU-ADM-01** CA-01: Dado o formulário de cadastro, quando o administrador salva com nome e perfil preenchidos (e e-mail, para perfis da web), então o usuário aparece na lista como "Ativo".
- **HU-ADM-01** CA-02: Dado um campo obrigatório vazio, quando o administrador tenta salvar, então vê a mensagem junto ao campo e nada é gravado (MOD-USA-010).
- **HU-ADM-01** CA-03: Dado um e-mail já usado, quando o administrador tenta salvar, então vê "Este e-mail já está cadastrado." (RN-17).

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/api/src/admin.ts](../../../apps/api/src/admin.ts)
- [apps/web/app/admin/usuarios](../../../apps/web/app/admin/usuarios)
- [apps/web/app/admin/registros](../../../apps/web/app/admin/registros)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
