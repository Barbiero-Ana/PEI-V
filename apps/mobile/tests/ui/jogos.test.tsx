import { render, screen, userEvent } from "@testing-library/react-native";
import { MISSOES, type Missao } from "@modolume/core";
import { Partida } from "@/componentes/Partida";
import { GestureHandlerRootView } from "react-native-gesture-handler";

describe("Renderização das fases reais do catálogo", () => {
  for (const missao of MISSOES) {
    test.each(missao.rodadas.map((rodada, indice) => ({ rodada, indice })))(
      `${missao.id}: fase $indice abre, mostra a dica e desmonta`,
      async ({ rodada }) => {
        const fase = { ...missao, rodadas: [rodada] } as Missao;
        const tela = await render(
          <GestureHandlerRootView>
            <Partida missao={fase} />
          </GestureHandlerRootView>,
        );
        expect(screen.getByText(rodada.cenario)).toBeVisible();
        const usuario = userEvent.setup();
        await usuario.press(screen.getByRole("button", { name: "Pedir dica" }));
        expect(screen.getByText(rodada.dica)).toBeVisible();
        await usuario.press(screen.getByRole("button", { name: "Esconder dica" }));
        expect(screen.queryByText(rodada.dica)).not.toBeOnTheScreen();
        await tela.unmount();
      },
    );
  }
});
