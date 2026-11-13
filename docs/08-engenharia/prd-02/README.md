# PRD-02 — Administração de usuários

**Data registrada no PRD de origem:** 2026-11-10. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

Administrador gerencia a própria escola. A lista filtra nome, perfil e situação antes de paginar. A pessoa define sua credencial pelo e-mail.

[PRD de origem](../../02-modulos/PRD-02%20%E2%80%94%20Administra%C3%A7%C3%A3o%20de%20usu%C3%A1rios.md) · [Matriz de rastreabilidade](../matriz.md) · [Qualidade e permissões](../prd-17/README.md)

## Perfis e necessidades

| Perfil | Necessidade | Solução |
| --- | --- | --- |
| Administrador | Manter o cadastro atualizado | Cadastro, busca, edição, ativação e desativação de usuários |
| Escola | Incluir uma turma inteira de uma vez | Importação por planilha CSV (desejável) |
| Professor | Ter o acesso criado sem burocracia | Cadastro feito pelo administrador com o perfil professor |

## Implementação

- [apps/api/src/admin.ts](../../../apps/api/src/admin.ts)
- [apps/web/app/admin/usuarios](../../../apps/web/app/admin/usuarios)
- [apps/web/app/admin/registros](../../../apps/web/app/admin/registros)

**Persistência** instituicao, professor, turma, aluno, registro.

## Regras de negócio

- **RN-16** Usuários não são excluídos, apenas desativados; o histórico continua consultável.
- **RN-17** O e-mail é único entre professor, gestão e administrador.

## Testes e limites

papel-equipe.test.ts e verificar-banco.ts. Importação CSV e homologação visual dos formulários pendentes.

## Dependências

[PRD-01](../prd-01/README.md) · [PRD-03](../prd-03/README.md) · [PRD-17](../prd-17/README.md)

## Requisitos

- [MOD-ADM-001](mod-adm-001.md) O administrador deve poder cadastrar usuários.
- [MOD-ADM-002](mod-adm-002.md) No cadastro, o administrador deve definir o papel: administrador, coordenação ou professor. O aluno é cadastrado na turma, com o código de acesso.
- [MOD-ADM-003](mod-adm-003.md) O administrador deve poder consultar os usuários cadastrados.
- [MOD-ADM-004](mod-adm-004.md) O administrador deve poder pesquisar usuários por nome, perfil e situação.
- [MOD-ADM-005](mod-adm-005.md) O administrador deve poder editar os dados cadastrais de um usuário.
- [MOD-ADM-006](mod-adm-006.md) O administrador deve poder ativar e desativar usuários, preservando o histórico.
- [MOD-ADM-007](mod-adm-007.md) A lista de usuários deve identificar usuários ativos e inativos por texto.
- [MOD-ADM-009](mod-adm-009.md) O sistema guarda um registro de atividades (quem fez o quê e quando), que o administrador consulta com filtros e que ninguém altera nem apaga.
- [MOD-ADM-010](mod-adm-010.md) A pessoa cadastrada solicita um link privado em Recuperar acesso e define a própria senha. A revogação administrativa exige uma nova recuperação, sem revelar a senha ao administrador.
- [MOD-ADM-011](mod-adm-011.md) O administrador cria e edita turmas, encerra e reabre, e cadastra, edita, troca de turma, desativa e reativa alunos.
- [MOD-ADM-012](mod-adm-012.md) O administrador não pode desativar nem tirar o próprio papel, e a escola nunca fica sem um administrador ativo.
- [MOD-ADM-008](mod-adm-008.md) O administrador pode importar usuários a partir de planilha CSV.
