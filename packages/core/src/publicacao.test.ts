import { describe, expect, it } from "vitest";
import { ATIVIDADES_EXEMPLO, conteudoDaPublicacao } from "./atividades-professor";

describe("conteúdo de uma publicação", () => {
  const original = ATIVIDADES_EXEMPLO.find((a) => a.questoes.length > 0)!;
  it("preserva o conteúdo ao ajustar somente o prazo e a ordem dos destinatários", () => {
    expect(conteudoDaPublicacao({ ...original, prazo: "2026-12-31", turmas: [...original.turmas].reverse() })).toBe(
      conteudoDaPublicacao(original),
    );
  });
  it("distingue alterações pedagógicas mesmo quando o formato permanece igual", () => {
    expect(conteudoDaPublicacao({ ...original, titulo: "Outra proposta pedagógica" })).not.toBe(
      conteudoDaPublicacao(original),
    );
    expect(conteudoDaPublicacao({ ...original, questoes: [...original.questoes, original.questoes[0]!] })).not.toBe(
      conteudoDaPublicacao(original),
    );
  });
});
