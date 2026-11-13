# PRD-01 — Autenticação e controle de acesso

**Data registrada no PRD de origem:** 2026-11-10. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

Equipe e aluno autenticam por canais diferentes. As guardas consultam papel, vínculo e versão da sessão no banco.

[PRD de origem](../../02-modulos/PRD-01%20%E2%80%94%20Autentica%C3%A7%C3%A3o%20e%20controle%20de%20acesso.md) · [Matriz de rastreabilidade](../matriz.md) · [Qualidade e permissões](../prd-17/README.md)

## Perfis e necessidades

| Perfil | Necessidade | Solução |
| --- | --- | --- |
| Aluno | Entrar na própria conta sem e-mail e sem senha difícil | Código pessoal + PIN de 4 números (MOD-AUT-009, ADR 0017) |
| Professor | Entrar rápido e ver só as suas turmas | E-mail e senha na web, com sessão de 8 horas |
| Gestão e administrador | Acessar as funções do seu perfil | Perfis com permissões verificadas no servidor |
| Escola | Proteger os dados dos alunos | Controle de acesso por perfil e por vínculo |

## Implementação

- [apps/api/src/acesso.ts](../../../apps/api/src/acesso.ts)
- [apps/api/src/infra.ts](../../../apps/api/src/infra.ts)
- [apps/web/app/entrar](../../../apps/web/app/entrar)
- [apps/web/app/redefinir-senha](../../../apps/web/app/redefinir-senha)
- [apps/mobile/src/app/entrar.tsx](../../../apps/mobile/src/app/entrar.tsx)

**Persistência** professor, aluno, turma, registro.

## Regras de negócio

- **RN-14** A mensagem de login inválido é a mesma para e-mail inexistente e senha errada, para não revelar quais e-mails existem.
- **RN-15** A sessão da web expira em 8 horas; depois disso, o usuário volta à tela de entrada.

## Testes e limites

senha-provisoria.test.ts, ciclo-aluno.test.ts e verificar-banco.ts. Entrega pelo Resend e comportamento em aparelho real aguardam homologação.

## Dependências

[PRD-02](../prd-02/README.md) · [PRD-03](../prd-03/README.md) · [PRD-17](../prd-17/README.md)

## Requisitos

- [MOD-AUT-001](mod-aut-001.md) Permitir que usuários cadastrados se autentiquem com suas credenciais.
- [MOD-AUT-002](mod-aut-002.md) Identificar o perfil do usuário após a autenticação.
- [MOD-AUT-003](mod-aut-003.md) Disponibilizar o acesso do aluno pelo aplicativo móvel e dos perfis professor, gestão e administrador pela plataforma web, respeitando suas permissões.
- [MOD-AUT-004](mod-aut-004.md) Restringir telas, funções e operações conforme o perfil autenticado.
- [MOD-AUT-005](mod-aut-005.md) Permitir que o usuário encerre sua sessão.
- [MOD-AUT-006](mod-aut-006.md) Manter a sessão ativa entre aberturas do aplicativo enquanto a autenticação for válida.
- [MOD-AUT-007](mod-aut-007.md) Permitir a redefinição de senha por e-mail para professor, gestão e administrador.
- [MOD-AUT-008](mod-aut-008.md) Permitir que o professor redefina o acesso de um aluno (zerar o PIN ou gerar novo código).
- [MOD-AUT-009](mod-aut-009.md) Permitir o acesso do aluno por um código pessoal (passado pelo professor ou coordenação) e um PIN de 4 números criado no primeiro acesso, sem exigir e-mail e sem escolher nome numa lista. Códigos novos têm quatro letras e quatro números, como `BDFH-2468`, conforme o ADR 0020.
