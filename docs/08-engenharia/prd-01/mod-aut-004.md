# MOD-AUT-004

Restringir telas, funções e operações conforme o perfil autenticado.

Origem: [PRD-01 — Autenticação e controle de acesso](../../02-modulos/PRD-01%20%E2%80%94%20Autentica%C3%A7%C3%A3o%20e%20controle%20de%20acesso.md), seção 5. Prioridade **E**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-AUT-03 Como **escola**, quero que cada perfil veja só o que lhe cabe, para proteger os dados dos alunos.

- **HU-AUT-03** CA-01: Dado um professor logado, quando ele abre o endereço de uma turma de outro professor, então vê "página não encontrada" e nenhum dado dessa turma.
- **HU-AUT-03** CA-02: Dado um aluno, quando o app busca dados no servidor, então recebe apenas os dados da própria turma e os seus.
- **HU-AUT-03** CA-03: Toda permissão é verificada no servidor, e não só escondida na tela (MOD-SEG-003); um aluno que chama uma rota de professor recebe "Você não tem permissão para isso."

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/api/src/acesso.ts](../../../apps/api/src/acesso.ts)
- [apps/api/src/infra.ts](../../../apps/api/src/infra.ts)
- [apps/web/app/entrar](../../../apps/web/app/entrar)
- [apps/web/app/redefinir-senha](../../../apps/web/app/redefinir-senha)
- [apps/mobile/src/app/entrar.tsx](../../../apps/mobile/src/app/entrar.tsx)

**Aceite nesta auditoria** Evidência parcial.

senha-provisoria.test.ts, ciclo-aluno.test.ts, leitura-professor.test.ts e escrita-professor.test.ts exercitam recusas de papéis e vínculos específicos.
