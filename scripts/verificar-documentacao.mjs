import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const engenharia = resolve(raiz, "docs/08-engenharia");
const ler = (arquivo) => readFileSync(arquivo, "utf8").replaceAll("\r\n", "\n");
const arquivos = ["README.md", "matriz.md"];
for (const pasta of readdirSync(engenharia).filter((nome) => /^prd-\d{2}$/.test(nome)))
  for (const nome of readdirSync(resolve(engenharia, pasta)).filter((nome) => nome.endsWith(".md")))
    arquivos.push(`${pasta}/${nome}`);
const antes = new Map(arquivos.map((nome) => [nome, ler(resolve(engenharia, nome))]));
execFileSync(process.execPath, [resolve(raiz, "scripts/gerar-rastreabilidade.mjs")], { stdio: "inherit" });
for (const [nome, texto] of antes)
  assert.equal(ler(resolve(engenharia, nome)), texto, `Rastreabilidade desatualizada: ${nome}. Regenere e versione.`);

const decisoes = resolve(raiz, "docs/03-decisoes");
const indice = ler(resolve(decisoes, "Índice de ADRs.md"));
for (const nome of readdirSync(decisoes).filter((nome) => /^\d{4}-/.test(nome) && !nome.startsWith("0000"))) {
  const texto = ler(resolve(decisoes, nome));
  const data = texto.match(/^- \*\*Data:\*\* (\d{2}\/\d{2}\/\d{4})$/m)?.[1];
  assert.ok(data, `Data original ausente: ${nome}`);
  const linha = indice.split("\n").find((linha) => linha.includes(`](${nome})`));
  assert.ok(linha?.endsWith(`| ${data} |`), `Data divergente no índice: ${nome}`);
  assert.match(texto, /\*\*Assinatura de aprovação:\*\* .+/, `Aprovação documental ausente: ${nome}`);
}
console.log("OK: PRDs de requisitos reproduzíveis e datas originais das ADRs consistentes com o índice.");
