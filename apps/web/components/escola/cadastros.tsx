"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { NOME_SEGMENTO, SEGMENTOS, SERIES_POR_SEGMENTO, type Segmento } from "@modolume/core";
import { OPCOES_PAPEL, OPCOES_PERIODO, type Materia, type Pessoa, type TurmaAdmin } from "@/lib/escola/tipos";
import { CAMPO, ROTULO, Campo, Escolha } from "./formulario";

function SelecionarSegmento({
  valor,
  escolher,
}: {
  valor: Segmento | "";
  escolher: (segmento: Segmento | "") => void;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={ROTULO}>
        Segmento
      </label>
      <select
        id={id}
        name="segmento"
        className={CAMPO}
        value={valor}
        onChange={(e) => escolher(e.target.value as Segmento | "")}
      >
        <option value="">Selecione o segmento</option>
        {SEGMENTOS.map((s) => (
          <option key={s} value={s}>
            {NOME_SEGMENTO[s]}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CamposDaEquipe({
  pessoa,
  materias,
  turmas,
}: {
  pessoa?: Pessoa;
  materias: Materia[];
  turmas?: TurmaAdmin[];
}) {
  const [papel, mudarPapel] = useState(pessoa?.papel ?? "professor");
  const [segmento, mudarSegmento] = useState<Segmento | "">(pessoa?.segmento ?? "");
  const papelId = useId();
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Campo nome="nome" rotulo="Nome completo" valor={pessoa?.nome} />
      <Campo
        nome="email"
        rotulo="E-mail"
        tipo="email"
        valor={pessoa?.email}
        somenteLeitura={Boolean(pessoa && !pessoa.senhaProvisoria)}
      />
      <div className="flex flex-col gap-1.5">
        <label htmlFor={papelId} className={ROTULO}>
          Perfil de acesso
        </label>
        <select
          id={papelId}
          name="papel"
          value={papel}
          onChange={(e) => mudarPapel(e.target.value as Pessoa["papel"])}
          className={CAMPO}
        >
          {OPCOES_PAPEL.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.rotulo}
            </option>
          ))}
        </select>
      </div>
      {papel === "coordenacao" ? <SelecionarSegmento valor={segmento} escolher={mudarSegmento} /> : null}
      {papel === "professor" ? (
        <>
          <div className="flex flex-col gap-1.5">
            <Escolha
              nome="materiaId"
              rotulo="Matéria"
              valor={pessoa?.materiaId ?? ""}
              opcoes={[
                { valor: "", rotulo: "Selecione a matéria" },
                ...materias.map((m) => ({ valor: m.id, rotulo: m.nome })),
              ]}
            />
            <Link href="/admin/materias" className="self-start text-xs font-semibold text-roxo-escuro">
              Ver catálogo de matérias
            </Link>
          </div>
          {turmas ? (
            <Escolha
              nome="turmaId"
              rotulo="Turma inicial (opcional)"
              opcoes={[
                { valor: "", rotulo: "Vincular depois" },
                ...turmas
                  .filter((t) => t.ativa)
                  .map((t) => ({ valor: t.id, rotulo: `${t.nome} · ${t.periodo} · ${t.anoLetivo}` })),
              ]}
            />
          ) : null}
        </>
      ) : null}
      {papel === "coordenacao" ? (
        <p className="text-sm text-texto-suave sm:col-span-2">
          O segmento limita o acesso às turmas, aos alunos e aos vínculos.
        </p>
      ) : null}
    </div>
  );
}

export function CamposDaTurma({ turma, ano }: { turma?: TurmaAdmin; ano: number }) {
  const [segmento, mudarSegmento] = useState<Segmento | "">(turma?.segmento ?? "");
  const padrao = segmento ? SERIES_POR_SEGMENTO[segmento] : [];
  const serieAtual = turma?.segmento === segmento || !turma?.segmento ? turma?.serie : undefined;
  const series = serieAtual && !padrao.includes(serieAtual) ? [...padrao, serieAtual] : padrao;
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <SelecionarSegmento valor={segmento} escolher={mudarSegmento} />
      <Escolha
        key={segmento}
        nome="serie"
        rotulo="Série"
        valor={serieAtual ?? ""}
        desabilitado={!segmento}
        opcoes={[
          { valor: "", rotulo: segmento ? "Selecione a série" : "Escolha o segmento primeiro" },
          ...series.map((serie) => ({ valor: serie, rotulo: serie })),
        ]}
      />
      <Escolha nome="periodo" rotulo="Turno" opcoes={OPCOES_PERIODO} valor={turma?.periodo} />
      <Campo nome="anoLetivo" rotulo="Ano letivo" tipo="number" valor={turma?.anoLetivo ?? ano} />
      <Campo
        nome="codigo"
        rotulo="Código da turma"
        somenteLeitura
        valor={turma?.codigo ?? "Gerado ao salvar"}
        dica={turma ? undefined : "Exemplos para o 6º ano: 6AM12 de manhã, 6TD12 à tarde ou 6IN12 no integral."}
      />
    </div>
  );
}
