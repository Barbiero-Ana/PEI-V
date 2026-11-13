import { render, screen, userEvent } from "@testing-library/react-native";
import { router } from "expo-router";
import { useConta } from "@/estado/conta";
import Inicio from "@/app/(abas)";

test("o sino mostra a prévia e leva à lista completa pelo botão Ver todos", async () => {
  const conta = useConta();
  conta.conta = {} as NonNullable<typeof conta.conta>;
  conta.avisos = [
    { id: "aviso-1", titulo: "Orientação de hoje", texto: "Revise a tabuada", lida: false },
    { id: "aviso-2", titulo: "Nova atividade", texto: "Disponível até sexta", lida: true },
  ] as typeof conta.avisos;

  await render(<Inicio />);
  const usuario = userEvent.setup();
  await usuario.press(await screen.findByRole("button", { name: "1 avisos não lidos. Abrir avisos" }));

  expect(screen.getByText("Seus avisos")).toBeVisible();
  expect(screen.getByText("Orientação de hoje")).toBeVisible();
  expect(screen.getByText("Nova atividade")).toBeVisible();
  await usuario.press(screen.getByRole("button", { name: "Ver todos" }));
  expect(router.push).toHaveBeenCalledWith("/avisos");
});
