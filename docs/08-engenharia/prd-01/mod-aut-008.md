# PRD do requisito MOD-AUT-008

**Data registrada no PRD de origem:** 2026-11-10. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

Permitir que o professor redefina o acesso de um aluno (zerar o PIN ou gerar novo código).

Origem: [PRD-01 — Autenticação e controle de acesso](../../02-modulos/PRD-01%20%E2%80%94%20Autentica%C3%A7%C3%A3o%20e%20controle%20de%20acesso.md), seção 5. Prioridade **I**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-AUT-07 Como **professor**, quero redefinir o acesso de um aluno, para que ele volte a entrar se trocar de aparelho.

- **HU-AUT-07** CA-01: Dado um aluno da turma, quando o professor abre o perfil dele no painel, então vê o código de acesso (com "Copiar") e se o PIN já foi criado ou está bloqueado.
- **HU-AUT-07** CA-02: Dado um aluno que esqueceu o PIN, quando o professor confirma "Zerar PIN", então o aluno cria um PIN novo no próximo acesso, com o mesmo código, e o progresso salvo é mantido.
- **HU-AUT-07** CA-03: Dado um código vazado ou um celular perdido, quando o professor confirma "Novo código", então o código antigo deixa de funcionar e o aluno sai do app em todos os aparelhos.
- **HU-AUT-07** CA-04: O professor só zera o PIN ou gera código de alunos das próprias turmas; para outro aluno, a API responde "Aluno não encontrado."
- **HU-AUT-07** CA-05: Ao cadastrar um aluno ou gerar um novo código, o painel mostra e copia quatro letras, um hífen e quatro números, conforme o [ADR 0020](../../03-decisoes/0020-codigo-do-aluno-com-letras-e-numeros.md).

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/api/src/acesso.ts](../../../apps/api/src/acesso.ts)
- [apps/api/src/infra.ts](../../../apps/api/src/infra.ts)
- [apps/web/app/entrar](../../../apps/web/app/entrar)
- [apps/web/app/redefinir-senha](../../../apps/web/app/redefinir-senha)
- [apps/mobile/src/app/entrar.tsx](../../../apps/mobile/src/app/entrar.tsx)

**Aceite nesta auditoria** Evidência parcial.

A API mantém as operações de código e PIN. Falta homologar recuperação do aluno no dispositivo.
