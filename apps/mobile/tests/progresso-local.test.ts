import assert from "node:assert/strict";
import { it } from "node:test";
import { creditarJogada, progressoVazio, NIVEIS, type ResultadoJogada } from "@modolume/core";
import {
  conciliarProgresso,
  retirarItensRecusados,
  type ControleProgresso,
  type ProgressoRemoto,
} from "../src/estado/progresso-local";

const resultado: ResultadoJogada = {
  id: "jogada-offline",
  missaoId: NIVEIS[0]!.missoes[0]!,
  formato: "completar",
  rodadas: 2,
  acertosDePrimeira: 2,
  tentativas: 2,
  percentualConclusao: 100,
  percentualAcerto: 100,
  tempoSegundos: 10,
  estrelas: 3,
  data: "2026-11-01",
};
const controle: ControleProgresso = {
  versaoProgresso: 2,
  dispositivoId: "aparelho-1",
  movimentos: [{ id: resultado.id!, resultado }],
  comprasPendentes: [],
  revisao: 1,
};
it("confirma o crédito remoto sem reaplicar e conserva uma jogada produzida durante o envio", () => {
  const nova = { ...resultado, id: "produzida-durante-envio" };
  const p = creditarJogada(progressoVazio(), resultado);
  const local = {
    ...creditarJogada(p, nova),
    ...controle,
    movimentos: [...controle.movimentos, { id: nova.id, resultado: nova }],
    resultados: [resultado, nova],
  };
  const remoto: ProgressoRemoto = { ...p, revisao: 2, jogadasConfirmadas: [resultado.id!], resultados: [resultado] };
  const novo = conciliarProgresso(local, remoto);
  assert.deepEqual(novo.pontosPorNivel, local.pontosPorNivel);
  assert.deepEqual(
    novo.movimentos.map((m) => m.id),
    [nova.id],
  );
  assert.equal(novo.resultados.length, 2);
  assert.equal(conciliarProgresso(novo, { ...remoto, revisao: 1 }), novo);
});
it("recusa de compra restaura o saldo e informa o aluno; não esconde os ganhos offline", () => {
  const local = {
    ...creditarJogada(progressoVazio(), resultado),
    ...controle,
    comprasPendentes: ["capa-doces"],
    resultados: [resultado],
    gastos: 20,
    compras: ["capa-doces"],
  };
  const remoto: ProgressoRemoto = { ...progressoVazio(), revisao: 2, jogadasConfirmadas: [], resultados: [] };
  const novo = conciliarProgresso(local, remoto, [], ["capa-doces"]);
  assert.equal(novo.gastos, 0);
  assert.deepEqual(novo.compras, []);
  assert.ok(novo.avisoSincronizacao);
  assert.equal(novo.movimentos.length, 1);
});

it("migração não duplica resultados antigos e uma compra recusada deixa de ser equipada", () => {
  const { id: _id, ...antiga } = resultado;
  const local = { ...progressoVazio(), ...controle, movimentos: [], resultados: [antiga] };
  const remoto: ProgressoRemoto = {
    ...progressoVazio(),
    revisao: 2,
    jogadasConfirmadas: [resultado.id!],
    resultados: [resultado],
  };
  assert.equal(conciliarProgresso(local, remoto).resultados.length, 1);
  assert.deepEqual(
    retirarItensRecusados({ rosto: { acessorio: "catEars", fundo: 6 }, capa: 7 }, [
      "acessorio:catEars",
      "fundo:6",
      "capa-doces",
    ]),
    { rosto: { acessorio: "nenhum", fundo: 0 }, capa: 0 },
  );
});
