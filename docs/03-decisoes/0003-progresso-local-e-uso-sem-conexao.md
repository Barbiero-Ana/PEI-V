# ADR 0003 — Progresso salvo no aparelho e uso sem conexão

- **Status:** Aceita
- **Data:** 07/10/2026
- **Decisores:** _preencher com os nomes da equipe_

## Contexto

A internet nas escolas costuma ser instável. Uma jogada perdida por queda de conexão frustra o aluno e apaga um
dado que o professor usaria. Além disso, o MVP precisava ser validado antes de existir um servidor.

## Decisão

Salvar o progresso no próprio aparelho (AsyncStorage) e permitir jogar sem internet. As preferências de
acessibilidade ficam num armazenamento síncrono (expo-sqlite), lido antes da primeira tela. Quando houver
back-end, as jogadas feitas sem conexão serão enviadas ao servidor assim que a conexão voltar.

## Alternativas consideradas

- **Tudo direto no servidor:** depende de internet o tempo todo e impediria validar o app antes do back-end.

## Consequências

- **Positivas:** o app funciona em qualquer lugar; o MVP pôde ser testado sem servidor; o formato da jogada
  (`ResultadoJogada`) já é o mesmo que será enviado à API.
- **Negativas:** até existir sincronização, o progresso fica preso ao aparelho; trocar de celular perde os
  dados.
- **Pendente:** implementar a sincronização e a recuperação do progresso em outro aparelho.
