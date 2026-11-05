"use client";

import Link from "next/link";
import { startTransition, useActionState, useState, type ReactNode } from "react";
import { FORMATOS_ATIVIDADE } from "@modolume/core";
import { gravarAtividade, type EstadoAtividade } from "@/app/professor/(painel)/atividades/acoes";
import type { DadosAtividade, FormatoEditavel, Questao } from "@/lib/painel/atividades";
import type { OpcoesPlanejamento } from "@/lib/painel/dados";
import type { AtividadeApp } from "@/lib/painel/sugestoes";
import { CelularPrevia, PreviaQuestao } from "./previa-atividade";

const ENTRADA =
  "w-full rounded-xl border border-[#D9D4EC] bg-superficie px-3 text-sm text-tinta outline-none focus:border-roxo";
const rotuloFormato = (id: string) => FORMATOS_ATIVIDADE.find((f) => f.id === id)?.rotulo ?? id;
const botaoPequeno =
  "h-8 rounded-full border border-[#D9D4EC] px-3 text-xs font-semibold text-tinta disabled:opacity-40";

const ETAPAS = [
  { nome: "Atividade", ajuda: "Formato, título e instrução" },
  { nome: "Questões", ajuda: "Monte e confira cada uma" },
  { nome: "Envio", ajuda: "Turmas, data e revisão" },
] as const;
/** Em que etapa cada campo com erro do servidor é corrigido. */
const etapaDoErro = (campo: string) =>
  campo.startsWith("questoes") || campo === "missaoId" ? 1 : campo === "turmas" || campo === "liberarEm" ? 2 : 0;

/** Questão vazia de cada formato, para começar a montar. */
function vazia(formato: FormatoEditavel): Questao | null {
  switch (formato) {
    case "objetiva":
      return { tipo: "objetiva", enunciado: "", alternativas: ["", "", "", ""], correta: 0 };
    case "completar":
      return { tipo: "completar", comando: "", texto: "" };
    case "associacao-visual":
      return {
        tipo: "associacao-visual",
        comando: "",
        pares: [
          { a: "", b: "" },
          { a: "", b: "" },
          { a: "", b: "" },
        ],
      };
    case "sequencia":
      return { tipo: "sequencia", comando: "", itens: ["", "", ""] };
    default:
      return null;
  }
}

/** Nome curto da questão na lista lateral: o comando ou o enunciado, se houver. */
function rotuloDaQuestao(q: Questao, i: number) {
  const texto = q.tipo === "objetiva" ? q.enunciado : q.comando;
  return texto?.trim() || `Questão ${i + 1}`;
}

/** A questão está completa o suficiente para ir ao app? (mesmas regras do servidor) */
function completa(q: Questao) {
  switch (q.tipo) {
    case "objetiva":
      return (
        q.enunciado.trim().length >= 3 && q.alternativas.every((a) => a.trim()) && q.correta < q.alternativas.length
      );
    case "completar":
      return /\[[^\]]+\]/.test(q.texto);
    case "associacao-visual":
      return q.pares.length >= 2 && q.pares.every((p) => p.a.trim() && p.b.trim());
    case "sequencia":
      return q.itens.length >= 3 && q.itens.every((x) => x.trim());
  }
}

const Erro = ({ msg }: { msg?: string }) =>
  msg ? <p className="mt-1.5 text-xs font-medium text-alerta">{msg}</p> : null;

function Campo({ rotulo, ajuda, children }: { rotulo: string; ajuda?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold text-tinta">
      {rotulo}
      {ajuda ? <span className="-mt-1 text-xs font-normal text-texto-suave">{ajuda}</span> : null}
      {children}
    </label>
  );
}

interface Props {
  inicial: DadosAtividade;
  id?: string;
  turmas: OpcoesPlanejamento;
  planos: { id: string; rotulo: string }[];
  habilidades: readonly { codigo: string; resumo: string }[];
  missoes: AtividadeApp[];
  sobre: Record<FormatoEditavel, { nome: string; descricao: string; exemplo: string }>;
}

export function EditorAtividade({ inicial, id, turmas, planos, habilidades, missoes, sobre }: Props) {
  const [estado, acao, enviando] = useActionState<EstadoAtividade, FormData>(gravarAtividade, {
    erros: {},
    tentativa: 0,
  });
  const [dados, setDados] = useState<DadosAtividade>(inicial);
  const [etapa, setEtapa] = useState(0);
  const [aviso, setAviso] = useState("");
  // questões guardadas por formato: trocar de formato não apaga o que já foi montado
  const [porFormato, setPorFormato] = useState<Partial<Record<FormatoEditavel, Questao[]>>>({
    [inicial.formato]: inicial.questoes,
  });
  const [atual, setAtual] = useState(0);
  // campos mexidos depois do último envio com erro: a mensagem deles some
  const [mexidos, setMexidos] = useState<string[]>([]);
  const [tentativaVista, setTentativaVista] = useState(estado.tentativa);
  if (tentativaVista !== estado.tentativa) {
    setTentativaVista(estado.tentativa);
    setMexidos([]);
    const primeiro = Object.keys(estado.erros)[0];
    if (primeiro !== undefined) setEtapa(etapaDoErro(primeiro));
  }
  const e = Object.fromEntries(
    Object.entries(estado.erros).filter(([k]) => !mexidos.some((m) => k === m || k.startsWith(`${m}.`))),
  );
  const mexeu = (...campos: string[]) => setMexidos((m) => [...m, ...campos]);

  const questoes = dados.questoes;
  const indice = Math.min(atual, Math.max(0, questoes.length - 1));
  const questao = questoes[indice];
  const mudar = (parcial: Partial<DadosAtividade>) => {
    mexeu(...Object.keys(parcial));
    setDados((d) => ({ ...d, ...parcial }));
  };
  const mudarQuestoes = (q: Questao[]) => {
    mexeu("questoes");
    setDados((d) => ({ ...d, questoes: q }));
    setPorFormato((p) => ({ ...p, [dados.formato]: q }));
  };
  const mudarQuestao = (q: Questao) => mudarQuestoes(questoes.map((x, j) => (j === indice ? q : x)));
  const trocarFormato = (f: FormatoEditavel) => {
    const guardadas = porFormato[f];
    const nova = vazia(f);
    setDados((d) => ({ ...d, formato: f, questoes: guardadas ?? (nova ? [nova] : []) }));
    setAtual(0);
  };
  const adicionar = () => {
    const nova = vazia(dados.formato);
    if (!nova) return;
    mudarQuestoes([...questoes, nova]);
    setAtual(questoes.length);
  };

  const turmaRef = turmas.find((t) => dados.turmas.includes(t.id)) ?? turmas[0];
  const acertoNo = (formato: string) => turmaRef?.formatos[formato]?.acerto;
  const missao = missoes.find((m) => m.id === dados.missaoId) ?? null;
  const pronta = dados.formato === "pronta";
  const prontas = questoes.filter(completa).length;

  const ir = (n: number) => {
    setAviso("");
    setEtapa(n);
  };
  const avancar = () => {
    if (etapa === 0 && dados.titulo.trim().length < 3) return setAviso("Dê um título à atividade para continuar.");
    if (etapa === 1 && pronta && !missao) return setAviso("Escolha a atividade do app para continuar.");
    if (etapa === 1 && !pronta && questoes.length === 0) return setAviso("Adicione ao menos uma questão.");
    ir(etapa + 1);
  };
  const salvar = (enviar: boolean) => {
    const f = new FormData();
    if (id) f.set("id", id);
    f.set("enviar", enviar ? "sim" : "nao");
    f.set("dados", JSON.stringify(dados));
    startTransition(() => acao(f));
  };

  const erroDaQuestao = (i: number) =>
    e[`questoes.${i}`] ?? Object.entries(e).find(([k]) => k.startsWith(`questoes.${i}.`))?.[1];

  return (
    <div className="flex flex-col gap-5">
      {/* etapas */}
      <ol className="sombra-suave grid grid-cols-3 overflow-hidden rounded-2xl bg-superficie">
        {ETAPAS.map((et, i) => (
          <li key={et.nome} className={i > 0 ? "border-l border-[#EEEBF6]" : ""}>
            <button
              type="button"
              onClick={() => ir(i)}
              aria-current={etapa === i ? "step" : undefined}
              className={`flex w-full items-center gap-3 px-4 py-3.5 text-left ${etapa === i ? "bg-[#F7F5FF]" : ""}`}
            >
              <span
                className={`tnum grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold ${etapa === i ? "bg-roxo-escuro text-white" : i < etapa ? "bg-roxo-claro text-roxo-escuro" : "border border-[#D9D4EC] text-texto"}`}
              >
                {i + 1}
              </span>
              <span className="min-w-0 leading-tight">
                <span className={`block text-sm font-semibold ${etapa === i ? "text-roxo-escuro" : "text-tinta"}`}>
                  {et.nome}
                </span>
                <span className="hidden text-xs text-texto-suave sm:block">{et.ajuda}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>

      {Object.keys(e).length > 0 ? (
        <p role="alert" className="rounded-xl border border-pessego bg-pessego-claro px-4 py-3 text-sm text-tinta">
          {e.geral ?? "Revise os pontos marcados antes de salvar."}
        </p>
      ) : null}

      {/* 1. a atividade */}
      {etapa === 0 ? (
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="sombra-suave rounded-2xl bg-superficie p-5">
            <h2 className="text-lg">Formato</h2>
            <p className="mt-0.5 text-sm text-texto-suave">
              {turmaRef ? `O número é o acerto do ${turmaRef.nome} nesse formato.` : "Como o aluno vai responder."}
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {(Object.keys(sobre) as FormatoEditavel[]).map((f) => {
                const sel = dados.formato === f;
                const acerto = f === "pronta" ? undefined : acertoNo(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => trocarFormato(f)}
                    aria-pressed={sel}
                    className={`grid grid-cols-[18px_1fr_auto] items-start gap-3 rounded-xl border px-4 py-3 text-left ${sel ? "border-roxo bg-[#F7F5FF]" : "border-[#E2DEF0]"}`}
                  >
                    <span
                      className={`mt-0.5 size-[18px] rounded-full border-2 ${sel ? "border-roxo-escuro bg-roxo-escuro shadow-[inset_0_0_0_3px_white]" : "border-[#CFC9E6]"}`}
                      aria-hidden
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-tinta">{sobre[f].nome}</span>
                      <span className="block text-xs text-texto">{sobre[f].descricao}</span>
                      <span className="mt-1 block truncate text-xs text-texto-suave">Ex.: {sobre[f].exemplo}</span>
                    </span>
                    {acerto !== undefined ? (
                      <span
                        className={`tnum text-xs ${acerto < 60 ? "font-semibold text-alerta" : "text-texto-suave"}`}
                      >
                        {Math.round(acerto)}%
                      </span>
                    ) : (
                      <span />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="sombra-suave flex flex-col gap-4 rounded-2xl bg-superficie p-5">
            <h2 className="text-lg">Sobre a atividade</h2>
            <Campo rotulo="Título" ajuda="O nome da atividade, que o aluno vê na lista do app.">
              <input
                value={dados.titulo}
                onChange={(ev) => mudar({ titulo: ev.target.value })}
                placeholder="Ex.: Porcentagem no mercado"
                className={`${ENTRADA} h-11 font-normal`}
              />
              <Erro msg={e.titulo} />
            </Campo>
            <Campo rotulo="Instrução geral" ajuda="Aparece no início. Cada questão pode ter o seu próprio comando.">
              <input
                value={dados.instrucao}
                onChange={(ev) => mudar({ instrucao: ev.target.value })}
                placeholder="Ex.: Leia com calma e responda."
                className={`${ENTRADA} h-11 font-normal`}
              />
            </Campo>
            <Campo rotulo="Habilidade da BNCC">
              <select
                value={dados.habilidade}
                onChange={(ev) => mudar({ habilidade: ev.target.value })}
                className={`${ENTRADA} h-11 font-normal`}
              >
                <option value="">Nenhuma</option>
                {habilidades.map((h) => (
                  <option key={h.codigo} value={h.codigo}>
                    {h.codigo} · {h.resumo}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Plano de aula" ajuda="Ligar a um plano faz a atividade aparecer na aula.">
              <select
                value={dados.planoId}
                onChange={(ev) => mudar({ planoId: ev.target.value })}
                className={`${ENTRADA} h-11 font-normal`}
              >
                <option value="">Sem plano</option>
                {planos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.rotulo}
                  </option>
                ))}
              </select>
              <Erro msg={e.planoId} />
            </Campo>
          </section>
        </div>
      ) : null}

      {/* 2. questões: lista, a questão aberta e a prévia */}
      {etapa === 1 ? (
        pronta ? (
          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <section className="sombra-suave rounded-2xl bg-superficie p-5">
              <h2 className="text-lg">Atividade do app</h2>
              <p className="mt-0.5 text-sm text-texto-suave">
                As atividades interativas já existem no app; escolha qual liberar.
              </p>
              <div className="mt-4 grid max-h-[520px] gap-2 overflow-y-auto pr-1 md:grid-cols-2">
                {missoes.map((m) => {
                  const sel = dados.missaoId === m.id;
                  const acerto = acertoNo(m.formato);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => mudar({ missaoId: m.id })}
                      aria-pressed={sel}
                      className={`rounded-xl border px-3 py-2.5 text-left ${sel ? "border-roxo bg-[#F7F5FF] ring-1 ring-roxo" : "border-[#E2DEF0]"}`}
                    >
                      <span className="block text-sm font-semibold text-tinta">{m.titulo}</span>
                      <span className="block text-xs text-texto-suave">
                        {m.conteudo} · {rotuloFormato(m.formato)}
                        {acerto !== undefined ? ` · turma ${Math.round(acerto)}%` : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
              <Erro msg={e.missaoId} />
            </section>
            <aside className="xl:sticky xl:top-0">
              <CelularPrevia titulo={dados.titulo} instrucao={dados.instrucao} numero={0} total={0}>
                <PreviaQuestao
                  pronta={
                    missao
                      ? { titulo: missao.titulo, conteudo: missao.conteudo, instrucao: dados.instrucao }
                      : { titulo: "Escolha uma atividade", conteudo: "—", instrucao: "" }
                  }
                />
              </CelularPrevia>
            </aside>
          </div>
        ) : (
          <div className="grid items-start gap-5 lg:grid-cols-[220px_minmax(0,1fr)] 2xl:grid-cols-[220px_minmax(0,1fr)_320px]">
            {/* lista de questões */}
            <nav aria-label="Questões" className="sombra-suave rounded-2xl bg-superficie p-3 lg:sticky lg:top-0">
              <p className="px-2 pb-2 text-xs font-semibold text-texto-suave">
                {questoes.length} {questoes.length === 1 ? "questão" : "questões"} · {prontas} completas
              </p>
              <ol className="flex flex-col gap-1">
                {questoes.map((q, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => setAtual(i)}
                      aria-current={i === indice ? "true" : undefined}
                      className={`flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2 text-left ${i === indice ? "bg-roxo-claro" : ""}`}
                    >
                      <span
                        className={`tnum grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold ${erroDaQuestao(i) ? "bg-pessego text-tinta" : completa(q) ? "bg-[#2E9E62] text-white" : "border border-[#CFC9E6] text-texto"}`}
                        title={erroDaQuestao(i) ? "Com erro" : completa(q) ? "Completa" : "Incompleta"}
                      >
                        {i + 1}
                      </span>
                      <span
                        className={`line-clamp-2 text-sm ${i === indice ? "font-semibold text-roxo-escuro" : "text-tinta"}`}
                      >
                        {rotuloDaQuestao(q, i)}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
              <button
                type="button"
                onClick={adicionar}
                className="mt-2 h-9 w-full rounded-xl border border-dashed border-roxo text-sm font-semibold text-roxo-escuro"
              >
                Adicionar questão
              </button>
              <Erro msg={e.questoes} />
            </nav>

            {/* a questão aberta */}
            {questao ? (
              <section className="sombra-suave rounded-2xl bg-superficie p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg">
                    Questão {indice + 1}{" "}
                    <span className="text-sm font-normal text-texto-suave">· {sobre[dados.formato].nome}</span>
                  </h2>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      className={botaoPequeno}
                      disabled={indice === 0}
                      onClick={() => {
                        const n = [...questoes];
                        [n[indice - 1], n[indice]] = [n[indice]!, n[indice - 1]!];
                        mudarQuestoes(n);
                        setAtual(indice - 1);
                      }}
                    >
                      Mover para cima
                    </button>
                    <button
                      type="button"
                      className={botaoPequeno}
                      onClick={() => {
                        mudarQuestoes([
                          ...questoes.slice(0, indice + 1),
                          structuredClone(questao),
                          ...questoes.slice(indice + 1),
                        ]);
                        setAtual(indice + 1);
                      }}
                    >
                      Duplicar
                    </button>
                    <button
                      type="button"
                      className={botaoPequeno}
                      disabled={questoes.length === 1}
                      onClick={() => {
                        mudarQuestoes(questoes.filter((_, j) => j !== indice));
                        setAtual(Math.max(0, indice - 1));
                      }}
                    >
                      Remover
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {questao.tipo !== "objetiva" ? (
                    <Campo rotulo="Comando da questão" ajuda="O que o aluno deve fazer nesta questão.">
                      <input
                        value={questao.comando ?? ""}
                        onChange={(ev) => mudarQuestao({ ...questao, comando: ev.target.value })}
                        placeholder={
                          questao.tipo === "associacao-visual"
                            ? "Ex.: Ligue cada fração ao decimal igual a ela."
                            : questao.tipo === "sequencia"
                              ? "Ex.: Coloque os números do menor para o maior."
                              : "Ex.: Complete com o valor certo."
                        }
                        className={`${ENTRADA} h-11 font-normal`}
                      />
                    </Campo>
                  ) : null}

                  {questao.tipo === "objetiva" ? (
                    <>
                      <Campo rotulo="Enunciado">
                        <textarea
                          rows={3}
                          value={questao.enunciado}
                          onChange={(ev) => mudarQuestao({ ...questao, enunciado: ev.target.value })}
                          placeholder="Ex.: Uma camiseta custa R$ 80 e está com 25% de desconto. Quanto é o desconto?"
                          className={`${ENTRADA} py-2.5 font-normal`}
                        />
                      </Campo>
                      <fieldset>
                        <legend className="mb-1.5 text-sm font-semibold text-tinta">Alternativas</legend>
                        <p className="mb-2 text-xs text-texto-suave">Clique na letra para marcar a correta.</p>
                        <div className="flex flex-col gap-2">
                          {questao.alternativas.map((alt, k) => {
                            const certa = questao.correta === k;
                            return (
                              <div key={k} className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => mudarQuestao({ ...questao, correta: k })}
                                  aria-pressed={certa}
                                  aria-label={`Marcar ${String.fromCharCode(97 + k)} como correta`}
                                  className={`grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold ${certa ? "bg-[#2E9E62] text-white" : "border border-[#D9D4EC] text-tinta"}`}
                                >
                                  {String.fromCharCode(97 + k)}
                                </button>
                                <input
                                  value={alt}
                                  onChange={(ev) =>
                                    mudarQuestao({
                                      ...questao,
                                      alternativas: questao.alternativas.map((a, j) => (j === k ? ev.target.value : a)),
                                    })
                                  }
                                  placeholder={certa ? "Alternativa correta" : "Alternativa"}
                                  className={`${ENTRADA} h-11 ${certa ? "border-[#2E9E62]" : ""}`}
                                />
                                {questao.alternativas.length > 2 ? (
                                  <button
                                    type="button"
                                    aria-label="Remover alternativa"
                                    className="grid size-8 place-items-center text-lg leading-none text-texto-suave"
                                    onClick={() =>
                                      mudarQuestao({
                                        ...questao,
                                        alternativas: questao.alternativas.filter((_, j) => j !== k),
                                        correta:
                                          questao.correta > k ? questao.correta - 1 : certa ? 0 : questao.correta,
                                      })
                                    }
                                  >
                                    ×
                                  </button>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                        {questao.alternativas.length < 5 ? (
                          <button
                            type="button"
                            className={`${botaoPequeno} mt-2`}
                            onClick={() => mudarQuestao({ ...questao, alternativas: [...questao.alternativas, ""] })}
                          >
                            Adicionar alternativa
                          </button>
                        ) : null}
                      </fieldset>
                    </>
                  ) : null}

                  {questao.tipo === "completar" ? (
                    <Campo
                      rotulo="Texto com lacunas"
                      ajuda="Escreva a resposta entre colchetes. Cada [ ] vira um espaço para o aluno."
                    >
                      <textarea
                        rows={3}
                        value={questao.texto}
                        onChange={(ev) => mudarQuestao({ ...questao, texto: ev.target.value })}
                        placeholder="Ex.: 25% de 80 é igual a [20]."
                        className={`${ENTRADA} py-2.5 font-normal`}
                      />
                      <span className="text-xs font-normal text-texto-suave">
                        Respostas:{" "}
                        {[...questao.texto.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]).join(", ") || "nenhuma ainda"}
                      </span>
                    </Campo>
                  ) : null}

                  {questao.tipo === "associacao-visual" ? (
                    <fieldset>
                      <legend className="mb-2 text-sm font-semibold text-tinta">Pares para ligar</legend>
                      <div className="flex flex-col gap-2">
                        {questao.pares.map((par, k) => (
                          <div key={k} className="flex items-center gap-2">
                            <input
                              value={par.a}
                              onChange={(ev) =>
                                mudarQuestao({
                                  ...questao,
                                  pares: questao.pares.map((p, j) => (j === k ? { ...p, a: ev.target.value } : p)),
                                })
                              }
                              placeholder="Ex.: 1/2"
                              className={`${ENTRADA} h-11`}
                            />
                            <span className="text-texto-suave" aria-hidden>
                              ↔
                            </span>
                            <input
                              value={par.b}
                              onChange={(ev) =>
                                mudarQuestao({
                                  ...questao,
                                  pares: questao.pares.map((p, j) => (j === k ? { ...p, b: ev.target.value } : p)),
                                })
                              }
                              placeholder="Ex.: 0,5"
                              className={`${ENTRADA} h-11`}
                            />
                            {questao.pares.length > 2 ? (
                              <button
                                type="button"
                                aria-label="Remover par"
                                className="grid size-8 place-items-center text-lg leading-none text-texto-suave"
                                onClick={() =>
                                  mudarQuestao({ ...questao, pares: questao.pares.filter((_, j) => j !== k) })
                                }
                              >
                                ×
                              </button>
                            ) : null}
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        className={`${botaoPequeno} mt-2`}
                        onClick={() => mudarQuestao({ ...questao, pares: [...questao.pares, { a: "", b: "" }] })}
                      >
                        Adicionar par
                      </button>
                    </fieldset>
                  ) : null}

                  {questao.tipo === "sequencia" ? (
                    <fieldset>
                      <legend className="mb-1 text-sm font-semibold text-tinta">Itens na ordem certa</legend>
                      <p className="mb-2 text-xs text-texto-suave">O app embaralha para o aluno.</p>
                      <div className="flex flex-col gap-2">
                        {questao.itens.map((item, k) => (
                          <div key={k} className="flex items-center gap-2">
                            <span className="tnum w-5 text-right text-xs text-texto-suave">{k + 1}</span>
                            <input
                              value={item}
                              onChange={(ev) =>
                                mudarQuestao({
                                  ...questao,
                                  itens: questao.itens.map((x, j) => (j === k ? ev.target.value : x)),
                                })
                              }
                              className={`${ENTRADA} h-11`}
                            />
                            {questao.itens.length > 3 ? (
                              <button
                                type="button"
                                aria-label="Remover item"
                                className="grid size-8 place-items-center text-lg leading-none text-texto-suave"
                                onClick={() =>
                                  mudarQuestao({ ...questao, itens: questao.itens.filter((_, j) => j !== k) })
                                }
                              >
                                ×
                              </button>
                            ) : null}
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        className={`${botaoPequeno} mt-2`}
                        onClick={() => mudarQuestao({ ...questao, itens: [...questao.itens, ""] })}
                      >
                        Adicionar item
                      </button>
                    </fieldset>
                  ) : null}
                  <Erro msg={erroDaQuestao(indice)} />
                </div>
              </section>
            ) : null}

            {/* prévia */}
            <aside className="flex flex-col gap-2 lg:col-span-2 2xl:sticky 2xl:top-0 2xl:col-span-1">
              <p className="text-center text-sm font-semibold text-tinta">Como o aluno vê no app</p>
              <CelularPrevia
                titulo={dados.titulo}
                instrucao={dados.instrucao}
                numero={indice + 1}
                total={questoes.length}
              >
                <PreviaQuestao questao={questao} />
              </CelularPrevia>
            </aside>
          </div>
        )
      ) : null}

      {/* 3. envio e revisão */}
      {etapa === 2 ? (
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="sombra-suave flex flex-col gap-5 rounded-2xl bg-superficie p-5">
            <h2 className="text-lg">Para quem e quando</h2>
            <div>
              <p className="mb-1.5 text-sm font-semibold text-tinta">Turmas</p>
              <div className="flex flex-wrap gap-2">
                {turmas.map((t) => {
                  const sel = dados.turmas.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      aria-pressed={sel}
                      onClick={() =>
                        mudar({ turmas: sel ? dados.turmas.filter((x) => x !== t.id) : [...dados.turmas, t.id] })
                      }
                      className={`h-11 rounded-full border px-4 text-sm font-semibold ${sel ? "border-roxo bg-roxo-claro text-roxo-escuro" : "border-[#D9D4EC] text-tinta"}`}
                    >
                      {t.nome} <span className="font-normal text-texto-suave">· {t.alunos.length} alunos</span>
                    </button>
                  );
                })}
              </div>
              <Erro msg={e.turmas} />
            </div>
            <Campo rotulo="Liberar no app a partir de">
              <input
                type="date"
                value={dados.liberarEm}
                onChange={(ev) => mudar({ liberarEm: ev.target.value })}
                className={`${ENTRADA} h-11 max-w-56 font-normal`}
              />
              <Erro msg={e.liberarEm} />
            </Campo>
          </section>

          <section className="sombra-suave rounded-2xl bg-superficie p-5">
            <h2 className="text-lg">Revisão</h2>
            <dl className="mt-3 flex flex-col gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-texto-suave">Atividade</dt>
                <dd className="text-right font-semibold text-tinta">{dados.titulo || "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-texto-suave">Formato</dt>
                <dd className="text-right text-tinta">{sobre[dados.formato].nome}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-texto-suave">{pronta ? "Atividade do app" : "Questões"}</dt>
                <dd className="text-right text-tinta">
                  {pronta ? (missao?.titulo ?? "—") : `${prontas} de ${questoes.length} completas`}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-texto-suave">Turmas</dt>
                <dd className="text-right text-tinta">
                  {turmas
                    .filter((t) => dados.turmas.includes(t.id))
                    .map((t) => t.nome)
                    .join(", ") || "—"}
                </dd>
              </div>
            </dl>
            {!pronta && prontas < questoes.length ? (
              <p className="mt-4 rounded-xl bg-pessego-claro px-3 py-2.5 text-sm text-tinta">
                Há questões incompletas.{" "}
                <button type="button" onClick={() => ir(1)} className="font-semibold text-alerta underline">
                  Voltar às questões
                </button>
              </p>
            ) : null}
          </section>
        </div>
      ) : null}

      {/* rodapé com as ações */}
      <div className="sombra-suave flex flex-wrap items-center gap-3 rounded-2xl bg-superficie px-5 py-3.5">
        <Link
          href={id ? `/professor/atividades/${id}` : "/professor/atividades"}
          className="inline-flex min-h-11 items-center text-sm font-semibold text-texto"
        >
          Cancelar
        </Link>
        {aviso ? <p className="text-sm font-medium text-alerta">{aviso}</p> : null}
        <div className="ml-auto flex flex-wrap gap-2">
          {etapa > 0 ? (
            <button
              type="button"
              onClick={() => ir(etapa - 1)}
              className="h-11 rounded-full border border-[#D9D4EC] px-4 text-sm font-semibold text-tinta"
            >
              Voltar
            </button>
          ) : null}
          <button
            type="button"
            disabled={enviando}
            onClick={() => salvar(false)}
            className="h-11 rounded-full border border-[#D9D4EC] px-4 text-sm font-semibold text-tinta disabled:opacity-60"
          >
            Salvar rascunho
          </button>
          {etapa < ETAPAS.length - 1 ? (
            <button
              type="button"
              onClick={avancar}
              className="h-11 rounded-full bg-tinta px-5 text-sm font-semibold text-white"
            >
              Continuar
            </button>
          ) : (
            <button
              type="button"
              disabled={enviando}
              onClick={() => salvar(true)}
              className="h-11 rounded-full bg-roxo-escuro px-5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {enviando ? "Salvando…" : "Salvar e enviar para o app"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
