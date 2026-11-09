import assert from "node:assert/strict";
import { it } from "node:test";
import { esquemaJogada, referenciaDaJogadaValida } from "./jogada.js";

const valida = {
  id: "jogada-123",
  origem: "mapa",
  missaoId: "missao",
  titulo: "Missão",
  formato: "objetiva",
  rodadas: 5,
  acertosDePrimeira: 4,
  tentativas: 6,
  percentualConclusao: 100,
  percentualAcerto: 80,
  tempoSegundos: 30,
  estrelas: 2,
  dicas: 1,
  data: "2026-11-08",
};
it("recusa resultados contraditórios antes da persistência", () => {
  assert.ok(esquemaJogada.safeParse(valida).success);
  for (const mudanca of [
    { rodadas: 0 },
    { acertosDePrimeira: 6 },
    { tentativas: 5 },
    { percentualAcerto: 100 },
    { estrelas: 3 },
    { data: "2026-02-31" },
    { origem: "professor" },
    { atividadeId: "atividade" },
  ]) {
    assert.equal(esquemaJogada.safeParse({ ...valida, ...mudanca }).success, false, JSON.stringify(mudanca));
  }
});
it("não aceita atividade alheia, missão inexistente ou formato trocado", () => {
  const jogada = esquemaJogada.parse(valida);
  assert.equal(referenciaDaJogadaValida(jogada, undefined, undefined), false);
  assert.equal(referenciaDaJogadaValida(jogada, { formatoId: "sequencia" }, undefined), false);
  assert.equal(referenciaDaJogadaValida(jogada, { formatoId: "objetiva" }, undefined), true);
  const propria = esquemaJogada.parse({
    ...valida,
    origem: "professor",
    atividadeId: "atividade",
    missaoId: "atividade",
  });
  assert.equal(referenciaDaJogadaValida(propria, undefined, undefined), false);
  assert.equal(referenciaDaJogadaValida(propria, undefined, { formato: "objetiva", missaoId: null }), true);
  assert.equal(referenciaDaJogadaValida(propria, undefined, { formato: "sequencia", missaoId: null }), false);
});
