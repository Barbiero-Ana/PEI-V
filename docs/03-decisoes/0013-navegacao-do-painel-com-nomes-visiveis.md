# ADR 0013 — Navegação do painel com nomes visíveis e agrupados

- **Status:** Aceita
- **Data:** 04/11/2026
- **Decisores originais:** não identificados no registro histórico.
- **Uso de IA:** auxílio na análise da interface pelas heurísticas de Nielsen e pelas leis de Hick e Fitts e na escrita
  do código. A decisão de reorganizar a navegação é da equipe, a partir da orientação do professor orientador.

## Contexto

O painel usava um trilho estreito com oito ícones. O nome de cada seção só aparecia ao passar o mouse, o que não
existe no celular nem no tablet. O professor precisava lembrar o que cada ícone significava (contra a heurística
"reconhecer em vez de lembrar"), escolher entre oito opções iguais (lei de Hick) e, no celular, acertar ícones numa
faixa com rolagem lateral. Os avisos eram um ponto colorido sem número.

## Decisão

- **Telas largas:** menu lateral de 248 px com ícone e nome de cada seção, separado em grupos: Visão geral;
  **Acompanhar** (Turmas, Alunos, Desempenho, Habilidades e insights); **Planejar** (Planos de aula, Calendário,
  Atividades para o app). Cada item ocupa a largura do menu e tem pelo menos 44 px de altura. "Sair do painel" fica no
  rodapé, com texto.
- **Telas estreitas:** faixa no topo com o nome da seção atual e o botão "Menu", que abre uma gaveta com os mesmos
  grupos; fecha com "Fechar", Esc, toque fora ou ao escolher a seção.
- **Avisos:** contador com número ao lado do nome da seção, com texto para o leitor de tela.
- **Teclado:** link "Pular para o conteúdo" no início da página.

As regras gerais ficam nas [[Diretrizes de usabilidade do painel]].

## Alternativas consideradas

- **Manter o trilho de ícones com dica ao passar o mouse:** ocupa menos espaço, mas não funciona no toque e exige
  memorização.
- **Barra de abas inferior no celular:** boa para até 5 seções; com 8, as opções ficariam apertadas ou escondidas em
  "Mais", sem os grupos.
- **Menu superior horizontal:** com 8 seções, quebraria em duas linhas ou exigiria rolagem.

## Consequências

- **Positivas:** o professor reconhece as seções sem decorar; a escolha é feita em dois passos (grupo e seção); alvos
  maiores e na borda da tela; funciona igual no computador, no tablet e no celular.
- **Negativas:** o menu ocupa mais largura no computador (248 px contra 84 px).
- **O que fica pendente:** aplicar o checklist das diretrizes às demais telas e testar com professores na validação.

## Aprovação da revisão documental

- **Data da revisão e aprovação:** 13/11/2026.
- **Assinatura de aprovação:** Ana Barbiero — Líder de projeto.
- **Registro:** aprovação expressa nesta conversa para organizar e consolidar a documentação.
- **Histórico:** a data original da decisão no cabeçalho foi preservada. Esta assinatura não atribui
  participação retroativa nem reativa decisões substituídas; evidências de homologação continuam separadas.
