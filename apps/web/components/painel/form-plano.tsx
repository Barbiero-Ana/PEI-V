"use client";

import Link from "next/link";
import { useActionState, useRef, useState, type ReactNode } from "react";
import { FORMATOS_ATIVIDADE } from "@modolume/core";
import { gravarPlano, type EstadoPlano } from "@/app/professor/(painel)/planejamento/acoes";
import type { OpcoesPlanejamento } from "@/lib/painel/dados";
import type { DadosPlano } from "@/lib/painel/planejamento";
import { sugerirAtividades, sugerirHabilidades, type AtividadeApp } from "@/lib/painel/sugestoes";

const ENTRADA =
  "w-full rounded-xl border border-[#D9D4EC] bg-superficie px-3 text-sm text-tinta outline-none focus:border-roxo aria-invalid:border-alerta";
const rotuloFormato = (id: string) => FORMATOS_ATIVIDADE.find((f) => f.id === id)?.rotulo ?? id;

/** Etapas do plano; cada campo com erro do servidor leva de volta à sua etapa. */
const ETAPAS = [
  { nome: "Aula", ajuda: "Turma, data e duração" },
  { nome: "Conteúdo", ajuda: "Tema e habilidades" },
  { nome: "Desenvolvimento", ajuda: "Objetivos, formatos e atividades" },
  { nome: "Alunos e registro", ajuda: "Acompanhamento e observações" },
] as const;
const ETAPA_DO_CAMPO: Record<string, number> = { turmaId: 0, data: 0, aulas: 0, tema: 1, objetivos: 2 };

interface Props {
  turmas: OpcoesPlanejamento;
  habilidades: readonly { codigo: string; resumo: string }[];
  unidades: readonly string[];
  atividades: AtividadeApp[];
  /** Valores iniciais: o plano em edição, um plano usado como base ou o que veio na URL. */
  inicial: DadosPlano;
  id?: string;
}

type Resumo = Pick<
  DadosPlano,
  | "turmaId"
  | "data"
  | "horario"
  | "aulas"
  | "tema"
  | "habilidades"
  | "formatos"
  | "atividadesApp"
  | "alunosFoco"
  | "status"
>;

function lerResumo(form: HTMLFormElement): Resumo {
  const f = new FormData(form);
  const t = (k: string) => String(f.get(k) ?? "");
  return {
    turmaId: t("turmaId"),
    data: t("data"),
    horario: t("horario"),
    aulas: Number(t("aulas") || 0),
    tema: t("tema"),
    habilidades: f.getAll("habilidades").map(String),
    formatos: f.getAll("formatos").map(String) as Resumo["formatos"],
    atividadesApp: f.getAll("atividadesApp").map(String),
    alunosFoco: f.getAll("alunosFoco").map(String),
    status: t("status") as Resumo["status"],
  };
}

function Campo({
  rotulo,
  nome,
  erro,
  obrigatorio,
  children,
}: {
  rotulo: string;
  nome: string;
  erro?: string;
  obrigatorio?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={nome} className="text-sm font-semibold text-tinta">
        {rotulo}
        {obrigatorio ? <span className="text-alerta"> *</span> : null}
      </label>
      {children}
      {erro ? (
        <p id={`${nome}-erro`} className="text-xs font-medium text-alerta">
          {erro}
        </p>
      ) : null}
    </div>
  );
}

/** Caixa de sugestão com o motivo e um botão para aplicar. */
function Sugestao({ children, acao, onAplicar }: { children: ReactNode; acao: string; onAplicar: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-lilas bg-[#F7F5FF] px-4 py-3 text-sm text-tinta">
      <p className="min-w-0 flex-1">{children}</p>
      <button
        type="button"
        onClick={onAplicar}
        className="h-8 shrink-0 rounded-full bg-roxo-escuro px-3.5 text-xs font-semibold text-white"
      >
        {acao}
      </button>
    </div>
  );
}

export function FormularioPlano({ turmas, habilidades, unidades, atividades, inicial, id }: Props) {
  const [estado, acao, enviando] = useActionState<EstadoPlano, FormData>(gravarPlano, { erros: {}, tentativa: 0 });
  const v = estado.valores ?? inicial;
  const form = useRef<HTMLFormElement>(null);
  const [etapa, setEtapa] = useState(0);
  const [resumo, setResumo] = useState<Resumo>(v);
  const [aviso, setAviso] = useState("");

  // depois de um envio com erro: volta à etapa do primeiro erro e ao que foi enviado
  const [tentativaVista, setTentativaVista] = useState(estado.tentativa);
  if (tentativaVista !== estado.tentativa) {
    setTentativaVista(estado.tentativa);
    setResumo(v);
    const primeiro = Object.keys(estado.erros)[0];
    if (primeiro !== undefined) setEtapa(ETAPA_DO_CAMPO[primeiro] ?? 0);
  }

  const e = estado.erros;
  const invalido = (campo: keyof EstadoPlano["erros"]) =>
    e[campo] ? { "aria-invalid": true as const, "aria-describedby": `${campo}-erro` } : {};
  const turma = turmas.find((t) => t.id === resumo.turmaId);
  const atualizar = () => form.current && setResumo(lerResumo(form.current));

  /** Marca caixas pelo nome e valor (as caixas não são controladas, para o envio levar tudo). */
  const marcar = (nome: string, valores: string[]) => {
    form.current?.querySelectorAll<HTMLInputElement>(`input[name="${nome}"]`).forEach((c) => {
      if (valores.includes(c.value)) c.checked = true;
    });
    atualizar();
  };

  const avancar = () => {
    // lê o formulário na hora (o preenchimento automático do navegador nem sempre avisa a mudança)
    const atual = form.current ? lerResumo(form.current) : resumo;
    setResumo(atual);
    if (etapa === 0 && (!atual.turmaId || !atual.data)) return setAviso("Escolha a turma e a data para continuar.");
    if (etapa === 1 && !atual.tema.trim()) return setAviso("Dê um tema para a aula para continuar.");
    setAviso("");
    setEtapa((n) => Math.min(ETAPAS.length - 1, n + 1));
  };

  // sugestões a partir dos dados
  const habSugeridas = sugerirHabilidades(resumo.tema).filter((c) => !resumo.habilidades.includes(c));
  const ativSugeridas = sugerirAtividades(resumo.tema, atividades);
  const ativFaltando = ativSugeridas.filter((a) => !resumo.atividadesApp.includes(a));
  const formatosFracos = turma
    ? Object.entries(turma.formatos)
        .sort((a, b) => a[1].acerto - b[1].acerto)
        .slice(0, 2)
        .map(([f, d]) => ({ id: f, acerto: d.acerto }))
    : [];
  const fracosFaltando = formatosFracos.filter((f) => !resumo.formatos.includes(f.id as Resumo["formatos"][number]));
  const atencao = turma?.alunos.filter((a) => a.atencao) ?? [];
  const atencaoFaltando = atencao.filter((a) => !resumo.alunosFoco.includes(a.id));
  const ordemAtividades = [
    ...atividades.filter((a) => ativSugeridas.includes(a.id)),
    ...atividades.filter((a) => !ativSugeridas.includes(a.id)),
  ];

  const faltando = [!resumo.turmaId && "turma", !resumo.data && "data", !resumo.tema.trim() && "tema"].filter(
    Boolean,
  ) as string[];

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <form
        ref={form}
        action={acao}
        noValidate
        onChange={atualizar}
        className="sombra-suave overflow-hidden rounded-2xl bg-superficie"
      >
        {id ? <input type="hidden" name="id" value={id} /> : null}

        {/* etapas */}
        <ol className="grid grid-cols-2 gap-px border-b border-[#E8E5F3] bg-[#E8E5F3] sm:grid-cols-4">
          {ETAPAS.map((et, i) => (
            <li key={et.nome} className="bg-superficie">
              <button
                type="button"
                onClick={() => {
                  setAviso("");
                  setEtapa(i);
                }}
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
                  <span className="hidden text-xs text-texto-suave md:block">{et.ajuda}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>

        {Object.keys(e).length > 0 ? (
          <p
            role="alert"
            className="mx-6 mt-5 rounded-xl border border-pessego bg-pessego-claro px-4 py-3 text-sm text-tinta"
          >
            Revise os campos marcados antes de salvar.
          </p>
        ) : null}

        {/* a chave remonta os campos com o que foi enviado quando há erro */}
        <div key={estado.tentativa} className="px-6 py-6">
          {/* 1. Aula */}
          <div className={etapa === 0 ? "flex flex-col gap-5" : "hidden"}>
            <Campo rotulo="Turma" nome="turmaId" erro={e.turmaId} obrigatorio>
              <div className="flex flex-wrap gap-2">
                {turmas.map((t) => (
                  <label
                    key={t.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold ${resumo.turmaId === t.id ? "border-roxo bg-roxo-claro text-roxo-escuro" : "border-[#D9D4EC] text-tinta"}`}
                  >
                    <input
                      type="radio"
                      name="turmaId"
                      value={t.id}
                      defaultChecked={v.turmaId === t.id}
                      className="sr-only"
                      id={t === turmas[0] ? "turmaId" : undefined}
                    />
                    {t.nome}
                    <span className="font-normal text-texto-suave">{t.alunos.length} alunos</span>
                  </label>
                ))}
              </div>
            </Campo>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Campo rotulo="Data" nome="data" erro={e.data} obrigatorio>
                <input
                  id="data"
                  name="data"
                  type="date"
                  defaultValue={v.data}
                  className={`${ENTRADA} h-11`}
                  {...invalido("data")}
                />
              </Campo>
              <Campo rotulo="Horário" nome="horario">
                <input id="horario" name="horario" type="time" defaultValue={v.horario} className={`${ENTRADA} h-11`} />
              </Campo>
              <Campo rotulo="Nº de aulas" nome="aulas" erro={e.aulas}>
                <input
                  id="aulas"
                  name="aulas"
                  type="number"
                  min={1}
                  max={10}
                  defaultValue={v.aulas}
                  className={`${ENTRADA} tnum h-11`}
                  {...invalido("aulas")}
                />
              </Campo>
              <Campo rotulo="Situação" nome="status">
                <select id="status" name="status" defaultValue={v.status} className={`${ENTRADA} h-11`}>
                  <option value="rascunho">Rascunho</option>
                  <option value="planejada">Planejada</option>
                  <option value="realizada">Realizada</option>
                </select>
              </Campo>
            </div>
          </div>

          {/* 2. Conteúdo */}
          <div className={etapa === 1 ? "flex flex-col gap-5" : "hidden"}>
            <div className="grid gap-4 md:grid-cols-[1fr_240px]">
              <Campo rotulo="Tema da aula" nome="tema" erro={e.tema} obrigatorio>
                <input
                  id="tema"
                  name="tema"
                  defaultValue={v.tema}
                  placeholder="Ex.: Frações equivalentes com material concreto"
                  className={`${ENTRADA} h-11`}
                  {...invalido("tema")}
                />
              </Campo>
              <Campo rotulo="Unidade temática" nome="unidade">
                <select id="unidade" name="unidade" defaultValue={v.unidade} className={`${ENTRADA} h-11`}>
                  {unidades.map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </select>
              </Campo>
            </div>
            {habSugeridas.length > 0 ? (
              <Sugestao acao="Marcar" onAplicar={() => marcar("habilidades", habSugeridas)}>
                Pelo tema, {habSugeridas.length === 1 ? "esta habilidade combina" : "estas habilidades combinam"}:{" "}
                <strong>{habSugeridas.join(", ")}</strong>
              </Sugestao>
            ) : null}
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-tinta">Habilidades da BNCC</legend>
              <div className="grid gap-2 md:grid-cols-2">
                {habilidades.map((h) => (
                  <label
                    key={h.codigo}
                    className={`flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-sm ${resumo.habilidades.includes(h.codigo) ? "border-roxo bg-[#F7F5FF]" : "border-[#E2DEF0]"}`}
                  >
                    <input
                      type="checkbox"
                      name="habilidades"
                      value={h.codigo}
                      defaultChecked={v.habilidades.includes(h.codigo)}
                      className="mt-0.5 size-4 accent-roxo-escuro"
                    />
                    <span>
                      <span className="tnum font-semibold text-tinta">{h.codigo}</span>{" "}
                      <span className="text-texto">{h.resumo}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          {/* 3. Desenvolvimento */}
          <div className={etapa === 2 ? "flex flex-col gap-5" : "hidden"}>
            <Campo rotulo="Objetivos de aprendizagem" nome="objetivos" erro={e.objetivos} obrigatorio>
              <textarea
                id="objetivos"
                name="objetivos"
                rows={3}
                defaultValue={v.objetivos}
                placeholder="O que os alunos devem saber fazer ao fim da aula"
                className={`${ENTRADA} py-2.5`}
                {...invalido("objetivos")}
              />
            </Campo>
            <div className="grid gap-4 md:grid-cols-2">
              <Campo rotulo="Conteúdos" nome="conteudos">
                <textarea
                  id="conteudos"
                  name="conteudos"
                  rows={3}
                  defaultValue={v.conteudos}
                  className={`${ENTRADA} py-2.5`}
                />
              </Campo>
              <Campo rotulo="Metodologia" nome="metodologia">
                <textarea
                  id="metodologia"
                  name="metodologia"
                  rows={3}
                  defaultValue={v.metodologia}
                  placeholder="Abertura, desenvolvimento e fechamento"
                  className={`${ENTRADA} py-2.5`}
                />
              </Campo>
            </div>

            <fieldset className="flex flex-col gap-3">
              <legend className="mb-2 text-sm font-semibold text-tinta">Formatos de atividade</legend>
              {turma && fracosFaltando.length > 0 ? (
                <Sugestao
                  acao="Incluir"
                  onAplicar={() =>
                    marcar(
                      "formatos",
                      fracosFaltando.map((f) => f.id),
                    )
                  }
                >
                  No {turma.nome}, o menor acerto está em{" "}
                  <strong>
                    {fracosFaltando.map((f) => `${rotuloFormato(f.id)} (${Math.round(f.acerto)}%)`).join(" e ")}
                  </strong>
                  . Incluir para a turma praticar?
                </Sugestao>
              ) : null}
              <div className="grid gap-2 md:grid-cols-2">
                {FORMATOS_ATIVIDADE.map((f) => {
                  const dado = turma?.formatos[f.id];
                  const marcado = resumo.formatos.includes(f.id);
                  return (
                    <label
                      key={f.id}
                      className={`flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-sm ${marcado ? "border-roxo bg-[#F7F5FF]" : "border-[#E2DEF0]"}`}
                    >
                      <input
                        type="checkbox"
                        name="formatos"
                        value={f.id}
                        defaultChecked={v.formatos.includes(f.id)}
                        className="mt-0.5 size-4 accent-roxo-escuro"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex justify-between gap-2">
                          <span className="font-semibold text-tinta">{f.rotulo}</span>
                          {dado ? (
                            <span
                              className={`tnum shrink-0 text-xs ${dado.acerto < 60 ? "font-semibold text-alerta" : "text-texto-suave"}`}
                            >
                              turma {Math.round(dado.acerto)}%
                            </span>
                          ) : null}
                        </span>
                        <span className="block text-xs text-texto-suave">{f.descricao}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="flex flex-col gap-3">
              <legend className="mb-2 text-sm font-semibold text-tinta">Atividades do app Modolume</legend>
              {ativFaltando.length > 0 ? (
                <Sugestao acao="Marcar" onAplicar={() => marcar("atividadesApp", ativFaltando)}>
                  Combinam com o tema:{" "}
                  <strong>
                    {atividades
                      .filter((a) => ativFaltando.includes(a.id))
                      .map((a) => a.titulo)
                      .join(", ")}
                  </strong>
                </Sugestao>
              ) : null}
              <div className="grid max-h-72 gap-2 overflow-y-auto pr-1 md:grid-cols-2">
                {ordemAtividades.map((a) => {
                  const marcado = resumo.atividadesApp.includes(a.id);
                  const dado = turma?.formatos[a.formato];
                  return (
                    <label
                      key={a.id}
                      className={`flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-sm ${marcado ? "border-roxo bg-[#F7F5FF]" : "border-[#E2DEF0]"}`}
                    >
                      <input
                        type="checkbox"
                        name="atividadesApp"
                        value={a.id}
                        defaultChecked={v.atividadesApp.includes(a.id)}
                        className="mt-0.5 size-4 accent-roxo-escuro"
                      />
                      <span className="min-w-0">
                        <span className="block font-semibold text-tinta">
                          {a.titulo}
                          {ativSugeridas.includes(a.id) ? (
                            <span className="ml-1.5 rounded bg-roxo-claro px-1.5 py-0.5 text-[0.65rem] font-semibold text-roxo-escuro">
                              combina com o tema
                            </span>
                          ) : null}
                        </span>
                        <span className="block text-xs text-texto-suave">
                          {a.conteudo} · {rotuloFormato(a.formato)}
                          {dado ? ` · turma ${Math.round(dado.acerto)}%` : ""}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="grid gap-4 md:grid-cols-2">
              <Campo rotulo="Recursos e materiais" nome="recursos">
                <textarea
                  id="recursos"
                  name="recursos"
                  rows={2}
                  defaultValue={v.recursos}
                  className={`${ENTRADA} py-2.5`}
                />
              </Campo>
              <Campo rotulo="Avaliação" nome="avaliacao">
                <textarea
                  id="avaliacao"
                  name="avaliacao"
                  rows={2}
                  defaultValue={v.avaliacao}
                  placeholder="Como verificar se o objetivo foi alcançado"
                  className={`${ENTRADA} py-2.5`}
                />
              </Campo>
            </div>
          </div>

          {/* 4. Alunos e registro */}
          <div className={etapa === 3 ? "flex flex-col gap-5" : "hidden"}>
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-2 text-sm font-semibold text-tinta">Alunos em acompanhamento</legend>
              {!turma ? (
                <p className="text-sm text-texto-suave">Escolha a turma na primeira etapa para ver os alunos.</p>
              ) : (
                <>
                  {atencaoFaltando.length > 0 ? (
                    <Sugestao
                      acao="Marcar todos"
                      onAplicar={() =>
                        marcar(
                          "alunosFoco",
                          atencaoFaltando.map((a) => a.id),
                        )
                      }
                    >
                      {atencaoFaltando.length} {atencaoFaltando.length === 1 ? "aluno pede" : "alunos pedem"} atenção
                      nesta turma: <strong>{atencaoFaltando.map((a) => a.nome.split(" ")[0]).join(", ")}</strong>
                    </Sugestao>
                  ) : null}
                  <div className="grid gap-2 md:grid-cols-2">
                    {turma.alunos.map((a) => {
                      const marcado = resumo.alunosFoco.includes(a.id);
                      return (
                        <label
                          key={a.id}
                          title={a.motivo || undefined}
                          className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-sm ${marcado ? "border-roxo bg-[#F7F5FF]" : "border-[#E2DEF0]"}`}
                        >
                          <input
                            type="checkbox"
                            name="alunosFoco"
                            value={a.id}
                            defaultChecked={v.alunosFoco.includes(a.id)}
                            className="size-4 accent-roxo-escuro"
                          />
                          <span className="min-w-0 flex-1 truncate text-tinta">{a.nome}</span>
                          <span
                            className={`tnum text-xs font-semibold ${a.atencao ? "text-alerta" : "text-texto-suave"}`}
                          >
                            {Math.round(a.acerto)}%
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </>
              )}
            </fieldset>
            <Campo rotulo="Observações" nome="observacoes">
              <textarea
                id="observacoes"
                name="observacoes"
                rows={2}
                defaultValue={v.observacoes}
                className={`${ENTRADA} py-2.5`}
              />
            </Campo>
            <Campo rotulo="Registro da aula (depois da aula)" nome="registro">
              <textarea
                id="registro"
                name="registro"
                rows={3}
                defaultValue={v.registro}
                placeholder="O que funcionou, o que ajustar na próxima"
                className={`${ENTRADA} py-2.5`}
              />
            </Campo>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-[#E8E5F3] bg-[#FAF9FE] px-6 py-4">
          <Link
            href={id ? `/professor/planejamento/${id}` : "/professor/planejamento"}
            className="inline-flex min-h-11 items-center text-sm font-semibold text-texto"
          >
            Cancelar
          </Link>
          {aviso ? <p className="text-sm font-medium text-alerta">{aviso}</p> : null}
          <div className="ml-auto flex items-center gap-2">
            {etapa > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setAviso("");
                  setEtapa((n) => n - 1);
                }}
                className="h-11 rounded-full border border-[#D9D4EC] px-4 text-sm font-semibold text-tinta"
              >
                Voltar
              </button>
            ) : null}
            {etapa < ETAPAS.length - 1 ? (
              <button
                type="button"
                onClick={avancar}
                className="h-11 rounded-full bg-tinta px-5 text-sm font-semibold text-white"
              >
                Continuar
              </button>
            ) : null}
            {etapa === ETAPAS.length - 1 || id ? (
              <button
                type="submit"
                disabled={enviando}
                className="h-11 rounded-full bg-roxo-escuro px-5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {enviando ? "Salvando…" : id ? "Salvar alterações" : "Salvar plano"}
              </button>
            ) : null}
          </div>
        </div>
      </form>

      {/* resumo que vai se montando */}
      <aside className="sombra-suave rounded-2xl bg-superficie p-5 xl:sticky xl:top-0">
        <h2 className="text-base">Resumo do plano</h2>
        <dl className="mt-4 flex flex-col gap-3.5 text-sm">
          <div>
            <dt className="text-xs text-texto-suave">Turma e data</dt>
            <dd className="mt-0.5 font-semibold text-tinta">
              {turma?.nome ?? "—"}
              {resumo.data ? ` · ${resumo.data.split("-").reverse().join("/")}` : ""}
              {resumo.horario ? ` · ${resumo.horario}` : ""}
              {resumo.aulas ? ` · ${resumo.aulas} ${resumo.aulas === 1 ? "aula" : "aulas"}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-texto-suave">Tema</dt>
            <dd className="mt-0.5 font-semibold text-tinta">{resumo.tema.trim() || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-texto-suave">Habilidades</dt>
            <dd className="tnum mt-0.5 text-tinta">{resumo.habilidades.join(", ") || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-texto-suave">Formatos</dt>
            <dd className="mt-0.5 text-tinta">{resumo.formatos.map(rotuloFormato).join(", ") || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-texto-suave">Atividades do app</dt>
            <dd className="mt-0.5 text-tinta">
              {atividades
                .filter((a) => resumo.atividadesApp.includes(a.id))
                .map((a) => a.titulo)
                .join(", ") || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-texto-suave">Alunos em acompanhamento</dt>
            <dd className="mt-0.5 text-tinta">
              {turma
                ? turma.alunos
                    .filter((a) => resumo.alunosFoco.includes(a.id))
                    .map((a) => a.nome.split(" ")[0])
                    .join(", ") || "—"
                : "—"}
            </dd>
          </div>
        </dl>
        <p
          className={`mt-5 rounded-xl px-3 py-2.5 text-xs ${faltando.length ? "bg-pessego-claro text-alerta" : "bg-[#EEF8F2] text-[#24704A]"}`}
        >
          {faltando.length ? `Falta: ${faltando.join(", ")}.` : "Tudo o que é obrigatório está preenchido."}
        </p>
      </aside>
    </div>
  );
}
