import assert from "node:assert/strict";
import { it } from "node:test";
import { codigoAcessoValido, formatarCodigoAcesso, normalizarCodigoAcesso } from "@modolume/core";
import { gerarCodigoAcesso } from "./codigo-acesso.js";

it("emite códigos no formato de quatro letras e quatro números sem caracteres ambíguos", () => {
  for (let tentativa = 0; tentativa < 40; tentativa++) {
    const codigo = gerarCodigoAcesso();
    assert.match(codigo, /^[A-HJKMNP-Z]{4}[2-9]{4}$/);
    assert.equal(formatarCodigoAcesso(codigo), `${codigo.slice(0, 4)}-${codigo.slice(4)}`);
  }
});

it("normaliza a leitura sem invalidar códigos anteriores ou aceitar caracteres extras", () => {
  for (const entrada of ["bdfh-2468", "BDFH 2468", " BDFH2468 "]) {
    const codigo = normalizarCodigoAcesso(entrada);
    assert.equal(codigo, "BDFH2468");
    assert.ok(codigoAcessoValido(codigo));
  }
  assert.ok(codigoAcessoValido(normalizarCodigoAcesso("u4zh-aem5")));
  for (const entrada of ["BDFH-246", "BDFH-24680", "BDFH-2461", "BDFH-2468!", "BDFH-2I68"]) {
    assert.equal(codigoAcessoValido(normalizarCodigoAcesso(entrada)), false, entrada);
  }
  assert.equal(formatarCodigoAcesso("BDFH-2468"), "BDFH-2468");
});
