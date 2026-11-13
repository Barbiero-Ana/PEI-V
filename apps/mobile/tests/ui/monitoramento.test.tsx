describe("Monitoramento opcional na abertura", () => {
  test("sem DSN não executa o SDK nem impede carregar a aplicação", () => {
    const anterior = process.env.EXPO_PUBLIC_SENTRY_DSN;
    delete process.env.EXPO_PUBLIC_SENTRY_DSN;
    const carregar = jest.fn(() => {
      throw new Error("SDK não deveria ser executado");
    });
    jest.doMock("@sentry/react-native", carregar);
    try {
      jest.isolateModules(() => {
        const { monitorarRaiz, registrarFalha } = require("@/lib/monitoramento");
        const componente = () => null;
        expect(monitorarRaiz(componente)).toBe(componente);
        expect(() => registrarFalha(new Error("falha de teste"))).not.toThrow();
      });
      expect(carregar).not.toHaveBeenCalled();
    } finally {
      if (anterior === undefined) delete process.env.EXPO_PUBLIC_SENTRY_DSN;
      else process.env.EXPO_PUBLIC_SENTRY_DSN = anterior;
      jest.dontMock("@sentry/react-native");
    }
  });
});
