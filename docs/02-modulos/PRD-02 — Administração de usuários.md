---
modulo: ADM
prd: PRD-02
atualizado: 2026-11-05
status: para revisão
---

# PRD-02 — Administração de usuários

## 1. Resumo executivo

Permite ao administrador cadastrar, consultar, editar, ativar e desativar os usuários do Modolume e definir o perfil de cada um. Sem esse módulo, a escola depende da equipe técnica para incluir professores e alunos.

## 2. Problema e oportunidade

- A escola precisa de autonomia para incluir e retirar pessoas ao longo do ano letivo.
- Desativar alguém não pode apagar o histórico de jogadas e avaliações (rastreabilidade pedagógica).

## 3. Usuários e necessidades

| Perfil | Necessidade | Solução |
| --- | --- | --- |
| Administrador | Manter o cadastro atualizado | Cadastro, busca, edição, ativação e desativação de usuários |
| Escola | Incluir uma turma inteira de uma vez | Importação por planilha CSV (desejável) |
| Professor | Ter o acesso criado sem burocracia | Cadastro feito pelo administrador com o perfil professor |

## 4. Objetivos e critérios de sucesso

| Objetivo | Indicador | Meta | Prazo |
| --- | --- | --- | --- |
| Cadastro autônomo pela escola | Usuários da validação cadastrados sem ajuda da equipe técnica | 100% | Início da validação (fase 6) |
| Histórico preservado | Usuários desativados com histórico consultável nos testes | 100% | Fase 5 |

### 4.1 Critérios de validação

Testes funcionais de cada operação e demonstração do cadastro de uma turma de exemplo.

## 5. Escopo funcional

### 5.1 Requisitos

| ID | Comportamento esperado | Prior. | Verif. | Situação |
| --- | --- | :---: | :---: | :---: |
| MOD-ADM-001 | O administrador deve poder cadastrar usuários. | E | T | Implementado |
| MOD-ADM-002 | No cadastro, o administrador deve definir o papel: administrador, coordenação ou professor. O aluno é cadastrado na turma, com o código de acesso. | E | T | Implementado |
| MOD-ADM-003 | O administrador deve poder consultar os usuários cadastrados. | E | D | Implementado |
| MOD-ADM-004 | O administrador deve poder pesquisar usuários por nome, perfil e situação. | I | T | Parcial |
| MOD-ADM-005 | O administrador deve poder editar os dados cadastrais de um usuário. | E | T | Implementado |
| MOD-ADM-006 | O administrador deve poder ativar e desativar usuários, preservando o histórico. | E | T | Implementado |
| MOD-ADM-007 | A lista de usuários deve identificar usuários ativos e inativos por texto. | I | N | Implementado |
| MOD-ADM-009 | O sistema guarda um registro de atividades (quem fez o quê e quando), que o administrador consulta com filtros e que ninguém altera nem apaga. | E | T | Implementado |
| MOD-ADM-010 | Quem é cadastrado ou tem a senha redefinida recebe uma senha provisória e precisa criar a própria senha antes de usar o painel. | E | T | Implementado |
| MOD-ADM-011 | O administrador cria e edita turmas, encerra e reabre, e cadastra, edita, troca de turma, desativa e reativa alunos. | E | T | Implementado |
| MOD-ADM-012 | O administrador não pode desativar nem tirar o próprio papel, e a escola nunca fica sem um administrador ativo. | E | T | Implementado |
| MOD-ADM-008 | O administrador pode importar usuários a partir de planilha CSV. | D | T | Pendente |

**Situação atual:** área do administrador em `/admin` (ADR 0019): visão geral, "Equipe e acessos" (cadastro, papel, desativação, senha provisória e o que cada pessoa fez), "Turmas e alunos", "Permissões" (o que cada papel pode fazer) e "Registro de atividades". A API (`apps/api/src/admin.ts`) confere o papel e a escola em cada chamada. A lista da equipe ainda não tem campo de busca (ADM-004 parcial); o registro tem filtro por tipo de ação e por pessoa. Contas de demonstração: `admin@escola.example` e `coordenacao@escola.example`, com a senha de `SENHA_DEMO`.

### 5.2 Regras de negócio

| Regra | Síntese |
| --- | --- |
| RN-16 | Usuários não são excluídos, apenas desativados; o histórico continua consultável. |
| RN-17 | O e-mail é único entre professor, gestão e administrador. |

### Fora do escopo atual

- Integração com o sistema acadêmico da escola.
- Autocadastro de professores.

## 6. Histórias de usuário

| ID | História | Requisitos |
| --- | --- | --- |
| HU-ADM-01 | Como **administrador**, quero cadastrar um usuário com seu perfil, para que ele possa acessar o Modolume. | ADM-001, ADM-002 |
| HU-ADM-02 | Como **administrador**, quero encontrar um usuário pelo nome, perfil ou situação, para atendê-lo rápido. | ADM-003, ADM-004, ADM-007 |
| HU-ADM-03 | Como **administrador**, quero corrigir os dados de um usuário, para manter o cadastro certo. | ADM-005 |
| HU-ADM-04 | Como **administrador**, quero desativar quem saiu da escola sem perder o histórico, para manter os registros pedagógicos. | ADM-006 |
| HU-ADM-05 | Como **administrador**, quero importar uma planilha de alunos, para não cadastrar um por um. | ADM-008 |

## 7. Critérios de aceite

### HU-ADM-01 — Cadastrar usuário

- [ ] CA-01: Dado o formulário de cadastro, quando o administrador salva com nome e perfil preenchidos (e e-mail, para perfis da web), então o usuário aparece na lista como "Ativo".
- [ ] CA-02: Dado um campo obrigatório vazio, quando o administrador tenta salvar, então vê a mensagem junto ao campo e nada é gravado (MOD-USA-010).
- [ ] CA-03: Dado um e-mail já usado, quando o administrador tenta salvar, então vê "Este e-mail já está cadastrado." (RN-17).

### HU-ADM-02 — Encontrar usuário

- [ ] CA-01: Dado um termo de busca, quando o administrador pesquisa, então a lista mostra só os usuários cujo nome contém o termo, sem diferenciar acentos e maiúsculas.
- [ ] CA-02: Dados os filtros de perfil e situação, quando aplicados juntos, então a lista respeita os dois.
- [ ] CA-03: A situação de cada usuário aparece escrita ("Ativo" ou "Inativo"), não só por cor.
- [ ] CA-04: Dada uma busca sem resultado, então a lista mostra uma mensagem que orienta a mudar o filtro (MOD-USA-009).

### HU-ADM-03 — Editar dados

- [ ] CA-01: Dado um usuário, quando o administrador altera e salva, então os novos dados aparecem na lista e na ficha.

### HU-ADM-04 — Desativar sem perder histórico

- [ ] CA-01: Dado um usuário ativo, quando o administrador pede para desativar, então o sistema pede confirmação antes (MOD-USA-011).
- [ ] CA-02: Depois de desativado, o usuário não consegue entrar, e suas jogadas e avaliações continuam visíveis para quem tem permissão (RN-16).
- [ ] CA-03: Dado um usuário inativo, quando o administrador o reativa, então ele volta a entrar com o mesmo histórico.

### HU-ADM-05 — Importar planilha

- [ ] CA-01: Dado um CSV no modelo fornecido, quando importado, então o sistema mostra quantos usuários foram criados e lista as linhas com erro e o motivo.
- [ ] CA-02: Linhas com erro não impedem a importação das linhas corretas.

## 8. MVP e fases

| Fase | Entrega | Situação |
| --- | --- | --- |
| 5 | Cadastro, edição, papel, ativação e desativação de usuários; turmas e alunos; registro de atividades. | Implementado |
| 5 | Busca na lista da equipe. | Pendente |
| Pós-MVP | Importação por CSV. | Pendente |

## 9. Diretrizes do produto

- Desativar, nunca excluir.
- Toda ação que tira o acesso de alguém pede confirmação.

## 10. Dependências e riscos

| Risco | Mitigação planejada |
| --- | --- |
| Depende da API e do banco (fase 4) | Construir depois da autenticação real. |
| Planilhas com dados incompletos | Modelo de CSV e relatório de erros por linha. |

## 11. Pendências para aprovação

- Definir quais dados de cadastro do aluno são necessários (MOD-SEG-009 limita a nome, turma e avatar).

## 12. Documentos vinculados

- [[PRD — Modolume]]
- [[PRD-01 — Autenticação e controle de acesso]] · [[PRD-03 — Gestão de turmas]] · [[PRD-17 — Qualidade, segurança e restrições]]
