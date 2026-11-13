import { render, screen, userEvent } from "@testing-library/react-native";
import { useConta } from "@/estado/conta";
import Entrar from "@/app/entrar";

beforeEach(() => jest.clearAllMocks());

test("código inválido não chama a API e mantém orientação visível", async () => {
  const conta = useConta();
  await render(<Entrar />);
  const usuario = userEvent.setup();
  await usuario.type(screen.getByLabelText("Código de acesso"), "ABC");
  await usuario.press(screen.getByRole("button", { name: "Continuar" }));
  expect(screen.getByText("Confira o código. O formato novo é BDFH-2468.")).toBeVisible();
  expect(conta.identificar).not.toHaveBeenCalled();
});

test("formata o código, identifica e envia o PIN uma vez", async () => {
  const conta = useConta();
  jest.mocked(conta.identificar).mockResolvedValue({ primeiroNome: "Ana", turma: "Turma fictícia", criarPin: false });
  jest.mocked(conta.entrar).mockResolvedValue(undefined);
  await render(<Entrar />);
  const usuario = userEvent.setup();
  await usuario.type(screen.getByLabelText("Código de acesso"), "BDFH2468");
  expect(screen.getByLabelText("Código de acesso")).toHaveDisplayValue("BDFH-2468");
  await usuario.press(screen.getByRole("button", { name: "Continuar" }));
  expect(await screen.findByText("Digite o seu PIN")).toBeVisible();
  for (const numero of "2468") await usuario.press(screen.getByRole("button", { name: numero }));
  expect(conta.identificar).toHaveBeenCalledWith("BDFH2468");
  expect(conta.entrar).toHaveBeenCalledTimes(1);
  expect(conta.entrar).toHaveBeenCalledWith("BDFH2468", "2468");
});
