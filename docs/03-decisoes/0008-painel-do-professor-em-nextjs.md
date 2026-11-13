# ADR 0008 — Painel do professor em Next.js com TypeScript

- **Status:** Aceita
- **Data:** 27/10/2026
- **Decisores originais:** não identificados no registro histórico.
- **Uso de IA:** a decisão foi da equipe. A IA foi usada apenas para levantar as alternativas e os prós e
  contras de cada uma, como apoio à análise.

## Contexto

O app do aluno continua em React Native com Expo ([ADR 0002](0002-react-native-com-expo.md)). Faltava definir a
tecnologia do painel web do professor, que terá login, turmas, desempenho dos alunos, gráficos, o pentagrama de
habilidades e insights. O painel vai consumir a API própria ([ADR 0007](0007-back-end-node-postgresql-railway.md)).

## Decisão

Construir o painel do professor em **Next.js (React) com TypeScript**, no pacote `apps/web` que já existe. O
Next.js será usado **somente como front-end**: as regras e o acesso ao banco ficam na API, que importa o
`packages/core`. Não serão criadas rotas de API dentro do Next.

## Alternativas consideradas

- **React com Vite:** mais simples, mas exigiria montar à mão rotas, layouts e proteção de páginas, que o Next
  já oferece. Como o Next já está configurado no projeto, trocar não compensa.
- **Next.js com rotas de API próprias:** criaria um segundo back-end ao lado da API, duplicando regras e acesso a
  dados.

## Consequências

- **Positivas:** rotas por pastas, como o Expo Router do app (o mesmo modelo para a equipe); layouts
  compartilhados (menu, cabeçalho); middleware para proteger as páginas por login e perfil; tudo em TypeScript e
  no ecossistema React.
- **Negativas:** o Next tem mais conceitos que o React puro (componentes de servidor e de cliente); a equipe
  precisa respeitar a regra de não colocar lógica de negócio no painel.

## Aprovação da revisão documental

- **Data da revisão e aprovação:** 13/11/2026.
- **Assinatura de aprovação:** Ana Barbiero — Líder de projeto.
- **Registro:** aprovação expressa nesta conversa para organizar e consolidar a documentação.
- **Histórico:** a data original da decisão no cabeçalho foi preservada. Esta assinatura não atribui
  participação retroativa nem reativa decisões substituídas; evidências de homologação continuam separadas.
