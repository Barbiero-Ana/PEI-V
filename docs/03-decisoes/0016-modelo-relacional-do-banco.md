# ADR 0016 — Modelo relacional do banco

- **Status:** Aceita
- **Data:** 04/11/2026
- **Decisores:** a preencher pela equipe
- **Uso de IA:** auxílio no desenho das tabelas, na migração, nos testes de integridade e no dicionário de dados, a
  partir do pedido da equipe de migrar tudo para o banco com tabelas mães e filhas.

## Contexto

Depois da integração (ADR 0015), parte dos dados ainda ficava fora do banco ou guardada de forma pouco estruturada:
os planos de aula na memória do painel; as turmas de cada atividade numa lista de texto; as questões e o avatar em
JSON; o progresso de gamificação (estrelas, pontos, constelações, desafios, compras) só no celular; e os catálogos
(formatos, mapas, missões, habilidades) só no código. O banco também era criado sem migrações versionadas, e o banco
local de desenvolvimento usava a codificação do Windows (WIN1252), que não guarda todos os caracteres.

## Decisão

- **Tudo no banco, em modelo relacional:** 26 tabelas em seis grupos (catálogos, escola, aluno, histórico, atividades
  e planejamento), com tabelas mães e filhas ligadas por chaves estrangeiras. O dicionário de dados e o diagrama estão
  em [[Modelo de dados]].
- **Listas viram tabelas de vínculo:** professor ↔ turma, atividade ↔ turma, plano ↔ habilidades/formatos/missões/alunos.
- **JSON vira colunas e linhas:** questões e opções em tabelas próprias; avatar em colunas (rosto) mais o SVG.
- **Catálogos no banco**, carregados do núcleo pelo seed: jogadas, progresso e planos apontam para missões e formatos
  que existem de verdade.
- **Progresso do app no banco**, com junção sem perda (maior valor e união das conquistas): o aluno recupera tudo em
  outro aparelho, e um aparelho desatualizado não apaga nada.
- **Integridade garantida pelo banco:** regras de exclusão (`RESTRICT` para o histórico, `CASCADE` para as partes de
  uma mãe, `SET NULL` para vínculos opcionais), `ENUM`, datas e 19 restrições `CHECK`.
- **Migrações versionadas** (`prisma/migrations`) no lugar de `db push`; papel de banco com privilégio mínimo para a
  API em produção; banco em UTF-8.
- **Formato externo inalterado:** a API converte as tabelas para os mesmos formatos do núcleo, então painel e app não
  mudaram a forma de ler os dados.

## Alternativas consideradas

- **Manter JSON para questões e avatar:** mais simples, mas o banco não consegue validar nem consultar o conteúdo, e
  um erro de gravação passaria despercebido.
- **Enum para formatos e missões:** mais leve, mas mudar o catálogo exigiria migração; como tabela, o seed atualiza.
- **Excluir em cascata o histórico do aluno:** mais simples de limpar, mas apagaria dados pedagógicos e contraria a
  RN-16 (desativar, não excluir).

## Consequências

- **Positivas:** nenhum dado depende só do celular ou da memória do servidor; o banco recusa sozinho dados
  impossíveis (testado); relações claras para relatórios e para a banca; histórico de mudanças no esquema.
- **Negativas:** gravar uma atividade ou um plano mexe em várias tabelas (feito numa só operação); a migração inicial
  exigiu recriar o banco local de desenvolvimento.
- **Aplicado no Railway em 04/11/2026:** migração, seed e papel `modolume_api` (a API usa esse usuário; as migrações
  usam o administrador pela `DIRECT_URL`). Testado: o papel lê e grava dados, mas é recusado em `CREATE`, `DROP`,
  `ALTER`, `TRUNCATE` e na tabela de migrações.
- **O que fica pendente:** telas de
  gestão para usar `professor_turma` com mais de um professor e os campos `ativo`.
