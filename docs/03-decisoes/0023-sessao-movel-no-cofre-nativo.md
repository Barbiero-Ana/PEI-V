# ADR 0023 — Sessão móvel no cofre nativo

- **Status:** Aceita
- **Data:** 10/11/2026
- **Decisores:** equipe do projeto
- **Uso de IA:** análise dos formatos anteriores, implementação e testes de migração.

## Contexto

A credencial do aluno era gravada no armazenamento comum do app. Algumas versões também copiavam a conta
com o token no cache. A migração precisa preservar a fila de jogadas e o progresso local de cada aluno.

## Decisão

- O repositório de sessão usa Expo SecureStore. A sessão guarda token e identificação mínima de aluno e turma.
  Avatar, atividades e progresso continuam no armazenamento de dados da identidade.
- Na primeira abertura da atualização, migrar a sessão e remover as cópias antigas da credencial, mantendo os
  demais campos. A limpeza pode ser retomada após uma interrupção. Uma instalação nova exige nova entrada.
- Ao sair, gravar o estado desconectado no cofre. No Android, desabilitar o backup automático do app para
  limitar a restauração de dados escolares locais em outro aparelho.

## Alternativas consideradas

- Exigir novo login de todos os alunos. A migração permite atualizar também em aparelhos sem conexão e
  preserva a separação das contas já guardadas.

## Consequências

- A equipe deve homologar migração, logout e troca de conta em builds nativos. A validação em Node usa
  implementações em memória das duas formas de armazenamento.
- O progresso do visitante continua restrito ao aparelho. O progresso escolar entre aparelhos é responsabilidade
  da sincronização da API.

Relacionados: [ADR 0017](0017-acesso-individual-do-aluno.md) · [ADR 0022](0022-conclusao-local-atomica.md) ·
[Expo SecureStore](https://docs.expo.dev/versions/v58.0.0/sdk/securestore/).

## Aprovação da revisão documental

- **Data da revisão e aprovação:** 13/11/2026.
- **Assinatura de aprovação:** Ana Barbiero — Líder de projeto.
- **Registro:** aprovação expressa nesta conversa para organizar e consolidar a documentação.
- **Histórico:** a data original da decisão no cabeçalho foi preservada. Esta assinatura não atribui
  participação retroativa nem reativa decisões substituídas; evidências de homologação continuam separadas.
