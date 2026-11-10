# ADR 0019 — Papéis da equipe: professor, coordenação e administrador

- **Status:** Aceita
- **Data:** 05/11/2026
- **Decisores:** a preencher pela equipe
- **Uso de IA:** auxílio no desenho das permissões, na implementação e nos testes, a partir do pedido da equipe de
  ter acesso de administrador (usuários, permissões e registro) e de coordenação (acompanha a escola e vincula
  professores às turmas).

## Contexto

Até aqui só o professor entrava no painel, e turmas, vínculos e pessoas vinham dos dados de demonstração. A escola
precisa de alguém que cadastre e gerencie quem usa o sistema, e de uma coordenação que acompanhe todas as turmas
sem precisar ser professora de cada uma. Também faltava saber quem fez o quê (auditoria), algo esperado quando o
sistema guarda dados de menores.

## Decisão

- **Três papéis na equipe, um por pessoa** (coluna `papel` na tabela `professor`, que passa a guardar toda a
  equipe): `professor`, `coordenacao` e `admin`. As permissões são **por papel**, não pessoa a pessoa: simples de
  explicar, de conferir na tela "Permissões" e de testar.
- **Professor:** como antes, só as próprias turmas; planeja, cria atividades e cuida do acesso dos alunos.
- **Coordenação:** vê a escola inteira (parâmetros gerais e desempenho por turma e por formato, dados individuais
  só para consulta) e vincula ou tira professores das turmas. **Não** cria atividades nem planos e não mexe no
  acesso dos alunos.
- **Administrador:** cadastra pessoas e define o papel, desativa e reativa acessos, cria senhas provisórias, cria
  turmas e cadastra alunos (com código de acesso), e consulta o registro de atividades.
- **Cada papel tem a sua área no painel** (`/professor`, `/coordenacao`, `/admin`), com o mesmo login. O
  middleware leva cada um à sua área, e a **API confere o papel em toda chamada** e consulta o banco: desativar
  alguém ou mudar o papel vale na hora, sem esperar o token vencer.
- **Senha provisória:** quem é cadastrado (ou tem a senha redefinida) recebe uma senha provisória, mostrada uma vez
  ao administrador, e só usa o painel depois de criar a própria senha (8 caracteres ou mais, com letras e números).
- **Proteções:** o administrador não desativa nem rebaixa a si mesmo, e a escola nunca fica sem administrador ativo.
- **Registro de atividades (`registro`):** entradas (e tentativas recusadas), cadastro, mudança de papel,
  desativação, senhas, turmas, vínculos, alunos, zerar PIN, novo código, atividades e planos. A tabela só cresce: o
  usuário da API (`modolume_api`) pode incluir e ler, mas não alterar nem apagar.

## Alternativas consideradas

- **Permissões pessoa a pessoa (lista de caixinhas):** mais flexível, mas difícil de entender e de auditar numa
  escola; fica para quando houver um caso real.
- **Tabela separada por papel (coordenador, administrador):** duplicaria login, senha e desativação.
- **Coordenação com acesso total ao painel do professor:** misturaria acompanhar com ensinar; a equipe pediu que
  a coordenação só acompanhe e vincule.

## Consequências

- **Positivas:** a escola se organiza sozinha (cadastros, vínculos e acessos); quem sai perde o acesso na hora;
  toda ação sensível fica registrada.
- **Negativas:** uma pessoa com dois papéis (por exemplo, professora e coordenadora) precisa de duas contas, ou de
  um papel novo no futuro.
- **Banco:** migração `20261105150000_equipe_papeis_e_registros` (só acréscimos: `papel`, `ultimo_acesso`,
  `senha_provisoria`, tabela `registro` e duas restrições `CHECK`). Ver [[Modelo de dados]].
- **Pendente:** redefinição de senha por e-mail (MOD-AUT-007); importação por CSV (MOD-ADM-008); busca na lista da
  equipe (MOD-ADM-004).

Relacionados: [[PRD-01 — Autenticação e controle de acesso]], [[PRD-02 — Administração de usuários]],
[[PRD-03 — Gestão de turmas]], [[0017-acesso-individual-do-aluno]].
