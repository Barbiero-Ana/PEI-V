import { Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";
import type { Constelacao } from "@modolume/core";
import { cor } from "@/tema";

/**
 * Relatório da semana em PDF (A4), montado como HTML e convertido pelo
 * expo-print. Segue a identidade do app: cores chapadas, Poppins/Inter.
 */

export interface DadosRelatorio {
  nome: string;
  periodo: string;
  avatarSvg: string;
  frase: string;
  lilo: string;
  semana: { letra: string; dia: number; aceso: boolean; hoje: boolean }[];
  diasLuz: number;
  missoes: number;
  estrelas: number;
  acertos: number | null;
  jogadas: { titulo: string; conteudo: string; vezes: number; melhor: number }[];
  constelacoes: { c: Constelacao; acesas: number }[];
}

const escapar = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const ESTRELA = "M12 2.8l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6L3.2 9.2l6.1-.8z";

function estrelas(n: number, tamanho = 16) {
  return Array.from(
    { length: 3 },
    (_, i) =>
      `<svg width="${tamanho}" height="${tamanho}" viewBox="0 0 24 24"><path d="${ESTRELA}" fill="${i < n ? cor.pessego : cor.inativo}"/></svg>`,
  ).join("");
}

/** Miniatura da constelação: estrelas acesas em creme, linhas só entre acesas. */
function ceu(c: Constelacao, acesas: number) {
  const lado = 120;
  const p = (v: number) => 12 + (v / 100) * (lado - 24);
  const linhas = c.ligacoes
    .filter(([a, b]) => a < acesas && b < acesas)
    .map(([a, b]) => {
      const e1 = c.estrelas[a]!;
      const e2 = c.estrelas[b]!;
      return `<line x1="${p(e1.x)}" y1="${p(e1.y)}" x2="${p(e2.x)}" y2="${p(e2.y)}" stroke="${cor.lilas}" stroke-width="1.5"/>`;
    })
    .join("");
  const pontos = c.estrelas
    .map((e, i) =>
      i < acesas
        ? `<circle cx="${p(e.x)}" cy="${p(e.y)}" r="7" fill="#FFF6E8" opacity="0.18"/><circle cx="${p(e.x)}" cy="${p(e.y)}" r="3.6" fill="#FFF6E8"/>`
        : `<circle cx="${p(e.x)}" cy="${p(e.y)}" r="3" fill="none" stroke="#6B74B8" stroke-width="1.2"/>`,
    )
    .join("");
  return `<svg width="${lado}" height="${lado}" viewBox="0 0 ${lado} ${lado}"><rect width="${lado}" height="${lado}" rx="18" fill="#141B57"/>${linhas}${pontos}</svg>`;
}

export function htmlDoRelatorio(d: DadosRelatorio) {
  const dias = d.semana
    .map(
      (s) => `
      <div class="dia">
        <span class="letra${s.hoje ? " hoje" : ""}">${s.letra}</span>
        <div class="bola${s.aceso ? " acesa" : ""}${s.hoje && !s.aceso ? " hoje" : ""}">
          ${s.aceso ? `<svg width="18" height="18" viewBox="0 0 24 24"><path d="${ESTRELA}" fill="${cor.pessego}"/></svg>` : s.dia}
        </div>
      </div>`,
    )
    .join("");

  const jogadas = d.jogadas.length
    ? d.jogadas
        .map(
          (j) => `
        <tr>
          <td><strong>${escapar(j.titulo)}</strong><span>${escapar(j.conteudo)}</span></td>
          <td class="centro">${j.vezes === 1 ? "1 vez" : `${j.vezes} vezes`}</td>
          <td class="direita">${estrelas(j.melhor)}</td>
        </tr>`,
        )
        .join("")
    : `<tr><td colspan="3" class="vazio">Nenhuma missão nesta semana.</td></tr>`;

  const ceus = d.constelacoes
    .map(
      ({ c, acesas }) => `
      <div class="ceu">
        ${ceu(c, acesas)}
        <strong>${escapar(c.nome)}</strong>
        <span>${acesas} de ${c.estrelas.length} estrelas</span>
      </div>`,
    )
    .join("");

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&display=swap" rel="stylesheet" />
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Inter, -apple-system, Roboto, sans-serif; color: ${cor.texto}; background: #FFFFFF; padding: 36px 40px; font-size: 13px; }
  h1, h2, strong { font-family: Poppins, Inter, sans-serif; color: ${cor.tinta}; }
  .faixa { display: flex; align-items: center; gap: 18px; padding: 22px 24px; border-radius: 24px; background: ${cor.roxo}; color: #FFFFFF; }
  .faixa .avatar { width: 84px; height: 84px; border-radius: 50%; border: 4px solid #FFFFFF; overflow: hidden; flex-shrink: 0; }
  .faixa .rotulo { font-size: 12px; color: ${cor.lilasClaro}; }
  .faixa h1 { color: #FFFFFF; font-size: 26px; line-height: 1.2; }
  .faixa .periodo { font-size: 13px; color: ${cor.lilasClaro}; margin-top: 2px; }
  .faixa .marca { margin-left: auto; font-family: Poppins, sans-serif; font-weight: 700; font-size: 16px; opacity: 0.9; }
  .recado { margin-top: 18px; padding: 16px 18px; border-radius: 18px; background: ${cor.pessegoClaro}; }
  .recado p { font-size: 15px; color: ${cor.tinta}; font-weight: 500; }
  .recado span { display: block; margin-top: 4px; font-size: 12px; color: ${cor.textoSuave}; }
  h2 { font-size: 16px; margin: 26px 0 10px; display: flex; justify-content: space-between; align-items: baseline; }
  h2 small { font-family: Inter, sans-serif; font-weight: 400; font-size: 12px; color: ${cor.textoSuave}; }
  .semana { display: flex; justify-content: space-between; padding: 14px 10px; border: 1px solid ${cor.borda}; border-radius: 18px; }
  .dia { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .letra { font-size: 11px; font-weight: 600; color: ${cor.textoSuave}; }
  .letra.hoje { color: ${cor.roxo}; }
  .bola { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: ${cor.fundo}; color: ${cor.textoFraco}; font-size: 12px; }
  .bola.acesa { background: ${cor.pessegoClaro}; border: 2px solid ${cor.pessego}; }
  .bola.hoje { border: 2px dashed ${cor.roxo}; }
  .numeros { display: flex; margin-top: 18px; }
  .numero { flex: 1; text-align: center; padding: 6px 0; }
  .numero + .numero { border-left: 1px solid ${cor.borda}; }
  .numero strong { display: block; font-size: 28px; line-height: 1.2; }
  .numero span { font-size: 12px; color: ${cor.textoSuave}; }
  table { width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid ${cor.borda}; border-radius: 18px; overflow: hidden; }
  td { padding: 12px 16px; border-top: 1px solid ${cor.borda}; vertical-align: middle; }
  tr:first-child td { border-top: none; }
  td strong { display: block; font-size: 14px; }
  td span { font-size: 12px; color: ${cor.textoSuave}; }
  td.centro { text-align: center; color: ${cor.textoSuave}; white-space: nowrap; }
  td.direita { text-align: right; white-space: nowrap; }
  td.vazio { color: ${cor.textoSuave}; }
  .ceus { display: flex; gap: 14px; flex-wrap: wrap; }
  .ceu { width: 120px; }
  .ceu strong { display: block; margin-top: 6px; font-size: 13px; }
  .ceu span { font-size: 11px; color: ${cor.textoSuave}; }
  .rodape { margin-top: 30px; padding-top: 14px; border-top: 1px solid ${cor.borda}; display: flex; justify-content: space-between; font-size: 11px; color: ${cor.textoSuave}; }
</style>
</head>
<body>
  <div class="faixa">
    <div class="avatar">${d.avatarSvg}</div>
    <div>
      <div class="rotulo">Relatório da semana</div>
      <h1>A semana de ${escapar(d.nome)}</h1>
      <div class="periodo">${escapar(d.periodo)}</div>
    </div>
    <div class="marca">Modolume</div>
  </div>

  <div class="recado">
    <p>${escapar(d.frase)}</p>
    <span>${escapar(d.lilo)}</span>
  </div>

  <h2>Dias de luz <small>${d.diasLuz} de 7</small></h2>
  <div class="semana">${dias}</div>

  <div class="numeros">
    <div class="numero"><strong>${d.missoes}</strong><span>${d.missoes === 1 ? "missão jogada" : "missões jogadas"}</span></div>
    <div class="numero"><strong>${d.estrelas}</strong><span>estrelas ganhas</span></div>
    <div class="numero"><strong>${d.acertos === null ? "—" : `${d.acertos}%`}</strong><span>acertos de primeira</span></div>
  </div>

  <h2>O que jogou</h2>
  <table>${jogadas}</table>

  ${d.constelacoes.length ? `<h2>Céu em construção</h2><div class="ceus">${ceus}</div>` : ""}

  <div class="rodape">
    <span>Os resultados são referências para acompanhar, não uma nota.</span>
    <span>Modolume · ideias que se iluminam</span>
  </div>
</body>
</html>`;
}

/** Gera o PDF e abre o compartilhamento do sistema (na web, abre a impressão). */
export async function compartilharRelatorio(d: DadosRelatorio) {
  const html = htmlDoRelatorio(d);
  if (Platform.OS === "web") {
    await Print.printAsync({ html });
    return;
  }

  // O PDF vem em base64 e é gravado na pasta de cache do próprio app: o
  // arquivo temporário do expo-print fica fora dela e, no Expo Go, não pode
  // ser lido pelo compartilhamento. De quebra, ganha um nome legível.
  const { base64 } = await Print.printToFileAsync({ html, width: 595, height: 842, base64: true });
  if (!base64) throw new Error("O PDF veio vazio.");
  const nome = `Modolume - semana de ${d.nome.replace(/[^\p{L}\p{N} ]/gu, "").trim() || "aluno"}.pdf`;
  const arquivo = new File(Paths.cache, nome);
  if (arquivo.exists) arquivo.delete();
  arquivo.create();
  arquivo.write(base64, { encoding: "base64" });

  await Sharing.shareAsync(arquivo.uri, {
    mimeType: "application/pdf",
    UTI: "com.adobe.pdf",
    dialogTitle: "Relatório da semana",
  });
}
