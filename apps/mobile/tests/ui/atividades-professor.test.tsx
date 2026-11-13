import { render, screen, userEvent } from "@testing-library/react-native";
import { useLocalSearchParams } from "expo-router";
import { type Questao } from "@modolume/core";
import { useConta, type AtividadeDoProfessor } from "@/estado/conta";
import Atividade from "@/app/atividade/[id]";

const feedbackErro = "Separe os grupos e confira a quantidade de cada um.";
const questoes: Questao[] = [
  { tipo: "objetiva", enunciado: "Quanto é dois mais dois?", alternativas: ["4", "5"], correta: 0, feedbackErro },
  { tipo: "completar", comando: "Complete a conta", texto: "Metade de quatro é [2].", feedbackErro },
  {
    tipo: "associacao-visual",
    comando: "Ligue os pares",
    pares: [
      { a: "Um", b: "1" },
      { a: "Dois", b: "2" },
    ],
    feedbackErro,
  },
  { tipo: "sequencia", comando: "Ordene os números", itens: ["Um", "Dois", "Três"], feedbackErro },
];

function atividade(q: Questao): AtividadeDoProfessor {
  return {
    id: "atividade-teste",
    publicacaoId: "publicacao-teste-1",
    publicacaoNumero: 1,
    titulo: "Atividade fictícia",
    formato: q.tipo,
    instrucao: "Resolva a questão.",
    habilidade: "",
    missaoId: "",
    questoes: [q],
    liberarEm: "2020-01-01",
    feita: null,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useLocalSearchParams).mockReturnValue({ id: "atividade-teste" });
});

test.each(questoes)("$tipo: conclui e registra uma única jogada ligada à publicação", async (q) => {
  const conta = useConta();
  conta.atividades = [atividade(q)];
  await render(<Atividade />);
  const usuario = userEvent.setup();
  await usuario.press(screen.getByRole("button", { name: "Conferir" }));
  expect(conta.registrarJogada).not.toHaveBeenCalled();
  if (q.tipo === "objetiva") {
    await usuario.press(screen.getByRole("radio", { name: /5/ }));
    await usuario.press(screen.getByRole("button", { name: "Conferir" }));
    expect(screen.getByText(feedbackErro)).toBeVisible();
    expect(screen.getByLabelText("Lilo com expressão de dúvida")).toBeVisible();
    await usuario.press(screen.getByRole("radio", { name: /4/ }));
  } else if (q.tipo === "completar") {
    await usuario.type(screen.getByLabelText("Espaço 1"), "2");
  } else if (q.tipo === "associacao-visual") {
    for (const par of q.pares) {
      await usuario.press(screen.getByRole("button", { name: par.a }));
      await usuario.press(screen.getByRole("button", { name: par.b }));
    }
  } else {
    for (const item of q.itens) await usuario.press(screen.getByRole("button", { name: item }));
  }
  await usuario.press(screen.getByRole("button", { name: "Conferir" }));
  expect(screen.getByText("Isso mesmo!")).toBeVisible();
  await usuario.press(screen.getByRole("button", { name: "Ver resultado" }));
  expect(await screen.findByText("Atividade concluída!")).toBeVisible();
  expect(conta.registrarJogada).toHaveBeenCalledTimes(1);
  expect(conta.registrarJogada).toHaveBeenCalledWith(
    expect.objectContaining({ rodadas: 1 }),
    expect.objectContaining({
      atividadeId: "atividade-teste",
      publicacaoId: "publicacao-teste-1",
      origem: "professor",
    }),
  );
});

test("atividade incompleta ou sem publicação exibe recuperação em vez de quebrar a tela", async () => {
  const conta = useConta();
  conta.atividades = [{ ...atividade(questoes[0]!), publicacaoId: undefined, questoes: [] }];
  await render(<Atividade />);
  expect(screen.getByText("Não foi possível abrir esta atividade")).toBeVisible();
  expect(conta.iniciarAtividade).not.toHaveBeenCalled();
  expect(conta.registrarJogada).not.toHaveBeenCalled();
});
