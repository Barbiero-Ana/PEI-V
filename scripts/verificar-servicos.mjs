import assert from "node:assert/strict";

const servicos = [
  { nome: "API e banco de produção", url: "https://api.modolume.com.br/prontidao", json: true },
  { nome: "Painel da equipe", url: "https://www.modolume.com.br/entrar", json: false },
];
if (process.env.API_URL_HOMOLOGACAO)
  servicos.push({
    nome: "API e banco de homologação",
    url: `${process.env.API_URL_HOMOLOGACAO.replace(/\/$/, "")}/prontidao`,
    json: true,
  });
let falhas = 0;
for (const servico of servicos) {
  let ok = false;
  for (let tentativa = 1; tentativa <= 3 && !ok; tentativa++) {
    try {
      const resposta = await fetch(servico.url, { signal: AbortSignal.timeout(10000) });
      assert.equal(resposta.status, 200);
      if (servico.json) assert.equal((await resposta.json()).ok, true);
      else assert.ok((await resposta.text()).includes("Modolume"));
      ok = true;
    } catch {
      console.error(JSON.stringify({ servico: servico.nome, tentativa, estado: "indisponivel" }));
      if (tentativa < 3) await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  if (!ok) falhas++;
  else console.log(JSON.stringify({ servico: servico.nome, estado: "disponivel" }));
}
if (falhas) process.exitCode = 1;
