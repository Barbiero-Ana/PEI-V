# ADR 0002 — App do aluno em React Native com Expo

- **Status:** Aceita
- **Data:** 07/10/2026
- **Decisores:** _preencher com os nomes da equipe_

## Contexto

O aluno usa celular ou tablet, que pode ser Android ou iOS. As atividades dependem de toque: arrastar, ligar,
girar e montar objetos. A equipe tem pouco tempo e já conhece React.

## Decisão

Construir o app do aluno em React Native com Expo, em TypeScript, usando o Expo Router para a navegação e o
react-native-gesture-handler para os gestos.

## Alternativas consideradas

- **Apps nativos separados (Kotlin e Swift):** dois códigos, duas linguagens novas para a equipe.
- **Flutter:** bom desempenho, mas exigiria aprender Dart e não aproveitaria o núcleo em TypeScript.
- **Só versão web no navegador:** gestos e desempenho piores no celular, sem vibração nem leitura de voz
  integradas.

## Consequências

- **Positivas:** um só código para Android e iOS; teste imediato no celular pelo Expo Go, inclusive a
  distância; instaladores gerados na nuvem (EAS Build), sem precisar de Mac; acesso a voz, vibração e PDF.
- **Negativas:** algumas bibliotecas nativas exigem um build próprio; a publicação nas lojas depende das contas
  de desenvolvedor.
