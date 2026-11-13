/* global jest */
require("react-native-gesture-handler/jestSetup");

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => true },
  useLocalSearchParams: jest.fn(() => ({})),
  useFocusEffect: jest.fn(),
  Redirect: () => null,
  Link: ({ children }) => children,
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("@/estado/acessibilidade", () => {
  const preferencias = {
    escala: 1,
    dislexia: false,
    voz: false,
    animacoesReduzidas: true,
    altoContraste: false,
    falar: jest.fn(),
  };
  return { useAcessibilidade: () => preferencias, useFalarAoAbrir: jest.fn() };
});

jest.mock("@/lib/acessibilidadeSalva", () => ({ lerPrefs: () => ({ altoContraste: false }) }));

jest.mock("@/estado/jogador", () => {
  const jogador = {
    pronto: true,
    jogador: { nome: "Aluno fictício" },
    desafios: {},
    progresso: {},
    pontosPorNivel: {},
    preferencias: { liberarTodos: true },
    vibrar: jest.fn(),
  };
  return { useJogador: () => jogador, hoje: () => "2026-11-13" };
});

jest.mock("@/estado/conta", () => {
  const conta = {
    pronto: true,
    carregandoAtividades: false,
    online: true,
    iniciarAtividade: jest.fn(async () => {}),
    concluirMissao: jest.fn(async () => ({ pontos: 5, estrelas: 3, nova: true })),
    registrarJogada: jest.fn(async () => {}),
    atividades: [],
    temServidor: true,
    conta: null,
    avisos: [],
    avaliacoes: [],
    identificar: jest.fn(),
    entrar: jest.fn(),
    continuarSemTurma: jest.fn(),
  };
  return { useConta: () => conta };
});

jest.mock("@/lib/navegacao", () => ({ voltar: jest.fn() }));

// Geometria e montagem reais; somente o contexto gráfico é substituído.
// GPU, gestos e ciclo de vida nativo precisam do APK no Android.
jest.mock("@/componentes/3d/Palco3D", () => {
  const React = require("react");
  const { View } = require("react-native");
  const THREE = require("three");
  return {
    Palco3D: ({ montar }) => {
      React.useEffect(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera();
        const limpar = montar({ scene, camera, render: jest.fn(), atingir: () => [] });
        return () => limpar?.();
      }, []);
      return React.createElement(View, { accessibilityLabel: "Cena 3D em teste de componente" });
    },
  };
});
