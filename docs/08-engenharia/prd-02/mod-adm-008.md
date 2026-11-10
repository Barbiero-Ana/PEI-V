# MOD-ADM-008

O administrador pode importar usuários a partir de planilha CSV.

Origem: [PRD-02 — Administração de usuários](../../02-modulos/PRD-02%20%E2%80%94%20Administra%C3%A7%C3%A3o%20de%20usu%C3%A1rios.md), seção 5. Prioridade **D**, método **T**. Situação declarada na origem **Pendente**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-ADM-05 Como **administrador**, quero importar uma planilha de alunos, para não cadastrar um por um.

- **HU-ADM-05** CA-01: Dado um CSV no modelo fornecido, quando importado, então o sistema mostra quantos usuários foram criados e lista as linhas com erro e o motivo.
- **HU-ADM-05** CA-02: Linhas com erro não impedem a importação das linhas corretas.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/api/src/admin.ts](../../../apps/api/src/admin.ts)
- [apps/web/app/admin/usuarios](../../../apps/web/app/admin/usuarios)
- [apps/web/app/admin/registros](../../../apps/web/app/admin/registros)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
