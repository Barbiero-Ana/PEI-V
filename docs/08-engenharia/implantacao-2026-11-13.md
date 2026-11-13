# Migração e publicação — 13/11/2026

Responsável pela aprovação: **Ana Barbiero — Líder de projeto**. A autorização abrange migração,
atualização da API e do painel e consolidação da documentação. Este registro descreve a execução atual;
as datas originais dos PRDs e das ADRs permanecem nos documentos de origem.

## Banco

- Destino conferido: PostgreSQL 18.6 do serviço Railway, banco `railway`.
- Histórico anterior: oito migrações concluídas. Os arquivos conferem com os checksums registrados,
  considerando a equivalência entre as quebras de linha Windows e Linux.
- Backup consistente em formato custom do PostgreSQL, com snapshot transacional e SHA-256.
  O arquivo contém dados privados e fica somente na pasta local ignorada
  `tmp/auditoria-banco-publicacao-20261113/`, junto ao manifesto e ao resultado do ensaio.
- Restauração em PostgreSQL descartável na porta 55440: contagens das 29 tabelas conferidas.
- As duas migrações foram aplicadas primeiro na cópia restaurada e depois no Railway:
  `20261111120000_consolidacao_progresso` e `20261111130000_ciclo_atividades`.
- Resultado em produção: dez migrações concluídas, 33 tabelas e registros originais preservados.
- Papel `modolume_api`: pode inserir avaliações; não pode alterá-las nem apagar o registro de auditoria.
  Não foi executado seed ou reinicialização de dados em produção.

O backup não substitui a política institucional de retenção e cópias externas. Para restaurar em incidente,
interromper escritas, preservar uma cópia do estado atual e restaurar primeiro em outra base. Não executar
`migrate reset`, `db push` ou `seed --recomecar` neste banco.

## Verificações da revisão

- 152 testes automatizados: 55 do núcleo, 72 da API, 24 do app e um contrato de aprendizagem com o painel.
- Suíte PostgreSQL: PIN concorrente, recuperação, idempotência, ganhos em dois aparelhos, compras,
  rollback, prazos, avaliações privadas/publicadas, avisos e migração repetida.
- Formatação, lint, tipagem dos quatro pacotes e tipagem dos testes móveis aprovados.
- Build de produção do painel e teste local das rotas públicas e protegidas aprovados.
- O seed foi bloqueado em produção e recusa reinicialização de bases com avaliações imutáveis,
  evitando contas de demonstração ou exclusões incompatíveis com o histórico.
- A CI verifica também a reprodução da rastreabilidade e a consistência das datas no índice de ADRs.
- A [primeira execução remota](https://github.com/Barbiero-Ana/PEI-V/actions/runs/43427120758)
  concluiu todas as etapas com sucesso, incluindo migrações, build web e bundle Android.
- A revisão corrigiu o calendário dos alertas da equipe: usa `dataEscolar` do núcleo em vez do fuso do
  servidor, mantendo hoje/amanhã coerentes com a API e o aplicativo.

## Serviços e compatibilidade

- API pública: [api.modolume.com.br](https://api.modolume.com.br/saude), hospedada no Railway.
- Painel da equipe: [www.modolume.com.br](https://www.modolume.com.br), hospedado na Vercel.
- O aluno usa o aplicativo nativo Android/iOS. Não há publicação web do app móvel.
- A publicação é feita pelo repositório conectado. Confirmar os estados de implantação e as rotas públicas
  depois do envio; a migração do banco sozinha não atualiza o código em execução.
- Distribuir APK/AAB novo com código 3 ou superior. O código 2 não contém o novo protocolo; após adotar
  a sincronização nova em uma conta, a escrita de totais pelo app antigo recebe conflito para proteger os ganhos.

## Validação no domínio publicado

A revisão `d8e9274` foi implantada com sucesso nos dois serviços. O teste HTTP utilizou exclusivamente
as contas fictícias de demonstração já existentes, sem cadastrar escola, aluno, compra ou atividade de teste.

- `GET /saude`: 200; rotas novas `/aluno/avisos` e `/aluno/avaliacoes`: 401 sem sessão.
- API autenticada: dados, atividades e avaliações pendentes do professor; visão da coordenação; resumo,
  pessoas e turmas da administração retornaram 200.
- Coordenação e administração receberam 403 ao tentar acessar a rota exclusiva de avaliações do professor.
- Login pelo formulário público do painel: redirecionamento correto para cada um dos três perfis.
- Onze páginas autenticadas retornaram 200: início, atividades, criação de atividade e alunos do professor;
  início, turmas e vínculos da coordenação; início, pessoas, turmas e registros da administração.
- Cookies de sessão com `HttpOnly` e `Secure`. A saída por POST retornou 303 e expirou a sessão em
  uma tentativa; a área protegida sem cookie redirecionou ao login.

Essas verificações comprovam a integração HTTP publicada, não uma inspeção visual ou o aceite físico do
aplicativo. O resultado detalhado, sem credenciais, está no registro privado local `validacao-producao.json`.

## Documentação e pendências

Os 17 PRDs de módulo e os 230 PRDs de requisitos possuem rastreabilidade para código, histórias,
critérios e evidências. A aprovação documental de 13/11/2026 é separada das datas históricas e do aceite
funcional. As ADRs 0024 e 0025 conservam 11/11/2026 e registram a aprovação atual em seção própria.

Continuam necessários o aceite em dois aparelhos, acessibilidade e revisão pedagógica, homologação
de entrega real do Resend e definição institucional de retenção, exportação e exclusão de dados. As
pendências específicas permanecem na [matriz](matriz.md) e no [roteiro do app](plano-correcao-mobile.md).
