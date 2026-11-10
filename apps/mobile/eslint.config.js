// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    // Os callbacks do react-native-gesture-handler (.onStart/.onUpdate/.onEnd)
    // rodam quando o dedo se move, não durante a renderização. A regra não sabe
    // disso e acusa a leitura de refs neles. Os demais usos de ref nestes
    // arquivos seguem o padrão useUltimo (atualizado em efeito).
    files: [
      "src/lib/arraste.tsx",
      "src/componentes/3d/Palco3D.tsx",
      "src/componentes/jogos/*.tsx",
    ],
    rules: { "react-hooks/refs": "off" },
  },
]);
