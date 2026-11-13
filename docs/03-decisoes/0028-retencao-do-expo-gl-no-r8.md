# ADR 0028 — Preservar expo-gl em APKs Android otimizados

- **Status:** Aceita; correção validada no APK 5 em emulador Android em 13/11/2026
- **Data:** 13/11/2026
- **Decisores:** Ana Barbiero — Líder de projeto
- **Uso de IA:** reproduzir o crash, comparar mitigação e aplicar a regra de build.

## Contexto

O APK Android código 4 encerrou ao abrir “Cubinhos escondidos”. O log nativo apontou falha ao instanciar
uma view de módulo Expo. A implementação do `expo-gl` cria `GLView` por reflexão; a otimização R8 do
SDK 58 removeu o construtor dessa classe, embora os testes JavaScript e a compilação do APK passassem.
O mesmo comportamento e a mitigação foram relatados para builds de release com SDK 58 em
[
expo/expo #51948](https://github.com/expo/expo/issues/51948).

## Decisão

Manter a otimização R8 e acrescentar pelo `expo-build-properties` a regra
`-keep class expo.modules.gl.** { *; }`. O próximo APK deve usar um `versionCode` novo e ser instalado
para confirmar a abertura e a interação das cenas 3D.

## Alternativas consideradas

- **Desativar R8:** evita a remoção reflexiva, mas amplia desnecessariamente o tamanho e reduz a otimização
  de todas as dependências Android.
- **Não incluir jogos 3D no APK:** evita o caminho que fecha o app, mas remove conteúdo pedagógico publicado.

## Consequências

- **Positivas:** preserva as classes nativas usadas pelo `expo-gl` e mantém R8 ativo para o restante do APK.
- **Negativas:** as classes do pacote `expo-gl` não serão reduzidas ou renomeadas por R8.
- **O que fica pendente:** repetir em aparelho físico. O APK código 5 concluiu as quatro fases de Cubinhos escondidos no emulador, com sincronização confirmada e sem crash do processo. Testes de componente
  não comprovam inicialização de `GLView` em release.

## Aprovação da revisão documental

- **Data da revisão e aprovação:** 13/11/2026.
- **Assinatura de aprovação:** Ana Barbiero — Líder de projeto.
- **Escopo:** decisão e mitigação registradas; reteste do APK 5 aprovado no emulador; aceite em aparelho físico permanece pendente.
