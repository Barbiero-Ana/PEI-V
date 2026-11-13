import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

const base = process.env.API_URL_HOMOLOGACAO?.replace(/\/$/, "");
assert.ok(
  base && new URL(base).protocol === "https:" && new URL(base).hostname !== "api.modolume.com.br",
  "Defina a API HTTPS isolada; produção é recusada.",
);
const senha = process.env.SENHA_DEMO,
  pin = process.env.PIN_HOMOLOGACAO;
assert.ok(senha && pin, "Carregue as credenciais privadas da homologação.");
async function chamar(caminho, token, corpo, metodo = corpo === undefined ? "GET" : "POST") {
  const r = await fetch(base + caminho, {
    method: metodo,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(corpo !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
    signal: AbortSignal.timeout(30000),
  });
  assert.ok(
    r.ok,
    `${metodo} ${caminho}: HTTP ${r.status}, requisição ${r.headers.get("x-request-id") ?? "sem código"}`,
  );
  return r.json();
}
const saude = await chamar("/prontidao");
assert.equal(saude.ambiente, "homologacao", "A API não confirmou o ambiente de dados fictícios.");
const professor = await chamar("/auth/professor", undefined, { email: "marina.alves@escola.example", senha });
const dados = await chamar("/professor/dados", professor.token);
const estudante = dados.alunos[0];
assert.ok(estudante?.codigoAcesso && estudante.turmaId);
const aluno = await chamar("/auth/aluno", undefined, { codigo: estudante.codigoAcesso, pin });
const hoje = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());
const entrada = {
  titulo: `Homologação automática ${new Date().toISOString()}`,
  formato: "objetiva",
  instrucao: "Escolha a alternativa correta.",
  habilidade: "",
  missaoId: "",
  planoId: "",
  turmas: [estudante.turmaId],
  liberarEm: hoje,
  prazo: "",
  questoes: [
    {
      tipo: "objetiva",
      enunciado: "Quanto é dois mais dois?",
      alternativas: ["4", "5"],
      correta: 0,
      feedbackErro: "Some dois grupos de dois.",
    },
  ],
};
const atividade = await chamar("/professor/atividades", professor.token, entrada);
const publicada = await chamar(`/professor/atividades/${atividade.id}/envio`, professor.token, { enviar: true });
assert.ok(publicada.publicacaoId);
const entrega = {
  id: randomUUID(),
  publicacaoId: publicada.publicacaoId,
  origem: "professor",
  atividadeId: atividade.id,
  missaoId: atividade.id,
  titulo: entrada.titulo,
  formato: "objetiva",
  rodadas: 1,
  acertosDePrimeira: 1,
  tentativas: 1,
  percentualConclusao: 100,
  percentualAcerto: 100,
  tempoSegundos: 12,
  estrelas: 3,
  dicas: 0,
  data: hoje,
  fases: [{ ordem: 1, tentativas: 1, tempoSegundos: 12, dica: false }],
};
const corpo = { dispositivoId: `homolog-${randomUUID()}`, jogadas: [entrega], compras: [] };
assert.deepEqual((await chamar("/aluno/sincronizar", aluno.token, corpo)).recebidas, [entrega.id]);
assert.deepEqual((await chamar("/aluno/sincronizar", aluno.token, corpo)).recebidas, [entrega.id]);
const detalhe = await chamar(`/professor/atividades/${atividade.id}/alunos/${estudante.id}`, professor.token);
assert.equal(detalhe.jogadas.length, 1);
assert.equal(detalhe.jogadas[0].publicacaoId, publicada.publicacaoId);
const avaliacao = {
  id: randomUUID(),
  jogadaId: entrega.id,
  feedback: "Confira sua resposta somando os dois grupos. Muito bem!",
  publicar: true,
  percepcao: null,
};
await chamar(`/professor/atividades/${atividade.id}/alunos/${estudante.id}/avaliacoes`, professor.token, avaliacao);
const avisos = await chamar("/aluno/avisos", aluno.token);
assert.ok(avisos.avisos.some((a) => a.avaliacaoId === avaliacao.id));
console.log(
  JSON.stringify({
    resultado: "aprovado",
    ambiente: "homologacao",
    percurso: "professor publica → aluno responde uma vez → painel consulta → devolutiva e aviso",
    atividadeId: atividade.id,
    publicacaoId: publicada.publicacaoId,
  }),
);
