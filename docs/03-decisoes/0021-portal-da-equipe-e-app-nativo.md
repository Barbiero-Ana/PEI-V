# ADR 0021 — Portal da equipe e app nativo

- **Status:** Aceita
- **Data:** 09/11/2026
- **Decisores:** equipe do projeto
- **Uso de IA:** registro da decisão e ajuste do encaminhamento no portal.
- **Substitui:** ADR 0018 quanto à página inicial do portal.

## Contexto

A equipe usa o navegador para administrar a instituição e acompanhar a aprendizagem. A experiência do aluno usa
recursos do aparelho, funciona offline e precisa de uma homologação própria no Android e no iOS.

## Decisão

- O app do aluno é distribuído para Android e iOS. O manifesto Expo declara essas duas plataformas.
- A raiz de `apps/web` encaminha para `/entrar`. A sessão determina a área de administrador, coordenação ou
  professor e a API confirma o acesso a cada recurso.
- A demonstração do aluno usa as missões do app e salva dados no aparelho sob uma identidade de visitante.
  O acesso a uma turma continua usando o código pessoal e o PIN.

## Alternativas consideradas

- A raiz institucional com planos comerciais do ADR 0018 foi usada na etapa anterior. Nesta implantação,
  o domínio do painel encaminha diretamente para o acesso da equipe.

## Consequências

- A homologação usa o navegador para os papéis da equipe e um build nativo para o aluno.
- O app e o painel compartilham a API, com sessões e permissões próprias. A demonstração pode ser testada offline.

Relacionados: [ADR 0017](0017-acesso-individual-do-aluno.md) e [ADR 0019](0019-papeis-coordenacao-e-administrador.md).

## Aprovação da revisão documental

- **Data da revisão e aprovação:** 13/11/2026.
- **Assinatura de aprovação:** Ana Barbiero — Líder de projeto.
- **Registro:** aprovação expressa nesta conversa para organizar e consolidar a documentação.
- **Histórico:** a data original da decisão no cabeçalho foi preservada. Esta assinatura não atribui
  participação retroativa nem reativa decisões substituídas; evidências de homologação continuam separadas.
