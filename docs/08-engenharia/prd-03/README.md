# PRD-03 — Gestão de turmas

Administração cadastra turmas e alunos. Coordenação gerencia vínculos docentes. Encerrar uma turma invalida o acesso dos alunos.

[PRD de origem](../../02-modulos/PRD-03%20%E2%80%94%20Gest%C3%A3o%20de%20turmas.md) · [Matriz de rastreabilidade](../matriz.md) · [Qualidade e permissões](../prd-17/README.md)

## Perfis e necessidades

| Perfil | Necessidade | Solução |
| --- | --- | --- |
| Gestão escolar | Montar as turmas do ano e vincular pessoas | Cadastro de turmas e vínculos |
| Professor | Ver apenas as próprias turmas | Recorte por vínculo |
| Aluno | Entrar na turma certa | Código de acesso da turma |

## Implementação

- [apps/api/src/admin.ts](../../../apps/api/src/admin.ts)
- [apps/api/src/coordenacao.ts](../../../apps/api/src/coordenacao.ts)
- [apps/api/src/professor.ts](../../../apps/api/src/professor.ts)
- [apps/web/app/admin/turmas](../../../apps/web/app/admin/turmas)
- [apps/web/app/coordenacao/vinculos](../../../apps/web/app/coordenacao/vinculos)

**Persistência** turma, professor_turma, aluno.

## Regras de negócio

- **RN-18** Um aluno pertence a uma turma ativa por vez; a troca de turma preserva o histórico anterior.
- **RN-19** ~~Renovar o código da turma invalida o anterior.~~ Substituída: gerar um novo código pessoal para o aluno invalida o anterior e encerra as sessões dele em todos os aparelhos (ADR 0017).

## Testes e limites

ciclo-aluno.test.ts e leitura-professor.test.ts. Homologar cadastro e vínculos pela interface.

## Dependências

[PRD-01](../prd-01/README.md) · [PRD-02](../prd-02/README.md) · [PRD-12](../prd-12/README.md)

## Requisitos

- [MOD-TUR-001](mod-tur-001.md) A gestão cadastra a turma selecionando segmento, série, turno e ano letivo. O sistema salva um identificador único com o número da série, a sigla do turno (`AM`, `TD` ou `IN`) e um número sequencial, como `6AM12`.
- [MOD-TUR-002](mod-tur-002.md) A gestão deve poder editar e consultar turmas.
- [MOD-TUR-003](mod-tur-003.md) A administração pode atribuir uma turma no cadastro do professor. A coordenação adiciona e remove professores das turmas do seu segmento.
- [MOD-TUR-004](mod-tur-004.md) A gestão deve poder vincular alunos a uma turma.
- [MOD-TUR-005](mod-tur-005.md) A gestão deve poder remover vínculos, preservando o histórico.
- [MOD-TUR-006](mod-tur-006.md) Exibir os professores e alunos de cada turma.
- [MOD-TUR-007](mod-tur-007.md) Identificar turmas ativas e encerradas.
- [MOD-TUR-008](mod-tur-008.md) ~~Gerar para cada turma um código de acesso, que pode ser renovado.~~ Substituído pelo código pessoal do aluno (MOD-AUT-009, ADR 0017).
- [MOD-TUR-009](mod-tur-009.md) O professor visualiza somente as turmas às quais está vinculado.
- [MOD-TUR-010](mod-tur-010.md) O aluno acessa somente as informações da própria turma.
